import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const hooks=[];let cursor=0,effects=[],tree;const calls=[];
const same=(a,b)=>a&&b.length===a.length&&b.every((x,i)=>Object.is(x,a[i]));
const React={createElement:(type,props,...children)=>({type,props:props||{},children}),useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=initial;return[hooks[i],v=>hooks[i]=typeof v==='function'?v(hooks[i]):v];},useMemo(fn,deps){const i=cursor++;if(!same(hooks[i]?.deps,deps))hooks[i]={deps,value:fn()};return hooks[i].value;},useEffect(fn,deps){const i=cursor++;if(!same(hooks[i],deps)){hooks[i]=deps;effects.push(fn);}}};
const exported={};const deps={'react':React,'react/jsx-runtime':{jsx:(type,props)=>({type,props:props||{},children:[props?.children]}),jsxs:(type,props)=>({type,props:props||{},children:[props?.children]})},'@tanstack/react-query':{useQueryClient:()=>({invalidateQueries:async()=>{}})},'@/lib/api':{moderateContent:async(...args)=>calls.push(args)},'@/components/ui/button':{Button:'Button'},'@/components/ui/dialog':Object.fromEntries(['Dialog','DialogContent','DialogDescription','DialogFooter','DialogHeader','DialogTitle'].map(x=>[x,x]))};
new Function('exports','require',ts.transpile(fs.readFileSync('src/components/admin/content-moderation-dialog.tsx','utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}))(exported,n=>{assert(n in deps,n);return deps[n];});
const find=(node,p)=>{if(!node||typeof node!=='object')return null;if(!Array.isArray(node)&&p(node))return node;for(const c of Array.isArray(node)?node:node.children||[]){const r=find(c,p);if(r)return r;}return null;};
const props={kind:'vibe',id:1,title:'Disposable QA',status:'active',open:true,onOpenChange(){}};
function render(){cursor=0;effects=[];tree=exported.ContentModerationDialog(props);for(const f of effects)f();if(effects.length){cursor=0;effects=[];tree=exported.ContentModerationDialog(props);}return tree;}
const control=label=>find(tree,n=>n.props['aria-label']===label);
const apply=()=>find(tree,n=>n.type==='Button'&&n.props.children==='Apply moderation');
for(const kind of ['vibe','story','community']){
 props.kind=kind;props.id++;props.status='active';render();
 control('Moderation action').props.onChange({target:{value:'remove'}});control('Moderation reason category').props.onChange({target:{value:'Spam'}});render();
 assert.equal(control('Moderation notes').props.value,'');assert.equal(apply().props.disabled,false);
 apply().props.onClick();await new Promise(r=>setImmediate(r));assert.deepEqual(calls.at(-1),[kind,props.id,'remove','Category: Spam']);
 props.status='removed';render();assert.equal(control('Moderation action').props.value,'restore');assert.equal(apply().props.disabled,false);
}
console.log('PASS: actual Vibe/Story/Community dialogs enable Spam without notes, send an audited reason, and allow restore.');
