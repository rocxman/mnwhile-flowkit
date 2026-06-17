# MNWHILE FlowKit — MnFlow FigJam Roadmap

**Date:** 2026-06-17  
**Status:** Active Roadmap  
**Scope:** Evolving MnFlow workspace from pure diagram tool to FigJam-like collaborative workspace  
**Owner:** MNWHILE Team  
**Parent:** `docs/architecture/OPEN_SOURCE_MODULE_INTEGRATION.md`

---

## 1. Vision

### 1.1 Current State: MnFlow = Structured Diagram Tool

MnFlow saat ini = OpenFlowKit (8 diagram families, Mermaid import, AI generation, cinematic export, MCP server, 1,600+ tech icons). Ini sangat powerful untuk technical diagramming, tapi bukan whiteboard collaborative ala FigJam.

| Capability | FigJam | Current MnFlow | Gap |
|------------|--------|----------------|-----|
| Structured diagrams (flowchart, architecture) | ❌ Not native | ✅ Excellent | — |
| Freeform whiteboard | ✅ Excellent | ❌ Not available | 🔴 Critical |
| Sticky notes | ✅ Built-in | ❌ Not available | 🔴 Critical |
| Freehand drawing/pen | ✅ Built-in | ❌ Not available | 🔴 Critical |
| Mind maps | ❌ Not native | ✅ Built-in | — |
| Templates gallery | ✅ Excellent | ✅ Good | 🟡 Minor |
| Real-time collaboration | ✅ Excellent | ⚠️ Opt-in beta | 🟡 Medium |
| Voting/reactions | ✅ Built-in | ❌ Not available | 🟡 Medium |
| Timer | ✅ Built-in | ❌ Not available | 🟢 Nice-to-have |
| AI Summarize | ✅ Built-in | ⚠️ Via Flowpilot | 🟡 Medium |
| AI Generate | ❌ Limited | ✅ Excellent | — |
| Polls | ✅ Built-in | ❌ Not available | 🟡 Medium |
| Music/player | ✅ Built-in | ❌ Not available | 🟢 Nice-to-have |
| Observation mode | ✅ Built-in | ❌ Not available | 🟢 Nice-to-have |
| Diagram-as-code | ❌ Not available | ✅ Excellent | — |
| 1,600+ tech icons | ❌ Not available | ✅ Excellent | — |
| Cinematic MP4 export | ❌ Not available | ✅ Excellent | — |
| MCP server integration | ❌ Not available | ✅ Excellent | — |

### 1.2 Target State: MnFlow = FigJam + Structured + AI

MnFlow v2 = OpenFlowKit structured engine + Excalidraw whiteboard + AI summarize/generate. Bukan cuma FigJam, tapi lebih kuat:

**Mode 1: Structured Diagram** (OpenFlowKit engine)
- Flowchart, architecture, ER, UML, sequence, mind map, journey, state machine
- Mermaid import, DSL, AI generation
- Tech icon auto-assign, ELK.js layout
- Cinematic MP4 export, MCP server

**Mode 2: Freeform Whiteboard** (Excalidraw engine)
- Freehand drawing, pen, highlighter
- Sticky notes, text boxes, shapes
- Image pasting, arrow/linking
- Collaborative real-time editing

**Mode 3: AI Workshop** (Flowpilot)
- Generate diagrams from prompt
- Summarize whiteboard content
- Convert brainstorming → structured diagram
- Convert structured diagram → whiteboard sketch
- Generate action items from meeting notes

**Mode Switch:** Dalam satu MnFlow document, user bisa punya multiple pages yang masing-masing bisa Diagram mode atau Whiteboard mode. Sama seperti FigJam yang bisa switch antara diagram dan freeform canvas.

---

## 2. Integration Strategy: OpenFlowKit + Excalidraw

### 2.1 Why Excalidraw (not tldraw, not AFFiNE)

**Selected: Excalidraw**

