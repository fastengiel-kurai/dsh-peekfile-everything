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

export async function convertOffice(source) {
  const info = await stat(source)
  const key = createHash('sha256').update(`${source}:${info.size}:${info.mtimeMs}`).digest('hex')
  if (locks.has(key)) return locks.get(key)
  const task = (async () => {
    const outputDir = join(cacheRoot,key); await mkdir(outputDir,{recursive:true})
    const existing=(await readdir(outputDir).catch(()=>[])).find(name=>/\.(html|pdf)$/i.test(name))
    if(existing)return join(outputDir,existing)
    const capability=await officeCapability()
    if(capability.officecli){
      const output=join(outputDir,'preview.html')
      await exec(capability.officecli,['view',source,'html','-o',output],{timeout:120000,maxBuffer:16<<20})
      await access(output);return output
    }
    if(capability.libreoffice){
      await exec(capability.libreoffice,['--headless','--convert-to','pdf','--outdir',outputDir,source],{timeout:120000,maxBuffer:16<<20})
      const pdf=(await readdir(outputDir)).find(name=>name.toLowerCase().endsWith('.pdf'))
      if(pdf)return join(outputDir,pdf)
    }
    throw new Error('Office 预览不可用：未安装 OfficeCLI 或 LibreOffice')
  })()
  locks.set(key,task)
  try{return await task}finally{locks.delete(key)}
}

export const isOfficePath = path => ['.doc','.docx','.xls','.xlsx','.ppt','.pptx','.odt','.ods','.odp'].includes(extname(path).toLowerCase())

