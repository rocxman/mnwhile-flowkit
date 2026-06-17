# MNWHILE FlowKit - Session Memory

**Last Updated:** 2026-06-17  
**Session Context:** Multi-workspace platform architecture planning completed; documentation now ready for professional implementation review.

---

## 1. Project Overview

**Name:** MNWHILE-FLOWKIT  
**Purpose:** Self-hosted local-first creative platform evolving from OpenFlowKit diagram editor into Figma-like multi-workspace suite  
**Stack:** React 19 + TypeScript 5 + Vite 6 + Zustand + React Flow + Supabase + Cloudflare R2 + Vercel  
**Status:** Cloud backend complete; multi-workspace architecture docs complete; implementation pending  
**Production URL:** https://mnwhile-flowkit.vercel.app  
**GitHub:** https://github.com/rocxman/mnwhile-flowkit  
**Vercel Project:** rocxman/mnwhile-flowkit

---

## 2. Security Status

- Secret leak was detected in prior git history via `docs/memory/memory.md`.
- History was rewritten across 267 commits to remove leaked docs.
- Force push to `main` completed after cleanup.
- Supabase and Cloudflare credentials were rotated on 2026-06-16.
- `docs/security/credential.md` contains current credentials and is gitignored.
- Never store secrets in this memory file, MCP memory, tracked docs, or chat.

---

## 3. Completed Production Foundation (2026-06-16)

All cloud features verified working end-to-end in production:

### Auth
- Email/password auth through Supabase.
- Auth route: `/auth`.
- Signup/login/logout verified in production.
- Existing confirmed real user: `rocxxman@gmail.com`.

### Cloud Document Sync
- Supabase documents table stores documents with `user_id`, `local_id`, `name`, `pages`, `page_count`.
- POST upsert returns 201 in production.
- Unique constraint: `(user_id, local_id)`.

### RLS Recursion Bug Fixed
- Root cause: `documents` and `document_shares` RLS circular dependency.
- Fix: `is_document_owner(doc_id uuid)` SECURITY DEFINER function.
- Migration applied via Supabase MCP.

### Public Sharing
- Public share token works for logged-out users.
- URL format: `https://mnwhile-flowkit.vercel.app/#/share/<token>`.

### R2 Export Upload
- `/api/upload-export` verifies Supabase JWT.
- Supports PNG/SVG/JSON/PDF/text allowlist.
- Uploads to R2 bucket `mnwhile-flowkit`.

---

## 4. Current Local State (Uncommitted)

Current working tree includes large local changes not yet committed/deployed:

- Workspace shells added locally: Design, Slides, Make, Buzz, Site.
- HomeSidebar rewritten Figma-style.
- HomeDashboard rewritten with Figma-style filters.
- FlowEditorChrome made workspace-aware.
- `SidebarFooter.tsx` deleted; user profile moved into HomeSidebar.
- Store types/actions updated with `workspaceType`.
- Cloud sync updated with `workspace_type`.
- Untracked files include `YOORASARAH-V3-IMPORT-FIXED.json`, `codepen-preview.png`, `simplified-landing-final.png`, and `src/components/workspaces/`.

**Important:** GitHub/Vercel are not as up-to-date as local. User explicitly said to check local first.

---

## 5. Multi-Workspace Vision

MNWHILE FlowKit is becoming a Figma-like creative suite:

| MNWHILE Workspace | Figma Equivalent | Strategy |
|---|---|---|
| **MnFlow** | FigJam | OpenFlowKit core + Excalidraw whiteboard mode |
| **Design** | Figma Design | Plasmic SDK candidate, Penpot service fallback |
| **Slides** | Figma Slides | Internal slide engine + Reveal.js, Slidev pattern extraction |
| **Make** | Figma Make | Flowpilot + bolt.diy/Dyad pattern extraction |
| **Buzz** | Figma Buzz | Fabric.js asset editor + brand kit |
| **Site** | Figma Sites | Plasmic SDK candidate, Webstudio service fallback |

---

