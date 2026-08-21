import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readdir, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const cacheRoot = join(homedir(), '.cache', 'peekfile', 'office')
const locks = new Map()
const candidates = {
  officecli: [process.env.OFFICECLI_PATH, 'officecli'].filter(Boolean),
  libreoffice: [process.env.LIBREOFFICE_PATH, process.env.SOFFICE_PATH, '/usr/bin/soffice', '/usr/bin/libreoffice', 'soffice', 'libreoffice'].filter(Boolean),
}

const probeOne = async (list) => {
  for (const command of [...new Set(list)]) {
    try { await exec(command, ['--version'], { timeout:5000, maxBuffer:1<<20 }); return command } catch {}
  }
  return null
}
export const officeCapability = async () => ({ officecli:await probeOne(candidates.officecli), libreoffice:await probeOne(candidates.libreoffice) })

export async function convertOffice(source, tools = {}) {
  const info = await stat(source)
  const key = createHash('sha256').update(`${source}:${info.size}:${info.mtimeMs}`).digest('hex')
  if (locks.has(key)) return locks.get(key)
  const task = (async () => {
    const outputDir = join(cacheRoot,key); await mkdir(outputDir,{recursive:true})
    const cached=await readdir(outputDir).catch(()=>[]),existing=cached.find(name=>/\.html$/i.test(name))||cached.find(name=>/\.pdf$/i.test(name))
    if(existing)return join(outputDir,existing)
    const capability=await officeCapability(),officecli=tools.officecli?.enabled!==false?(tools.officecli?.path||capability.officecli):null
    if(officecli){
      const output=join(outputDir,'preview.html')
      try{await exec(officecli,['view',source,'html','-o',output],{timeout:180000,maxBuffer:32<<20});await access(output);return output}catch{}
    }
    const anydoc=tools.anydoc?.enabled!==false?(tools.anydoc?.path||'anydoc'):null
    if(anydoc){
      const output=join(outputDir,'preview.md')
      try{await exec(anydoc,[source,'-o',output],{timeout:180000,maxBuffer:32<<20});await access(output);return output}catch{}
    }
    if(capability.libreoffice){
      await exec(capability.libreoffice,['--headless','--convert-to','pdf','--outdir',outputDir,source],{timeout:120000,maxBuffer:16<<20})
      const pdf=(await readdir(outputDir)).find(name=>name.toLowerCase().endsWith('.pdf'))
      if(pdf)return join(outputDir,pdf)
    }
    throw new Error('Office 预览不可用：请启用并配置 AnyDoc 或 OfficeCLI')
  })()
  locks.set(key,task)
  try{return await task}finally{locks.delete(key)}
}

export const isOfficePath = path => ['.doc','.docx','.xls','.xlsx','.ppt','.pptx','.odt','.ods','.odp','.rtf'].includes(extname(path).toLowerCase())
