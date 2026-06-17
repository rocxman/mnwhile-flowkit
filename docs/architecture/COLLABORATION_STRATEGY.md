# MNWHILE FlowKit — Collaboration Strategy

**Date:** 2026-06-17  
**Status:** Technical Design — Awaiting Approval  
**Priority:** High — blocks real-time whiteboard collaboration  
**Parent:** `docs/architecture/MNFLOW_FIGJAM_ROADMAP.md`

---

## 1. Executive Summary

MNWHILE FlowKit currently inherits OpenFlowKit's collaboration layer (Yjs + WebRTC, opt-in beta). Adding Excalidraw whiteboard introduces a second collaboration mechanism. This document defines the strategy to avoid dual-sync conflicts and establish a unified collaboration architecture.

**Key Decision:** Use **Yjs as the single collaboration source of truth** across all page types. Excalidraw's default collaboration system is disabled. Whiteboard elements sync via Yjs bindings.

**Fallback:** If Yjs-Excalidraw binding proves unstable during spike, whiteboard v1 ships without real-time collaboration; persistence remains cloud-synced via Supabase.

---

## 2. Current Collaboration State

### 2.1 OpenFlowKit Collaboration

Current stack:
- **Yjs** — CRDT document model
- **y-webrtc** — P2P transport
- **y-indexeddb** — local persistence
- **Feature flag:** `VITE_COLLABORATION_ENABLED=true`
- **Status:** Opt-in beta, off by default

Current capabilities:
- Node/edge position sync
- Remote presence overlay
- P2P WebRTC sessions
- Local-first fallback

Current limitations:
- P2P WebRTC unstable for large teams
- No centralized collaboration server
- No durable realtime history
- Limited conflict resolution visibility

### 2.2 Excalidraw Collaboration

Excalidraw default collaboration stack:
- Own socket-based collaboration protocol
- Scene versioning via element versions
- Peer presence/cursors
- Optional encryption keys

**Problem:** If enabled alongside Yjs, we get two sync systems:

```
Diagram Page:
  Yjs + WebRTC → source of truth

Whiteboard Page:
  Excalidraw socket → separate source of truth

Result:
  Two sync protocols in one document
  Different conflict models
  Different presence systems
  Different auth/session lifecycle
```

This is unacceptable for a unified platform.

---

## 3. Collaboration Architecture Decision

### 3.1 Single Source of Truth: Yjs

All collaborative state must live in one Yjs document per workspace document:

```typescript
interface CollaborationDocument {
  ydoc: Y.Doc;
  documentId: string;
  pages: Y.Map<YPageState>;
  presence: Awareness;
}

interface YPageState {
  type: PageType;
  content: Y.Map<unknown> | Y.Array<unknown>;
  metadata: Y.Map<unknown>;
}
```

### 3.2 Per-Page Collaboration Mapping

| Page Type | Yjs Structure | Sync Granularity |
|-----------|---------------|------------------|
| **diagram** | `Y.Array<FlowNode>`, `Y.Array<FlowEdge>` | Node/edge level |
| **whiteboard** | `Y.Array<ExcalidrawElement>` | Element level |
| **slide** | `Y.Text` (markdown) + `Y.Map` (metadata) | Text + metadata |
| **design** | `Y.Map` or external service | TBD |
| **asset** | `Y.Map<FabricObject>` | Object level |
| **site** | `Y.Map<SiteRoute>` | Route/component level |

### 3.3 Transport Strategy

**Phase 1: Local-first + WebRTC (current)**

```typescript
const ydoc = new Y.Doc();
const provider = new WebrtcProvider(`mnflow-${documentId}`, ydoc, {
  signaling: ['wss://signaling.yjs.dev'],
});
```

**Phase 2: WebSocket server (recommended for production)**

```typescript
const ydoc = new Y.Doc();
const provider = new WebsocketProvider(
  process.env.VITE_COLLABORATION_WS_URL,
  `document:${documentId}`,
  ydoc,
  {
    params: {
      token: userAccessToken,
    },
  }
);
```

