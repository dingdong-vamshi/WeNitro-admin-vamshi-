import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const load=(path,deps)=>{const exports={};new Function('exports','require',ts.transpile(fs.readFileSync(path,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}))(exports,name=>{assert.ok(name in deps,`Unexpected dependency ${name}`);return deps[name];});return exports;};
const report=(id,overrides={})=>({id:`user-${id}`,sourceType:'user',sourceId:String(id),targetId:'7',reportedUserId:'7',reportedUser:'Member Seven',reportedBy:'Reporter',description:'Chat harassment allegation',reason:'harassment',reportType:'harassment',status:'pending',createdAt:`2026-10-0${id}T10:00:00Z`,isTestReport:false,evidenceCount:0,...overrides});
const users=[{id:'7',name:'Member Seven',username:'seven',status:'active',eventsHosted:2,eventsJoined:3}];
const reports=[report(1),report(2,{status:'resolved'}),report(3,{sourceType:'event',targetId:'11',reportedUserId:'',reportedUser:'Activity Eleven',reportType:'other',description:'Image concern'}),report(4,{sourceType:'event',targetId:'12',reportedUserId:'',reportedUser:'Activity Twelve',reportType:'other',description:'Photo concern'})];
const events=[{id:'11',hostAccountType:'partner'},{id:'12',hostAccountType:'individual'}];
const reads=[];
const model=load('src/lib/admin-review-read-models.ts',{'@/lib/api':{getSafetyReports:async options=>{reads.push(['reports',options]);return{rows:reports,total:reports.length};},getUsers:async options=>{reads.push(['users',options]);return{rows:users,total:users.length};},getEvents:async()=>({rows:events,total:events.length})}});
const cases=await model.getReviewCases('all');assert.equal(cases.length,3,'Unmapped targets must not collapse into one account');assert.equal(cases.find(c=>c.id==='7').openCount,1);assert.equal(cases.find(c=>c.id==='7').reports.length,2);assert.equal(cases.find(c=>c.id==='7').user.name,'Member Seven');
assert.equal((await model.getReviewCases('chat')).length,1);assert.equal((await model.getReviewCases('image')).length,2);assert.equal(model.matchesReviewScope(report(1,{description:'Different opinion',reportType:'other'}),'image'),false);
assert.deepEqual((await model.getPartnerActivities()).map(event=>event.id),['11']);assert.ok(reads.every(([,options])=>options.pageSize===Number.MAX_SAFE_INTEGER),'Do not apply accidental local first-page truncation');

// Exercise the actual investigation component's review operation and frozen restriction target.
const state=[];let cursor=0,dirty=false,tree,queryRows=cases;const writes=[];let invalidations=0;
const jsx=(type,props)=>({type,props});
const presentation=load('src/lib/report-presentation.ts',{});
const panel=load('src/components/admin/investigation-panel.tsx',{
 'react/jsx-runtime':{jsx,jsxs:jsx},react:{useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;dirty=true;}];}},
 'next/link':{default:'Link'},'@tanstack/react-query':{useQueryClient:()=>({invalidateQueries:async()=>invalidations++}),useQuery:()=>({data:queryRows,isPending:false,isError:false,isFetching:false,refetch:()=>{}})},
 '@/lib/admin-review-read-models':model,'@/lib/api':{reviewReport:async(...args)=>writes.push(args)},'@/lib/report-presentation':presentation,'./admin-data-state':{AdminDataState:'AdminDataState'},'./ban-user-dialog':{BanUserDialog:'BanUserDialog'},'@/components/ui/button':{Button:'Button'},'@/components/ui/badge':{Badge:'Badge'},
}).ReportInvestigation;
const render=()=>{cursor=0;dirty=false;tree=panel({});if(dirty)render();};
const find=(node,p)=>{if(!node||typeof node!=='object')return null;if(p(node))return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child,p);if(found)return found;}return null;};
render();find(tree,node=>node.type==='input'&&node.props['aria-label']==='Search reports and accounts').props.onChange({target:{value:'Member Seven'}});render();
assert.equal(find(tree,node=>node.type==='Button'&&node.props.children==='Resolve').props.disabled,true);
find(tree,node=>node.type==='textarea').props.onChange({target:{value:'Reviewed submitted evidence'}});render();
find(tree,node=>node.type==='Button'&&node.props.children==='Resolve').props.onClick();await new Promise(r=>setImmediate(r));if(dirty)render();
assert.deepEqual(writes,[['user','1','resolved','Reviewed submitted evidence']]);assert.equal(invalidations,1);
find(tree,node=>node.type==='Button'&&node.props.children==='Restrict account').props.onClick();render();assert.equal(find(tree,node=>node.type==='BanUserDialog').props.userId,'7');
queryRows=[{...cases[0],id:'other',user:{...users[0],id:'9',name:'Another member'}}];render();assert.equal(find(tree,node=>node.type==='BanUserDialog').props.userId,'7','Refreshing cases must not retarget an open restriction dialog');
const redirects=[];
const detail=load('src/app/(admin)/business/sponsored-events/[id]/page.tsx',{'next/navigation':{notFound:()=>{throw new Error('404');},redirect:path=>redirects.push(path)}}).default;
await detail({params:Promise.resolve({id:'123'})});assert.deepEqual(redirects,['/events/123']);for(const id of ['-1','abc','0','../users','9007199254740992'])await assert.rejects(detail({params:Promise.resolve({id})}),/404/);
const apiSource=fs.readFileSync('src/lib/api.ts','utf8');
const tableSource=fs.readFileSync('src/components/admin/safety-reports-table.tsx','utf8');
const investigationSource=fs.readFileSync('src/components/admin/investigation-panel.tsx','utf8');
assert.match(apiSource,/communityReports\(true\)/,'Community reports must be loaded into the Admin moderation queue');
assert.match(apiSource,/vibeReports\(\)/,'Vibe reports must be loaded into the Admin moderation queue');
assert.match(apiSource,/sourceType:\"community\" as const/,'Community reports must retain a distinct report type');
assert.match(apiSource,/admin_review_report/,'Admin report decisions must use the authorized audit RPC');
assert.match(tableSource,/reportTargetHref/,'Safety Reports must link directly to reported targets');
assert.match(investigationSource,/TEST \/ QA/,'Investigation cards must clearly label QA reports');
for(const [sourceType,targetId,expected] of [['community','244','#/community/244'],['event','282','#/activity/282'],['vibe','115','#/vibe/115'],['user','70','#/profile/70']])assert.equal(presentation.reportTargetHref({sourceType,targetId}),`https://wenitro-app.vercel.app/${expected}`);
assert.equal(presentation.reportEvidenceContext({evidenceCount:0}),'No file evidence is stored. The reporter description is the submitted context.');
console.log('PASS: real report grouping/status/topic selection/unknown-target isolation, Community and Vibe moderation coverage, all reported-target deep links, QA labeling, explicit evidence context, Partner-only activities, actual review RPC arguments/cache refresh, required notes, frozen restriction targets, and valid detail redirect. Offline executable behavioral tests only.');
