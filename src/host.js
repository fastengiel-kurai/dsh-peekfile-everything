import { execFile } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, readFile, readdir, realpath, stat, unlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { describePath, matchSnippet, normalizeCandidate, parseCandidate, windowsToWsl } from './core.js'
import { convertOffice, isOfficePath, officeCapability } from './office.js'
import { ebookCapability, isEbookPath, prepareEbook } from './ebook.js'
import { lineRenderable, renderDocument, renderable } from './render.js'

export const name = 'dsh-peekfile-everything'
export const inject = ['webServer']
const exec = promisify(execFile)
const BASE = '/__peekfile'
const MAX_BODY = 1 << 20
const MAX_RESULTS = 100

const csvRows = (text) => {
  const rows = []; let row = []; let cell = ''; let quoted = false
  for (let i = text.charCodeAt(0) === 0xfeff ? 1 : 0; i < text.length; i += 1) {
    const c = text[i]
    if (quoted && c === '"' && text[i + 1] === '"') { cell += '"'; i += 1 }
    else if (c === '"') quoted = !quoted
    else if (!quoted && c === ',') { row.push(cell); cell = '' }
    else if (!quoted && (c === '\n' || c === '\r')) {
      if (c === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell); cell = ''; if (row.some(Boolean)) rows.push(row); row = []
    } else cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const readJson = async (req) => {
  const chunks = []; let size = 0
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY) throw new Error('request too large'); chunks.push(chunk) }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}
const json = (res, body, status = 200) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)) }
const mime = (path) => ({
  '.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.html':'text/html; charset=utf-8','.htm':'text/html; charset=utf-8','.xhtml':'application/xhtml+xml; charset=utf-8','.css':'text/css; charset=utf-8','.xml':'application/xml; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8','.csv':'text/csv; charset=utf-8'
}[extname(path).toLowerCase()] || 'application/octet-stream')

