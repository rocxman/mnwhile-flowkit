import { cloudStorage, type CloudDocument } from '@/lib/cloud-storage';
import type { DiagramType } from '@/lib/types';
import type { FlowDocument } from './flowDocumentModel';
import { supabase } from '@/lib/supabase';

const CLOUD_SYNC_DEBOUNCE_MS = 2000;

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface CloudSyncState {
  status: SyncStatus;
  error: string | null;
  lastSyncedAt: number | null;
}

const listeners = new Set<(state: CloudSyncState) => void>();
let currentState: CloudSyncState = {
  status: 'idle',
  error: null,
  lastSyncedAt: null,
};

function setState(next: Partial<CloudSyncState>): void {
  currentState = { ...currentState, ...next };
  listeners.forEach((listener) => listener(currentState));
}

export function subscribeCloudSync(listener: (state: CloudSyncState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCloudSyncState(): CloudSyncState {
  return currentState;
}

function flowDocumentToCloudPayload(doc: FlowDocument) {
  const primaryPage = doc.pages.find((p) => p.id === doc.activePageId) ?? doc.pages[0];
  const pages = doc.pages.map((page) => ({
    id: page.id,
    name: page.name,
    diagramType: page.diagramType,
    updatedAt: page.updatedAt,
    content: {
      nodes: page.nodes,
      edges: page.edges,
      playback: page.playback,
    },
  }));

  return {
    local_id: doc.id,
    name: doc.name,
    diagram_type: primaryPage?.diagramType,
    content: primaryPage
      ? {
          nodes: primaryPage.nodes,
          edges: primaryPage.edges,
          playback: primaryPage.playback,
        }
      : undefined,
    pages,
    active_page_id: doc.activePageId,
  };
}

export function cloudDocumentToFlowDocument(cloud: CloudDocument): FlowDocument | null {
  if (!cloud.pages || cloud.pages.length === 0) {
    return null;
  }

  const pages: FlowDocument['pages'] = cloud.pages.map((page: Record<string, unknown>) => ({
    id: page.id as string,
    name: page.name as string,
    diagramType: page.diagramType as DiagramType | undefined,
    updatedAt: page.updatedAt as string,
    nodes: ((page.content as Record<string, unknown>)?.nodes as FlowDocument['pages'][0]['nodes']) ?? [],
    edges: ((page.content as Record<string, unknown>)?.edges as FlowDocument['pages'][0]['edges']) ?? [],
    playback: (page.content as Record<string, unknown>)?.playback as FlowDocument['pages'][0]['playback'],
    history: { past: [], future: [] },
  }));

  const localId = cloud.local_id ?? cloud.id;
  const activePageId = cloud.active_page_id ?? pages[0]?.id ?? '';

  return {
    id: localId,
    name: cloud.name,
    createdAt: cloud.created_at,
    updatedAt: cloud.updated_at,
    activePageId,
    pages,
  };
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
const pendingDocs: Map<string, FlowDocument> = new Map();

export function queueCloudSync(doc: FlowDocument): void {
  pendingDocs.set(doc.id, doc);

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    void flushPendingSyncs();
  }, CLOUD_SYNC_DEBOUNCE_MS);
}

async function flushPendingSyncs(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    pendingDocs.clear();
    return;
  }

  const docsToSync = Array.from(pendingDocs.values());
  pendingDocs.clear();

  if (docsToSync.length === 0) {
    return;
  }

  setState({ status: 'syncing', error: null });

  try {
    for (const doc of docsToSync) {
      const payload = flowDocumentToCloudPayload(doc);
      await cloudStorage.saveDocument(payload);
    }
    setState({
      status: 'synced',
      lastSyncedAt: Date.now(),
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    setState({ status: 'error', error: message });
  }
}

export async function hydrateFromCloud(): Promise<FlowDocument[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  setState({ status: 'syncing', error: null });

  try {
    const cloudDocs = await cloudStorage.getAllDocuments();
    const flowDocs = cloudDocs
      .map(cloudDocumentToFlowDocument)
      .filter((doc): doc is FlowDocument => doc !== null);

    setState({
      status: 'synced',
      lastSyncedAt: Date.now(),
      error: null,
    });

    return flowDocs;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hydrate failed';
    setState({ status: 'error', error: message });
    return [];
  }
}
