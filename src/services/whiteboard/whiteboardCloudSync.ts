import { supabase } from '@/lib/supabase';
import { cloudStorage } from '@/lib/cloud-storage';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export interface WhiteboardCloudData {
  type: 'whiteboard';
  schemaVersion: number;
  elements: ExcalidrawElement[];
  updatedAt: string;
}

export async function saveWhiteboardToCloud(
  documentId: string,
  name: string,
  elements: ExcalidrawElement[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, skip cloud sync
    return;
  }

  const cloudData: WhiteboardCloudData = {
    type: 'whiteboard',
    schemaVersion: 1,
    elements,
    updatedAt: new Date().toISOString(),
  };

  await cloudStorage.saveDocument({
    local_id: documentId,
    name,
    diagram_type: 'whiteboard',
    content: cloudData as unknown as Record<string, unknown>,
    pages: [],
    active_page_id: null,
  });
}

export async function loadWhiteboardFromCloud(
  documentId: string
): Promise<WhiteboardCloudData | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('content')
      .eq('user_id', user.id)
      .eq('local_id', documentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!data?.content) return null;

    const content = data.content as unknown as WhiteboardCloudData;

    if (content.type !== 'whiteboard') {
      return null;
    }

    return content;
  } catch (error) {
    console.error('Failed to load whiteboard from cloud:', error);
    return null;
  }
}

export async function deleteWhiteboardFromCloud(documentId: string): Promise<void> {
  try {
    await cloudStorage.deleteDocument(documentId);
  } catch (error) {
    console.error('Failed to delete whiteboard from cloud:', error);
  }
}
