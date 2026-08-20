import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const cacheRoot = join(homedir(), '.cache', 'peekfile', 'ebooks')
const locks = new Map()
const probe = async (command,args=['--version']) => { try { await exec(command,args,{timeout:5000,maxBuffer:1<<20});return command } catch { return null } }
export const ebookCapability = async () => ({ unzip:await probe('unzip',['-v']), converter:await probe(process.env.EBOOK_CONVERT_PATH || 'ebook-convert') })
export const isEbookPath = path => ['.epub','.mobi','.azw','.azw3'].includes(extname(path).toLowerCase())

export async function prepareEbook(source){
  const info=await stat(source),key=createHash('sha256').update(`${source}:${info.size}:${info.mtimeMs}`).digest('hex')
  if(locks.has(key))return locks.get(key)
  const task=(async()=>{
    const capability=await ebookCapability();if(!capability.unzip)throw new Error('EPUB 预览不可用：未安装 unzip')
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
    const packageXml=await readFile(opf,'utf8'),manifest=new Map([...packageXml.matchAll(/<item\b[^>]*>/gi)].map(m=>{const id=/\bid=["']([^"']+)["']/i.exec(m[0])?.[1],href=/\bhref=["']([^"']+)["']/i.exec(m[0])?.[1];return[id,href]}).filter(pair=>pair[0]&&pair[1]))
    const first=/<itemref\b[^>]*idref=["']([^"']+)["']/i.exec(packageXml)?.[1],href=first&&manifest.get(first)
    if(!href)throw new Error('EPUB 缺少可阅读章节')
    const entry=resolve(opf,'..',decodeURIComponent(href));if(!entry.startsWith(output+'/'))throw new Error('EPUB 章节越界')
    return {root:output,entry}
  })();locks.set(key,task);try{return await task}finally{locks.delete(key)}
}