**Phase 3: Durable collaboration service**

- Hosted y-websocket server
- Authenticated rooms via Supabase JWT
- Persistent Yjs document snapshots in Supabase/R2
- Rate limiting and abuse protection

---

## 4. Excalidraw + Yjs Binding

### 4.1 Binding Requirements

The Excalidraw integration must:

1. Disable Excalidraw's default collaboration
2. Store elements in Yjs `Y.Array`
3. Sync element changes bidirectionally
4. Preserve Excalidraw element versions
5. Sync appState selectively (viewport, background, not transient UI state)
6. Handle binary files (images) separately

### 4.2 Proposed Binding

```typescript
// src/services/collaboration/excalidrawYjsBinding.ts

import * as Y from 'yjs';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState } from '@excalidraw/excalidraw/types/types';

export interface ExcalidrawYjsBinding {
  destroy: () => void;
  getElements: () => ExcalidrawElement[];
  updateElements: (elements: ExcalidrawElement[]) => void;
  getAppState: () => Partial<AppState>;
  updateAppState: (appState: Partial<AppState>) => void;
}

export function createExcalidrawYjsBinding({
  ydoc,
  pageId,
  onRemoteUpdate,
}: {
  ydoc: Y.Doc;
  pageId: string;
  onRemoteUpdate: (elements: ExcalidrawElement[], appState: Partial<AppState>) => void;
}): ExcalidrawYjsBinding {
  const yPages = ydoc.getMap('pages');
  const yPage = getOrCreateYPage(yPages, pageId);
  const yElements = yPage.get('elements') as Y.Array<ExcalidrawElement>;
  const yAppState = yPage.get('appState') as Y.Map<unknown>;

  let isApplyingRemoteUpdate = false;

  const observer = () => {
    if (isApplyingRemoteUpdate) return;
    const elements = yElements.toArray();
    const appState = Object.fromEntries(yAppState.entries()) as Partial<AppState>;
    onRemoteUpdate(elements, appState);
  };

  yElements.observe(observer);
  yAppState.observe(observer);

  return {
    destroy: () => {
      yElements.unobserve(observer);
      yAppState.unobserve(observer);
    },

    getElements: () => yElements.toArray(),

    updateElements: (elements) => {
      isApplyingRemoteUpdate = true;
      ydoc.transact(() => {
        yElements.delete(0, yElements.length);
        yElements.insert(0, elements);
      });
      isApplyingRemoteUpdate = false;
    },

    getAppState: () => Object.fromEntries(yAppState.entries()) as Partial<AppState>,

    updateAppState: (appState) => {
      isApplyingRemoteUpdate = true;
      ydoc.transact(() => {
        for (const [key, value] of Object.entries(filterSyncableAppState(appState))) {
          yAppState.set(key, value);
        }
      });
      isApplyingRemoteUpdate = false;
    },
  };
}

function filterSyncableAppState(appState: Partial<AppState>): Partial<AppState> {
  // Only sync persistent app state, not transient UI state
  return {
    viewBackgroundColor: appState.viewBackgroundColor,
    gridSize: appState.gridSize,
    zoom: appState.zoom,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
  };
}
```

### 4.3 Element-Level Sync Optimization

Naive approach replaces all elements on every change. This is simple but inefficient.

**Phase 1 (Spike): Full array replacement**
- Simpler to implement
- Good enough for 100-200 elements
- Validate feasibility

**Phase 2 (Production): Element-level diff**

