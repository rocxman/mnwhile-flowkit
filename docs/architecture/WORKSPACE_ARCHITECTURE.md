# MNWHILE FlowKit — Workspace Architecture Decision Record

**ADR Status:** Accepted  
**Date:** 2026-06-17  
**Authors:** MNWHILE Team + AI-assisted analysis  
**Approved by:** rocxman (Project Lead)

---

## 1. Problem Statement

MNWHILE FlowKit has evolved from a single-purpose diagram tool (OpenFlowKit fork) into a multi-workspace platform inspired by the Figma product suite. However, the current implementation has architectural limitations:

1. **Code Duplication:** All 6 workspace shells duplicate ~70-80 lines of identical logic (document editing, user avatar, sidebar state, logo rendering)
2. **Monolithic Engine:** Every workspace renders the same React Flow diagram canvas, but future workspaces need different engines (vector editor for Design, slide deck for Slides, site builder for Sites)
3. **Tightly Coupled UI:** Each workspace's visual shell and logic are in single files (400-500 lines), making maintenance and evolution difficult
4. **No Engine Abstraction:** There's no way to swap canvas implementations per workspace without massive rewrites

**Impact:** Current architecture blocks the platform vision. Each new workspace adds ~400 lines of mostly duplicated code, and evolving one workspace's visuals risks breaking others.

---

## 2. Decision

We adopt a **"Shared Infrastructure, Isolated Shells"** architecture:

```
┌─────────────────────────────────────────┐
│           WorkspaceRouter                │
│    (lazy-loads workspace by type)        │
└───────┬───────┬───────┬───────┬─────────┘
        │       │       │       │
   ┌────▼──┐ ┌─▼────┐ ┌▼────┐ ┌▼────┐
   │MnFlow │ │Design│ │Slide│ │Make │
   │  (D)  │ │  (D) │ │ (D) │ │(D)  │
   └───┬───┘ └──┬───┘ └──┬──┘ └──┬──┘
       └────────┴────────┴───────┘
                    │
       ┌────────────▼─────────────┐
       │     shared/hooks/        │  ← Logic layer
       │  useWorkspaceDocument    │
       │  useWorkspaceUser        │
       │  useWorkspacePanelState  │
       └────────────┬─────────────┘
                    │
       ┌────────────▼─────────────┐
       │   shared/primitives/     │  ← UI atoms
       │  WorkspaceDocTitle       │
       │  WorkspaceAvatar         │
       │  WorkspaceRail           │
       │  WorkspaceRailButton     │
       │  WorkspaceSidebarShell   │
       │  WorkspaceFloatingHelp   │
       │  MNWHILELogo            │
       └────────────┬─────────────┘
                    │
       ┌────────────▼─────────────┐
       │  shared/infrastructure/  │  ← Shared services
       │  WorkspaceCanvas         │
       │  WorkspaceOverlays       │
       │  workspaceTypes          │
       └──────────────────────────┘
```

**Core Principle:** Each workspace directory owns its visual shell (layout, colors, interactions) but shares all logic, primitives, and infrastructure. MnFlow remains unchanged and serves as the reference implementation.

---

## 3. Context

### 3.1 Current Workspace Status

| Workspace | Lines | File | Engine | Visual Shell |
|-----------|-------|------|--------|-------------|
| **MnFlow** | 81 | `MnFlowWorkspace.tsx` | React Flow | Minimal (default look) |
| **Design** | 472 | `DesignWorkspace.tsx` | React Flow | Figma-like (rail, pages, layers) |
| **Slides** | 356 | `SlidesWorkspace.tsx` | React Flow | Slide deck (thumbnails, transitions) |
| **Make** | 298 | `MakeWorkspace.tsx` | React Flow | AI-first (Flowpilot panel) |
| **Buzz** | 464 | `BuzzWorkspace.tsx` | React Flow | Campaign hub (channels, AI) |
| **Site** | 519 | `SiteWorkspace.tsx` | React Flow | Site builder (sitemap, sections) |

### 3.2 Duplication Analysis

Each non-MnFlow workspace duplicates:

