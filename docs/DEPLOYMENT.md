# Deployment Guide

MNWHILE FlowKit deploys as Vite SPA plus Vercel API routes. Cloud features need Supabase and Cloudflare R2.

## Prerequisites

- Node.js 20+
- Vercel project
- Supabase project
- Cloudflare R2 bucket
- Optional Sentry project

## Environment Variables

### Client

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
VITE_SENTRY_DSN=<sentry-browser-dsn>
```

### Server / Vercel API routes

```bash
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=<bucket-name>
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://<public-bucket-domain>
```

Never expose service role key or R2 secret to browser. Only `VITE_*` variables ship client-side.

## Supabase Setup

1. Create Supabase project.
2. Configure auth email provider and allowed redirect URLs:
   - `http://localhost:3000`
   - production origin, e.g. `https://your-app.vercel.app`
3. Apply migrations:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Migration `supabase/migrations/00000000000001_initial_schema.sql` creates:

- `profiles`
- `documents`
- `document_shares`
- `document_snapshots`
- RLS policies
- owner helper function
- signup profile trigger

## Cloudflare R2 Setup

1. Create R2 bucket.
2. Create R2 API token with bucket read/write access.
3. Add Vercel env vars listed above.
4. Optional: configure public custom domain and set `R2_PUBLIC_URL`.

## Vercel Deploy

```bash
npm install
npm run build
npx vercel --prod
```

Build output: `dist/`.

## Verification Checklist

- `/home` redirects anonymous users to `/#/auth`
- login returns user to intended route
- document edits show sync status
- share dialog creates public `/#/share/<token>` URL
- shared users can see entries in dashboard
- R2 export upload returns downloadable URL
- Sentry receives test browser error when `VITE_SENTRY_DSN` set

## Rollback

- Vercel: use deployment rollback in dashboard.
- Supabase: do not edit production schema manually; create a reverse migration if needed.
- R2: uploaded exports are object data; delete only after confirming no active links depend on them.
