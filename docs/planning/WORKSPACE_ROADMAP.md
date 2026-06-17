# MNWHILE FlowKit — Multi-Workspace Roadmap

**Date:** 2026-06-17  
**Status:** Active Roadmap  
**Scope:** Workspace architecture, engine abstraction, and per-workspace visual evolution  
**Owner:** MNWHILE Team

---

## 1. Executive Summary

MNWHILE FlowKit is evolving from an OpenFlowKit-based diagram editor into a multi-workspace creative platform inspired by the Figma product ecosystem. The platform will support six core workspace types:

1. **MnFlow** — Diagramming / whiteboard / FigJam-style workspace (current OpenFlowKit feature set)
2. **Design** — UI/UX design canvas (Figma Design-style)
3. **Slides** — Presentation deck builder (Figma Slides-style)
4. **Make** — AI prompt-to-output workspace (Figma Make-style)
5. **Buzz** — Branded asset / campaign workspace (Figma Buzz-style)
6. **Site** — Responsive website builder / publisher (Figma Sites-style)

The immediate goal is not to build all engines from scratch. The immediate goal is to **create a clean, professional architecture** that allows each workspace to evolve independently without duplicating infrastructure or breaking MnFlow.

---

## 2. Strategic Direction

### 2.1 Product Positioning

| Product Area | MNWHILE Workspace | Primary User Need | Current Engine |
|--------------|------------------|-------------------|----------------|
| Ideation / diagrams | **MnFlow** | Diagram systems, architecture, flows, brainstorming | React Flow |
| UI/UX design | **Design** | Design app/web interfaces, components, design systems | React Flow (temporary) |
| Presentations | **Slides** | Create interactive decks connected to designs | React Flow pages (temporary) |
| AI creation | **Make** | Generate diagrams, prototypes, or code from prompts | Flowpilot + React Flow |
| Brand assets | **Buzz** | Generate campaign assets from brand-safe templates | React Flow (temporary) |
| Website publishing | **Site** | Create responsive websites and publish them | React Flow (temporary) |

### 2.2 Core Architecture Strategy

**Short-term:**
- Keep React Flow as the shared canvas engine for all workspace shells
- Split UI shells cleanly by workspace
- Extract duplicated logic into shared hooks and primitives
- Keep MnFlow stable and production-ready

**Medium-term:**
- Add workspace-specific data models while preserving the shared document container
- Add workspace-specific property panels
- Add workspace-specific export/publish paths

**Long-term:**
- Swap engines per workspace:
  - MnFlow → React Flow (stay)
  - Design → vector/layout engine
  - Slides → deck/page engine
  - Site → responsive DOM/layout engine
  - Buzz → template/brand engine
  - Make → orchestration engine for AI output

---

## 3. Current State

### 3.1 Completed Platform Foundation

| Layer | Status | Notes |
|-------|--------|-------|
| Auth | ✅ Complete | Supabase email/password |
| Cloud Persistence | ✅ Complete | Supabase documents + RLS |
| Sharing | ✅ Complete | Public share token + explicit sharing |
| Export Upload | ✅ Complete | Cloudflare R2 via Vercel API |
| Production Deploy | ✅ Complete | Vercel production active |
| MnFlow Engine | ✅ Complete | OpenFlowKit feature set |
| Workspace Types | ✅ Added locally | `mnflow`, `design`, `slides`, `make`, `buzz`, `site` |
| Workspace Shells | 🟡 Prototype | Visual shells exist, engine shared |
| Engine Abstraction | ❌ Missing | Roadmap item |

### 3.2 Current Workspace Implementation

```
src/components/workspaces/
├── WorkspaceRouter.tsx
├── MnFlowWorkspace.tsx
├── DesignWorkspace.tsx
├── SlidesWorkspace.tsx
├── MakeWorkspace.tsx
├── BuzzWorkspace.tsx
├── SiteWorkspace.tsx
└── shared/
    ├── WorkspaceCanvas.tsx
    ├── WorkspaceHeader.tsx
    ├── WorkspaceOverlays.tsx
    └── workspaceTypes.ts
```

All workspaces currently share:
- `WorkspaceCanvas` → React Flow canvas
- `WorkspaceOverlays` → Toolbar/playback/collaboration overlays
- `PropertiesPanel` → Diagram-specific properties panel
- Zustand document/page/node/edge model

