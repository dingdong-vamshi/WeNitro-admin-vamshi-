# WeNitro Admin

Next.js administration console for the existing WeNitro Supabase project. Authenticated member, Activity, Partner, verification, moderation, notification, analytics and administrator workflows use live Supabase data.

## Local setup

Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then run `npm ci` and `npm run dev`. Open http://localhost:3000/dashboard. Never put a service-role key in this client or commit local environment files.

Checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`. Backend migrations and disposable-Postgres tests are maintained in the WeNitro App repository; deploy them before the matching Admin release.

## Access and operational controls

Roles are read from trusted current Supabase Auth app metadata: Master (`super_admin`), operations Admin (`admin`), and Finance Admin (`finance_admin`). A Master manages existing registered administrator accounts. Members cannot promote themselves. Account restrictions, Activity moderation, category edits, report review, feature gates and campaign changes retain audit reasons. Identity verification media is reviewed through short-lived authorized access.

The category catalog supports add, rename, order, enable/disable, archive and restore. Archived categories remain attached to historical content; new assignments must use available categories. Database feature gates can pause new Activities, Communities, Vibes or Stories, including legacy direct API creation, without hiding existing content.

## Drafts and delivery

Templates, campaign drafts, reward proposals and coupon proposals persist in private database storage with role checks and optimistic version checks. A sent campaign is immutable and cannot be delivered twice. System Alerts can deliver actual in-app notifications to an explicit list of member IDs; delivery and read counts come from stored notifications. A failed recipient or validation check rolls back the entire send.

Email and device-push campaign delivery require their configured external sender/provider. External-provider drafts do not claim delivery. In-app campaigns support immediate or scheduled delivery through one named minute cron job (`wenitro-admin-in-app-campaigns`). Scheduling requires an explicit recipient list; editing content or archiving cancels the schedule. Dispatch checks that the approving Admin still has access and that each recipient is eligible. Failures preserve the draft and expose the reason. Templates are reusable drafts, not overrides for Supabase authentication emails or hardcoded lifecycle messages. Reward/coupon drafts cannot activate redemptions or change balances without an approved provider and economic contract. Nitro rules remain the approved backend contract: participant rating 2, eligible referral 10, one Play Store rating claim 10; verification awards no Nitro. The leaderboard derives from positive ledger awards over rolling 7/30-day or all-time periods, not current balances.

Release-owned branding, payment currency and shipped English UI are displayed accurately. A language database row would not supply translations; additional languages require approved translation bundles and a client release.

## Analytics definitions

DAU and MAU count observed signed-in members today / the last 30 days, using UTC dates. Collection starts with this release; past sessions are not reconstructed from registration dates. Device distribution uses member/platform/day observations. Retention means the proportion of the prior period's observed active members seen in the current equal-length period; it is unavailable until a prior cohort exists.

Activity views and shares count distinct member/Activity/UTC-day observations. Vibe shares are separate. Approved participants only count toward engagement. Numeric Activity ratings and conversion attribution are not collected and are not replaced by host ratings or zero. Member nationality is not presented as a city, and Activity display locations are not geocoded implicitly. Core member, Activity, participant, report and category readers paginate through PostgREST's row limit.
