import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@/lib/reactflowCompat';
import { cloudStorage } from '@/lib/cloud-storage';
import type { CloudDocument } from '@/lib/cloud-storage';
import { FlowEditor } from '@/components/FlowEditor';
import { useFlowStore } from '@/store';
import { cloudDocumentToFlowDocument } from '@/services/storage/cloudSyncService';

export function SharedDocumentPage(): React.JSX.Element {
  const { shareToken } = useParams<{ shareToken: string }>();
  const hasShareToken = Boolean(shareToken);
  const [document, setDocument] = useState<CloudDocument | null>(null);
  const [loading, setLoading] = useState(hasShareToken);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasShareToken) {
      return;
    }

    let isDisposed = false;

    void cloudStorage
      .getDocumentByShareToken(shareToken as string)
      .then((doc) => {
        if (isDisposed) {
          return;
        }
        setDocument(doc);
        if (doc) {
          const flowDoc = cloudDocumentToFlowDocument(doc);
          if (flowDoc) {
            useFlowStore.setState((state) => ({
              documents: [...state.documents.filter((d) => d.id !== flowDoc.id), flowDoc],
              activeDocumentId: flowDoc.id,
              tabs: flowDoc.pages.map((p) => ({
                id: p.id,
                name: p.name,
                diagramType: p.diagramType,
                updatedAt: p.updatedAt,
                nodes: p.nodes,
                edges: p.edges,
                playback: p.playback,
                history: p.history,
              })),
              activeTabId: flowDoc.activePageId,
              nodes: flowDoc.pages.find((p) => p.id === flowDoc.activePageId)?.nodes ?? [],
              edges: flowDoc.pages.find((p) => p.id === flowDoc.activePageId)?.edges ?? [],
            }));
          }
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isDisposed) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Gagal memuat dokumen';
        setFetchError(message);
        setLoading(false);
      });

    return () => {
      isDisposed = true;
    };
  }, [hasShareToken, shareToken]);

  const error = hasShareToken ? fetchError : 'Share token tidak ditemukan';

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-lime-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat dokumen...</p>
        </div>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <section className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-4">Dokumen Tidak Tersedia</h1>
          <p className="text-slate-300 mb-6">{error || 'Dokumen tidak ditemukan atau tidak lagi dibagikan secara publik.'}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="h-screen bg-slate-950">
      <ReactFlowProvider>
        <FlowEditor onGoHome={() => {}} />
      </ReactFlowProvider>
    </main>
  );
}