```typescript
function updateElementsDiff(
  yElements: Y.Array<ExcalidrawElement>,
  oldElements: ExcalidrawElement[],
  newElements: ExcalidrawElement[]
) {
  const oldMap = new Map(oldElements.map(el => [el.id, el]));
  const newMap = new Map(newElements.map(el => [el.id, el]));

  // Delete removed elements
  for (const oldEl of oldElements) {
    if (!newMap.has(oldEl.id)) {
      const index = oldElements.indexOf(oldEl);
      yElements.delete(index, 1);
    }
  }

  // Update changed elements
  for (const newEl of newElements) {
    const oldEl = oldMap.get(newEl.id);
    if (!oldEl || oldEl.version !== newEl.version) {
      // Update or insert
    }
  }
}
```

---

## 5. Presence & Awareness

### 5.1 Unified Presence Model

```typescript
export interface UserPresence {
  userId: string;
  username: string;
  avatarUrl?: string;
  color: string;
  currentPageId: string;
  currentPageType: PageType;
  cursor?: {
    x: number;
    y: number;
    pageId: string;
  };
  selection?: {
    elementIds: string[];
    pageId: string;
  };
}
```

### 5.2 Awareness Integration

```typescript
const awareness = provider.awareness;

// Update local presence
awareness.setLocalStateField('user', {
  userId: user.id,
  username: user.email?.split('@')[0],
  avatarUrl: user.user_metadata?.avatar_url,
  color: getUserColor(user.id),
});

awareness.setLocalStateField('cursor', {
  x: cursorX,
  y: cursorY,
  pageId: activePageId,
});

// Listen to remote presence
awareness.on('change', () => {
  const states = Array.from(awareness.getStates().values());
  updateRemotePresence(states);
});
```

### 5.3 Page-Specific Presence

Only show cursors for users on the same page:

```typescript
function getVisiblePresence(
  presence: UserPresence[],
  activePageId: string
): UserPresence[] {
  return presence.filter(p => p.currentPageId === activePageId);
}
```

---

## 6. Collaboration Fallback Strategy

### 6.1 If Yjs-Excalidraw Binding Fails

**Fallback V1: Save-only whiteboard**

- Disable real-time collaboration for whiteboard pages
- Save Excalidraw scene to IndexedDB/Supabase on debounce
- Show banner: "Whiteboard collaboration coming soon"
- Diagram pages keep existing collaboration

```typescript
if (page.type === 'whiteboard' && !whiteboardCollabEnabled) {
  return (
    <>
      <CollaborationDisabledBanner>
        Whiteboard collaboration is not available in this preview.
        Your changes are still autosaved.
      </CollaborationDisabledBanner>
      <Excalidraw onChange={debouncedSave} />
    </>
  );
}
```

### 6.2 If WebRTC Fails

**Fallback V2: Cloud sync only**

- Disable realtime collaboration entirely
- Use Supabase cloud sync with conflict resolution
- Show status: "Realtime unavailable — autosaving to cloud"

### 6.3 If Conflicts Occur

**Conflict Resolution:**
- Last-write-wins for appState
- Element version wins for Excalidraw elements
- Timestamp wins for document metadata
- User prompted for manual merge if conflict cannot be resolved

```typescript
function resolveElementConflict(
  local: ExcalidrawElement,
  remote: ExcalidrawElement
): ExcalidrawElement {
  if (remote.version > local.version) return remote;
  if (local.version > remote.version) return local;
  return remote.versionNonce > local.versionNonce ? remote : local;
}
```

---

## 7. Auth & Authorization

### 7.1 Room Access Control

Every collaboration room requires:
- Authenticated Supabase user
- User owns document OR document shared with user OR document is public with edit permission

```typescript
async function canJoinCollaborationRoom(
  userId: string,
  documentId: string
): Promise<boolean> {
  const { data: doc } = await supabase
    .from('documents')
    .select('user_id, is_public')
    .eq('id', documentId)
    .single();

  if (doc.user_id === userId) return true;

  const { data: share } = await supabase
    .from('document_shares')
    .select('permission')
    .eq('document_id', documentId)
    .eq('shared_with_user_id', userId)
    .single();

  return share?.permission === 'edit';
}
```

### 7.2 WebSocket Auth