| Pattern | Lines | Extracted To |
|---------|-------|-------------|
| Document name editing | ~25 | `useWorkspaceDocument` hook |
| User avatar + username | ~6 | `useWorkspaceUser` hook |
| Sidebar open/close state | ~3 | `useWorkspacePanelState` hook |
| MNWHILE logo SVG | ~6 | `MNWHILELogo` component |
| PropertiesPanel prop drilling | ~30 | Workspace-local component |
| **Total per workspace** | **~70-80** | Shared hooks + primitives |

**Net reduction:** ~350-400 lines of duplicated code across 5 workspaces.

### 3.3 Design Goals

1. **No visual changes to MnFlow** — Default diagram workspace stays identical
2. **Visual isolation per workspace** — Each workspace can evolve independently
3. **Shared logic** — Auth, persistence, sharing, export, AI remain in shared infrastructure
4. **Engine-ready** — Architecture allows future canvas swap (React Flow → vector editor for Design)
5. **Professional-grade** — Clean separation, proper typing, comprehensive documentation

---

## 4. Architecture Details

### 4.1 Target Directory Structure

```
src/components/workspaces/
├── WorkspaceRouter.tsx                  ← Routing (unchanged)
│
├── shared/
│   ├── hooks/
│   │   ├── useWorkspaceDocument.ts     ← Document name editing
│   │   ├── useWorkspaceUser.ts         ← Avatar + username
│   │   └── useWorkspacePanelState.ts   ← Sidebar state
│   ├── primitives/
│   │   ├── MNWHILELogo.tsx             ← SVG logo component
│   │   ├── WorkspaceDocTitle.tsx       ← Editable document title
│   │   ├── WorkspaceAvatar.tsx         ← User avatar (img or initials)
│   │   ├── WorkspaceRail.tsx           ← Left thin rail container
│   │   ├── WorkspaceRailButton.tsx     ← Rail button (icon + label)
│   │   ├── WorkspaceSidebarShell.tsx   ← Collapsible sidebar wrapper
│   │   ├── WorkspaceFloatingHelp.tsx   ← Help button (bottom-right)
│   │   └── WorkspacePlayShareBar.tsx   ← Avatar + play + share row
│   ├── WorkspaceCanvas.tsx             ← React Flow wrapper
│   ├── WorkspaceOverlays.tsx           ← Toolbar + playback overlays
│   └── workspaceTypes.ts              ← WorkspaceProps type
│
├── mnflow/
│   └── MnFlowWorkspace.tsx            ← MnFlow workspace (default)
│
├── design/
│   ├── DesignWorkspace.tsx            ← Design layout orchestrator
│   ├── DesignRail.tsx                 ← Rail buttons (File, Assets, Variables)
│   ├── DesignLeftSidebar.tsx          ← Pages + Layers + Usage banner
│   └── DesignRightPanel.tsx           ← Design/Prototype tabs + Properties
│
├── slides/
│   ├── SlidesWorkspace.tsx            ← Slides layout orchestrator
│   ├── SlidesRail.tsx                 ← Rail buttons (Slides, Insert)
│   ├── SlidesPanel.tsx                ← Slide thumbnails list
│   └── SlidesSettingsPanel.tsx        ← Transition, bg, insert elements
│
├── make/
│   ├── MakeWorkspace.tsx              ← Make layout orchestrator
│   ├── MakeRail.tsx                   ← Rail buttons (AI, Chat, Tools)
│   └── MakeAISidebar.tsx             ← Flowpilot AI chat panel
│
├── buzz/
│   ├── BuzzWorkspace.tsx              ← Buzz layout orchestrator
│   ├── BuzzRail.tsx                   ← Rail buttons (Buzz, Variables)
│   ├── BuzzChannelPanel.tsx           ← Channels + AI + Post outlines
│   └── BuzzCampaignPanel.tsx          ← Campaign/Publish tabs
│
└── site/
    ├── SiteWorkspace.tsx              ← Site layout orchestrator
    ├── SiteRail.tsx                   ← Rail buttons (Site, Variables)
    ├── SitePageNavigator.tsx          ← Sitemap + Layout sections
    ├── SiteViewportSwitcher.tsx       ← Desktop/Tablet/Mobile switcher
    └── SiteSettingsPanel.tsx          ← Domain/SEO settings + Properties
```

