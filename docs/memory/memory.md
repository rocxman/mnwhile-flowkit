# MNWHILE-FLOWKIT Project Memory

**Last Updated:** 2026-06-16  
**Session Context:** Cloud backend complete, secrets rotated, GitHub/Vercel production updated

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

## Auth / Login Status

- Supabase email/password auth exists and is wired through `AuthProvider`.
- Auth route exists at `/auth`.
- `AuthPage` includes login/register toggle, loading state, error display, post-login redirect, and logged-in state UI.
- Main UI now has a Login/User entry in `src/components/home/SidebarFooter.tsx`.
- When logged out: sidebar footer shows `Login` button that navigates to `/auth`.
- When logged in: sidebar footer shows user email and logout icon.

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
