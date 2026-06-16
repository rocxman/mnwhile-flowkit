import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@/lib/reactflowCompat';
import { cloudStorage } from '@/lib/cloud-storage';
import type { CloudDocument } from '@/lib/cloud-storage';
import { FlowEditor } from '@/components/FlowEditor';

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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
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
