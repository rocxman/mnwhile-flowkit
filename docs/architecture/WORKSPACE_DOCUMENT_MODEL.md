# MNWHILE FlowKit — Workspace Document Model

**Date:** 2026-06-17  
**Status:** Technical Design — Awaiting Approval  
**Priority:** Critical — blocks all workspace implementations  
**Parent:** `docs/architecture/WORKSPACE_ARCHITECTURE.md`

---

## 1. Executive Summary

Dokumen ini mendefinisikan data model final untuk multi-workspace platform MNWHILE FlowKit. Model baru mendukung 6 workspace type (MnFlow, Design, Slides, Make, Buzz, Site) dengan backward compatibility dari struktur `FlowDocument` + `FlowTab` yang ada saat ini.

**Key Decisions:**
1. **WorkspacePage** replaces FlowTab sebagai container untuk berbagai tipe konten
2. **schemaVersion** wajib di setiap page untuk migration safety
3. **Type-specific content** disimpan sebagai union type dengan discriminator
4. **Cloud-first schema** — Supabase JSON column mendukung semua workspace type

---

## 2. Current Data Model (Before)

### 2.1 FlowDocument

```typescript
// src/services/storage/flowDocumentModel.ts (current)
export interface FlowDocument {
  id: string;
  name: string;
  diagramType?: DiagramType;
  activeTabId: string;
  tabs: FlowTab[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

**Limitations:**
- `diagramType` field ambigu — dokumen bisa mixed types, tapi field ini global
- Tidak ada workspace type field — semua dokumen dianggap "mnflow"
- `tabs` array tidak mendukung berbagai content types (whiteboard, design, site)

### 2.2 FlowTab

```typescript
// src/lib/types.ts (current)
export interface FlowTab {
  id: string;
  name: string;
  diagramType: DiagramType;
  nodes: FlowNode[];
  edges: FlowEdge[];
  playback: PlaybackState;
  history: FlowHistory;
  updatedAt: string;
}
```

**Limitations:**
- Hanya mendukung diagram content (nodes/edges)
- Tidak ada field untuk Excalidraw elements, design components, slide markdown
- Tidak ada schema versioning — migration akan sulit

---

## 3. Target Data Model (After)

### 3.1 WorkspaceDocument

```typescript
export interface WorkspaceDocument {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
  primaryType?: PageType; // Optional: "main" content type for UI hints
  activePageId: string;
  pages: WorkspacePage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Metadata
  tags?: string[];
  thumbnail?: string; // Base64 atau URL
  description?: string;
}

export type WorkspaceType = 
  | 'mnflow'      // OpenFlowKit + Excalidraw
  | 'design'      // Plasmic SDK
  | 'slides'      // Reveal.js
  | 'make'        // Flowpilot + bolt.diy pattern
  | 'buzz'        // Fabric.js
  | 'site';       // Plasmic + static export
```

**Key Changes:**
- ✅ `workspaceType` field explicit — mendukung 6 workspace types
- ✅ `primaryType` optional — hint untuk UI (contoh: "this is primarily a diagram doc")
- ✅ `pages` replaces `tabs` — semantic naming lebih jelas
- ✅ Metadata fields untuk tags, thumbnail, description

### 3.2 WorkspacePage

```typescript
export interface WorkspacePage {
  id: string;
  name: string;
  type: PageType;
  schemaVersion: number; // ⚠️ CRITICAL: wajib ada dari hari pertama
  content: PageContent;
  history: FlowHistory;
  playback?: PlaybackState; // Optional: untuk cinematic export
  updatedAt: string;
  
  // Page-level metadata
  locked?: boolean; // Read-only page
  archived?: boolean; // Hidden from main view
  thumbnail?: string; // Base64 preview
}

export type PageType = 
  | 'diagram'     // OpenFlowKit nodes/edges
  | 'whiteboard'  // Excalidraw elements
  | 'design'      // Plasmic components
  | 'slide'       // Markdown + metadata
  | 'asset'       // Fabric.js canvas
  | 'site';       // Plasmic site

export type PageContent = 
  | DiagramContent
  | WhiteboardContent
  | DesignContent
  | SlideContent
  | AssetContent
  | SiteContent;
