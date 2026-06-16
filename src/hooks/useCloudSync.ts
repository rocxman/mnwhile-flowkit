import { useState, useCallback } from 'react';
import { cloudStorage } from '@/lib/cloud-storage';
import type { CloudDocument } from '@/lib/cloud-storage';
import { useAuth } from '@/contexts/AuthContext';

export function useCloudSync() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncDocument = useCallback(
    async (localDoc: {
      id?: string;
      name: string;
      diagram_type?: string;
      content?: Record<string, unknown>;
      pages?: Record<string, unknown>[];
      active_page_id?: string;
    }): Promise<CloudDocument | null> => {
      if (!user) return null;

      try {
        setLoading(true);
        setError(null);
        const cloudDoc = await cloudStorage.saveDocument(localDoc);
        return cloudDoc;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sync failed';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const loadDocuments = useCallback(async (): Promise<CloudDocument[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);
      return await cloudStorage.getAllDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Load failed';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await cloudStorage.deleteDocument(id);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const shareDocument = useCallback(async (id: string): Promise<string | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      return await cloudStorage.shareDocument(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Share failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unshareDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await cloudStorage.unshareDocument(id);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unshare failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSnapshot = useCallback(async (documentId: string, name?: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);
      return await cloudStorage.createSnapshot(documentId, name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Snapshot failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getSnapshots = useCallback(async (documentId: string) => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);
      return await cloudStorage.getSnapshots(documentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Load snapshots failed';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addShareUser = useCallback(async (documentId: string, email: string, permission: 'view' | 'edit' = 'view') => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await cloudStorage.addShareUser(documentId, email, permission);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Add share user failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeShareUser = useCallback(async (documentId: string, userId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      await cloudStorage.removeShareUser(documentId, userId);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Remove share user failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getDocumentShares = useCallback(async (documentId: string) => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);
      return await cloudStorage.getDocumentShares(documentId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Load shares failed';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    isCloudEnabled: !!user,
    syncDocument,
    loadDocuments,
    deleteDocument,
    shareDocument,
    unshareDocument,
    createSnapshot,
    getSnapshots,
    addShareUser,
    removeShareUser,
    getDocumentShares,
  };
}