---

## 4. Phase Roadmap

## Phase A — Commit & Stabilize Current Local Work

**Goal:** Preserve current local changes safely, validate build/test, and deploy current state.

**Duration:** 1 day

### Tasks

- [ ] Review working tree (`git status`, `git diff --stat`)
- [ ] Verify deleted `SidebarFooter.tsx` has no imports
- [ ] Review untracked assets (`YOORASARAH-V3-IMPORT-FIXED.json`, PNGs)
- [ ] Run `npm run build`
- [ ] Run focused tests for workspace/store changes
- [ ] Run full test suite if environment permits
- [ ] Commit current changes with professional message
- [ ] Push to GitHub
- [ ] Deploy to Vercel production
- [ ] Verify production manually

### Acceptance Criteria

- [ ] Git working tree clean after commit
- [ ] Build passes
- [ ] Tests pass or failing tests documented with root cause
- [ ] Production deploy loads without console errors
- [ ] Workspace creation buttons work from Home

### Recommended Commit Message

```text
feat: add multi-workspace shells and workspace type persistence

- add workspace router for MnFlow, Design, Slides, Make, Buzz, and Site
- persist workspaceType across local and cloud document models
- redesign home sidebar and dashboard with workspace launch actions
- add Figma-inspired shells for design, slides, make, buzz, and site workspaces
- replace SidebarFooter with integrated user profile menu

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Phase B — Documentation & Architecture Planning

**Goal:** Document the multi-workspace strategy before implementation.

**Duration:** 1-2 days

### Tasks

- [x] Create `docs/architecture/WORKSPACE_ARCHITECTURE.md`
- [x] Create `docs/planning/WORKSPACE_ROADMAP.md`
- [ ] Update `CLAUDE.md` with workspace architecture rules
- [ ] Update `docs/planning/TIMELINE_CHECKLIST.md` with workspace phases
- [ ] Optionally create `docs/architecture/WORKSPACE_ENGINE_ABSTRACTION.md` for future engine work

### Acceptance Criteria

- [ ] All docs explain the current state, target state, and implementation sequence
- [ ] Docs clearly state MnFlow UI remains unchanged
- [ ] Docs distinguish workspace shell refactor from future engine replacement
- [ ] Docs include verification strategy

---

## Phase C — Shared Hooks & Primitives Extraction

**Goal:** Remove duplicated workspace logic without changing visual UI.

**Duration:** 3-4 days

### Tasks

#### C1. Shared Hooks

- [ ] Create `src/components/workspaces/shared/hooks/useWorkspaceDocument.ts`
- [ ] Create `src/components/workspaces/shared/hooks/useWorkspaceUser.ts`
- [ ] Create `src/components/workspaces/shared/hooks/useWorkspacePanelState.ts`

#### C2. Shared Primitives

- [ ] Create `src/components/workspaces/shared/primitives/MNWHILELogo.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspaceDocTitle.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspaceAvatar.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspaceRail.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspaceRailButton.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspaceSidebarShell.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspaceFloatingHelp.tsx`
- [ ] Create `src/components/workspaces/shared/primitives/WorkspacePlayShareBar.tsx`

#### C3. Refactor Workspaces

- [ ] Refactor `DesignWorkspace.tsx` to use shared hooks/primitives
- [ ] Refactor `SlidesWorkspace.tsx` to use shared hooks/primitives
- [ ] Refactor `MakeWorkspace.tsx` to use shared hooks/primitives
- [ ] Refactor `BuzzWorkspace.tsx` to use shared hooks/primitives
- [ ] Refactor `SiteWorkspace.tsx` to use shared hooks/primitives
- [ ] Refactor `MnFlowWorkspace.tsx` only if visual parity remains exact

### Acceptance Criteria

- [ ] No visible UI changes
- [ ] All workspace interactions still work:
  - doc rename
  - sidebar open/close
  - avatar display
  - play/share buttons
  - properties panel
- [ ] Build passes
- [ ] Tests pass
- [ ] Line count reduced in workspace files
- [ ] No duplicated MNWHILE SVG paths remain in workspace files

### Verification Commands

```bash
npm run build
npm test -- --run src/store/createFlowStore.test.ts src/components/HomePage.integration.test.tsx
```

---

## Phase D — Workspace Directory Reorganization

**Goal:** Move each workspace into its own isolated directory and split large files.

**Duration:** 2-3 days

### Tasks

- [ ] Create subdirectories:
  - `src/components/workspaces/mnflow/`
  - `src/components/workspaces/design/`
  - `src/components/workspaces/slides/`
  - `src/components/workspaces/make/`
  - `src/components/workspaces/buzz/`
  - `src/components/workspaces/site/`

- [ ] Move and split files:
  - `MnFlowWorkspace.tsx` → `mnflow/MnFlowWorkspace.tsx`
  - `DesignWorkspace.tsx` → `design/DesignWorkspace.tsx`, `DesignRail.tsx`, `DesignLeftSidebar.tsx`, `DesignRightPanel.tsx`
  - `SlidesWorkspace.tsx` → `slides/SlidesWorkspace.tsx`, `SlidesRail.tsx`, `SlidesPanel.tsx`, `SlidesSettingsPanel.tsx`
  - `MakeWorkspace.tsx` → `make/MakeWorkspace.tsx`, `MakeRail.tsx`, `MakeAISidebar.tsx`
  - `BuzzWorkspace.tsx` → `buzz/BuzzWorkspace.tsx`, `BuzzRail.tsx`, `BuzzChannelPanel.tsx`, `BuzzCampaignPanel.tsx`
  - `SiteWorkspace.tsx` → `site/SiteWorkspace.tsx`, `SiteRail.tsx`, `SitePageNavigator.tsx`, `SiteViewportSwitcher.tsx`, `SiteSettingsPanel.tsx`

- [ ] Update `WorkspaceRouter.tsx` lazy imports
- [ ] Run build/tests
- [ ] Manual visual verification

### Acceptance Criteria

- [ ] File sizes reduced (workspace orchestrators ~100-150 lines)
- [ ] No cross-imports between workspace directories
- [ ] WorkspaceRouter lazy imports work
- [ ] UI visually unchanged
- [ ] Build passes

---

## Phase E — Engine Abstraction Preparation

**Goal:** Prepare for future canvas engine swaps without replacing React Flow yet.

**Duration:** 1-2 weeks

### Tasks

- [ ] Create `src/components/workspaces/engines/types.ts`
- [ ] Define `WorkspaceEngine` interface
- [ ] Register current React Flow engine as `diagramEngine`
- [ ] Create workspace engine mapping:
  - MnFlow → diagramEngine
  - Design → diagramEngine (temporary)
  - Slides → diagramEngine (temporary)
  - Make → diagramEngine (temporary)
  - Buzz → diagramEngine (temporary)
  - Site → diagramEngine (temporary)

### Proposed Interface

```typescript
export interface WorkspaceEngine {
  id: string;
  label: string;
  Canvas: React.ComponentType<WorkspaceEngineCanvasProps>;
  PropertiesPanel: React.ComponentType<WorkspaceEnginePropertiesProps>;
  overlays?: React.ComponentType<WorkspaceEngineOverlayProps>;
  supportsNodes: boolean;
  supportsEdges: boolean;
  exportFormats: ExportFormat[];
}
```

### Acceptance Criteria

- [ ] Engine interface exists
- [ ] Current behavior unchanged
- [ ] Future Design vector engine can be added without touching MnFlow

---

## Phase F — Per-Workspace Feature Roadmap

Once architecture is stable, each workspace evolves independently.

### F1. MnFlow Polish

**Priority:** Critical  
**Goal:** Keep current OpenFlowKit/MnFlow feature set stable and production-grade.

Tasks:
- [ ] Verify all 8 diagram types work
- [ ] Verify Mermaid import/export
- [ ] Verify AI generation
- [ ] Verify MP4 export
- [ ] Verify cloud sync/sharing
- [ ] Improve onboarding for MnFlow-specific flows

### F2. Make Workspace MVP

**Priority:** High  
**Goal:** Convert Make from AI-side-panel shell into AI-first creation workflow.

Tasks:
- [ ] Add prompt landing state
- [ ] Add output type selector: diagram, design mockup, site outline, slide deck
- [ ] Connect Flowpilot output to workspace type
- [ ] Add generation history
- [ ] Add publish/export actions

### F3. Slides Workspace MVP

**Priority:** High  
**Goal:** Build actual presentation flow on top of pages.

Tasks:
- [ ] Treat pages as slides
- [ ] Add presenter mode
- [ ] Add slide transitions
- [ ] Add speaker notes
- [ ] Export to PDF / image sequence
- [ ] Optional: PowerPoint export later

### F4. Design Workspace MVP

**Priority:** Medium-High  
**Goal:** Add design-oriented editing while keeping React Flow temporarily.

Tasks:
- [ ] Add frame/artboard node type
- [ ] Add auto-layout-like section node
- [ ] Add component/variant metadata
- [ ] Add style/token panel
- [ ] Add design-specific properties panel
- [ ] Later: evaluate vector engine replacement (Konva/Fabric/custom)

### F5. Site Workspace MVP

**Priority:** Medium  
**Goal:** Generate responsive site structure and static HTML export.

Tasks:
- [ ] Add site page model
- [ ] Add sections/components model
- [ ] Add breakpoint metadata
- [ ] Add HTML export pipeline
- [ ] Add Vercel/Cloudflare publish path later

### F6. Buzz Workspace MVP

**Priority:** Medium-Low  
**Goal:** Generate brand-safe campaign assets and templates.

Tasks:
- [ ] Add brand kit model
- [ ] Add template lock fields
- [ ] Add channel size presets
- [ ] Add batch generation
- [ ] Add PNG/SVG bulk export

---

## 5. Commit Strategy

Use small professional commits:

### Commit 1 — Current local work

```text
feat: add multi-workspace shells and workspace type persistence
```

### Commit 2 — Documentation

```text
docs: document multi-workspace architecture and roadmap
```

### Commit 3 — Shared hooks

```text
refactor: extract shared workspace hooks
```

### Commit 4 — Shared primitives

```text
refactor: extract shared workspace UI primitives
```

### Commit 5 — Workspace split

```text
refactor: organize workspaces into isolated directories
```

### Commit 6 — Engine prep

```text
feat: add workspace engine abstraction foundation
```

All commits end with:

```text
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 6. Verification Matrix