```

**Key Changes:**
- ✅ `type` field discriminator — union type type-safe
- ✅ `schemaVersion` wajib — memungkinkan migration otomatis
- ✅ `content` union type — mendukung berbagai konten
- ✅ `history` tetap ada — undo/redo across page types
- ✅ Page-level metadata (locked, archived, thumbnail)

### 3.3 Type-Specific Content

#### 3.3.1 DiagramContent

```typescript
export interface DiagramContent {
  nodes: FlowNode[];
  edges: FlowEdge[];
  diagramType: DiagramType;
  layout?: LayoutOptions; // ELK.js config
  mermaid?: string; // Source Mermaid code (if imported)
  dsl?: string; // OpenFlow DSL (if generated)
}
```

**Compatibility:** Identical dengan FlowTab content lama. Migration trivial.

#### 3.3.2 WhiteboardContent

```typescript
export interface WhiteboardContent {
  elements: ExcalidrawElement[];
  appState: ExcalidrawAppState;
  files?: Record<string, BinaryFileData>; // Embedded images
  
  // MNWHILE extensions
  templates?: WhiteboardTemplate[]; // Saved templates
  voting?: VotingSession[]; // Active voting sessions
  timers?: TimerSession[]; // Active timers
}

// Excalidraw types (import dari @excalidraw/excalidraw)
export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'text' | 'line' | 'arrow' | 'freedraw' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'solid' | 'hachure' | 'cross-hatch';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  groupIds: string[];
  boundElements?: { id: string; type: 'arrow' | 'text' }[];
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  customData?: Record<string, unknown>; // MNWHILE extensions
}

export interface ExcalidrawAppState {
  viewBackgroundColor: string;
  currentItemFontFamily: number;
  currentItemFontSize: number;
  currentItemTextAlign: 'left' | 'center' | 'right';
  currentItemStrokeColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: 'solid' | 'hachure' | 'cross-hatch';
  currentItemStrokeWidth: number;
  currentItemStrokeStyle: 'solid' | 'dashed' | 'dotted';
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontFamily: number;
  currentItemFontSize: number;
  currentItemTextAlign: 'left' | 'center' | 'right';
  cursorButton: 'up' | 'down';
  gridSize: number | null;
  viewModeEnabled: boolean;
  zenModeEnabled: boolean;
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
}
```

**Notes:**
- Excalidraw elements structure bisa berubah antar versi — `schemaVersion` critical
- `files` field untuk embedded images (base64 atau blob URL)
- `customData` untuk MNWHILE extensions (voting, reactions, etc.)

#### 3.3.3 DesignContent

```typescript
export interface DesignContent {
  plasmicProjectId?: string; // Jika pakai Plasmic SDK
  plasmicData?: PlasmicProjectData; // Plasmic project JSON
  
  // Fallback: custom design format
  frames?: DesignFrame[];
  components?: DesignComponent[];
  tokens?: DesignToken[];
}

export interface DesignFrame {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: DesignElement[];
}

export interface DesignComponent {
  id: string;
  name: string;
  variants: DesignVariant[];
}

export interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow';
}
```

**Notes:**
- `plasmicData` optional — bisa pakai Plasmic SDK atau custom format
- Fallback custom format untuk offline-first scenarios

#### 3.3.4 SlideContent

```typescript
export interface SlideContent {
  markdown: string; // Slidev-compatible markdown
  notes?: string; // Speaker notes
  layout: 'title' | 'content' | 'two-column' | 'blank';
  theme?: SlideTheme;
  transitions?: TransitionConfig;
  
  // Reveal.js extensions
  revealOptions?: Record<string, unknown>;
}

export interface SlideTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  backgroundColor: string;
}

export interface TransitionConfig {
  type: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
  duration: number; // ms
}
```

**Notes:**
- `markdown` field utama — Slidev/Reveal.js compatible
- `layout` hint untuk editor UI
- `theme` per-slide override

#### 3.3.5 AssetContent

```typescript
export interface AssetContent {
  fabricCanvas: FabricCanvasJSON; // Fabric.js serialized canvas
  brandKit: BrandKit;
  channelSize?: ChannelSize; // Target export size
  
  // Batch generation
  variants?: AssetVariant[];
}

export interface FabricCanvasJSON {
  version: string;
  objects: FabricObject[];
  background?: string;
  backgroundImage?: string;
}

export interface BrandKit {
  id: string;
  name: string;
  colors: string[]; // Hex colors
  fonts: string[]; // Font families
  logos: string[]; // Logo URLs atau base64
  lockedFields: string[]; // Fields yang tidak boleh diubah
}

export interface ChannelSize {
  name: string; // "Instagram Story", "Twitter Post"
  width: number;
  height: number;
}

