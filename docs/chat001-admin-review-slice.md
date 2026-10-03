# CHAT001 Admin review slice

Branch `codex/chat001-admin-review`, isolated from `149618c`. Local implementation only; no push, deployment, live mutation or production screenshot was performed by this agent.

Requested change: Source A page 36 requires current Dashboard functions to work. Investigation, chat/image moderation, abuse/IP monitoring and sponsored-event screens previously consumed empty placeholder APIs, displayed invented capabilities, or exposed action buttons with no mutation behind them.

Implemented:

- Investigation is built from actual Safety Reports and current Admin-authorized users. It retains separate missing/deleted targets, includes open and closed records, supports search, refresh, report investigation/resolution/dismissal with required notes, and opens the existing account restriction dialog. Report updates use the existing `admin_review_report` backend through `reviewReport`; restrictions use the existing tested dialog/RPC. Profile and reported Activity navigation exposes existing history and moderation controls.
- Chat/media/abuse screens reuse that manual review flow. Chat/media filters are clearly described as searches of submitted report text, not classifier findings. They show the submitted description and source, not fabricated transcripts, media labels, severity/risk scores or proof that an allegation is true. Existing report decisions remain available in all three screens.
- IP Monitoring explicitly identifies absent IP telemetry and IP enforcement. Its navigation links open the real security audit, restricted accounts and safety reports. It does not claim to block an address without an enforcement service.
- Partner Activities lists actual activities whose host is a Partner, with real participant counts/status, search, filters, pagination and links to `/events/:id`. Existing saved sponsored-event detail links validate the ID and redirect to those working controls. Membership does not fabricate sponsorship, ad spend, clicks or impressions.
- Restriction dialogs freeze the selected account so a background report refresh cannot silently retarget an open action.

Files: six scoped components, their seven page routes including the saved detail redirect, new `src/lib/admin-review-read-models.ts`, focused test and this report. Shared `api.ts`, `types/admin.ts`, master ledger and other agent files were not modified.

Local verification:

- `node scripts/admin-review-read-models-test.mjs` passes executable transpiled code tests: source grouping, exact open/closed status counts, topic filtering, separate unknown targets, Partner-only selection, report action arguments and cache refresh, required notes, stable restriction-dialog identity, and valid/invalid saved-detail routes.
- Scoped ESLint passes.
- `tsc --noEmit --pretty false` passes.
- `git diff --check` passes.
- Full integrated Admin build is root's responsibility with all slices merged. The isolated checkout uses a read-only symlink to primary dependencies; that symlink is not committed.

Production verification still required after integration/deployment:

1. Open all six routes on the deployed Admin; capture actual rendered states.
2. Use an existing marked QA report: search it, mark investigating, resolve or dismiss with review notes, reload and inspect persisted status/audit. Restore the agreed fixture state if needed.
3. Show closed reports by clearing Open reports only; verify report counts from actual data.
4. Open a QA account/profile and reported Activity from the case; verify working history/moderation screens.
5. Open a QA account restriction dialog; confirm its account identity stays stable and existing backend permissions still apply. Avoid restricting a real member for evidence.
6. Show Partner-hosted Activity data and verify ordinary host activities are excluded; follow Activity controls and a saved numeric detail link.
7. Capture honest unavailable IP/automatic-classifier states, plus working manual alternatives. These pages do not constitute proof of an external classifier or IP enforcement integration.

Remaining dependency boundaries: No automatic semantic image/message/abuse classifier, IP telemetry/enforcement or advertising sponsorship contract is configured in the current implementation. Those capabilities are explicitly unavailable. Manual report review and the existing account/Activity moderation workflows are implemented. Root must include exact current provider/access evidence for any final external hold.

Shared-reader concern sent to primary Admin agent: baseline raw PostgREST `events`, `participants` and `reports` reads lacked range pagination, so default API row limits could truncate large datasets. This slice does not introduce an extra local page cap; the primary agent owns the shared reader correction.