export function apply(ctx) {
  const handles = new Map()
  let available = false; let command = process.env.PEEKFILE_ES || '/home/kurai/.local/bin/es'
  let driveMounts = {}
  const refreshDriveMounts = async () => {
    try {
      const lines = (await readFile('/proc/mounts', 'utf8')).split('\n')
      const mappings = lines.map(line => line.split(' ')).filter(parts => /^[A-Za-z]:/.test(parts[0] || '') && /^\/mnt\/[a-z]$/.test(parts[1] || '')).map(parts => [parts[0][0].toUpperCase(), parts[1].replaceAll('\\040', ' ')])
      driveMounts = Object.fromEntries(mappings)
    } catch { driveMounts = {} }
    return driveMounts
  }
  void refreshDriveMounts()
  const detect = async () => { try { await access(command); await exec(command, ['-version'], { timeout: 4000 }); available = true } catch { available = false }; return available }
  void detect()
  const allowedRoot = (actual) => [homedir(), ...Object.values(driveMounts)].find(root => actual === root || actual.startsWith(`${root}/`))
  const allowed = (actual) => allowedRoot(actual) !== undefined
  const issue = async (candidate, cwd = process.cwd(), assetsRoot = null) => {
    const fragment=parseCandidate(candidate)
    const normalized = normalizeCandidate(candidate, cwd, homedir(), driveMounts)
    const actual = await realpath(normalized); const info = await stat(actual)
    if (!allowed(actual)) throw new Error('path is outside PeekFile allowed roots')
    const id = crypto.randomUUID(); handles.set(id, { path: actual, assetsRoot, expires: Date.now() + 30 * 60_000 })
    const routePath=(assetsRoot?relative(assetsRoot,actual):basename(actual)).split('/').map(encodeURIComponent).join('/'),params=new URLSearchParams()
    if(!assetsRoot&&renderable(actual))params.set('render','1');if(fragment.lineStart)params.set('lineStart',String(fragment.lineStart));if(fragment.lineEnd)params.set('lineEnd',String(fragment.lineEnd))
    const hash=fragment.page?`#page=${fragment.page}`:fragment.time!==undefined?`#t=${fragment.time}`:''
    return { ...describePath(actual, info),...fragment,handle:id,previewUrl:`${BASE}/file/${id}/${routePath}${params.size?`?${params}`:''}${hash}` }
  }
  const search = async ({ query, limit = 50, offset = 0 }) => {
    if (!available && !(await detect())) throw new Error('EverythingCLI 未安装或不可用')
    const count = Math.max(1, Math.min(MAX_RESULTS + 1, Number(limit) || 50))
    const start=Math.max(0,Number(offset)||0)
    const { stdout } = await exec(command, ['-viewport-offset',String(start),'-viewport-count',String(count), '-csv', '-utf8-bom', '-size', '-date-modified', String(query || '')], { encoding: 'buffer', timeout: 15000, maxBuffer: 8 << 20 })
    const bytes = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout)
    const text = new TextDecoder('gb18030').decode(bytes.subarray(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0))
    const rows = csvRows(text); rows.shift()
    return Promise.all(rows.map(async ([winPath, size, modified]) => {
      const path = windowsToWsl(winPath, driveMounts)
      try { const target = await issue(path);return { ...target, windowsPath: winPath, size: Number(size) || target.size, modifiedAt: modified || target.modifiedAt, reason:matchSnippet(basename(winPath),query) } } catch { return null }
    })).then((items) => items.filter(Boolean))
  }
  const methods = {
    capability: async () => ({ everything: await detect(), command, preview: true, driveMounts: await refreshDriveMounts(), office:await officeCapability(), ebook:await ebookCapability() }),
    search,
    'search-page':async ({query,page=0,pageSize=50})=>{const size=Math.max(1,Math.min(MAX_RESULTS,Number(pageSize)||50)),index=Math.max(0,Number(page)||0),items=await search({query,limit:size+1,offset:index*size});return{items:items.slice(0,size),page:index,pageSize:size,hasMore:items.length>size}},
    resolve: async ({ candidates, cwd }) => ({ items: (await Promise.all((candidates || []).slice(0, 50).map(async (candidate) => { try { return { candidate, ok: true, target: await issue(candidate, cwd) } } catch { return { candidate, ok: false } } }))) }),
    list: async ({ path }) => {
      const root = await issue(path); if (root.kind !== 'directory') throw new Error('path is not a directory')
      const entries = await Promise.all((await readdir(root.path, { withFileTypes:true })).slice(0,500).map(async entry => {
        const child = `${root.path}/${entry.name}`
        return entry.isDirectory() ? describePath(child, await stat(child)) : issue(child)
      }))
      entries.sort((a,b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'directory' ? -1 : 1)
      const boundary = allowedRoot(root.path)
      return { path:root.path, root:boundary, parent:root.path === boundary ? boundary : dirname(root.path), items:entries }
    },
    convert: async ({ path }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||!isOfficePath(source))throw new Error('unsupported office path');const output=await convertOffice(source);return issue(output,process.cwd(),dirname(output)) },
    ebook: async ({ path }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||!isEbookPath(source))throw new Error('unsupported ebook path');const book=await prepareEbook(source);return issue(book.entry,process.cwd(),book.root) },
    lines: async ({ path }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');const info=await stat(source);if(!info.isFile()||!lineRenderable(source))throw new Error('当前文件不是行式文本');if(info.size>(16<<20))throw new Error('行式文本预览上限为 16 MiB');const text=await readFile(source,'utf8');return {lines:Math.max(1,text.split('\n').length)} },
    'open-system':async ({path})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');if(process.platform==='linux'&&await access('/mnt/c/Windows/System32/cmd.exe').then(()=>true).catch(()=>false)){const converted=await exec('wslpath',['-w',source],{encoding:'utf8',timeout:5000});await exec('/mnt/c/Windows/System32/cmd.exe',['/c','start','',String(converted.stdout).trim()],{timeout:10000});return{opened:true}}await exec(process.platform==='darwin'?'open':'xdg-open',[source],{timeout:10000});return{opened:true}},
  }
  const handler = async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    if(req.method==='POST'&&url.pathname===`${BASE}/upload`){
      try{
        const requestedRoot=decodeURIComponent(String(req.headers['x-peekfile-root']||'')),root=await realpath(requestedRoot)
        if(!allowed(root)||(await stat(root)).isDirectory()===false)throw new Error('upload root is not allowed')
        const rawName=decodeURIComponent(String(req.headers['x-peekfile-name']||'file')),name=rawName.replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,160)||'file'
        const configuredMb=Number(req.headers['x-peekfile-limit-mb']||10),limitMb=Number.isFinite(configuredMb)&&configuredMb>0?configuredMb:10,limitBytes=limitMb*1024*1024
        const declared=Number(req.headers['content-length']||0);if(declared>limitBytes)throw new Error(`file exceeds ${limitMb} MB`)
        const dropDir=`${root}/.dsh-drops`;await mkdir(dropDir,{recursive:true});const output=`${dropDir}/${Date.now()}-${name}`;let total=0
        const meter=new Transform({transform(chunk,_encoding,callback){total+=chunk.length;callback(total>limitBytes?new Error(`file exceeds ${limitMb} MB`):null,chunk)}})
        try{await pipeline(req,meter,createWriteStream(output,{flags:'wx'}))}catch(error){await unlink(output).catch(()=>{});throw error}
        return json(res,{ok:true,value:await issue(output)})
      }catch(error){return json(res,{ok:false,error:String(error?.message||error)},400)}
    }
    if (req.method === 'POST' && url.pathname === `${BASE}/api`) {
      try { const body = await readJson(req); const fn = methods[body.method]; if (!fn) return json(res, { ok:false, error:'unknown method' }, 404); return json(res, { ok:true, value:await fn(body.args || {}) }) } catch (error) { return json(res, { ok:false, error:String(error?.message || error) }, 400) }
    }
    const match = url.pathname.match(/^\/__peekfile\/file\/([^/]+)/)
    if (!match || (req.method !== 'GET' && req.method !== 'HEAD')) return json(res, { ok:false, error:'not found' }, 404)
    const target = handles.get(match[1]); if (!target || target.expires < Date.now()) return json(res, { ok:false, error:'preview handle expired' }, 404)
    try {
      let servedPath=target.path
      if(target.assetsRoot){const suffix=decodeURIComponent(url.pathname.replace(/^\/__peekfile\/file\/[^/]+\//,''));const candidate=resolve(target.assetsRoot,suffix);if(candidate===target.assetsRoot||candidate.startsWith(target.assetsRoot+'/'))servedPath=candidate;else throw new Error('asset path traversal')}
      const info = await stat(servedPath); const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''))
      if(url.searchParams.get('render')==='1'&&renderable(servedPath)&&info.size<=16*1024*1024){const text=await readFile(servedPath,'utf8'),html=renderDocument(servedPath,text,{lineStart:Number(url.searchParams.get('lineStart'))||1,lineEnd:Number(url.searchParams.get('lineEnd'))||Number(url.searchParams.get('lineStart'))||1});res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-length':String(Buffer.byteLength(html))});return res.end(html)}
      let start = 0; let end = info.size - 1; let status = 200
      if (range) { start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2])); end = range[2] ? Math.min(info.size - 1, Number(range[2])) : info.size - 1; status = 206 }
      res.writeHead(status, { 'content-type':mime(servedPath), 'content-length':String(Math.max(0, end-start+1)), 'accept-ranges':'bytes', ...(status===206?{'content-range':`bytes ${start}-${end}/${info.size}`}:{}) })
      if (req.method === 'HEAD') return res.end(); createReadStream(servedPath, { start, end }).pipe(res)
    } catch (error) { json(res, { ok:false, error:String(error?.message || error) }, 404) }
  }
  ctx.effect(() => ctx.webServer.register({ kind:'prefix', path:BASE, handler }))
}

export { csvRows }
