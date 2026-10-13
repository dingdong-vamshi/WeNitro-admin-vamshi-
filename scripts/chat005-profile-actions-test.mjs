import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync('src/app/(admin)/users/[id]/page.tsx', 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const buttons = [];
function visit(node) {
  if (ts.isJsxOpeningElement(node) && node.tagName.getText(ast) === 'Button') buttons.push(node);
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(buttons.length >= 4);
for (const button of buttons) {
  const names = button.attributes.properties.map(p => p.name?.getText(ast));
  assert.ok(names.includes('onClick') || names.includes('asChild') || names.includes('disabled'), 'Every user-detail button must act, navigate, or be explicitly disabled');
}
assert.doesNotMatch(source, /Send Warning|Verify User|Suspend Account|Block User|Ban User/);
assert.match(source, /<BanUserDialog userId=\{profile.id\}/);
assert.match(source, /<UnbanUserDialog userId=\{profile.id\}/);
assert.match(source, /href="\/verification"/);
assert.match(source, /href="\/notifications"/);
const dialog = fs.readFileSync('src/components/admin/ban-user-dialog.tsx', 'utf8');
assert.match(dialog, /reason.trim\(\).length<5/);
assert.match(dialog, /await moderateUser\(userId,restore\?"restore":duration,reason\)/);
assert.match(dialog, /await cache.invalidateQueries\(\)/);
console.log('PASS: user-detail controls navigate or use the existing audited restriction flow; reason validation and query refresh preserved.');

const logs = fs.readFileSync('src/components/admin/admin-activity-logs-screen.tsx', 'utf8');
assert.match(logs, /JSON.stringify\(selected, null, 2\)/);
assert.match(logs, /link.download = `wenitro-admin-access-audit-\$\{selected.id\}.json`/);
assert.match(logs, /link.click\(\)/);
console.log('PASS: single-log export downloads the selected audit record instead of a dead button.');

// Execute the real component's select/export handlers with a local renderer.
// This never signs in, fetches production data, or downloads through a browser.
const logAst = ts.createSourceFile('logs.tsx', logs, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const component = logAst.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'AdminActivityLogsScreen');
const sample = {id:'qa-audit-1',adminName:'QA Admin',module:'Admin access',action:'QA sample',targetName:'QA Target',targetType:'Administrator',timestamp:'2026-10-13',ipAddress:'Not recorded'};
let cursor = 0;
const state = [];
const exports = {};
const downloads = [];
let blob;
let revoked;
const symbols = Object.fromEntries(logAst.statements.filter(ts.isImportDeclaration).flatMap(n => n.importClause?.namedBindings && ts.isNamedImports(n.importClause.namedBindings) ? n.importClause.namedBindings.elements.map(e => [e.name.text,e.name.text]) : []));
const deps = {...symbols, moduleColors:{}, Blob,
  React:{createElement:(type,props,...children)=>({type,props:props||{},children})},
  useState:initial=>{const i=cursor++; if(!(i in state)) state[i]=initial; return [state[i],next=>{state[i]=next;}];},
  useQuery:()=>({data:[sample],isLoading:false,error:null}),
  URL:{createObjectURL:value=>{blob=value;return 'blob:qa-only';},revokeObjectURL:value=>{revoked=value;}},
  document:{createElement:()=>{const link={click:()=>downloads.push({href:link.href,name:link.download})};return link;}},
};
new Function('exports',...Object.keys(deps),ts.transpile(component.getText(logAst),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}))(exports,...Object.values(deps));
const render=()=>{cursor=0;return exports.AdminActivityLogsScreen();};
const all=(node,test)=>!node||typeof node!=='object'?[]:[...(!Array.isArray(node)&&test(node)?[node]:[]),...(Array.isArray(node)?node:node.children||[]).flatMap(n=>all(n,test))];
let tree=render();
assert.equal(all(tree,n=>n.type==='Button'&&n.children.includes('Export This Log')).length,0,'Single export only exists after selecting a log');
all(tree,n=>n.type==='TableRow'&&n.props.onClick)[0].props.onClick();
tree=render();
all(tree,n=>n.type==='Button'&&n.children.includes('Export This Log'))[0].props.onClick();
assert.deepEqual(JSON.parse(await blob.text()),sample,'Download contains precisely the selected record');
assert.deepEqual(downloads,[{href:'blob:qa-only',name:'wenitro-admin-access-audit-qa-audit-1.json'}]);
assert.equal(revoked,'blob:qa-only');
console.log('PASS: actual log selection and export handler create the expected JSON download and release its URL.');