### 4.2 Shared Hooks Design

#### `useWorkspaceDocument`

```typescript
interface UseWorkspaceDocumentReturn {
  document: FlowDocument | undefined;
  docName: string;
  isEditingDocName: boolean;
  docNameInput: string;
  startEditDocName: () => void;
  setDocNameInput: (value: string) => void;
  saveDocName: () => void;
  cancelEditDocName: () => void;
}
```

Extracts from every workspace:
- `activeDocument` lookup from Zustand store
- Document name derivation
- Document name editing state (isEditing, inputValue)
- Save logic with validation
- `useEffect` sync with store name changes

#### `useWorkspaceUser`

```typescript
interface UseWorkspaceUserReturn {
  user: User | null;
  username: string;
  avatarUrl: string | undefined;
}
```

Extracts:
- `useAuth()` call
- Username derivation from email (`email.split('@')[0]`)
- Avatar URL from user metadata

#### `useWorkspacePanelState`

```typescript
interface UseWorkspacePanelStateReturn {
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
}
```

Extracts sidebar open/close state management.

### 4.3 Shared Primitives Design

#### `WorkspaceDocTitle`

```typescript
interface WorkspaceDocTitleProps {
  docName: string;
  isEditing: boolean;
  inputValue: string;
  onStartEdit: () => void;
  onInputChange: (value: string) => void;
  onSave: () => void;
  accentColor?: string;  // Border color when editing (default: '#0c8ce9')
}
```

Renders editable document name with:
- Display mode: clickable button showing doc name
- Edit mode: input field with accent border, blur/Enter to save
- ChevronDown indicator in display mode

#### `WorkspaceAvatar`

```typescript
interface WorkspaceAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';  // sm: 7x7, md: 8x8, lg: 14x14
}
```

Renders user avatar:
- Image if `avatarUrl` exists
- Gradient circle with initial letter otherwise

#### `WorkspaceRail`

```typescript
interface WorkspaceRailProps {
  children: React.ReactNode;
}
```

Renders the left thin rail container:
- Fixed width: 56px (w-14)
- Background: #2c2c2c
- Border right: #1e1e1e
- Vertical flex layout with padding

#### `WorkspaceRailButton`

```typescript
interface WorkspaceRailButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  accentColor?: string;  // Background color when active
  onClick: () => void;
}
```

Renders rail button:
- Icon container (rounded, changes bg when active)
- Label below icon (changes color when active)
- Hover states

#### `WorkspaceSidebarShell`

```typescript
interface WorkspaceSidebarShellProps {
  open: boolean;
  width?: string;        // Default: 'w-60'
  children: React.ReactNode;
}
```

Renders collapsible sidebar:
- Smooth transition when open/close
- Overflow hidden when collapsed
- Border right: #2c2c2c

#### `WorkspaceFloatingHelp`

```typescript
interface WorkspaceFloatingHelpProps {
  helpUrl?: string;  // Default: 'https://mnwhile-flowkit.com/docs'
}
```

Renders help button:
- Absolute bottom-right (4 units from edge)
- Circle with '?' icon
- Opens help URL in new tab

#### `WorkspacePlayShareBar`

```typescript
interface WorkspacePlayShareBarProps {
  username: string;
  avatarUrl?: string;
  onPlay: () => void;
  onShare?: () => void;
  accentColor?: string;  // Share button bg (default: '#0c8ce9')
}
```

Renders top-right bar:
- User avatar
- Play button with icon
- Share button (optional, colored)
- Divider between elements

#### `MNWHILELogo`

```typescript
interface MNWHILELogoProps {
  onClick?: () => void;
}
```

Renders MNWHILE logo SVG:
- Fixed size: 20x20
- Clickable if onClick provided
- Hover state

---

