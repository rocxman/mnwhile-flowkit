# Excalidraw Integration Spike Plan

**Date:** 2026-06-17  
**Status:** Ready for Execution  
**Priority:** Critical — proves feasibility of whiteboard MVP  
**Parent:** `docs/planning/MNFLOW_FIGJAM_ROADMAP.md`

---

## 1. Spike Objective

Prove that Excalidraw can be integrated into MNWHILE FlowKit as a whiteboard mode, with:
- Rendering in dedicated workspace
- Save/load to IndexedDB and Supabase
- Yjs binding for collaboration
- Export to PNG/SVG
- Performance acceptable for 100+ elements

**Not in scope:**
- Full whiteboard UI/UX polish
- Production deployment
- All workspace types
- AI integration (separate spike)

---

## 2. Success Criteria (Pass/Fail)

### Must Pass (all required)

- [ ] Excalidraw renders in browser without errors
- [ ] Can create/modify elements (rectangle, text, arrow, freehand)
- [ ] Can save whiteboard to IndexedDB
- [ ] Can reload whiteboard from IndexedDB
- [ ] Can save whiteboard to Supabase (JSONB column)
- [ ] Can reload whiteboard from Supabase
- [ ] Can switch between diagram and whiteboard pages
- [ ] Export to PNG works
- [ ] Export to SVG works
- [ ] Performance: 100 elements render in < 500ms
- [ ] Performance: Element drag latency < 50ms
- [ ] No console errors after 5 minutes of use
- [ ] Yjs binding syncs elements between two tabs (if time permits)

### Nice to Have

- [ ] Real-time cursor/presence
- [ ] Export to PDF
- [ ] Template loading
- [ ] Mobile touch interaction

### Abort Conditions

- Excalidraw package won't install (dependency conflicts)
- Excalidraw rendering broken in Chrome/Firefox
- Save/load corrupts data
- Performance unacceptable (< 30 FPS with 50 elements)
- Yjs binding completely unstable

---

## 3. Prerequisites

### 3.1 Environment

```bash
# Verify Node.js version
node --version  # Must be >= 18

# Verify npm/yarn
npm --version   # Must be >= 9
```

### 3.2 Current State

```bash
# Ensure working directory clean
git status

# If dirty, stash or commit
git stash  # or git commit

# Install dependencies
npm install
```

### 3.3 Create Spike Branch

```bash
git checkout -b spike/excalidraw-whiteboard
```

---

## 4. Implementation Steps

## Phase 1: Installation (30 min)

### 4.1 Install Excalidraw

```bash
npm install @excalidraw/excalidraw
```

**Expected:**
- Package installed
- No peer dependency conflicts
- Bundle size increases ~300KB

**If fails:**
- Check Node.js version
- Try `--legacy-peer-deps`
- Document error and abort if unresolvable

### 4.2 Verify Installation

```bash
npm run build
```

**Expected:** Build succeeds without errors.

---

## Phase 2: Basic Integration (2 hours)

### 4.3 Create Whiteboard Component

**File:** `src/components/Whiteboard.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { Excalidraw, exportToBlob, exportToSvg } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

export interface WhiteboardProps {
  initialElements?: any[];
  onChange?: (elements: any[], appState: any) => void;
}

export function Whiteboard({ initialElements, onChange }: WhiteboardProps) {
  const excalidrawAPI = useRef<ExcalidrawImperativeAPI>(null);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPI.current = api;
          if (initialElements) {
            api.updateScene({ elements: initialElements });
          }
        }}
        onChange={(elements, appState) => {
          onChange?.(elements, appState);
        }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: false, // We'll implement custom export
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
      />
    </div>
  );
}
```

### 4.4 Create Whiteboard Workspace

**File:** `src/components/workspaces/WhiteboardWorkspace.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Whiteboard } from '../Whiteboard';
import { useFlowStore } from '../../store';
import { Button } from '../ui/button';

export function WhiteboardWorkspace() {
  const [elements, setElements] = useState<any[]>([]);
  const { activeDocument, updateDocument } = useFlowStore();

  // Load initial elements
  useEffect(() => {
    if (activeDocument?.whiteboardElements) {
      setElements(activeDocument.whiteboardElements);
    }
  }, [activeDocument]);

  // Save on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeDocument) {
        updateDocument({ whiteboardElements: elements });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [elements, activeDocument, updateDocument]);

  // Export functions
  const handleExportPNG = async () => {
    const blob = await exportToBlob({
      elements,
      appState: { exportBackground: true },
      files: null,
      getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSVG = async () => {
    const svg = await exportToSvg({
      elements,
      appState: { exportBackground: true },
      files: null,
    });
    
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '8px' }}>
        <Button onClick={handleExportPNG}>Export PNG</Button>
        <Button onClick={handleExportSVG}>Export SVG</Button>
      </div>
      
      {/* Canvas */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Whiteboard
          initialElements={elements}
          onChange={setElements}
        />
      </div>
    </div>
  );
}
```