## 6. Key Architecture Decisions (2026-06-17)

### Decision 1 — Shared Infrastructure, Isolated Shells
- Each workspace owns visual shell/layout/colors.
- Common logic goes to `shared/hooks`.
- Common atoms go to `shared/primitives`.
- MnFlow visual UI stays unchanged/default.
- No cross-workspace imports.

### Decision 2 — Integration Model
Use 3 integration models:
1. **Native Module:** NPM/embed directly when client-side and license-safe.
2. **Service Module:** Docker + iframe/reverse proxy when repo has own backend/database/migrations.
3. **Pattern Extraction:** Study architecture but implement internally when full app is not embeddable.

Rule sharpened by user: **if repo has backend/database/migration, it is automatically Service Module**, regardless of React UI.

### Decision 3 — Excalidraw Selected for MnFlow Whiteboard v1
- Excalidraw is MIT-licensed, no watermark, no commercial threshold.
- tldraw has custom/commercial licensing and watermark risk, so not v1.
- AFFiNE too large/not embeddable.

### Decision 4 — `schemaVersion` Mandatory
- Every `WorkspacePage` must include `schemaVersion` from day one.
- Required for Excalidraw/Plasmic/Fabric future format migrations.

### Decision 5 — Yjs Single Source of Truth
- Avoid dual sync engines.
- Excalidraw default collab disabled.
- Whiteboard elements sync through Yjs binding.
- Fallback: whiteboard v1 save/load only if Yjs binding unstable.

### Decision 6 — AI Normalization Layer Required
- Flowpilot must not read raw per-workspace formats directly.
- Use `NormalizedContent`, `NormalizedElement`, `NormalizedRelationship` abstraction.

### Decision 7 — Webstudio AGPL Is Business/Legal Blocker
- Do not integrate Webstudio into commercial/SaaS flow until legal decision.

---

## 7. Documentation Created (2026-06-17)

### Architecture Docs
- `docs/architecture/WORKSPACE_ARCHITECTURE.md` — ADR for shared infrastructure + isolated shells.
- `docs/architecture/OPEN_SOURCE_MODULE_INTEGRATION.md` — 13 repo integration strategy.
- `docs/architecture/WORKSPACE_DOCUMENT_MODEL.md` — final data model with `WorkspacePage` and `schemaVersion`.
- `docs/architecture/COLLABORATION_STRATEGY.md` — Yjs unified collaboration strategy.
- `docs/architecture/AI_CONTENT_NORMALIZATION.md` — neutral content model for AI.
- `docs/architecture/OPEN_SOURCE_LICENSE_MATRIX.md` — license risk matrix.

### Planning Docs
- `docs/planning/WORKSPACE_ROADMAP.md` — multi-workspace roadmap.
- `docs/planning/MNFLOW_FIGJAM_ROADMAP.md` — MnFlow FigJam-style roadmap.
- `docs/planning/EXCALIDRAW_SPIKE_PLAN.md` — executable Excalidraw spike plan.

### Updated Docs
- `CLAUDE.md` — workspace architecture rules added.
- `docs/planning/TIMELINE_CHECKLIST.md` — Phase 7 multi-workspace architecture added.

---

## 8. Critical New Data Model Direction

Target model:

```typescript
interface WorkspaceDocument {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
  primaryType?: PageType;
  activePageId: string;
  pages: WorkspacePage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface WorkspacePage {
  id: string;
  name: string;
  type: PageType;
  schemaVersion: number;
  content: PageContent;
  history: FlowHistory;
  playback?: PlaybackState;
  updatedAt: string;
}

type PageType = 'diagram' | 'whiteboard' | 'design' | 'slide' | 'asset' | 'site';
```

Migration direction:
- Old `FlowTab` → new `WorkspacePage` with `type: 'diagram'`, `schemaVersion: 1`.
- Old `tabs` → new `pages`.
- Keep backward compatibility layer during migration.

---

## 9. Open-Source Module License Status