```typescript
const provider = new WebsocketProvider(
  COLLAB_WS_URL,
  `document:${documentId}`,
  ydoc,
  {
    params: {
      token: supabaseSession.access_token,
    },
  }
);
```

Server validates JWT before allowing room join.

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
describe('excalidrawYjsBinding', () => {
  it('syncs elements from local to Yjs', () => {});
  it('applies remote updates to Excalidraw', () => {});
  it('filters transient appState fields', () => {});
  it('resolves element conflicts by version', () => {});
});
```

### 8.2 Integration Tests

1. Create two browser contexts
2. Open same document
3. Add whiteboard element in browser A
4. Verify element appears in browser B
5. Move element in browser B
6. Verify position updates in browser A
7. Delete element in browser A
8. Verify deletion in browser B

### 8.3 Stress Tests

- 100 elements, 2 users
- 500 elements, 2 users
- 100 elements, 5 users
- Rapid element creation/deletion
- Network disconnect/reconnect

### 8.4 Manual QA

- Diagram page collaboration still works
- Whiteboard page collaboration works
- Switch between page types during collaboration
- Remote cursors only show on same page
- User leaves room, presence disappears

---

## 9. Implementation Phases

### Phase 1: Binding Spike (1 week)

- [ ] Install Excalidraw
- [ ] Create `excalidrawYjsBinding.ts`
- [ ] Create test page with 2 local Yjs docs
- [ ] Verify element sync works
- [ ] Verify appState sync works
- [ ] Measure performance with 100 elements

**Pass Criteria:** Element sync works reliably in single browser with simulated remote updates.

### Phase 2: WebRTC Integration (1 week)

- [ ] Connect binding to y-webrtc provider
- [ ] Test two browser tabs
- [ ] Test two browsers
- [ ] Add presence/cursors
- [ ] Add fallback banner

**Pass Criteria:** Two browsers can edit same whiteboard page in real-time.

### Phase 3: Production WebSocket (2 weeks)

- [ ] Deploy y-websocket server
- [ ] Add Supabase JWT auth
- [ ] Add room access control
- [ ] Add persistence snapshots
- [ ] Test with 5+ users

**Pass Criteria:** Stable collaboration with authenticated users.

---

## 10. Acceptance Criteria

### Collaboration Architecture

- [ ] Yjs is single source of truth
- [ ] Excalidraw default collab disabled
- [ ] Whiteboard elements sync via Yjs
- [ ] Presence unified across page types
- [ ] Room access controlled by Supabase permissions

### Functionality

- [ ] Diagram collaboration unchanged
- [ ] Whiteboard collaboration works or fallback banner displayed
- [ ] Page switching preserves collaboration state
- [ ] Remote cursors/selection show correctly
- [ ] Offline/online transitions handled

### Performance

- [ ] 100 elements sync under 200ms
- [ ] 500 elements does not freeze UI
- [ ] Debounced saves prevent excessive writes
- [ ] No memory leaks when switching pages

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Yjs binding unstable** | High | Fallback to save-only whiteboard v1 |
| **Performance with large boards** | Medium | Element-level diff, virtualization |
| **WebRTC unreliable** | Medium | Move to y-websocket server |
| **Auth bypass in collab room** | Critical | JWT validation server-side |
| **Data conflicts** | Medium | Element version conflict resolution |
| **Memory leaks** | Medium | Proper binding cleanup on unmount |

---

## 12. References

- **Yjs:** https://github.com/yjs/yjs
- **y-webrtc:** https://github.com/yjs/y-webrtc
- **y-websocket:** https://github.com/yjs/y-websocket
- **Excalidraw:** https://github.com/excalidraw/excalidraw
- **Excalidraw Collaboration:** https://github.com/excalidraw/excalidraw/tree/master/excalidraw-app/collab
- **Workspace Model:** `docs/architecture/WORKSPACE_DOCUMENT_MODEL.md`

---

**Status:** Ready for spike implementation after team approval.