| Check | Command / Method | Required |
|-------|------------------|----------|
| TypeScript build | `npm run build` | ✅ |
| Unit tests | `npm test -- --run` | ✅ |
| Focused workspace tests | `npm test -- --run src/store/createFlowStore.test.ts src/components/HomePage.integration.test.tsx` | ✅ |
| Lint | `npm run lint` | ✅ |
| Browser smoke | Open local app, create all 6 workspace types | ✅ |
| Production smoke | Check Vercel prod, no console errors | ✅ |
| Cloud sync | Create doc while logged in, verify Supabase row | ✅ before deploy claims |
| Export | PNG/SVG export smoke | ✅ |
| Share | Generate public link smoke | ✅ |

---

## 7. Definition of Done

A phase is done only when:

1. Code compiles
2. Tests pass or failures are clearly documented with root cause
3. UI is manually verified
4. Docs updated if architecture changed
5. Commit created with clear message
6. Production deploy verified if phase affects user-facing behavior

---

## 8. Notes for Future Maintainers

- Do not put workspace-specific visual logic in `shared/`
- Do not import one workspace from another workspace
- Do not change MnFlow visual shell unless explicitly requested
- Keep `WorkspaceRouter` as the only place that maps `workspaceType` to workspace component
- Keep shared hooks logic-only; avoid Tailwind classes in hooks
- Keep shared primitives small and style-overridable via props
- Use `@/` imports per project convention

---

## 9. Open Questions

1. Should Design eventually use Konva, Fabric.js, or custom SVG/canvas engine?
2. Should Slides export to PowerPoint in v1 or later?
3. Should Site publishing target Vercel, Cloudflare Pages, or static export first?
4. Should Buzz have its own brand kit table in Supabase?
5. Should Make output real code in v1 or stay diagram/design generation first?

---

## 10. Related Docs

- `docs/architecture/WORKSPACE_ARCHITECTURE.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/planning/TIMELINE_CHECKLIST.md`
- `docs/planning/PROJECT_BUILD_PLAN.md`
- `CLAUDE.md`

---

**Last updated:** 2026-06-17