| Criterion | Score | Detail |
|-----------|-------|--------|
| Embeddability | ✅ | NPM package, designed for embedding |
| Freehand drawing | ✅ | Excellent pen/pencil tool |
| Sticky notes | ✅ | Built-in, good styling |
| Shapes + arrows | ✅ | Full shape library |
| Image support | ✅ | Paste, drag-drop |
| Collaboration | ✅ | WebRTC-based, simple |
| Export | ✅ | PNG, SVG, JSON |
| Bundle size | ✅ | ~300KB (reasonable) |
| License | ✅ | MIT |
| Community | ✅ | 85k+ GitHub stars, active development |
| React integration | ✅ | Native React component |

**Not Selected:**
- **tldraw:** SDK license review needed, more complex SDK, excellent but Excalidraw is simpler for v1
- **AFFiNE:** Too large, not embeddable, full app architecture

### 2.2 Integration Architecture

```typescript
// MnFlow Document Model (v2)
interface MnFlowDocument {
  id: string;
  name: string;
  workspaceType: 'mnflow';
  pages: MnFlowPage[];
  activePageId: string;
}

type MnFlowPage = DiagramPage | WhiteboardPage;

interface DiagramPage {
  id: string;
  name: string;
  type: 'diagram';
  diagramType: DiagramType;
  content: DiagramContent; // OpenFlowKit nodes/edges
  history: FlowHistory;
  updatedAt: string;
}

interface WhiteboardPage {
  id: string;
  name: string;
  type: 'whiteboard';
  content: WhiteboardContent; // Excalidraw elements
  updatedAt: string;
}

interface WhiteboardContent {
  elements: ExcalidrawElement[];
  appState: ExcalidrawAppState;
}
```

### 2.3 Page Type Switching

```typescript
// User can switch page type between diagram and whiteboard
function switchPageType(pageId: string, newType: 'diagram' | 'whiteboard') {
  // If switching from diagram to whiteboard:
  //   - Convert nodes to sticky notes (preserve labels)
  //   - Convert edges to arrows
  //   - Layout as spatial arrangement
  
  // If switching from whiteboard to diagram:
  //   - Convert sticky notes to nodes (preserve text)
  //   - Convert arrows to edges
  //   - Run ELK layout
  
  // Conversion is lossy but preserves core content
}
```

---

## 3. Implementation Phases

## Phase 1: Excalidraw Integration Spike (1-2 weeks)

**Goal:** Prove Excalidraw can embed in MNWHILE FlowKit with auth + persistence.

**Duration:** 80-120 hours

### 1.1 Setup & Dependencies

```bash
npm install @excalidraw/excalidraw @excalidraw/excalidraw-types
```

**Note:** Excalidraw packages may require peer dependencies check. Run `npm install` and fix any conflicts.

### 1.2 Whiteboard Mode Component

```typescript
// src/components/workspaces/mnflow/WhiteboardMode.tsx
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState } from '@excalidraw/excalidraw/types/types';

interface WhiteboardModeProps {
  initialElements: ExcalidrawElement[];
  initialAppState: AppState;
  onChange: (elements: ExcalidrawElement[], appState: AppState) => void;
  theme: 'light' | 'dark';
}

export function WhiteboardMode({
  initialElements,
  initialAppState,
  onChange,
  theme,
}: WhiteboardModeProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Excalidraw
        initialData={{ elements: initialElements, appState: initialAppState }}
        onChange={(elements, appState) => {
          onChange(elements, appState);
        }}
        theme={theme}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            export: false, // We handle export ourselves
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
      />
    </div>
  );
}
```

### 1.3 Page Type Integration

```typescript
// src/store/actions/createMnFlowPageActions.ts
export function createMnFlowPageActions(set, get) {
  return {
    addWhiteboardPage: () => {
      const { activeDocumentId, documents } = get();
      const doc = documents.find(d => d.id === activeDocumentId);
      if (!doc) return;
      
      const newPage: WhiteboardPage = {
        id: `${doc.id}:wb:${createId('wb')}`,
        name: 'Whiteboard',
        type: 'whiteboard',
        content: { elements: [], appState: {} },
        updatedAt: nowIso(),
      };
      
      set(state => ({
        documents: state.documents.map(d =>
          d.id === activeDocumentId
            ? { ...d, pages: [...d.pages, newPage], activePageId: newPage.id }
            : d
        ),
      }));
    },
    
    switchPageType: (pageId: string, newType: 'diagram' | 'whiteboard') => {
      // Convert content between formats
      // This is lossy but preserves core structure
    },
  };
}
```

