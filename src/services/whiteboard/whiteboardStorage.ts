import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'mnwhile-whiteboard';
const STORE_NAME = 'whiteboards';
const DB_VERSION = 1;

export interface WhiteboardSnapshot {
  id: string;
  elements: ExcalidrawElement[];
  updatedAt: string;
  schemaVersion: number;
}

let dbInstance: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

export async function saveWhiteboard(
  id: string,
  elements: ExcalidrawElement[]
): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, {
    id,
    elements,
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  } satisfies WhiteboardSnapshot);
}

export async function loadWhiteboard(
  id: string
): Promise<WhiteboardSnapshot | null> {
  const db = await getDb();
  const result = await db.get(STORE_NAME, id);
  return (result as WhiteboardSnapshot) ?? null;
}

export async function deleteWhiteboard(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}