## 5. Workspace Isolation Contract

### 5.1 Each Workspace Directory Owns

- **Layout JSX:** Rail + sidebar + canvas + right panel arrangement
- **Color Scheme:** Accent color, badge colors, hover states
- **Specific UI Components:** Workspace-specific interactions
- **Workspace-Specific State:** E.g., Slides transition settings, Site viewport mode

### 5.2 Each Workspace Directory Does NOT Own

- **Auth:** Authentication, user session (`src/contexts/AuthContext.tsx`)
- **Persistence:** IndexedDB, Supabase (`src/services/storage/`)
- **Sharing:** Public links, user sharing (`src/components/SharedDocumentPage.tsx`)
- **Export:** PNG, SVG, PDF, MP4, etc. (`src/services/export/`)
- **AI:** Flowpilot, generation (`src/services/flowpilot/`)
- **Canvas Rendering:** React Flow wrapper (`shared/WorkspaceCanvas.tsx`)
- **Data Model:** Zustand store, documents, pages (`src/store/`)

---

## 6. Consequences

### 6.1 Positive

1. **No Duplication** — ~400 lines of shared code consolidated
2. **Visual Isolation** — Each workspace evolves independently
3. **Engine-Ready** — Can swap canvas per workspace in future
4. **Maintainable** — Small, focused files per workspace
5. **Testable** — Shared hooks easily unit-testable
6. **Professional** — Clean architecture matching industry standards

### 6.2 Neutral

1. **MnFlow Unchanged** — Reference implementation stays identical
2. **Same Canvas** — All workspaces still use React Flow (no visual change)
3. **Same Properties Panel** — All workspaces use diagram properties (no visual change)

### 6.3 Negative

1. **Initial Effort** — Requires Phase C (extraction) and Phase D (reorganization)
2. **Import Path Changes** — All workspace imports need updating
3. **Learning Curve** — Team needs to understand shared primitives layer

### 6.4 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Shared extraction breaks existing behavior | Medium | Unit tests + visual regression check |
| Import path changes break lazy loading | High | Atomic updates, test build after each step |
| PropertiesPanel prop drilling changes | Medium | Keep interface stable, only change WHERE rendered |
| Test environment vitest-pool failure | Low | Use `--pool=threads` or `--no-file-parallelism` |

---

## 7. Implementation Phases

| Phase | Goal | Duration | Status |
|-------|------|----------|--------|
| **Phase A** | Commit & Stabilize | 1 day | ✅ Approved |
| **Phase B** | Documentation & Planning | 2 days | ✅ Approved |
| **Phase C** | Shared Infrastructure Extraction | 4 days | ✅ Approved |
| **Phase D** | Directory Reorganization | 2 days | ✅ Approved |
| **Phase E** | Per-Workspace Visual Evolution | Ongoing | 🟡 Pending |

**Full roadmap:** See `docs/planning/WORKSPACE_ROADMAP.md`

---

## 8. Related Decisions

- **ADR-001:** Self-hosted deployment (Vercel + Supabase + Cloudflare R2)
- **ADR-002:** Local-first with cloud sync (IndexedDB + Supabase)
- **ADR-003:** Email/password auth only (v1)
- **ADR-004:** Single Zustand store with slices

---

## 9. References

- **Figma Product Suite:** https://www.figma.com/
- **OpenFlowKit Upstream:** https://github.com/Vrun-design/openflowkit
- **Project Plan:** `docs/planning/WORKSPACE_ROADMAP.md`
- **Architecture Overview:** `docs/architecture/ARCHITECTURE.md`
- **Timeline Checklist:** `docs/planning/TIMELINE_CHECKLIST.md`

---

## 10. Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-06-17 | AI + rocxman | Initial draft (ADR format) |
| 2026-06-17 | AI + rocxman | Added shared hooks/primitives design |

---

**Next Steps:**

1. Review and approve this ADR
2. Create `docs/planning/WORKSPACE_ROADMAP.md` with detailed execution plan
3. Execute Phase A (commit & stabilize)
4. Begin Phase C (shared infrastructure extraction)
