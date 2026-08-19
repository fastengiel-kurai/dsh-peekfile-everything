import { extname, basename, dirname, resolve } from 'node:path'

export const pathKind = (value) => /^[A-Za-z]:[\\/]/.test(value) ? 'windows' : value.startsWith('/') || value.startsWith('~/') ? 'posix' : 'relative'
export const windowsToWsl = (value, driveMounts = {}) => {
  const match = /^([A-Za-z]):[\\/](.*)$/.exec(value)
  if (!match) return value
  const drive = match[1].toUpperCase()
  return `${driveMounts[drive] || `/mnt/${drive.toLowerCase()}`}/${match[2].replaceAll('\\', '/')}`
}
export const normalizeCandidate = (value, cwd, home, driveMounts = {}) => {
  const clean = String(value).trim().replace(/^['"`]|['"`]$/g, '').replace(/:(\d+)(?:-(\d+))?$/, '')
  if (/^[A-Za-z]:[\\/]/.test(clean)) return windowsToWsl(clean, driveMounts)
  if (clean.startsWith('~/')) return resolve(home, clean.slice(2))
  return clean.startsWith('/') ? resolve(clean) : resolve(cwd, clean)
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
