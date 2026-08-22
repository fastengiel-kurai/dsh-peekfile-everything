import { execFile } from 'node:child_process'
import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, readFile, readdir, realpath, stat, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, extname, relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { describePath, matchSnippet, mergeSearchSources, normalizeCandidate, parseCandidate, windowsToWsl } from './core.js'
import { convertOffice, isOfficePath, officeCapability } from './office.js'
import { ebookCapability, isEbookPath, prepareEbook } from './ebook.js'
import { lineRenderable, renderDocument, renderable } from './render.js'

export const name = 'dsh-peekfile-everything'
export const inject = ['webServer']
const exec = promisify(execFile)
const BASE = '/__peekfile'
const MAX_BODY = 1 << 20
const MAX_RESULTS = 100
const LOCAL_INDEX_TTL = 30_000
const toolCommand=(tools,key,field,fallback)=>tools?.[key]?.enabled===false?null:String(tools?.[key]?.[field]||fallback||'').trim()||null
const probe=async(command,args=['--version'])=>{if(!command)return{ok:false,disabled:true};try{const result=await exec(command,args,{encoding:'utf8',timeout:8000,maxBuffer:2<<20});return{ok:true,path:command,version:String(result.stdout||result.stderr||'').trim().split('\n')[0]}}catch(error){return{ok:false,path:command,error:String(error?.message||error)}}}
const probeExecutable=async(command)=>{if(!command)return{ok:false,disabled:true};try{await access(command);return{ok:true,path:command,version:'已检测到可执行文件'}}catch(error){return{ok:false,path:command,error:String(error?.message||error)}}}
const findRemoteUrl=(value,pattern)=>{if(typeof value==='string'&&/^https?:\/\//.test(value)&&pattern.test(value))return value;if(Array.isArray(value))for(const item of value){const hit=findRemoteUrl(item,pattern);if(hit)return hit}else if(value&&typeof value==='object')for(const item of Object.values(value)){const hit=findRemoteUrl(item,pattern);if(hit)return hit}return null}

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
  '.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.m4v':'video/x-m4v','.mkv':'video/x-matroska','.avi':'video/x-msvideo','.wmv':'video/x-ms-wmv','.rm':'application/vnd.rn-realmedia','.rmvb':'application/vnd.rn-realmedia-vbr','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.html':'text/html; charset=utf-8','.htm':'text/html; charset=utf-8','.xhtml':'application/xhtml+xml; charset=utf-8','.css':'text/css; charset=utf-8','.xml':'application/xml; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.otf':'font/otf','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8','.csv':'text/csv; charset=utf-8'
}[extname(path).toLowerCase()] || 'application/octet-stream')
const videoExtensions=new Set(['.mp4','.webm','.mov','.m4v','.mkv','.avi','.wmv','.rm','.rmvb'])
const htmlEsc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const videoPlayerPage=(title,source)=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEsc(title)}</title><style>:root{color-scheme:light dark;--bg:#f7f7f5;--layer:#fff;--text:#37352f;--muted:#787774;--border:#deddd9;--accent:#4176e6}@media(prefers-color-scheme:dark){:root{--bg:#202633;--layer:#242b38;--text:#e6e6e4;--muted:#a3a3a0;--border:#3d4657;--accent:#679efe}}*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;background:var(--bg);color:var(--text);font:13px/1.5 system-ui,sans-serif}.stage{position:relative;width:100%;height:100%;display:grid;place-items:center}video{width:100%;height:100%;object-fit:contain;background:#111827}.fallback{position:absolute;inset:0;display:none;place-items:center;padding:24px;background:var(--bg)}.fallback.show{display:grid}.card{max-width:460px;padding:22px;text-align:center;border:1px solid var(--border);border-radius:12px;background:var(--layer);box-shadow:0 12px 38px #0003}.card strong{display:block;margin-bottom:7px;font-size:15px}.card p{margin:0 0 15px;color:var(--muted)}button{min-width:120px;height:34px;border:1px solid var(--border);border-radius:18px;background:transparent;color:var(--text);cursor:pointer}button:hover{background:color-mix(in srgb,var(--text) 8%,transparent)}button:disabled{opacity:.6;cursor:wait}.spinner{display:none;width:15px;height:15px;margin-right:7px;vertical-align:-3px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .75s linear infinite}.loading .spinner{display:inline-block}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><main class="stage"><video id="video" src=${JSON.stringify(source)} controls autoplay playsinline preload="metadata"></video><section id="fallback" class="fallback"><div class="card"><strong>浏览器无法直接播放此视频</strong><p id="message">当前容器或视频编码不受浏览器支持，可以转换为 MP4 后播放。</p><button id="convert"><span class="spinner"></span><span id="label">转 MP4</span></button></div></section></main><script>const video=document.querySelector('#video'),fallback=document.querySelector('#fallback'),button=document.querySelector('#convert'),label=document.querySelector('#label');const show=()=>fallback.classList.add('show');video.addEventListener('error',show);button.onclick=()=>{button.disabled=true;button.classList.add('loading');label.textContent='转换中…';const target=parent!==window?parent:opener;target?.postMessage({type:'peekfile:transcode-video'},location.origin)};addEventListener('message',event=>{if(event.origin!==location.origin)return;if(event.data?.type==='peekfile:transcode-status'){if(event.data.status==='success'&&event.data.previewUrl){location.replace(event.data.previewUrl);return}if(event.data.status==='error'){button.disabled=false;button.classList.remove('loading');label.textContent='重新转换';document.querySelector('#message').textContent=event.data.message||'转换失败，请检查 FFmpeg 设置。'}}});video.play().catch(()=>{})</script></body></html>`

export function apply(ctx) {
  const handles = new Map()
  const localIndexes = new Map()
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
    if(!assetsRoot&&renderable(actual))params.set('render','1');if(!assetsRoot&&videoExtensions.has(extname(actual).toLowerCase()))params.set('player','1');if(fragment.lineStart)params.set('lineStart',String(fragment.lineStart));if(fragment.lineEnd)params.set('lineEnd',String(fragment.lineEnd))
    const hash=fragment.page?`#page=${fragment.page}`:fragment.time!==undefined?`#t=${fragment.time}`:''
    return { ...describePath(actual, info),...fragment,handle:id,previewUrl:`${BASE}/file/${id}/${routePath}${params.size?`?${params}`:''}${hash}` }
  }
  const search = async ({ query, limit = 50, offset = 0, tools }) => {
    const searchCommand=toolCommand(tools,'everything','path',command);if(!searchCommand)throw new Error('EverythingCLI 已在 PeekFile 设置中停用')
    try{await access(searchCommand);await exec(searchCommand,['-version'],{timeout:4000})}catch{throw new Error('EverythingCLI 未安装或不可用')}
    const count = Math.max(1, Math.min(MAX_RESULTS + 1, Number(limit) || 50))
    const start=Math.max(0,Number(offset)||0)
    const { stdout } = await exec(searchCommand, ['-viewport-offset',String(start),'-viewport-count',String(count), '-csv', '-utf8-bom', '-size', '-date-modified', String(query || '')], { encoding: 'buffer', timeout: 15000, maxBuffer: 8 << 20 })
    const bytes = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout)
    const text = new TextDecoder('gb18030').decode(bytes.subarray(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0))
    const rows = csvRows(text); rows.shift()
    return Promise.all(rows.map(async ([winPath, size, modified]) => {
      const path = windowsToWsl(winPath, driveMounts)
      try { const target = await issue(path);return { ...target, source:'everything', windowsPath: winPath, size: Number(size) || target.size, modifiedAt: modified || target.modifiedAt, reason:matchSnippet(basename(winPath),query) } } catch { return null }
    })).then((items) => items.filter(Boolean))
  }
  const localSearchTerms = query => (String(query).match(/"[^"]+"|[^\s]+/g)||[]).map(term=>term.replace(/^"|"$/g,'').replace(/^[-!]+/,'').replace(/^(?:file|folder|path|ext|name):/i,'').replace(/[?*]+/g,'').trim()).filter(Boolean)
  const localIndex = async (root,rgCommand='rg') => {
    const cached=localIndexes.get(root);if(cached&&cached.expires>Date.now())return cached.paths
    const {stdout}=await exec(rgCommand,['--files','--hidden','--no-ignore','-g','!**/.git/**','-g','!**/node_modules/**','-g','!**/.cache/**','-g','!**/.local/share/Trash/**',root],{encoding:'buffer',timeout:15_000,maxBuffer:64<<20})
    const paths=Buffer.from(stdout).toString('utf8').split('\n').filter(Boolean);localIndexes.set(root,{paths,expires:Date.now()+LOCAL_INDEX_TTL});return paths
  }
  const localSearch = async (root, query, limit, offset, source, rgCommand) => {
    if(!root||!allowed(root))return[]
    const terms=localSearchTerms(query);if(!terms.length)return[]
    try{const start=Math.max(0,Number(offset)||0),paths=(await localIndex(root,rgCommand)).filter(path=>{const name=basename(path).toLocaleLowerCase();return terms.every(term=>name.includes(term.toLocaleLowerCase()))}).slice(start,start+Math.max(1,limit));return(await Promise.all(paths.map(async path=>{try{return{...await issue(path),source,reason:matchSnippet(basename(path),query)}}catch{return null}}))).filter(Boolean)}catch{return[]}
  }
  const unifiedSearchPage = async ({query,page=0,pageSize=50,cwd,scopes=['workspace','wsl','everything'],tools}) => {
    const size=Math.max(1,Math.min(MAX_RESULTS,Number(pageSize)||50)),index=Math.max(0,Number(page)||0),offset=index*size,requested=new Set(Array.isArray(scopes)?scopes:['workspace','wsl','everything']),count=size+1
    let workspaceRoot=null
    try{workspaceRoot=await realpath(normalizeCandidate(cwd||process.cwd(),process.cwd(),homedir(),driveMounts));if(!allowed(workspaceRoot))workspaceRoot=null}catch{}
    const rgCommand=toolCommand(tools,'ripgrep','path','rg');const [workspaceRaw,wslRaw,everythingRaw]=await Promise.all([
      requested.has('workspace')&&rgCommand?localSearch(workspaceRoot,query,count,offset,'workspace',rgCommand):[],
      requested.has('wsl')&&rgCommand?localSearch(homedir(),query,count,offset,'wsl',rgCommand):[],
      requested.has('everything')?search({query,limit:count,offset,tools}).catch(()=>[]):[],
    ])
    const raw={workspace:workspaceRaw,wsl:wslRaw,everything:everythingRaw},bySource={},sourceHasMore={}
    for(const source of ['workspace','wsl','everything']){sourceHasMore[source]=raw[source].length>size;bySource[source]=raw[source].slice(0,size)}
    const items=mergeSearchSources([bySource.workspace,bySource.wsl,bySource.everything],size*3)
    return{items,bySource,page:index,pageSize:size,hasMore:Object.values(sourceHasMore).some(Boolean),sourceHasMore,sources:Object.fromEntries(Object.entries(bySource).map(([source,values])=>[source,values.length]))}
  }
  const methods = {
    capability: async ({tools}={}) => ({ everything:Boolean(await probe(toolCommand(tools,'everything','path',command),['-version']).then(value=>value.ok)), command:toolCommand(tools,'everything','path',command), preview: true, driveMounts: await refreshDriveMounts(), office:await officeCapability(), ebook:await ebookCapability(tools) }),
    search,
    'search-page':unifiedSearchPage,
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
    convert: async ({ path,tools }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||!isOfficePath(source))throw new Error('unsupported office path');const output=await convertOffice(source,tools);return issue(output,process.cwd(),dirname(output)) },
    ebook: async ({ path,tools }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||!isEbookPath(source))throw new Error('unsupported ebook path');const book=await prepareEbook(source,tools);return issue(book.entry,process.cwd(),book.root) },
    'inspect-pdf':async({path,tools})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||extname(source).toLowerCase()!=='.pdf')throw new Error('unsupported PDF path');const detectPdf=toolCommand(tools,'pdfInspector','detectPath','detect-pdf');if(!detectPdf)throw new Error('PDF Inspector 已在 PeekFile 设置中停用');const detected=JSON.parse((await exec(detectPdf,[source,'--json'],{encoding:'utf8',timeout:30_000,maxBuffer:8<<20})).stdout),type=String(detected.pdf_type||detected.pdfType||detected.type||''),kind=/Scanned|ImageBased|scanned|image_based/i.test(type)?'image':'text';return{kind,pdfType:type,confidence:detected.confidence,inspector:'pdf-inspector CLI',previewTarget:null}},
    'extract-pdf-text':async({path,tools})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||extname(source).toLowerCase()!=='.pdf')throw new Error('unsupported PDF path');const anydoc=toolCommand(tools,'anydoc','path','anydoc'),pdf2md=toolCommand(tools,'pdfInspector','convertPath','pdf2md');let text='';if(anydoc){const outputDir=resolve(homedir(),'.cache','peekfile','pdf-anydoc');await mkdir(outputDir,{recursive:true});const output=resolve(outputDir,`${crypto.randomUUID()}.md`);try{await exec(anydoc,[source,'-o',output],{timeout:180_000,maxBuffer:32<<20});text=await readFile(output,'utf8')}catch{}}if(!text&&pdf2md)text=(await exec(pdf2md,[source,'--raw'],{encoding:'utf8',timeout:180_000,maxBuffer:32<<20})).stdout;if(!text.trim())throw new Error('AnyDoc/PDF2MD 未能从该 PDF 提取文本');return{text,extractor:anydoc?'AnyDoc / PDF2MD':'PDF2MD'}},
    'convert-markdown':async({path,tools})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source)||!(extname(source).toLowerCase()==='.pdf'||isOfficePath(source)))throw new Error('当前文件不支持全文 Markdown 转换');const anydoc=toolCommand(tools,'anydoc','path','anydoc');if(!anydoc)throw new Error('AnyDoc 已在 PeekFile 设置中停用');const info=await stat(source),outputDir=resolve(homedir(),'.cache','peekfile','markdown'),stem=basename(source,extname(source)).replace(/[^\p{L}\p{N}._ -]+/gu,'_'),output=resolve(outputDir,`${stem}-${info.size}-${Math.trunc(info.mtimeMs)}.md`);await mkdir(outputDir,{recursive:true});try{await access(output)}catch{await exec(anydoc,[source,'-o',output],{timeout:180_000,maxBuffer:32<<20})}const result=await stat(output);if(!result.size)throw new Error('AnyDoc 生成的 Markdown 为空');return issue(output)},
    'transcode-mp4':async({path,tools})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');const ffmpeg=toolCommand(tools,'ffmpeg','path','ffmpeg');if(!ffmpeg)throw new Error('FFmpeg 已在 PeekFile 设置中停用');const sourceExt=extname(source),output=resolve(dirname(source),`${basename(source,sourceExt)}.mp4`);if(output===source)throw new Error('源文件已经是 MP4，无需转换');try{await access(output);throw new Error(`同目录已存在同名文件：${output}`)}catch(error){if(!String(error?.message||'').includes('ENOENT'))throw error}try{await exec(ffmpeg,['-n','-i',source,'-map','0:v?','-map','0:a?','-c:v','libx264','-c:a','aac','-movflags','+faststart',output],{timeout:30*60_000,maxBuffer:16<<20})}catch(error){await unlink(output).catch(()=>{});throw new Error(`转 MP4 失败：${error?.message||error}`)}return issue(output)},
    'tool-status':async({tools})=>{const ffmpeg=toolCommand(tools,'ffmpeg','path','ffmpeg'),anydoc=toolCommand(tools,'anydoc','path','anydoc'),officecli=toolCommand(tools,'officecli','path','officecli'),detectPdf=toolCommand(tools,'pdfInspector','detectPath','detect-pdf'),pdf2md=toolCommand(tools,'pdfInspector','convertPath','pdf2md'),ebookConvert=toolCommand(tools,'ebookConvert','path','ebook-convert'),unzip=toolCommand(tools,'unzip','path','unzip'),everything=toolCommand(tools,'everything','path',command),ripgrep=toolCommand(tools,'ripgrep','path','rg'),mineru=tools?.mineru||{};const [ffmpegStatus,anydocStatus,officeStatus,detectStatus,convertStatus,ebookStatus,unzipStatus,everythingStatus,ripgrepStatus]=await Promise.all([probe(ffmpeg,['-version']),probe(anydoc,['--version']),probe(officecli,['--version']),probeExecutable(detectPdf),probeExecutable(pdf2md),probe(ebookConvert,['--version']),probe(unzip,['-v']),probe(everything,['-version']),probe(ripgrep,['--version'])]);let mineruStatus={ok:false,disabled:mineru.enabled===false,endpoint:mineru.endpoint||'https://mineru.net'};if(mineru.enabled!==false)try{const token=String(await readFile(mineru.tokenPath,'utf8')).trim();mineruStatus={...mineruStatus,ok:Boolean(token),tokenPath:mineru.tokenPath}}catch(error){mineruStatus={...mineruStatus,error:String(error?.message||error),tokenPath:mineru.tokenPath}}return{ffmpeg:ffmpegStatus,anydoc:anydocStatus,officecli:officeStatus,pdfInspector:{ok:detectStatus.ok&&convertStatus.ok,detect:detectStatus,convert:convertStatus},ebookConvert:ebookStatus,unzip:unzipStatus,everything:everythingStatus,ripgrep:ripgrepStatus,mineru:mineruStatus}},
    'mineru-ocr':async({path,tools})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');const cfg=tools?.mineru||{};if(cfg.enabled===false)throw new Error('MinerU 已在 PeekFile 设置中停用');const token=String(await readFile(cfg.tokenPath,'utf8')).trim();if(!token)throw new Error('MinerU Token 文件为空');const endpoint=String(cfg.endpoint||'https://mineru.net').replace(/\/$/,'');const headers={Authorization:`Bearer ${token}`,'content-type':'application/json'},body={files:[{name:basename(source),data_id:crypto.randomUUID(),is_ocr:true,...(cfg.pageRanges?{page_ranges:String(cfg.pageRanges)}:{})}],model_version:cfg.modelVersion||'vlm',enable_formula:cfg.enableFormula!==false,enable_table:cfg.enableTable!==false,language:cfg.language||'ch'};const init=await fetch(`${endpoint}/api/v4/file-urls/batch`,{method:'POST',headers,body:JSON.stringify(body)}).then(async response=>{const data=await response.json();if(!response.ok||Number(data.code||0)!==0)throw new Error(data.msg||`MinerU HTTP ${response.status}`);return data});const batchId=init.data?.batch_id,fileUrl=init.data?.file_urls?.[0];if(!batchId||!fileUrl)throw new Error('MinerU 未返回上传地址');const upload=await fetch(fileUrl,{method:'PUT',body:await readFile(source)});if(!upload.ok)throw new Error(`MinerU 上传失败：HTTP ${upload.status}`);const deadline=Date.now()+Math.max(30,Number(cfg.timeoutSeconds)||600)*1000;let result;while(Date.now()<deadline){await new Promise(resolve=>setTimeout(resolve,3000));result=await fetch(`${endpoint}/api/v4/extract-results/batch/${batchId}`,{headers:{Authorization:`Bearer ${token}`}}).then(response=>response.json());const state=String(result.data?.extract_result?.[0]?.state||result.data?.state||'').toLowerCase();if(['failed','error'].includes(state))throw new Error(result.data?.extract_result?.[0]?.err_msg||'MinerU 解析失败');if(['done','success','completed'].includes(state)||findRemoteUrl(result,/\.md(?:\?|$)|markdown/i)||findRemoteUrl(result,/\.zip(?:\?|$)/i))break}if(!result)throw new Error('MinerU OCR 超时');const outputDir=resolve(homedir(),'.cache','peekfile','mineru',batchId);await mkdir(outputDir,{recursive:true});const markdownUrl=findRemoteUrl(result,/\.md(?:\?|$)|markdown/i);let output=resolve(outputDir,'result.md');if(markdownUrl){const response=await fetch(markdownUrl);if(!response.ok)throw new Error(`MinerU 结果下载失败：HTTP ${response.status}`);await writeFile(output,Buffer.from(await response.arrayBuffer()))}else{const zipUrl=findRemoteUrl(result,/\.zip(?:\?|$)/i);if(!zipUrl)throw new Error('MinerU 已完成，但未返回 Markdown 或 ZIP 地址');const zip=resolve(outputDir,'result.zip'),response=await fetch(zipUrl);if(!response.ok)throw new Error(`MinerU ZIP 下载失败：HTTP ${response.status}`);await writeFile(zip,Buffer.from(await response.arrayBuffer()));await exec('unzip',['-oq',zip,'-d',outputDir],{timeout:60000});const markdown=(await readdir(outputDir,{recursive:true})).find(name=>String(name).toLowerCase().endsWith('.md'));if(!markdown)throw new Error('MinerU 结果包中未找到 Markdown');output=resolve(outputDir,String(markdown))}return{target:await issue(output),batchId}},
    subtitles:async({path})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');const folder=dirname(source),stem=basename(source,extname(source)).toLocaleLowerCase(),extensions=new Set(['.srt','.ass','.vtt','.ssa','.sub']),names=(await readdir(folder)).filter(name=>extensions.has(extname(name).toLowerCase())&&basename(name,extname(name)).toLocaleLowerCase().startsWith(stem));return{items:(await Promise.all(names.map(name=>issue(resolve(folder,name)))))}} ,
    lines: async ({ path }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');const info=await stat(source);if(!info.isFile()||!lineRenderable(source))throw new Error('当前文件不是行式文本');if(info.size>(16<<20))throw new Error('行式文本预览上限为 16 MiB');const text=await readFile(source,'utf8');return {lines:Math.max(1,text.split('\n').length)} },
    text: async ({ path }) => { const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');const info=await stat(source);if(!info.isFile()||!lineRenderable(source))throw new Error('当前文件不是行式文本');if(info.size>(16<<20))throw new Error('行式文本读取上限为 16 MiB');return {text:await readFile(source,'utf8')} },
    'native-region-capture':async()=>{if(process.platform!=='darwin')throw new Error('native region capture is only available on macOS');const outputDir=resolve(homedir(),'.cache','peekfile','screenshots'),output=resolve(outputDir,`region-${Date.now()}.png`);await mkdir(outputDir,{recursive:true});await exec('/usr/sbin/screencapture',['-i','-o',output],{timeout:5*60_000});const info=await stat(output);if(!info.size)throw new Error('截图已取消');return issue(output)},
    'open-system':async ({path})=>{const source=await realpath(normalizeCandidate(path,process.cwd(),homedir(),driveMounts));if(!allowed(source))throw new Error('path outside allowed roots');if(process.platform==='linux'&&await access('/mnt/c/Windows/System32/cmd.exe').then(()=>true).catch(()=>false)){const converted=await exec('wslpath',['-w',source],{encoding:'utf8',timeout:5000});await exec('/mnt/c/Windows/System32/cmd.exe',['/c','start','',String(converted.stdout).trim()],{timeout:10000});return{opened:true}}await exec(process.platform==='darwin'?'open':'xdg-open',[source],{timeout:10000});return{opened:true}},
  }
  const handler = async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    if(req.method==='POST'&&url.pathname===`${BASE}/mineru-ocr-upload`){
      const outputDir=resolve(homedir(),'.cache','peekfile','ocr-upload');let output
      try{
        await mkdir(outputDir,{recursive:true});const rawName=decodeURIComponent(String(req.headers['x-peekfile-name']||'page.png')),name=rawName.replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,160)||'page.png';output=resolve(outputDir,`${Date.now()}-${crypto.randomUUID()}-${name}`)
        const limitBytes=32*1024*1024,declared=Number(req.headers['content-length']||0);if(declared>limitBytes)throw new Error('OCR 截图超过 32 MB')
        let total=0;const meter=new Transform({transform(chunk,_encoding,callback){total+=chunk.length;callback(total>limitBytes?new Error('OCR 截图超过 32 MB'):null,chunk)}});await pipeline(req,meter,createWriteStream(output,{flags:'wx'}))
        const tools=JSON.parse(decodeURIComponent(String(req.headers['x-peekfile-tools']||'%7B%7D')));const value=await methods['mineru-ocr']({path:output,tools});await unlink(output).catch(()=>{});return json(res,{ok:true,value})
      }catch(error){if(output)await unlink(output).catch(()=>{});return json(res,{ok:false,error:String(error?.message||error)},400)}
    }
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
      if(url.searchParams.get('player')==='1'&&videoExtensions.has(extname(servedPath).toLowerCase())){const html=videoPlayerPage(basename(servedPath),url.pathname);res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-length':String(Buffer.byteLength(html))});return res.end(html)}
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
