import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const cacheRoot = join(homedir(), '.cache', 'peekfile', 'ebooks')
const locks = new Map()
const configured=(tools,key,fallback)=>tools?.[key]?.enabled===false?null:String(tools?.[key]?.path||fallback||'').trim()||null
const probe = async (command,args=['--version']) => { if(!command)return null;try { await exec(command,args,{timeout:5000,maxBuffer:1<<20});return command } catch { return null } }
export const ebookCapability = async tools => ({ unzip:await probe(configured(tools,'unzip','unzip'),['-v']), converter:await probe(configured(tools,'ebookConvert',process.env.EBOOK_CONVERT_PATH || 'ebook-convert')) })
export const isEbookPath = path => ['.epub','.mobi','.azw','.azw3','.fb2'].includes(extname(path).toLowerCase())

const attr=(tag,name)=>new RegExp(`\\b${name}=["']([^"']+)["']`,'i').exec(tag)?.[1]
const decodeXml=value=>String(value||'').replace(/&(?:#(x[0-9a-f]+|\d+)|amp|lt|gt|quot|apos);/gi,(match,numeric)=>{
  if(numeric)return String.fromCodePoint(parseInt(numeric.replace(/^x/i,''),/^x/i.test(numeric)?16:10))
  return({ '&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'" })[match.toLowerCase()]||match
})
const inside=(root,path)=>path===root||path.startsWith(`${root}/`)
const relativeUrl=(root,path)=>relative(root,path).split('/').map(encodeURIComponent).join('/')
const safeJson=value=>JSON.stringify(value).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026')

function readerHtml(title,chapters){
  const data=safeJson(chapters)
  const bookTitle=String(title||'EPUB 阅读器').replace(/[&<>"']/g,char=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[char])
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${bookTitle}</title><style>
:root{color-scheme:light;--reader-bg:#fff;--reader-layer:#f7f7f5;--reader-margin:#f1f1ef;--reader-text:#37352f;--reader-muted:#787774;--reader-border:#e8e7e4;--reader-hover:#ececea;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}@media(prefers-color-scheme:dark){:root{color-scheme:dark;--reader-bg:#191919;--reader-layer:#242424;--reader-margin:#202633;--reader-text:#e6e6e4;--reader-muted:#a3a3a0;--reader-border:#373d49;--reader-hover:#303744}}*{box-sizing:border-box}html,body{height:100%;margin:0;overflow:hidden;background:var(--reader-bg);color:var(--reader-text)}.reader{height:100%;display:grid;grid-template-rows:42px minmax(0,1fr) 38px}.bar{display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--reader-layer);border-color:var(--reader-border);border-style:solid;border-width:0 0 1px}.bar.bottom{border-width:1px 0 0}.title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600}.spacer{flex:1}.nav{min-width:0;max-width:55%;height:28px;border:1px solid var(--reader-border);border-radius:6px;background:var(--reader-bg);color:var(--reader-text)}.button{height:28px;min-width:64px;border:1px solid var(--reader-border);border-radius:6px;background:var(--reader-hover);color:var(--reader-text);cursor:pointer}.button:disabled{opacity:.4;cursor:default}.page{font-size:12px;white-space:nowrap;color:var(--reader-muted)}.book{min-height:0;overflow-y:auto;overflow-x:hidden;padding:24px clamp(20px,5vw,72px);scroll-behavior:smooth;background:var(--reader-margin)}.chapter{display:block;width:100%;min-height:1px;border:0;background:#fff;overflow:hidden}.chapter+.chapter{margin-top:24px;border-top:1px solid var(--reader-border);padding-top:24px}@media(max-width:620px){.title{display:none}.nav{max-width:none;flex:1}.button{min-width:52px}.book{padding:16px 18px}}
</style></head><body><main class="reader"><header class="bar"><strong class="title">${bookTitle}</strong><span class="spacer"></span><select id="nav" class="nav" aria-label="章节目录"></select></header><section id="book" class="book" aria-label="电子书正文"></section><footer class="bar bottom"><button id="page-prev" class="button">上一页</button><button id="page-next" class="button">下一页</button><button id="counter" class="button page" disabled>1 / 1</button><span class="spacer"></span><button id="chapter-prev" class="button">上一章</button><button id="chapter-next" class="button">下一章</button></footer></main><script>
const chapters=${data};const book=document.querySelector('#book'),nav=document.querySelector('#nav'),counter=document.querySelector('#counter'),pagePrev=document.querySelector('#page-prev'),pageNext=document.querySelector('#page-next'),chapterPrev=document.querySelector('#chapter-prev'),chapterNext=document.querySelector('#chapter-next');let index=0,pageIndex=0,pageCount=1,locking=false;const frames=chapters.map((chapter,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=chapter.label||('第 '+(i+1)+' 章');nav.append(option);const frame=document.createElement('iframe');frame.className='chapter';frame.title=option.textContent;frame.src=chapter.href;frame.dataset.index=String(i);frame.scrolling='no';frame.addEventListener('load',()=>fit(frame));book.append(frame);return frame});function fit(frame){try{const doc=frame.contentDocument;doc.documentElement.style.overflow='hidden';if(doc.body)doc.body.style.overflow='hidden';const resize=()=>{frame.style.height=Math.max(doc.documentElement.scrollHeight,doc.body?.scrollHeight||0,1)+'px';requestAnimationFrame(measure)};resize();new ResizeObserver(resize).observe(doc.documentElement)}catch{} }function measure(){const height=Math.max(1,book.clientHeight);pageCount=Math.max(1,Math.ceil(book.scrollHeight/height));pageIndex=Math.max(0,Math.min(pageCount-1,Math.floor(book.scrollTop/height)));if(!locking){const marker=book.scrollTop+Math.min(100,height*.2);let active=0;for(let i=0;i<frames.length;i++)if(frames[i].offsetTop<=marker)active=i;index=active;nav.value=String(index);sessionStorage.setItem('peekfile-epub-index',String(index))}update()}function update(){counter.textContent=(pageIndex+1)+' / '+pageCount;pagePrev.disabled=book.scrollTop<=0;pageNext.disabled=book.scrollTop+book.clientHeight>=book.scrollHeight-2;chapterPrev.disabled=index===0;chapterNext.disabled=index===chapters.length-1}function scrollPage(direction){book.scrollBy({top:direction*Math.max(1,book.clientHeight),behavior:'smooth'})}function show(value){index=Math.max(0,Math.min(chapters.length-1,Number(value)||0));locking=true;frames[index].scrollIntoView({block:'start',behavior:'smooth'});nav.value=String(index);sessionStorage.setItem('peekfile-epub-index',String(index));setTimeout(()=>{locking=false;measure()},350);update()}book.addEventListener('scroll',measure,{passive:true});pagePrev.onclick=()=>scrollPage(-1);pageNext.onclick=()=>scrollPage(1);chapterPrev.onclick=()=>show(index-1);chapterNext.onclick=()=>show(index+1);nav.onchange=()=>show(nav.value);addEventListener('keydown',event=>{if(event.key==='PageUp'||event.key==='ArrowLeft')scrollPage(-1);if(event.key==='PageDown'||event.key==='ArrowRight')scrollPage(1)});let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>frames.forEach(fit),120)});Promise.all(frames.map(frame=>new Promise(resolve=>frame.addEventListener('load',resolve,{once:true})))).then(()=>show(Number(sessionStorage.getItem('peekfile-epub-index')||0)));update()
</script></body></html>`
}

export async function prepareEbook(source,tools){
  const info=await stat(source),key=createHash('sha256').update(`${source}:${info.size}:${info.mtimeMs}`).digest('hex')
  if(locks.has(key))return locks.get(key)
  const task=(async()=>{
    const capability=await ebookCapability(tools);if(!capability.unzip)throw new Error('EPUB 预览不可用：未安装或未启用 unzip')
    const output=join(cacheRoot,key),marker=join(output,'.ready');await mkdir(output,{recursive:true})
    let epub=source
    if(extname(source).toLowerCase()!=='.epub'){
      if(!capability.converter)throw new Error('MOBI/AZW 预览不可用：未安装 ebook-convert')
      epub=join(output,'converted.epub');try{await access(epub)}catch{await exec(capability.converter,[source,epub],{timeout:180000,maxBuffer:16<<20})}
    }
    try{await access(marker)}catch{await exec('unzip',['-oq',epub,'-d',output],{timeout:120000,maxBuffer:8<<20});await import('node:fs/promises').then(fs=>fs.writeFile(marker,''))}
    const container=await readFile(join(output,'META-INF','container.xml'),'utf8')
    const match=/full-path=["']([^"']+)["']/.exec(container);if(!match)throw new Error('EPUB 缺少有效的 OPF 入口')
    const opf=resolve(output,match[1]);if(opf!==output&&!opf.startsWith(output+'/'))throw new Error('EPUB 入口越界')
    const packageXml=await readFile(opf,'utf8'),opfRoot=dirname(opf)
    const manifest=new Map([...packageXml.matchAll(/<item\b[^>]*>/gi)].map(match=>[attr(match[0],'id'),{href:attr(match[0],'href'),mediaType:attr(match[0],'media-type'),properties:attr(match[0],'properties')||''}]).filter(([id,item])=>id&&item.href))
    const spine=[...packageXml.matchAll(/<itemref\b[^>]*>/gi)].map(match=>attr(match[0],'idref')).filter(Boolean)
    const title=decodeXml(/<dc:title\b[^>]*>([\s\S]*?)<\/dc:title>/i.exec(packageXml)?.[1]||source.split('/').pop())
    const labels=new Map
    const ncxItem=[...manifest.values()].find(item=>item.mediaType==='application/x-dtbncx+xml')
    if(ncxItem){
      const ncxPath=resolve(opfRoot,decodeURIComponent(ncxItem.href));if(inside(output,ncxPath))try{
        const ncx=await readFile(ncxPath,'utf8')
        for(const point of ncx.matchAll(/<navPoint\b[\s\S]*?<navLabel\b[^>]*>[\s\S]*?<text\b[^>]*>([\s\S]*?)<\/text>[\s\S]*?<content\b[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/navPoint>/gi))labels.set(resolve(dirname(ncxPath),decodeURIComponent(point[2].split('#')[0])),decodeXml(point[1].replace(/<[^>]+>/g,'')))
      }catch{}
    }
    const chapters=(await Promise.all(spine.map(async(id,index)=>{
      const item=manifest.get(id);if(!item)return null
      const path=resolve(opfRoot,decodeURIComponent(item.href.split('#')[0]));if(!inside(output,path))return null
      let label=labels.get(path)||''
      if(!label||/^(?:text|chapter|section)?\d+$/i.test(label))try{const chapter=await readFile(path,'utf8');label=decodeXml(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(chapter)?.[1]?.replace(/<[^>]+>/g,'').trim())}catch{}
      return{href:relativeUrl(output,path),label:label||`第 ${index+1} 章`}
    }))).filter(Boolean)
    if(!chapters.length)throw new Error('EPUB 缺少可阅读章节')
    const entry=join(output,'peekfile-reader.html');await writeFile(entry,readerHtml(title,chapters),'utf8')
    return {root:output,entry,chapters:chapters.length,title}
  })();locks.set(key,task);try{return await task}finally{locks.delete(key)}
}
