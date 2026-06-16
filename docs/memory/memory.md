# MNWHILE-FLOWKIT Project Memory

**Last Updated:** 2026-06-16  
**Session Context:** All cloud features E2E verified in production, RLS recursion bug fixed

## Project Overview

**Name:** MNWHILE-FLOWKIT (MNWHILE FlowKit Self-Hosted Fork)  
**Purpose:** Self-hosted local-first diagram tool with cloud features  
**Stack:** React 19 + TypeScript 5 + Vite 6 + Supabase + Cloudflare R2 + Vercel  
**Status:** Core phases complete ✅  
**Production URL:** https://mnwhile-flowkit.vercel.app  
**GitHub:** https://github.com/rocxman/mnwhile-flowkit  
**Vercel Project:** rocxman/mnwhile-flowkit

## Security Status

- Secret leak was detected in prior git history via `docs/memory/memory.md`.
- History was rewritten across 267 commits to remove `docs/memory/memory.md` from all tracked history.
- Force push to `main` completed after cleanup.
- Supabase and Cloudflare credentials were rotated on 2026-06-16.
- `docs/security/credential.md` contains current credentials and is gitignored.
- Never store secrets in this memory file or any tracked docs.

## Latest Production Updates

- Branding consistency fixed: auth/share UI primary accents use lime green.
- GitHub repo links fixed from `Vrun-design/mnwhile-flowkit` to `rocxman/mnwhile-flowkit`.
- GitHub star count fetch now handles API failures gracefully and avoids console errors.
- Production deployment verified with Playwright: app loads, sidebar GitHub link is correct, console has 0 errors.

## Production E2E Verification (2026-06-16)

All cloud features verified working end-to-end in production:

### Auth System
- Signup with email/password works (email confirmation disabled in Supabase)
- Login persists session across page reloads
- Logout sends POST /auth/v1/logout?scope=global (returns 204)
- Auth state correctly reflected in sidebar (email shown when logged in, Login button when logged out)

### Cloud Document Sync
- Documents created in editor auto-sync to Supabase via `src/lib/cloud-storage.ts`
- POST to `/rest/v1/documents?on_conflict=user_id,local_id&select=*` returns 201
- Documents stored with `user_id`, `local_id`, `name`, `pages`, `page_count`
- Multiple documents per user supported via unique `(user_id, local_id)` constraint

### Critical Bug Fixed: RLS Infinite Recursion
- Symptom: Supabase document upsert returned 500 error
- Root cause: RLS policies on `documents` and `document_shares` created circular dependency
  - `documents` SELECT policy checked `document_shares` for shared access
  - `document_shares` policies checked `documents` for owner verification
  - PostgreSQL detected infinite recursion and returned 500
- Fix: Created `is_document_owner(doc_id uuid)` SECURITY DEFINER function
  - Function bypasses RLS to check `documents.user_id = auth.uid()` directly
  - Rewrote `document_shares` and `document_snapshots` policies to use this function
  - `documents` shared-access SELECT policy kept as-is (no recursion from documents→document_shares direction)
- Migration applied via Supabase MCP on 2026-06-16

### Public Document Sharing
- "Share Publicly" button in editor generates `share_token` (UUID)
- PATCH to `documents` table sets `is_public=true` and `share_token`
- Share dialog shows URL: `https://mnwhile-flowkit.vercel.app/#/share/<token>`
- Anonymous (logged-out) access works: GET with `share_token=eq.<token>&is_public=eq.true&deleted_at=is.null` returns 200
- Shared document renders in editor for logged-out users with 0 console errors

### R2 Export Upload
- Export menu "Upload to cloud" action for PNG/SVG/JSON works
- Authenticated POST to `/api/upload-export` returns 200
- Object stored in R2 bucket `mnwhile-flowkit` under prefix `exports/<user_id>/<timestamp>-<filename>`
- Content-type allowlist enforced: application/json, application/pdf, image/png, image/svg+xml, text/plain
- 15MB max file size enforced
- JWT validation via Supabase `auth.getUser()` on server side

### Key Database Details
- Supabase project: `dhlnqnbamqdxmybmokxn` (ACTIVE_HEALTHY)
- Tables: `profiles`, `documents`, `document_shares`, `document_snapshots`
- All tables have RLS enabled
- `is_document_owner()` is SECURITY DEFINER function (search_path should be hardened later)
- Unique constraint: `documents_user_id_local_id_key` on `(user_id, local_id)`

## Auth / Login Status

- Supabase email/password auth exists and is wired through `AuthProvider`.
- Auth route exists at `/auth`.
- `AuthPage` includes login/register toggle, loading state, error display, post-login redirect, and logged-in state UI.
- Main UI now has a Login/User entry in `src/components/home/SidebarFooter.tsx`.
- When logged out: sidebar footer shows `Login` button that navigates to `/auth`.
- When logged in: sidebar footer shows user email and logout icon.
- Production auth E2E verified on 2026-06-16 with a temporary confirmed Supabase test user: login redirected to `/home`, sidebar showed user email, logout returned sidebar to `Login`, then test user was deleted.
- Existing user `rocxxman@gmail.com` is confirmed in Supabase and can log in with the password used during signup.

## Environment Variables

Browser-safe:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_R2_PUBLIC_URL`
- `VITE_APP_URL`

Server-only:
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `CLOUDFLARE_API_TOKEN`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`
- `R2_BUCKET_NAME`

Values are stored only in `.env.local`, Vercel environment variables, and `docs/security/credential.md` (gitignored).

## Key Architecture

- Single Zustand store with slices for canvas, workspace, history, design, view, AI, layers, and selection.
- IndexedDB persistence remains local-first.
- Supabase handles auth and cloud document persistence.
- Cloudflare R2 handles export storage.
- Vercel hosts production deployment.

## Validation Commands

```bash
npm run build
npm test -- --run
npx vercel --prod --yes
```

## Session Continuity Checklist

- Check `git status` before edits.
- Do not commit `.env.local`, `docs/security/credential.md`, or generated Playwright artifacts.
- If touching auth/cloud storage, verify Vercel env vars and Supabase credentials.
- If touching production UI, run build and verify with Playwright.