### 1.4 Persistence Integration

```typescript
// src/services/storage/flowDocumentModel.ts
// Update FlowDocument to support whiteboard pages

export interface FlowPage {
  id: string;
  name: string;
  type: 'diagram' | 'whiteboard';
  diagramType?: DiagramType; // Only for diagram pages
  content: DiagramContent | WhiteboardContent;
  updatedAt: string;
}

export interface WhiteboardContent {
  elements: unknown[]; // Excalidraw elements
  appState: unknown; // Excalidraw app state
}
```

### 1.5 Cloud Sync Integration

```typescript
// src/lib/cloud-storage.ts
// Update saveDocument to handle whiteboard pages

async saveDocument(doc: FlowDocument): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  await supabase
    .from('documents')
    .upsert({
      id: doc.id,
      user_id: user.id,
      name: doc.name,
      workspace_type: 'mnflow',
      content: doc, // Full document including whiteboard pages
      updated_at: new Date().toISOString(),
    });
}
```

### 1.6 Testing Spike

**Unit Tests:**
- Page type switching
- Content conversion (diagram ↔ whiteboard)
- Persistence round-trip

**Integration Tests:**
- Create MnFlow document with diagram + whiteboard pages
- Save to IndexedDB, reload, verify both page types
- Cloud sync: save with auth, reload on different device

**Visual Verification:**
- Open MnFlow workspace
- Switch between diagram and whiteboard pages
- Verify diagram renders correctly
- Verify Excalidraw renders correctly
- Verify toolbar, properties panel adapt to page type

### Phase 1 Acceptance Criteria

- [ ] Excalidraw renders inside MnFlow workspace
- [ ] Whiteboard page can be created
- [ ] Diagram page still works unchanged
- [ ] Save/load whiteboard content to IndexedDB
- [ ] Cloud sync saves whiteboard content
- [ ] Visual verification: both modes work side-by-side
- [ ] No console errors
- [ ] `npm run build` passes

---

## Phase 2: MnFlow Whiteboard Features (2-3 weeks)

**Goal:** Add FigJam-like features to whiteboard mode.

**Duration:** 120-160 hours

### 2.1 Template Gallery for Whiteboard

```typescript
// src/components/workspaces/mnflow/templates/whiteboardTemplates.ts
export const whiteboardTemplates = [
  {
    id: 'brainstorming',
    name: 'Brainstorming Session',
    thumbnail: '/templates/brainstorming.png',
    elements: [
      // Pre-built sticky note groups
      // Column headers (Problem, Idea, Solution, Action)
      // Connecting arrows
    ],
  },
  {
    id: 'retrospective',
    name: 'Sprint Retrospective',
    thumbnail: '/templates/retrospective.png',
    elements: [
      // Went well, Needs improvement, Action items columns
    ],
  },
  {
    id: 'customer-journey',
    name: 'Customer Journey Map',
    thumbnail: '/templates/customer-journey.png',
    elements: [
      // Journey stages with touchpoints
    ],
  },
  {
    id: 'user-story-mapping',
    name: 'User Story Mapping',
    thumbnail: '/templates/user-story-mapping.png',
    elements: [
      // Backbone, Walking skeleton, Tasks layout
    ],
  },
  {
    id: 'empathy-map',
    name: 'Empathy Map',
    thumbnail: '/templates/empathy-map.png',
    elements: [
      // Thinks, Feels, Says, Does quadrants
    ],
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    thumbnail: '/templates/mind-map-freeform.png',
    elements: [
      // Central topic with branches
    ],
  },
];
```

### 2.2 Sticky Note Quick Insert

