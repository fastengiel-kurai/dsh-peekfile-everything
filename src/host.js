import { execFile } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { access, readFile, readdir, realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import { describePath, normalizeCandidate, windowsToWsl } from './core.js'
import { convertOffice, isOfficePath, officeCapability } from './office.js'
import { ebookCapability, isEbookPath, prepareEbook } from './ebook.js'

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
    const normalized = normalizeCandidate(candidate, cwd, homedir(), driveMounts)
    const actual = await realpath(normalized); const info = await stat(actual)
    if (!allowed(actual)) throw new Error('path is outside PeekFile allowed roots')
    const id = crypto.randomUUID(); handles.set(id, { path: actual, assetsRoot, expires: Date.now() + 30 * 60_000 })
    const routePath=(assetsRoot?relative(assetsRoot,actual):basename(actual)).split('/').map(encodeURIComponent).join('/')
    return { ...describePath(actual, info), handle: id, previewUrl: `${BASE}/file/${id}/${routePath}` }
  }
  const search = async ({ query, limit = 50 }) => {
    if (!available && !(await detect())) throw new Error('EverythingCLI 未安装或不可用')
    const count = Math.max(1, Math.min(MAX_RESULTS, Number(limit) || 50))
    const { stdout } = await exec(command, ['-n', String(count), '-csv', '-utf8-bom', '-size', '-date-modified', String(query || '')], { encoding: 'buffer', timeout: 15000, maxBuffer: 8 << 20 })
    const bytes = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout)
    const text = new TextDecoder('gb18030').decode(bytes.subarray(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0))
    const rows = csvRows(text); rows.shift()
    return Promise.all(rows.map(async ([winPath, size, modified]) => {
      const path = windowsToWsl(winPath, driveMounts)
      try { const target = await issue(path); return { ...target, windowsPath: winPath, size: Number(size) || target.size, modifiedAt: modified || target.modifiedAt, reason: basename(winPath).toLowerCase().includes(String(query).toLowerCase()) ? '文件名匹配' : '路径匹配' } } catch { return null }
    })).then((items) => items.filter(Boolean))
  }
  const methods = {
    capability: async () => ({ everything: await detect(), command, preview: true, driveMounts: await refreshDriveMounts(), office:await officeCapability(), ebook:await ebookCapability() }),
    search,
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
  }
  const handler = async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
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
      let start = 0; let end = info.size - 1; let status = 200
      if (range) { start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2])); end = range[2] ? Math.min(info.size - 1, Number(range[2])) : info.size - 1; status = 206 }
      res.writeHead(status, { 'content-type':mime(servedPath), 'content-length':String(Math.max(0, end-start+1)), 'accept-ranges':'bytes', ...(status===206?{'content-range':`bytes ${start}-${end}/${info.size}`}:{}) })
      if (req.method === 'HEAD') return res.end(); createReadStream(servedPath, { start, end }).pipe(res)
    } catch (error) { json(res, { ok:false, error:String(error?.message || error) }, 404) }
  }
  ctx.effect(() => ctx.webServer.register({ kind:'prefix', path:BASE, handler }))
}

export { csvRows }