### 4.5 Add to Router

**File:** `src/App.tsx` (or routing config)

```typescript
import { WhiteboardWorkspace } from './components/workspaces/WhiteboardWorkspace';

// Add route
<Route path="/whiteboard/:id" element={<WhiteboardWorkspace />} />
```

### 4.6 Test Basic Rendering

```bash
npm run dev
```

**Manual test:**
1. Navigate to `/whiteboard/test`
2. Verify Excalidraw renders
3. Draw a rectangle
4. Draw text
5. Draw freehand
6. Check console for errors

---

## Phase 3: Persistence Integration (2 hours)

### 4.7 Update Document Model

**File:** `src/lib/types.ts`

```typescript
export interface FlowDocument {
  id: string;
  name: string;
  // ... existing fields
  
  // Add whiteboard support
  whiteboardElements?: any[]; // Excalidraw elements
  whiteboardAppState?: any;  // Excalidraw app state
  
  schemaVersion: number; // For migrations
}
```

### 4.8 IndexedDB Save/Load

**File:** `src/services/storage/whiteboardStorage.ts`

```typescript
import { openDB } from 'idb';

const DB_NAME = 'mnwhile-whiteboard';
const STORE_NAME = 'whiteboards';
const DB_VERSION = 1;

export async function saveWhiteboard(id: string, elements: any[], appState: any) {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  
  await db.put(STORE_NAME, {
    id,
    elements,
    appState,
    updatedAt: new Date().toISOString(),
  }, id);
}

export async function loadWhiteboard(id: string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  return await db.get(STORE_NAME, id);
}
```

### 4.9 Update Whiteboard Component

```typescript
import { saveWhiteboard, loadWhiteboard } from '../services/storage/whiteboardStorage';

// In WhiteboardWorkspace:
useEffect(() => {
  const load = async () => {
    const data = await loadWhiteboard(activeDocument.id);
    if (data) {
      setElements(data.elements);
    }
  };
  load();
}, [activeDocument.id]);

useEffect(() => {
  const timer = setTimeout(() => {
    saveWhiteboard(activeDocument.id, elements, null);
  }, 1000);
  return () => clearTimeout(timer);
}, [elements, activeDocument.id]);
```

### 4.10 Test IndexedDB Persistence

**Manual test:**
1. Draw elements
2. Wait 1 second (auto-save)
3. Refresh page
4. Verify elements reload
5. Check IndexedDB in DevTools → Application → IndexedDB

---

## Phase 4: Supabase Integration (1 hour)

### 4.11 Verify Supabase Schema

**File:** `supabase/migrations/*_create_documents.sql`

Ensure `documents` table has JSONB column:

```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS whiteboard_data JSONB;
```

### 4.12 Update Cloud Sync Service

**File:** `src/services/cloudSync.ts`

```typescript
export async function syncWhiteboardToSupabase(
  docId: string,
  elements: any[],
  appState: any
) {
  const { error } = await supabase
    .from('documents')
    .update({
      whiteboard_data: {
        elements,
        appState,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
      },
    })
    .eq('id', docId);

  if (error) {
    console.error('Failed to sync whiteboard:', error);
    throw error;
  }
}

export async function loadWhiteboardFromSupabase(docId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('whiteboard_data')
    .eq('id', docId)
    .single();

  if (error) {
    console.error('Failed to load whiteboard:', error);
    return null;
  }

  return data?.whiteboard_data;
}
```

### 4.13 Update Whiteboard Component

```typescript
import { syncWhiteboardToSupabase, loadWhiteboardFromSupabase } from '../services/cloudSync';

useEffect(() => {
  const load = async () => {
    const data = await loadWhiteboardFromSupabase(activeDocument.id);
    if (data?.elements) {
      setElements(data.elements);
    }
  };
  load();
}, [activeDocument.id]);

useEffect(() => {
  const timer = setTimeout(() => {
    syncWhiteboardToSupabase(activeDocument.id, elements, null);
  }, 2000); // 2 second debounce
  return () => clearTimeout(timer);
}, [elements, activeDocument.id]);
```

### 4.14 Test Supabase Persistence

