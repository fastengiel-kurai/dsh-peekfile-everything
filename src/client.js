const inject = []
const CSS = `.peekfile-btn{border:0;background:transparent;color:inherit;cursor:pointer;padding:6px 9px;border-radius:8px}.peekfile-btn:hover{background:rgba(127,127,127,.16)}.peekfile-panel{position:fixed;inset:64px 24px 24px auto;width:min(860px,calc(100vw - 48px));z-index:3000;background:var(--dsw-alias-bg-overlay,#171a21);color:var(--dsw-alias-label-primary,#eee);border:1px solid rgba(127,127,127,.35);border-radius:14px;box-shadow:0 18px 60px #0008;display:flex;flex-direction:column;overflow:hidden}.peekfile-bar{display:flex;gap:8px;padding:10px;border-bottom:1px solid rgba(127,127,127,.25)}.peekfile-input{flex:1;background:transparent;color:inherit;border:1px solid rgba(127,127,127,.4);border-radius:8px;padding:7px 10px}.peekfile-body{display:grid;grid-template-columns:minmax(300px,42%) 1fr;min-height:0;flex:1}.peekfile-results{overflow:auto;border-right:1px solid rgba(127,127,127,.25)}.peekfile-row{display:grid;grid-template-columns:1fr 70px;padding:8px 10px;border-bottom:1px solid rgba(127,127,127,.15);cursor:pointer}.peekfile-row:hover{background:rgba(79,140,255,.12)}.peekfile-path{font-size:10px;opacity:.65;grid-column:1/-1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.peekfile-frame{width:100%;height:100%;border:0;background:#fff}.peekfile-empty{display:grid;place-items:center;opacity:.65}.peekfile-link{color:#4f8cff;text-decoration:underline dotted;cursor:pointer}`
const api = async (method,args={}) => { const r=await fetch('/__peekfile/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({method,args})}); const j=await r.json(); if(!j.ok) throw new Error(j.error); return j.value }

function apply(ctx){
  const slots=ctx.get('slots'); if(!slots)return
  ctx.effect(()=>{const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);return()=>s.remove()})
  let openPanel=()=>{}
  function Button(){return React.createElement('button',{className:'peekfile-btn',title:'PeekFile 文件搜索与预览',onClick:()=>openPanel()},'⌕ 文件')}
  function Panel(){
    const [open,setOpen]=React.useState(false),[query,setQuery]=React.useState(''),[items,setItems]=React.useState([]),[selected,setSelected]=React.useState(null),[error,setError]=React.useState(''),[cap,setCap]=React.useState(null)
    React.useEffect(()=>{openPanel=(target)=>{setOpen(true);if(target)setSelected(target)};return()=>{openPanel=()=>{}}},[])
    React.useEffect(()=>{if(open)api('capability').then(setCap).catch(e=>setError(e.message))},[open])
    const search=async()=>{try{setError('');setItems((await api('search',{query,limit:50})));}catch(e){setError(e.message)}}
    if(!open)return null
    return React.createElement('div',{className:'peekfile-panel'},
      React.createElement('div',{className:'peekfile-bar'},React.createElement('input',{className:'peekfile-input',value:query,placeholder:cap?.everything===false?'EverythingCLI 未安装：仍可点击对话中的本地路径':'搜索本地文件',disabled:cap?.everything===false,onChange:e=>setQuery(e.target.value),onKeyDown:e=>e.key==='Enter'&&search()}),React.createElement('button',{className:'peekfile-btn',onClick:search,disabled:cap?.everything===false},'搜索'),React.createElement('button',{className:'peekfile-btn',onClick:()=>setOpen(false)},'关闭')),
      error?React.createElement('div',{style:{padding:8,color:'#ff7777'}},error):null,
      React.createElement('div',{className:'peekfile-body'},React.createElement('div',{className:'peekfile-results'},items.map(x=>React.createElement('div',{className:'peekfile-row',key:x.handle,onClick:()=>setSelected(x)},React.createElement('span',null,x.name),React.createElement('span',null,x.extension||'目录'),React.createElement('span',{className:'peekfile-path',title:x.path},x.parent+' · '+x.reason)))),selected?React.createElement('iframe',{className:'peekfile-frame',src:selected.previewUrl,title:selected.name}):React.createElement('div',{className:'peekfile-empty'},'选择文件进行预览'))
    )
  }
  slots.inject('conversation.session.header.utilities',()=>slots.register({name:'conversation.session.header.utilities',id:'peekfile-button',label:'PeekFile',order:9},Button))
  slots.inject('shell.overlay',()=>slots.register({name:'shell.overlay',id:'peekfile-panel',order:9},Panel))
  ctx.effect(()=>{
    const re=/(?<![\w@.])(?:[A-Za-z]:[\\/][^\s<>"'`]+|(?:\/home\/|\/mnt\/|~\/)[^\s<>"'`]+?\.[A-Za-z0-9]{1,12})(?=[\s),;]|$)/g
    const process=async root=>{const nodes=[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(n.parentElement?.closest('.peekfile-panel,a,pre,code,input,textarea'))continue;const m=n.nodeValue?.match(re);if(m)nodes.push([n,m])}for(const [node,matches] of nodes){const result=await api('resolve',{candidates:matches}).catch(()=>null);if(!result)continue;for(const hit of result.items.filter(x=>x.ok)){if(!node.isConnected||!node.nodeValue.includes(hit.candidate))continue;const parts=node.nodeValue.split(hit.candidate);const f=document.createDocumentFragment();parts.forEach((p,i)=>{f.append(p);if(i<parts.length-1){const a=document.createElement('a');a.className='peekfile-link';a.textContent=hit.candidate;a.href=hit.target.previewUrl;a.onclick=e=>{e.preventDefault();openPanel(hit.target)};f.append(a)}});node.replaceWith(f);break}}}
    const obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>n.nodeType===1&&process(n))));obs.observe(document.body,{childList:true,subtree:true});process(document.body);return()=>obs.disconnect()
  })
}
