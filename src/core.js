import { extname, basename, dirname, resolve } from 'node:path'

export const pathKind = (value) => /^[A-Za-z]:[\\/]/.test(value) ? 'windows' : value.startsWith('/') || value.startsWith('~/') ? 'posix' : 'relative'
export const windowsToWsl = (value, driveMounts = {}) => {
  const match = /^([A-Za-z]):[\\/](.*)$/.exec(value)
  if (!match) return value
  const drive = match[1].toUpperCase()
  return `${driveMounts[drive] || `/mnt/${drive.toLowerCase()}`}/${match[2].replaceAll('\\', '/')}`
}
export const parseCandidate = value => {
  let path=String(value).trim().replace(/^['"`]|['"`]$/g,'')
  const fragment={}
  const hash=/#(?:page=(\d+)|t=(\d+(?:\.\d+)?))$/.exec(path)
  if(hash){if(hash[1])fragment.page=Number(hash[1]);if(hash[2])fragment.time=Number(hash[2]);path=path.slice(0,hash.index)}
  const lines=/(?:^|[^:]):(\d+)(?:-(\d+))?$/.exec(path)
  if(lines){fragment.lineStart=Number(lines[1]);fragment.lineEnd=Number(lines[2]||lines[1]);path=path.slice(0,lines.index+lines[0].lastIndexOf(':'))}
  return {path,...fragment}
}
export const normalizeCandidate = (value, cwd, home, driveMounts = {}) => {
  const clean = parseCandidate(value).path
  if (/^[A-Za-z]:[\\/]/.test(clean)) return windowsToWsl(clean, driveMounts)
  if (clean.startsWith('~/')) return resolve(home, clean.slice(2))
  return clean.startsWith('/') ? resolve(clean) : resolve(cwd, clean)
}
export const matchSnippet = (filename, query) => {
  const source=String(filename),lower=source.toLocaleLowerCase(),terms=String(query).match(/"[^"]+"|[^\s]+/g)||[]
  for(const raw of terms){const term=raw.replace(/^"|"$/g,'').replace(/^[-!]+/,'').replace(/^(?:file|folder|path|ext|name):/i,'').replace(/[?*]+/g,'').trim();if(!term)continue;const index=lower.indexOf(term.toLocaleLowerCase());if(index<0)continue;const tail=source.slice(index),snippet=tail.split(/[\s\\/\-–—_()[\]{}【】（）《》,，.。;；:：]+/,1)[0];return(snippet||source.slice(index,index+term.length)).slice(0,32)}
  return '路径'
}
export const describePath = (fullPath, stats) => ({
  name: basename(fullPath),
  extension: stats.isDirectory() ? '' : extname(fullPath).slice(1).toLowerCase(),
  parent: dirname(fullPath),
  path: fullPath,
  kind: stats.isDirectory() ? 'directory' : 'file',
  size: stats.size,
  modifiedAt: stats.mtime.toISOString(),
})
