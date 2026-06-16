import { supabase } from './supabase';

export interface CloudDocument {
  id: string;
  user_id: string;
  local_id: string | null;
  name: string;
  diagram_type: string | null;
  content: Record<string, unknown> | null;
  pages: Record<string, unknown>[] | null;
  active_page_id: string | null;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CloudSnapshot {
  id: string;
  document_id: string;
  user_id: string;
  name: string | null;
  content: Record<string, unknown>;
  created_at: string;
}

export const cloudStorage = {
  async getAllDocuments(): Promise<CloudDocument[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data as CloudDocument[]) || [];
  },

  async getDocument(id: string): Promise<CloudDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CloudDocument;
  },

  async getDocumentByShareToken(token: string): Promise<CloudDocument | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data as CloudDocument;
  },

  async saveDocument(doc: {
    id?: string;
    local_id?: string;
    name: string;
    diagram_type?: string;
    content?: Record<string, unknown>;
    pages?: Record<string, unknown>[];
    active_page_id?: string;
  }): Promise<CloudDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const payload: Record<string, unknown> = {
      user_id: user.id,
      name: doc.name,
      diagram_type: doc.diagram_type ?? null,
      content: doc.content ?? null,
      pages: doc.pages ?? null,
      active_page_id: doc.active_page_id ?? null,
      updated_at: new Date().toISOString(),
    };

    if (doc.local_id) {
      payload.local_id = doc.local_id;
    }

    const { data, error } = await supabase
      .from('documents')
      .upsert(payload, {
        onConflict: doc.local_id ? 'user_id,local_id' : undefined,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CloudDocument;
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async shareDocument(localId: string): Promise<string> {
    const shareToken = crypto.randomUUID();

    const { error } = await supabase
      .from('documents')
      .update({ is_public: true, share_token: shareToken })
      .eq('local_id', localId);

    if (error) throw error;
    return shareToken;
  },

  async unshareDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ is_public: false, share_token: null })
      .eq('id', id);

    if (error) throw error;
  },

  async createSnapshot(documentId: string, name?: string): Promise<CloudSnapshot> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error('Document not found');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('document_snapshots')
      .insert({
        document_id: documentId,
        user_id: user.id,
        name: name || `Snapshot ${new Date().toLocaleString('id-ID')}`,
        content: { name: doc.name, diagram_type: doc.diagram_type, content: doc.content, pages: doc.pages },
      })
      .select()
      .single();

    if (error) throw error;
    return data as CloudSnapshot;
  },

  async getSnapshots(documentId: string): Promise<CloudSnapshot[]> {
    const { data, error } = await supabase
      .from('document_snapshots')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as CloudSnapshot[]) || [];
  },

  async addShareUser(documentId: string, email: string, permission: 'view' | 'edit' = 'view'): Promise<void> {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) throw new Error('User not found');

    const { error } = await supabase
      .from('document_shares')
      .insert({
        document_id: documentId,
        shared_with_user_id: userData.id,
        permission,
      });

    if (error) throw error;
  },

  async removeShareUser(documentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('document_shares')
      .delete()
      .eq('document_id', documentId)
      .eq('shared_with_user_id', userId);

    if (error) throw error;
  },

  async getDocumentShares(documentId: string) {
    const { data, error } = await supabase
      .from('document_shares')
      .select('*, profiles:shared_with_user_id(email, display_name)')
      .eq('document_id', documentId);

    if (error) throw error;
    return data || [];
  },
};
