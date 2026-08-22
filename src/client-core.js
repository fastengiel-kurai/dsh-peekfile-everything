export const previewFamilies = [
  ['image', '图片'],
  ['pdf', 'PDF'],
  ['web', 'Markdown、HTML'],
  ['text', '文本、代码、脚本'],
  ['media', '音频、视频'],
  ['office', 'Word、Excel、PowerPoint'],
  ['ebook', 'EPUB、电子书'],
  ['other', '其他文件'],
]

const familyExtensions = {
  image: new Set(['png','jpg','jpeg','gif','webp','svg','bmp','ico','avif','heic']),
  pdf: new Set(['pdf']),
  web: new Set(['md','markdown','html','htm','xhtml']),
  text: new Set(['txt','log','json','js','mjs','cjs','jsx','ts','tsx','py','rs','go','java','c','cc','cpp','h','hpp','cs','php','rb','sh','bash','zsh','ps1','css','scss','yaml','yml','toml','ini','conf','xml','sql','vue','svelte','csv','tsv']),
  media: new Set(['mp3','wav','flac','aac','m4a','ogg','opus','mp4','mkv','mov','avi','webm','wmv','m4v','rm','rmvb']),
  office: new Set(['doc','docx','odt','rtf','xls','xlsx','ods','ppt','pptx','odp']),
  ebook: new Set(['epub','mobi','azw','azw3','fb2']),
}

export const previewFamilyOf = target => {
  const extension = String(target?.extension || '').toLowerCase()
  for (const [family, extensions] of Object.entries(familyExtensions)) {
    if (extensions.has(extension)) return family
  }
  return 'other'
}

const normalizedPath = value => String(value || '').replaceAll('\\', '/').replace(/\/+$/, '')

export const pathInsideRoot = (path, root) => {
  const candidate = normalizedPath(path)
  const boundary = normalizedPath(root)
  return Boolean(candidate && boundary && (candidate === boundary || candidate.startsWith(`${boundary}/`)))
}

export const configuredPreviewChannel = (preferences, target) => {
  const mode = preferences?.previewRoutingMode || 'peekfile-first'
  if (mode === 'peekfile-first') return 'peekfile'
  if (mode !== 'custom') return 'peekfile'
  const selected = preferences?.previewFamilyRoutes?.[previewFamilyOf(target)] || 'peekfile'
  return selected === 'sidebar' ? 'sidebar' : 'peekfile'
}

export const sidebarRouteEligibility = ({ preferences, target, cwd, sidebarAvailable, viewerMatched }) => {
  if (configuredPreviewChannel(preferences, target) !== 'sidebar') return { eligible:false, reason:'peekfile-selected' }
  if (!sidebarAvailable) return { eligible:false, reason:'sidebar-unavailable' }
  if (!pathInsideRoot(target?.sourcePath || target?.path, cwd)) return { eligible:false, reason:'outside-workspace' }
  if (!viewerMatched) return { eligible:false, reason:'viewer-unavailable' }
  return { eligible:true, reason:'sidebar' }
}

export const parseCachedSearchQuery = value => {
  const parts=String(value||'').split('+').map(part=>part.trim())
  return {base:parts.shift()||'',filters:parts.filter(Boolean)}
}

export const filterCachedSearchItems = (items, filters = []) => {
  const terms=filters.map(term=>String(term).toLocaleLowerCase()).filter(Boolean)
  if(!terms.length)return items
  return items.filter(item=>{const text=`${item?.name||''} ${item?.parent||''} ${item?.path||''}`.toLocaleLowerCase();return terms.every(term=>text.includes(term))})
}

export const previewCapabilitiesOf = target => {
  const family = previewFamilyOf(target)
  const extension = String(target?.extension || '').toLowerCase()
  const capabilities = new Set(['copy-path','download','open-system','refresh','file-info'])
  const lineText = new Set(['txt','log','md','markdown','json','js','mjs','cjs','jsx','ts','tsx','py','rs','go','java','c','cpp','h','hpp','css','scss','sh','zsh','yaml','yml','toml','ini','conf','xml','sql','vue','svelte'])
  if (lineText.has(extension)) {
    capabilities.add('copy-content')
    capabilities.add('copy-selection')
    capabilities.add('send-full-to-chat')
    capabilities.add('send-selection-to-chat')
  }
  if (family === 'image' || ['mp4','webm','mov','m4v'].includes(extension)) capabilities.add('screenshot')
  return capabilities
}

const menuExtensions = {
  text:new Set(['txt','log','md','markdown','rst','adoc','org','tex','json','jsonl','js','mjs','cjs','jsx','ts','tsx','py','rs','go','java','c','cc','cpp','h','hpp','cs','php','rb','pl','pm','lua','swift','kt','kts','scala','r','dart','ex','exs','erl','hrl','clj','cljs','groovy','gradle','asm','s','sol','proto','graphql','gql','sh','bash','zsh','fish','ps1','bat','cmd','css','scss','less','yaml','yml','toml','ini','cfg','conf','properties','env','lock','xml','sql','vue','svelte','html','htm','xhtml','csv','tsv','srt','vtt','ass','ssa','sub']),
  image:new Set(['png','jpg','jpeg','gif','webp','svg','bmp','ico','avif','heic']),
  video:new Set(['mp4','webm','mov','m4v','mkv','avi','wmv','rm','rmvb']),
  audio:new Set(['mp3','wav','flac','aac','m4a','ogg','opus']),
  office:new Set(['doc','docx','xls','xlsx','ppt','pptx','odt','ods','odp','rtf']),
  ebook:new Set(['epub','mobi','azw','azw3','fb2']),
  archive:new Set(['zip','rar','7z','tar','gz','bz2','xz']),
}

export const previewMenuKind = (target, pdfKind = target?.pdfKind) => {
  if(['office','ebook','pdf-text','pdf-image'].includes(target?.menuKind))return target.menuKind
  const extension=String(target?.extension||'').toLowerCase()
  if(menuExtensions.text.has(extension))return'text'
  if(menuExtensions.image.has(extension))return'image'
  if(menuExtensions.video.has(extension))return'video'
  if(menuExtensions.audio.has(extension))return'audio'
  if(extension==='pdf')return pdfKind==='image'?'pdf-image':'pdf-text'
  if(menuExtensions.office.has(extension))return'office'
  if(menuExtensions.ebook.has(extension))return'ebook'
  if(menuExtensions.archive.has(extension))return'archive'
  return'other'
}
