# WeNitro Admin

WeNitro Admin is the administration application for the WeNitro activity and community platform. It is in active development and reads live data from the same Supabase project as the client application.

## Administration areas

- Dashboard and platform metrics
- User and profile management
- Activities and participants
- Communities
- Vibes and Stories
- Verification
- Interests, badges, and rewards
- Notifications and moderation tools where implemented

## Technology

- Next.js
- React
- TypeScript
- Supabase

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the public Supabase project URL and publishable key.
3. Run `npm ci`.
4. Run `npm run dev`.

## Checks

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

Runtime query failures surface through loading, empty, or error states rather than silently substituting fixture data.
