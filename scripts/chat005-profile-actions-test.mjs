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