```typescript
// Quick insert sticky note with color, text
function addStickyNote(
  position: { x: number; y: number },
  text: string,
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
): ExcalidrawElement {
  return {
    type: 'rectangle',
    x: position.x,
    y: position.y,
    width: 200,
    height: 200,
    backgroundColor: STICKY_COLORS[color],
    strokeColor: 'transparent',
    fillStyle: 'solid',
    text: text,
    fontSize: 16,
  };
}
```

### 2.3 Voting/Reactions System

```typescript
// Store voting state separately (not in Excalidraw elements)
interface VoteSession {
  id: string;
  question: string;
  options: VoteOption[];
  endTime?: string;
  votes: Map<string, string>; // userId → optionId
}

// Overlay voting UI on top of Excalidraw
// Use existing collaboration channel for sync
```

### 2.4 Timer Widget

```typescript
// Floating timer overlay (not canvas element)
interface TimerState {
  duration: number; // seconds
  remaining: number;
  isRunning: boolean;
  onEnd?: () => void;
}

// Render as floating widget, synced via Yjs
```

### 2.5 Collaboration Enhancement

```typescript
// Enable WebRTC collaboration for whiteboard pages
// Use existing y-webrtc provider

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const yDoc = new Y.Doc();
const provider = new WebsocketProvider(
  'wss://your-collab-server.com',
  `mnflow-${documentId}-${pageId}`,
  yDoc
);

// Sync Excalidraw elements via Y.Array
const yElements = yDoc.getArray('elements');
```

### Phase 2 Acceptance Criteria

- [ ] Template gallery with 5+ whiteboard templates
- [ ] Quick insert sticky notes with colors
- [ ] Voting/reactions overlay works
- [ ] Timer widget functional
- [ ] Real-time collaboration works on whiteboard pages
- [ ] Template can be applied to new whiteboard page
- [ ] Visual: FigJam-like experience

---

## Phase 3: AI Integration (2-3 weeks)

**Goal:** AI features that work across both diagram and whiteboard modes.

**Duration:** 120-160 hours

### 3.1 AI Summarize Whiteboard

```typescript
// Flowpilot extension for whiteboard
interface WhiteboardSummarize {
  // Read all sticky notes, text elements, connections
  // Group by spatial proximity
  // Generate summary:
  //   - Key themes
  //   - Action items
  //   - Open questions
  //   - Decisions made
  
  summarize(elements: ExcalidrawElement[]): Promise<WhiteboardSummary>;
}

interface WhiteboardSummary {
  themes: string[];
  actionItems: string[];
  decisions: string[];
  questions: string[];
  rawText: string;
}
```

### 3.2 AI Generate from Whiteboard

```typescript
// Convert brainstorming to structured diagram
interface WhiteboardToDiagram {
  // Read sticky notes
  // Identify categories/groups
  // Generate flowchart/architecture
  // Preserve spatial relationships
  
  convert(elements: ExcalidrawElement[]): Promise<{
    nodes: FlowNode[];
    edges: FlowEdge[];
  }>;
}

// Convert structured diagram to whiteboard sketch
interface DiagramToWhiteboard {
  // Read nodes/edges
  // Convert to sticky notes + arrows
  // Preserve relationships
  // Add spatial layout
  
  convert(nodes: FlowNode[], edges: FlowEdge[]): Promise<{
    elements: ExcalidrawElement[];
  }>;
}
```

### 3.3 AI Generate from Prompt

```typescript
// Existing Flowpilot, enhanced for whiteboard
interface WhiteboardGenerate {
  // Generate from text prompt:
  //   "Create a brainstorming board about mobile app features"
  //   "Generate a customer journey map for e-commerce checkout"
  //   "Create a user story mapping for auth feature"
  
  generate(prompt: string, templateId?: string): Promise<{
    elements: ExcalidrawElement[];
  }>;
}
```

### 3.4 AI Action Items Extraction

