import type { FlowTab } from '@/lib/types';

export interface PersistedDocumentContent {
  nodes: FlowTab['nodes'];
  edges: FlowTab['edges'];
  playback?: FlowTab['playback'];
  history?: FlowTab['history'];
}

export interface PersistedDocumentPage {
  id: string;
  name: string;
  diagramType?: FlowTab['diagramType'];
  updatedAt?: string;
  content: PersistedDocumentContent;
}

export type WorkspaceType = 'mnflow' | 'design' | 'slides' | 'make' | 'buzz' | 'site' | 'whiteboard';

export interface PersistedDocument {
  id: string;
  name: string;
  workspaceType?: WorkspaceType;
  diagramType?: FlowTab['diagramType'];
  content?: PersistedDocumentContent;
  pages?: PersistedDocumentPage[];
  activePageId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PersistedDocumentSession {
  id: string;
  documentId: string;
  camera?: unknown;
  viewport?: unknown;
  lastOpenedPanel?: string;
  lastOpenedAt: string;
}

export interface WorkspaceMeta {
  id: 'workspace';
  activeDocumentId: string | null;
  documentOrder: string[];
  lastOpenedAt: string;
}

export interface LoadedDocument {
  document: PersistedDocument | null;
  documents: PersistedDocument[];
  workspaceMeta: WorkspaceMeta;
}
