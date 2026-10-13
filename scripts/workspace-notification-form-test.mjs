import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const exported = {};
new Function('exports', 'require', ts.transpile(
  fs.readFileSync('src/lib/workspace-validation.ts', 'utf8'),
  { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
))(exported, name => { throw new Error(`Unexpected runtime dependency: ${name}`); });

const payload = {
  name: 'QA system alert',
  title: 'Test alert',
  body: 'Safe QA message',
  channel: 'in_app',
  recipients: [],
  status: 'draft',
  notes: '',
};

assert.deepEqual(exported.parseRecipientIds(' 100, 100\n91 '), { ids: [100, 91], invalid: [] });
assert.deepEqual(exported.parseRecipientIds('100 nope -1 1.5'), { ids: [100], invalid: ['nope', '-1', '1.5'] });
assert.equal(exported.workspaceSaveIssue({ kind: 'campaign', payload, recipients: '100', reason: 'Any' }), 'Explain the audit reason in at least 5 characters.');
assert.equal(exported.workspaceSaveIssue({ kind: 'campaign', payload, recipients: '100', reason: 'QA test' }), '');
assert.equal(exported.workspaceSaveIssue({ kind: 'campaign', payload, recipients: '', reason: 'QA test' }), 'Select at least one recipient.');
assert.equal(exported.workspaceSaveIssue({ kind: 'campaign', payload: { ...payload, body: ' ' }, recipients: '100', reason: 'QA test' }), 'Enter a message.');

const form = fs.readFileSync('src/components/admin/workspace-documents.tsx', 'utf8');
const picker = fs.readFileSync('src/components/admin/admin-recipient-picker.tsx', 'utf8');
const broadcast = fs.readFileSync('src/components/admin/login-announcements.tsx', 'utf8');
assert.match(picker, /Search recipients by name, username, or email/);
assert.match(picker, /Advanced: enter member IDs/);
assert.match(form, /required, 5–1000 characters/);
assert.match(form, /workspaceSaveIssue/);
assert.match(broadcast, /AdminRecipientPicker/);
assert.match(broadcast, /parsedRecipients\.ids\.length/);

console.log('PASS: campaign drafts validate every required field, explain the audit reason rule, normalize recipient IDs, and provide searchable recipient selection with optional advanced IDs.');
