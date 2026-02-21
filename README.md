# Get It Off Your Chest

Production-ready Next.js + Supabase social venting platform with moderation, admin tooling, analytics, and monetization-ready ad placements.

## Stack
- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase (Auth + PostgreSQL + Storage)
- Deployable to Vercel

## Environment Variables
Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup
1. Create a new Supabase project.
2. In SQL editor, run `supabase/migration.sql`.
3. In Authentication:
   - Enable Email provider.
   - Enable **Confirm email** (verification required).
4. In Storage:
   - Create bucket named `avatars`.
   - Set bucket as public.
5. Add your app domain to auth URL allowlist for local + production.

## Local Development
```bash
npm install
npm run dev
```

## Build Validation
```bash
npm run build
```

## Vercel Deployment
1. Push repository to GitHub.
2. Import project into Vercel.
3. Add both environment variables in Vercel project settings.
4. Deploy.

## Database Notes
- Categories are seeded in migration SQL.
- RLS policies secure write operations.
- Banned users are blocked from posting by RLS + middleware checks.
- Duplicate voting prevented with `votes` composite primary key.

## Features Included
- Email/password auth + verification enforcement
- Profile management (username, bio, avatar)
- Category feed and trending feed
- Post, comments, upvote/downvote, report
- Follow + block
- Private messages
- Central moderation keyword filter with strike/ban escalation
- Protected admin dashboard
- Internal analytics endpoint/dashboard stats
- AdSense/affiliate placement placeholders

## Google Analytics Readiness
The current analytics module (`src/lib/analytics.ts`) is internal and server-side. Add GA by inserting script tags into `src/app/layout.tsx` and piping events from client actions without restructuring the app.