export interface AssetVariant {
  id: string;
  name: string;
  channelSize: ChannelSize;
  fabricCanvas: FabricCanvasJSON;
}
```

**Notes:**
- `fabricCanvas` serialized JSON dari Fabric.js
- `brandKit` untuk template locking
- `variants` untuk batch export (Instagram, Twitter, LinkedIn sizes)

#### 3.3.6 SiteContent

```typescript
export interface SiteContent {
  plasmicSiteId?: string; // Jika pakai Plasmic
  plasmicSiteData?: PlasmicSiteData;
  
  // Fallback: custom site format
  routes: SiteRoute[];
  components: SiteComponent[];
  staticExport?: string; // Generated HTML
  
  // Deployment
  deployment?: SiteDeployment;
}

export interface SiteRoute {
  path: string; // "/about", "/pricing"
  page: SitePage;
  metadata: SiteMetadata;
}

export interface SitePage {
  id: string;
  name: string;
  sections: SiteSection[];
}

export interface SiteSection {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'footer' | 'custom';
  content: Record<string, unknown>;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export interface SiteDeployment {
  provider: 'vercel' | 'cloudflare' | 'static';
  url?: string;
  lastDeployedAt?: string;
  status: 'draft' | 'deploying' | 'deployed' | 'error';
}
```

**Notes:**
- `plasmicSiteData` untuk Plasmic integration
- Fallback custom format untuk static site generation
- `deployment` tracking untuk publish workflow

---

## 4. Schema Versioning Strategy

### 4.1 Why schemaVersion is Critical

Excalidraw, Plasmic, dan Fabric.js semua pernah mengubah format data antar versi. Tanpa `schemaVersion`, kita tidak tahu:
- Apakah data ini dari Excalidraw v1 atau v2?
- Apakah design ini dari Plasmic SDK 2024 atau 2025?
- Apakah canvas ini dari Fabric.js 5.x atau 6.x?

### 4.2 Version Numbers

```typescript
// Setiap page type punya version sendiri
const SCHEMA_VERSIONS = {
  diagram: 1,
  whiteboard: 1, // Excalidraw elements format
  design: 1,
  slide: 1,
  asset: 1,
  site: 1,
};

// Increment saat format berubah
// Contoh: Excalidraw rilis format baru
// SCHEMA_VERSIONS.whiteboard = 2;
```

### 4.3 Migration Functions

```typescript
// src/services/storage/pageMigration.ts

export function migratePage(page: WorkspacePage): WorkspacePage {
  const currentVersion = SCHEMA_VERSIONS[page.type];
  
  if (page.schemaVersion === currentVersion) {
    return page; // No migration needed
  }
  
  if (page.schemaVersion < currentVersion) {
    return applyMigrations(page, page.schemaVersion, currentVersion);
  }
  
  throw new Error(
    `Page ${page.id} has future schemaVersion ${page.schemaVersion}, ` +
    `current is ${currentVersion}. Cannot downgrade.`
  );
}

function applyMigrations(
  page: WorkspacePage,
  fromVersion: number,
  toVersion: number
): WorkspacePage {
  let migrated = page;
  
  for (let v = fromVersion; v < toVersion; v++) {
    const migrationFn = MIGRATIONS[page.type][v];
    if (!migrationFn) {
      throw new Error(`No migration from ${page.type} v${v} to v${v + 1}`);
    }
    migrated = migrationFn(migrated);
  }
  
  return {
    ...migrated,
    schemaVersion: toVersion,
    updatedAt: new Date().toISOString(),
  };
}

const MIGRATIONS: Record<PageType, Record<number, MigrationFn>> = {
  diagram: {
    // 1 → 2: add layout field
    // 1: (page) => ({ ...page, content: { ...page.content, layout: defaultLayout } }),
  },
  whiteboard: {
    // 1 → 2: Excalidraw v2 elements format
    // 1: (page) => ({ ...page, content: migrateExcalidrawV1toV2(page.content) }),
  },
  design: {},
  slide: {},
  asset: {},
  site: {},
};

type MigrationFn = (page: WorkspacePage) => WorkspacePage;
```

---

## 5. Migration from Current FlowDocument

### 5.1 Migration Function

```typescript
// src/services/storage/migrateToWorkspaceDocument.ts

export function migrateToWorkspaceDocument(
  oldDoc: FlowDocument,
  workspaceType: WorkspaceType = 'mnflow'
): WorkspaceDocument {
  return {
    id: oldDoc.id,
    name: oldDoc.name,
    workspaceType,
    primaryType: workspaceType === 'mnflow' ? 'diagram' : undefined,
    activePageId: oldDoc.activeTabId,
    pages: oldDoc.tabs.map(migrateFlowTabToWorkspacePage),
    createdAt: oldDoc.createdAt,
    updatedAt: oldDoc.updatedAt,
    deletedAt: oldDoc.deletedAt,
  };
}

function migrateFlowTabToWorkspacePage(tab: FlowTab): WorkspacePage {
  return {
    id: tab.id,
    name: tab.name,
    type: 'diagram',
    schemaVersion: 1,
    content: {
      nodes: tab.nodes,
      edges: tab.edges,
      diagramType: tab.diagramType,
    },
    history: tab.history,
    playback: tab.playback,
    updatedAt: tab.updatedAt,
  };
}
```

### 5.2 Backward Compatibility

**Problem:** Kode lama masih akses `doc.tabs[0].nodes`, tapi model baru pakai `doc.pages[0].content.nodes`.

**Solution:** Create legacy accessor layer.

```typescript
// src/services/storage/legacyAccessors.ts

export function getNodesFromPage(page: WorkspacePage): FlowNode[] {
  if (page.type !== 'diagram') {
    console.warn(`getNodesFromPage called on non-diagram page: ${page.type}`);
    return [];
  }
  return (page.content as DiagramContent).nodes;
}

export function getEdgesFromPage(page: WorkspacePage): FlowEdge[] {
  if (page.type !== 'diagram') {
    console.warn(`getEdgesFromPage called on non-diagram page: ${page.type}`);
    return [];
  }
  return (page.content as DiagramContent).edges;
}

// Untuk backward compatibility di store
export function getActiveTabNodes(state: FlowState): FlowNode[] {
  const activePage = state.pages.find(p => p.id === state.activePageId);
  if (!activePage) return [];
  return getNodesFromPage(activePage);
}
```

**Gradual Migration:**
1. Phase 1: Add WorkspaceDocument model, keep FlowDocument
2. Phase 2: Migrate all FlowDocument → WorkspaceDocument di database
3. Phase 3: Update store accessors pakai legacyAccessors
4. Phase 4: Update components satu per satu pakai WorkspacePage
5. Phase 5: Remove legacyAccessors

---

## 6. Cloud Database Impact

### 6.1 Supabase Schema

```sql
-- Current schema (unchanged)
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  workspace_type TEXT NOT NULL DEFAULT 'mnflow',
  name TEXT NOT NULL,
  content JSONB NOT NULL, -- Stores WorkspaceDocument
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Content JSONB structure
{
  "id": "doc_123",
  "name": "My Diagram",
  "workspaceType": "mnflow",
  "primaryType": "diagram",
  "activePageId": "page_456",
  "pages": [
    {
      "id": "page_456",
      "name": "Page 1",
      "type": "diagram",
      "schemaVersion": 1,
      "content": {
        "nodes": [...],
        "edges": [...],
        "diagramType": "flowchart"
      },
      "updatedAt": "2026-06-17T10:00:00Z"
    },
    {
      "id": "page_789",
      "name": "Whiteboard",
      "type": "whiteboard",
      "schemaVersion": 1,
      "content": {
        "elements": [...],
        "appState": {...}
      },
      "updatedAt": "2026-06-17T10:05:00Z"
    }
  ],
  "createdAt": "2026-06-17T10:00:00Z",
  "updatedAt": "2026-06-17T10:05:00Z"
}
```

**Notes:**
- ✅ `content JSONB` fleksibel — mendukung semua workspace types
- ✅ `workspace_type` column sudah ada — backward compatible
- ✅ No schema migration required di Supabase

### 6.2 Migration Script

```sql
-- One-time migration untuk existing documents
UPDATE documents
SET content = jsonb_set(
  content::jsonb,
  '{pages}',
  (
    SELECT jsonb_agg(
      jsonb_set(
        tab,
        '{type}',
        '"diagram"'
      ) || jsonb_build_object('schemaVersion', 1)
    )
    FROM jsonb_array_elements(content->'tabs') AS tab
  )
)
WHERE content->>'workspaceType' IS NULL;
```

**Safety:** Backup database sebelum run migration script.

---

## 7. IndexedDB Migration

### 7.1 Current Schema

```typescript
// src/services/storage/indexedDbSchema.ts (current)
const DB_VERSION = 3;

const objectStores = {
  flowDocuments: 'id', // Stores FlowDocument
  // ...
};
```

### 7.2 Updated Schema

```typescript
const DB_VERSION = 4; // Increment

const objectStores = {
  workspaceDocuments: 'id', // Stores WorkspaceDocument
  // Keep flowDocuments for backward compatibility
  flowDocuments: 'id',
};
```

### 7.3 Migration Logic

```typescript
// src/services/storage/indexedDbMigration.ts

export async function migrateIndexedDB(db: IDBDatabase): Promise<void> {
  if (db.version < 4) {
    // Create workspaceDocuments store
    if (!db.objectStoreNames.contains('workspaceDocuments')) {
      db.createObjectStore('workspaceDocuments', { keyPath: 'id' });
    }
    
    // Migrate flowDocuments → workspaceDocuments
    const flowStore = db.transaction('flowDocuments', 'readonly').objectStore('flowDocuments');
    const workspaceStore = db.transaction('workspaceDocuments', 'readwrite').objectStore('workspaceDocuments');
    
    const cursor = await promisifyCursor(flowStore.openCursor());
    for await (const entry of cursor) {
      const oldDoc = entry.value as FlowDocument;
      const newDoc = migrateToWorkspaceDocument(oldDoc);
      workspaceStore.put(newDoc);
    }
  }
}
```

---

## 8. Type Guards & Helpers

```typescript
// src/services/storage/pageTypeGuards.ts

export function isDiagramPage(page: WorkspacePage): page is WorkspacePage & { content: DiagramContent } {
  return page.type === 'diagram';
}

export function isWhiteboardPage(page: WorkspacePage): page is WorkspacePage & { content: WhiteboardContent } {
  return page.type === 'whiteboard';
}

export function isDesignPage(page: WorkspacePage): page is WorkspacePage & { content: DesignContent } {
  return page.type === 'design';
}

export function isSlidePage(page: WorkspacePage): page is WorkspacePage & { content: SlideContent } {
  return page.type === 'slide';
}

export function isAssetPage(page: WorkspacePage): page is WorkspacePage & { content: AssetContent } {
  return page.type === 'asset';
}

export function isSitePage(page: WorkspacePage): page is WorkspacePage & { content: SiteContent } {
  return page.type === 'site';
}
```

---

## 9. Acceptance Criteria

### 9.1 Schema Design

- [ ] WorkspaceDocument interface defined dengan semua fields
- [ ] WorkspacePage union type defined dengan discriminator
- [ ] 6 page types (Diagram, Whiteboard, Design, Slide, Asset, Site) content interfaces defined
- [ ] schemaVersion field wajib di WorkspacePage
- [ ] Type guards implemented untuk semua page types

### 9.2 Migration

- [ ] `migrateToWorkspaceDocument()` function implemented
- [ ] `migratePage()` function dengan version checking
- [ ] Backward compatibility layer (`legacyAccessors.ts`) implemented
- [ ] Supabase migration script tested
- [ ] IndexedDB migration logic implemented

### 9.3 Testing

- [ ] Unit tests untuk migration functions
- [ ] Integration test: load old FlowDocument, migrate, save as WorkspaceDocument
- [ ] Integration test: load WorkspaceDocument dengan mixed page types
- [ ] Cloud sync test: save WorkspaceDocument to Supabase, reload, verify
- [ ] IndexedDB test: migrate flowDocuments → workspaceDocuments

### 9.4 Documentation

- [ ] All interfaces documented dengan JSDoc comments
- [ ] Migration examples documented
- [ ] Schema versioning strategy documented
- [ ] Backward compatibility guide documented

---

## 10. Next Steps

1. **Approve this schema** — team review
2. **Implement migration functions** — `migrateToWorkspaceDocument`, `migratePage`
3. **Update store** — add `pages` field, deprecate `tabs`
4. **Update components** — gradual migration dari FlowTab ke WorkspacePage
5. **Test migration** — verify data integrity
6. **Deploy** — roll out ke production

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Migration corrupts data** | Critical | Backup database sebelum migrate, test di staging |
| **Backward compatibility breaks** | High | Use legacyAccessors layer, gradual migration |
| **Excalidraw format changes** | Medium | schemaVersion + migration functions |
| **Large documents slow migration** | Medium | Batch migration, progress indicator |
| **TypeScript errors di existing code** | Medium | Use type guards, update gradually |

---

## 12. References

- **Current Model:** `src/lib/types.ts` (FlowDocument, FlowTab)
- **Storage:** `src/services/storage/flowDocumentModel.ts`
- **IndexedDB:** `src/services/storage/indexedDbSchema.ts`
- **Supabase:** `supabase/migrations/`
- **Architecture:** `docs/architecture/WORKSPACE_ARCHITECTURE.md`

---

**Status:** Ready for team review and approval.