Safe for v1:
- OpenFlowKit — MIT
- Excalidraw — MIT
- Reveal.js — MIT
- Fabric.js — MIT
- Slidev — MIT for pattern extraction

Need review:
- Plasmic — package/API terms need verification
- Penpot — service-only, MPL review
- bolt.diy — verify before copying code
- Dyad — verify before copying code
- OpenPolotno — verify license/deps

Avoid/block until legal decision:
- tldraw — custom license/commercial threshold/watermark risk
- Webstudio — AGPL-3.0 network copyleft risk

---

## 10. Implementation Roadmap

### Recommended Order

1. Review docs and approve decisions.
2. Commit docs.
3. Commit current workspace shell changes.
4. Run build/tests and deploy current state.
5. Create branch `spike/excalidraw-whiteboard`.
6. Execute `docs/planning/EXCALIDRAW_SPIKE_PLAN.md`.
7. Write spike report.
8. Decide Go/No-Go for full MnFlow whiteboard implementation.

### Phase Breakdown

- Phase A: Commit & stabilize current local work.
- Phase B: Documentation & planning — done.
- Phase C: Shared hooks/primitives extraction.
- Phase D: Workspace directory reorganization.
- Phase E: Excalidraw integration spike.
- Phase F: Per-workspace feature implementation.

---

## 11. Excalidraw Spike Summary

Spike duration estimate: 7-9.5 hours plus debugging buffer.

Must prove:
- Excalidraw renders.
- Create/modify elements.
- Save/load IndexedDB.
- Save/load Supabase.
- Switch diagram/whiteboard pages.
- Export PNG/SVG.
- Performance acceptable with 100 elements.
- Optional: Yjs binding sync between tabs.

Abort if:
- Package cannot install.
- Rendering broken.
- Data corrupts on save/load.
- Performance unacceptable.
- Yjs binding unstable with no fallback.

---

## 12. Important Files

### Current Implementation
- `src/components/workspaces/WorkspaceRouter.tsx`
- `src/components/workspaces/*Workspace.tsx`
- `src/components/workspaces/shared/WorkspaceCanvas.tsx`
- `src/components/workspaces/shared/WorkspaceOverlays.tsx`
- `src/services/storage/persistenceTypes.ts`
- `src/services/storage/flowDocumentModel.ts`
- `src/store/types.ts`
- `src/store/actions/createWorkspaceDocumentActions.ts`

### New Documentation
- `docs/architecture/WORKSPACE_ARCHITECTURE.md`
- `docs/architecture/OPEN_SOURCE_MODULE_INTEGRATION.md`
- `docs/architecture/WORKSPACE_DOCUMENT_MODEL.md`
- `docs/architecture/COLLABORATION_STRATEGY.md`
- `docs/architecture/AI_CONTENT_NORMALIZATION.md`
- `docs/architecture/OPEN_SOURCE_LICENSE_MATRIX.md`
- `docs/planning/WORKSPACE_ROADMAP.md`
- `docs/planning/MNFLOW_FIGJAM_ROADMAP.md`
- `docs/planning/EXCALIDRAW_SPIKE_PLAN.md`

---

## 13. Validation Commands

```bash
npm run build
npm test -- --run
npm run lint
npx vercel --prod --yes
```

Focused tests:

```bash
npm test -- --run src/store/createFlowStore.test.ts src/components/HomePage.integration.test.tsx
```

If vitest worker fails on Windows, try:

```bash
npm test -- --run --pool=threads --no-file-parallelism
```

---

## 14. User Preferences

- Use Indonesian language for discussion.
- Email/password auth only for v1.
- Full backend implementation preferred.
- Professional developer-grade planning/docs before coding.
- Do not rush implementation without docs and architecture review.
- Excalidraw selected over tldraw because of MIT license and no watermark/commercial threshold.

---

## 15. Session Notes

As of 2026-06-17:
- Documentation is now mature enough to begin professional implementation review.
- Do not start major coding until docs are reviewed/approved.
- Next best action: commit docs, then stabilize/commit workspace shell, then run Excalidraw spike in separate branch.