```typescript
// From whiteboard or meeting notes
interface ActionItemExtractor {
  extract(elements: ExcalidrawElement[]): Promise<ActionItem[]>;
}

interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  sourceElementId: string;
}

// Display action items as checklist overlay
// Can assign via collaboration channel
```

### Phase 3 Acceptance Criteria

- [ ] AI summarize works on whiteboard elements
- [ ] AI convert brainstorming → diagram
- [ ] AI convert diagram → whiteboard sketch
- [ ] AI generate whiteboard from text prompt
- [ ] Action items extraction works
- [ ] All AI features work via existing Flowpilot
- [ ] AI responses displayed in StudioAIPanel

---

## Phase 4: Polish & Production (1-2 weeks)

**Goal:** Production-quality MnFlow with FigJam-like features.

**Duration:** 80-120 hours

### 4.1 Performance Optimization

- [ ] Lazy load Excalidraw (heavy package)
- [ ] Virtualize whiteboard elements for large boards
- [ ] Debounce save operations
- [ ] Optimize Excalidraw bundle (tree-shaking)

```typescript
// Lazy load Excalidraw
const LazyWhiteboardMode = lazy(async () => {
  const module = await import('./WhiteboardMode');
  return { default: module.WhiteboardMode };
});

// In MnFlowWorkspace:
<Suspense fallback={<WhiteboardLoading />}>
  <LazyWhiteboardMode ... />
</Suspense>
```

### 4.2 Export Enhancement

```typescript
// Add whiteboard export options
interface WhiteboardExport {
  // Existing: PNG, SVG
  // New: PDF (whiteboard layout)
  // New: JSON (Excalidraw scene)
  // New: Markdown (sticky notes → text)
  
  exportToPDF(elements: ExcalidrawElement[]): Promise<Blob>;
  exportToMarkdown(elements: ExcalidrawElement[]): Promise<string>;
}
```

### 4.3 Template Management

```typescript
// Allow users to save custom templates
interface TemplateManager {
  saveAsTemplate(pageId: string, name: string): Promise<string>;
  getCustomTemplates(): Promise<WhiteboardTemplate[]>;
  deleteTemplate(templateId: string): Promise<void>;
  shareTemplate(templateId: string): Promise<string>; // returns share URL
}
```

### 4.4 Integration Testing

- [ ] All 8 diagram types still work correctly
- [ ] Whiteboard mode works with all features
- [ ] Cloud sync handles both page types
- [ ] Sharing works for both diagram and whiteboard pages
- [ ] Export works for both modes
- [ ] AI features work across both modes
- [ ] Real-time collaboration works for both modes
- [ ] Mobile responsiveness (whiteboard touch gestures)
- [ ] Performance: 100+ sticky notes don't lag
- [ ] Performance: Large diagram (500+ nodes) still works

### Phase 4 Acceptance Criteria

- [ ] `npm run build` passes
- [ ] All existing tests pass
- [ ] New whiteboard tests pass
- [ ] Production deploy works
- [ ] No console errors
- [ ] Visual: professional-grade FigJam-like experience
- [ ] Performance: smooth with 100+ elements

---

## 4. Technical Requirements

### 4.1 Dependencies

```json
{
  "dependencies": {
    "@excalidraw/excalidraw": "^0.17.0",
    "@excalidraw/excalidraw-types": "^0.17.0",
    "yjs": "^13.6.0",
    "y-websocket": "^2.0.0",
    "y-indexeddb": "^9.0.0"
  }
}
```

### 4.2 Bundle Size Impact

| Module | Size (gzipped) | Impact |
|--------|----------------|--------|
| Excalidraw | ~300KB | Medium |
| Excalidraw types | 0KB (dev only) | None |
| Y.js | ~50KB | Low |
| Y-WebSocket | ~15KB | Low |
| **Total** | **~365KB** | **Acceptable** |

### 4.3 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Excalidraw | ✅ | ✅ | ✅ | ✅ |
| Freehand drawing | ✅ | ✅ | ✅ | ✅ |
| Touch gestures | ✅ | ✅ | ✅ | ✅ |
| WebRTC collab | ✅ | ✅ | ✅ | ✅ |

