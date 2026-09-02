# WeNitro Admin

Production administration console for WeNitro. It provides user, activity,
community, moderation, notification, rewards, reporting, security, and
administrator access-management workflows backed by Supabase.

## Local Setup

Create `.env.local` from `.env.local.example`, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

Required public variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Never commit service-role keys, local environment files, or deployment
credentials.