**Manual test:**
1. Login to app
2. Draw elements
3. Wait 2 seconds (auto-sync)
4. Check Supabase dashboard → documents table → whiteboard_data column
5. Refresh page
6. Verify elements reload from Supabase

---

## Phase 5: Workspace Switching (1 hour)

### 4.15 Add Workspace Type to Document

**File:** `src/lib/types.ts`

```typescript
export type WorkspaceType = 'mnflow' | 'whiteboard';

export interface FlowDocument {
  // ... existing fields
  workspaceType?: WorkspaceType;
}
```

### 4.16 Update Home Page

**File:** `src/components/HomePage.tsx`

```typescript
import { WhiteboardWorkspace } from './workspaces/WhiteboardWorkspace';

// Add whiteboard creation button
<Button onClick={() => createDocument('New Whiteboard', 'whiteboard')}>
  Create Whiteboard
</Button>

// Route to correct workspace
{document.workspaceType === 'whiteboard' ? (
  <WhiteboardWorkspace />
) : (
  <FlowWorkspace />
)}
```

### 4.17 Test Workspace Switching

**Manual test:**
1. Create new diagram
2. Create new whiteboard
3. Switch between them
4. Verify each loads correct data
5. Verify no data corruption

---

## Phase 6: Performance Testing (30 min)

### 4.18 Performance Measurement

**File:** `src/components/Whiteboard.tsx` (add logging)

```typescript
const performanceStart = performance.now();

<Excalidraw
  onChange={(elements, appState) => {
    onChange?.(elements, appState);
    
    if (elements.length === 100) {
      const renderTime = performance.now() - performanceStart;
      console.log(`100 elements render time: ${renderTime}ms`);
    }
  }}
/>
```

### 4.19 Manual Performance Test

1. Draw 50 elements → verify smooth (60 FPS)
2. Draw 100 elements → verify smooth (30+ FPS)
3. Drag element → verify latency < 50ms
4. Zoom in/out → verify smooth
5. Pan canvas → verify smooth

**Target metrics:**
- 100 elements: render < 500ms
- Element drag: latency < 50ms
- Canvas pan/zoom: 60 FPS
- Memory: < 200MB for 100 elements

---

## Phase 7: Yjs Binding Spike (2 hours, optional)

### 4.20 Install Yjs Dependencies

```bash
npm install yjs y-webrtc
```

### 4.21 Create Yjs Binding

**File:** `src/services/collaboration/excalidrawYjsBinding.ts`

```typescript
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export class ExcalidrawYjsBinding {
  private ydoc: Y.Doc;
  private provider: WebrtcProvider;
  private yElements: Y.Array<any>;

  constructor(roomId: string) {
    this.ydoc = new Y.Doc();
    this.provider = new WebrtcProvider(roomId, this.ydoc);
    this.yElements = this.ydoc.getArray('elements');
  }

  getElements(): any[] {
    return this.yElements.toArray();
  }

  updateElements(elements: any[]) {
    this.yElements.delete(0, this.yElements.length);
    this.yElements.insert(0, elements);
  }

  onChange(callback: (elements: any[]) => void) {
    this.yElements.observe(() => {
      callback(this.yElements.toArray());
    });
  }

  destroy() {
    this.provider.destroy();
    this.ydoc.destroy();
  }
}
```

### 4.22 Integrate with Whiteboard

```typescript
import { ExcalidrawYjsBinding } from '../services/collaboration/excalidrawYjsBinding';

const [binding] = useState(() => new ExcalidrawYjsBinding(activeDocument.id));

useEffect(() => {
  binding.onChange((remoteElements) => {
    setElements(remoteElements);
  });
  
  return () => binding.destroy();
}, [binding]);

const handleChange = (newElements: any[]) => {
  setElements(newElements);
  binding.updateElements(newElements);
};
```

### 4.23 Test Real-Time Collaboration

**Manual test:**
1. Open whiteboard in Tab A
2. Open same whiteboard in Tab B
3. Draw element in Tab A
4. Verify element appears in Tab B within 1 second
5. Draw element in Tab B
6. Verify element appears in Tab A within 1 second

**If Yjs fails:**
- Document error
- Skip real-time, keep save/load
- Mark as "not feasible" in spike report

---

## Phase 8: Documentation (30 min)

### 4.24 Write Spike Report

**File:** `docs/spikes/excalidraw-spike-report.md`