### 4.4 Data Storage

```typescript
// IndexedDB schema update
// Existing: flowDocuments store
// Update: content field now supports both DiagramContent and WhiteboardContent

// Document structure
interface PersistedMnFlowDocument {
  id: string;
  name: string;
  workspaceType: 'mnflow';
  pages: PersistedPage[]; // Can be diagram or whiteboard
  activePageId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type PersistedPage = PersistedDiagramPage | PersistedWhiteboardPage;

interface PersistedDiagramPage {
  id: string;
  name: string;
  type: 'diagram';
  diagramType: string;
  content: PersistedDocumentContent;
}

interface PersistedWhiteboardPage {
  id: string;
  name: string;
  type: 'whiteboard';
  content: {
    elements: unknown[];
    appState: unknown;
  };
}
```

---

## 5. File Structure

```
src/
├── components/
│   └── workspaces/
│       ├── mnflow/
│       │   ├── MnFlowWorkspace.tsx          ← Layout shell
│       │   ├── WhiteboardMode.tsx           ← Excalidraw wrapper
│       │   ├── DiagramMode.tsx              ← OpenFlowKit canvas
│       │   ├── PageTypeSwitcher.tsx         ← Diagram ↔ Whiteboard
│       │   └── templates/
│       │       ├── whiteboardTemplates.ts
│       │       └── WhiteboardTemplateGallery.tsx
│       └── shared/
│           ├── WorkspaceCanvas.tsx
│           └── WorkspaceOverlays.tsx
├── store/
│   └── actions/
│       ├── createMnFlowPageActions.ts
│       └── createWhiteboardActions.ts
├── hooks/
│   ├── useMnFlowPage.ts
│   └── useWhiteboard.ts
└── services/
    └── storage/
        └── whiteboardContent.ts
```

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Excalidraw bundle too large** | Medium | Lazy load, code split |
| **Performance with 100+ elements** | Medium | Virtualize, debounce |
| **Excalidraw breaking changes** | High | Pin version, fork if needed |
| **Data model migration** | High | Add migration for existing documents |
| **Collaboration stability** | Medium | Use Yjs WebSocket (not just WebRTC) |
| **Mobile touch support** | Low | Excalidraw has good mobile support |
| **TypeScript type conflicts** | Low | Excalidraw types are well-maintained |

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Whiteboard creation time** | < 5 seconds | User test |
| **Element rendering** | < 100ms | Performance API |
| **Save/load** | < 1 second | IndexedDB benchmark |
| **Cloud sync** | < 3 seconds | Network monitor |
| **Bundle size** | < 400KB gzipped | Bundle analyzer |
| **Collaboration latency** | < 200ms | WebRTC monitor |
| **User satisfaction** | > 80% | Survey |

---

## 8. References

- **Excalidraw:** https://github.com/excalidraw/excalidraw
- **Excalidraw Embedding:** https://docs.excalidraw.com/docs/@excalidraw/excalidraw/
- **FigJam Features:** https://www.figma.com/figjam/
- **OpenFlowKit:** https://github.com/Vrun-design/openflowkit
- **Workspace Architecture:** `docs/architecture/WORKSPACE_ARCHITECTURE.md`
- **Module Integration:** `docs/architecture/OPEN_SOURCE_MODULE_INTEGRATION.md`
- **Timeline:** `docs/planning/TIMELINE_CHECKLIST.md`

---

## 9. Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-06-17 | AI + rocxman | Initial roadmap |
| 2026-06-17 | AI + rocxman | Added Phase 1-4 detailed tasks |

---

## 10. Next Steps

1. **Review this roadmap** — approve phases and priorities
2. **Execute Phase A** (from TIMELINE_CHECKLIST) — commit current work
3. **Start Phase 1** — Excalidraw integration spike
4. **Prototype** — build `WhiteboardMode` component
5. **Test** — verify embed, persistence, cloud sync
6. **Iterate** — refine based on findings

---

**Status:** Ready for team review and Phase 1 approval.
