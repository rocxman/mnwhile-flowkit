import React, { useState, useEffect } from 'react';
import { X, Copy, Check, UserPlus, Trash2, Users } from 'lucide-react';
import { cloudStorage, type CloudDocument } from '@/lib/cloud-storage';
import { MODAL_PANEL_CLASS, SECTION_CARD_CLASS } from '@/lib/designTokens';

interface ShareDialogProps {
  localDocumentId: string;
  documentName: string;
  onClose: () => void;
}

interface SharedUser {
  id: string;
  document_id: string;
  shared_with_user_id: string;
  permission: 'view' | 'edit';
  created_at: string;
  profiles?: {
    email: string;
    display_name: string | null;
  };
}

export function ShareDialog({ localDocumentId, documentName, onClose }: ShareDialogProps): React.ReactElement {
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cloudDocId, setCloudDocId] = useState<string | null>(null);

  useEffect(() => {
    // Load current share state
    void (async () => {
      try {
        const docs = await cloudStorage.getAllDocuments();
        const doc = docs.find((d) => d.local_id === localDocumentId);
        if (doc) {
          setCloudDocId(doc.id);
          setIsPublic(doc.is_public);
          setShareToken(doc.share_token);
          const shares = await cloudStorage.getDocumentShares(doc.id) as SharedUser[];
          setSharedUsers(shares);
        }
      } catch (err) {
        console.error('Failed to load share state:', err);
      }
    })();
  }, [localDocumentId]);

  const handleTogglePublic = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isPublic) {
        // Ensure document is saved to cloud first
        const state = await import('@/store').then((m) => m.useFlowStore.getState());
        const activeDocument = state.documents.find((doc) => doc.id === state.activeDocumentId);
        if (!activeDocument) throw new Error('No active document');

        const syncedDocument = {
          ...activeDocument,
          pages: activeDocument.pages.map((page) =>
            page.id === state.activeTabId
              ? { ...page, nodes: state.nodes, edges: state.edges }
              : page
          ),
        };

        const cloudDoc = await cloudStorage.saveDocument({
          local_id: syncedDocument.id,
          name: syncedDocument.name,
          diagram_type: syncedDocument.pages.find((p) => p.id === syncedDocument.activePageId)?.diagramType,
          content: syncedDocument.pages.find((p) => p.id === syncedDocument.activePageId)
            ? {
                nodes: syncedDocument.pages.find((p) => p.id === syncedDocument.activePageId)?.nodes ?? [],
                edges: syncedDocument.pages.find((p) => p.id === syncedDocument.activePageId)?.edges ?? [],
                playback: syncedDocument.pages.find((p) => p.id === syncedDocument.activePageId)?.playback,
              }
            : undefined,
          pages: syncedDocument.pages.map((page) => ({
            id: page.id,
            name: page.name,
            diagramType: page.diagramType,
            updatedAt: page.updatedAt,
            content: { nodes: page.nodes, edges: page.edges, playback: page.playback },
          })),
          active_page_id: syncedDocument.activePageId,
        });

        setCloudDocId(cloudDoc.id);
        const token = await cloudStorage.shareDocument(localDocumentId);
        setShareToken(token);
        setIsPublic(true);
      } else {
        if (cloudDocId) {
          await cloudStorage.unshareDocument(cloudDocId);
          setShareToken(null);
          setIsPublic(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sharing');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/#/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !cloudDocId) return;

    setLoading(true);
    setError(null);
    try {
      await cloudStorage.addShareUser(cloudDocId, email.trim(), permission);
      const shares = await cloudStorage.getDocumentShares(cloudDocId) as SharedUser[];
      setSharedUsers(shares);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share with user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!cloudDocId) return;
    setLoading(true);
    setError(null);
    try {
      await cloudStorage.removeShareUser(cloudDocId, userId);
      setSharedUsers((prev) => prev.filter((u) => u.shared_with_user_id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className={`relative mx-4 w-full max-w-md text-[var(--brand-text)] animate-in fade-in zoom-in-95 duration-150 ${MODAL_PANEL_CLASS}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-brand-border)] px-5 py-4">
          <div>
            <h2 id="share-dialog-title" className="text-sm font-semibold">Share "{documentName}"</h2>
            <p className="mt-0.5 text-[11px] text-[var(--brand-secondary-light)]">
              Manage public and private sharing
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--brand-secondary)] hover:bg-[var(--brand-background)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Public Sharing */}
          <div className={SECTION_CARD_CLASS}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--brand-primary)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">Public Link</h3>
              </div>
              <button
                onClick={() => void handleTogglePublic()}
                disabled={loading}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-[var(--brand-primary)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {isPublic && shareToken && (
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-[var(--brand-background)] px-2 py-1 text-[11px] text-[var(--brand-secondary)]">
                  {`${window.location.origin}/#/share/${shareToken}`}
                </code>
                <button
                  onClick={() => void handleCopyLink()}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-[var(--brand-background)]"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Explicit Sharing */}
          {cloudDocId && (
            <>
              <div className={SECTION_CARD_CLASS}>
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="h-4 w-4 text-[var(--brand-primary)]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider">Share with People</h3>
                </div>
                <form onSubmit={(e) => void handleAddUser(e)} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 rounded border border-[var(--color-brand-border)] bg-[var(--brand-background)] px-3 py-1.5 text-xs outline-none focus:border-[var(--brand-primary)]"
                      required
                    />
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                      className="rounded border border-[var(--color-brand-border)] bg-[var(--brand-background)] px-2 py-1.5 text-xs outline-none focus:border-[var(--brand-primary)]"
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                    </select>
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="rounded bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Share
                    </button>
                  </div>
                </form>
              </div>

              {/* Shared Users List */}
              {sharedUsers.length > 0 && (
                <div className={SECTION_CARD_CLASS}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Shared With</h3>
                  <div className="space-y-2">
                    {sharedUsers.map((share) => (
                      <div
                        key={share.id}
                        className="flex items-center justify-between rounded bg-[var(--brand-background)] p-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {share.profiles?.display_name || share.profiles?.email || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-[var(--brand-secondary)] truncate">
                            {share.profiles?.email} • {share.permission}
                          </p>
                        </div>
                        <button
                          onClick={() => void handleRemoveUser(share.shared_with_user_id)}
                          disabled={loading}
                          className="ml-2 rounded p-1 text-[var(--brand-secondary)] hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Remove user"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