```markdown
# Excalidraw Spike Report

**Date:** [completion date]
**Branch:** spike/excalidraw-whiteboard
**Time spent:** [actual hours]

## Results

### Pass/Fail Criteria

- [x] Excalidraw renders
- [x] Create/modify elements
- [ ] Save to IndexedDB
- [ ] Load from IndexedDB
- [ ] Save to Supabase
- [ ] Load from Supabase
- [ ] Switch workspaces
- [ ] Export PNG
- [ ] Export SVG
- [ ] Performance: 100 elements
- [ ] Performance: drag latency
- [ ] Yjs binding (if attempted)

### Performance Metrics

- 50 elements: [X] FPS
- 100 elements: [X] FPS, [X]ms render time
- Element drag latency: [X]ms
- Memory usage: [X] MB

### Issues Encountered

1. [Issue description]
   - Root cause: [cause]
   - Workaround: [workaround or "none"]

2. [Issue description]
   - Root cause: [cause]
   - Workaround: [workaround or "none"]

### Recommendations

**Go/No-Go:** [GO if all must-pass criteria met, NO-GO otherwise]

**If GO:**
- Estimated full implementation: [X] weeks
- Key risks: [list]
- Next steps: [list]

**If NO-GO:**
- Alternative approaches: [list]
- Estimated effort for alternative: [X] weeks

## Code Examples

[Include key code snippets that worked]

## Dependencies

[List exact versions installed]

## Bundle Size Impact

- Before: [X] KB
- After: [X] KB
- Increase: [X] KB

## Screenshots

[Attach screenshots of working whiteboard]
```

---

## 5. Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Installation | 30 min | 0.5 hours |
| Phase 2: Basic Integration | 2 hours | 2.5 hours |
| Phase 3: IndexedDB Persistence | 2 hours | 4.5 hours |
| Phase 4: Supabase Integration | 1 hour | 5.5 hours |
| Phase 5: Workspace Switching | 1 hour | 6.5 hours |
| Phase 6: Performance Testing | 30 min | 7 hours |
| Phase 7: Yjs Binding (optional) | 2 hours | 9 hours |
| Phase 8: Documentation | 30 min | 9.5 hours |

**Total:** 7-9.5 hours (1-1.5 days)

**Buffer:** Add 2 hours for debugging = 11.5 hours max

---

## 6. Rollback Plan

### If Spike Fails

```bash
# Discard spike branch
git checkout main
git branch -D spike/excalidraw-whiteboard

# Uninstall Excalidraw
npm uninstall @excalidraw/excalidraw

# Document failure in spike report
```

### If Spike Partially Succeeds

```bash
# Keep branch, document what worked
git add .
git commit -m "spike: excalidraw integration (partial success)"

# Write spike report with findings
```

---

## 7. Success Metrics

### Technical Metrics

- **Bundle size increase:** < 400KB (target: 300KB)
- **Render performance:** 100 elements in < 500ms
- **Interaction latency:** < 50ms
- **Memory usage:** < 200MB for 100 elements
- **Save/load time:** < 1 second

### User Experience Metrics

- **Time to first element:** < 3 seconds
- **Export time:** < 2 seconds
- **Workspace switch time:** < 1 second

### Code Quality Metrics

- **Lines of code added:** < 500 (excluding tests)
- **Console errors:** 0
- **TypeScript errors:** 0
- **Test coverage:** > 80% for new code

---

## 8. Next Steps After Spike

### If Spike Succeeds

1. Merge spike branch to `develop`
2. Create implementation plan based on spike findings
3. Estimate full whiteboard feature (UI polish, templates, AI, etc.)
4. Schedule implementation sprint
5. Update roadmap with actual timeline

### If Spike Fails

1. Document failure reasons
2. Evaluate alternatives:
   - tldraw (if license acceptable)
   - Custom Canvas API implementation
   - Postpone whiteboard to v2
3. Update roadmap
4. Decision meeting with team

---

## 9. Checklist

Before starting:

- [ ] Read this plan completely
- [ ] Verify Node.js/npm versions
- [ ] Clean working directory
- [ ] Create spike branch
- [ ] Have Supabase credentials ready
- [ ] Have test browser tabs ready

During spike:

- [ ] Follow phases in order
- [ ] Test each phase before moving to next
- [ ] Document issues as they occur
- [ ] Take screenshots of working features
- [ ] Measure performance metrics

After spike:

- [ ] Write spike report
- [ ] Commit all code
- [ ] Push spike branch to GitHub
- [ ] Schedule review meeting
- [ ] Update roadmap based on findings

---

## 10. References

- Excalidraw docs: https://docs.excalidraw.com/
- Excalidraw GitHub: https://github.com/excalidraw/excalidraw
- Yjs docs: https://docs.yjs.dev/
- Supabase JSONB: https://supabase.com/docs/guides/database/jsonb

---

**Status:** Ready to execute. Estimated completion: 1-1.5 days.
