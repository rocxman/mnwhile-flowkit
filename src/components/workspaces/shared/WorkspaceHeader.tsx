import React, { useState, useEffect } from 'react';
import { Play, ChevronDown, Palette } from 'lucide-react';
import { useFlowStore } from '@/store';
import { useWorkspaceDocumentActions } from '@/store/documentHooks';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkspaceHeaderProps {
  onPlay: () => void;
  onShare?: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  onPlay,
  onShare,
}) => {
  const { user } = useAuth();
  const { renameDocument } = useWorkspaceDocumentActions();

  // Selected document information from store
  const activeDocument = useFlowStore((state) =>
    state.documents.find((doc) => doc.id === state.activeDocumentId)
  );
  const docName = activeDocument?.name || 'Untitled';

  // State states for renaming document
  const [isEditingDocName, setIsEditingDocName] = useState(false);
  const [docNameInput, setDocNameInput] = useState(docName);

  // Sync docNameInput with docName from store if store name changes
  useEffect(() => {
    setDocNameInput(docName);
  }, [docName]);

  const username = user?.email ? user.email.split('@')[0] : 'rocxman';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  function handleDocNameSave() {
    setIsEditingDocName(false);
    if (activeDocument && docNameInput.trim()) {
      renameDocument(activeDocument.id, docNameInput.trim());
    }
  }

  return (
    <header className="h-12 shrink-0 bg-[#2c2c2c] border-b border-[#1e1e1e] flex items-center justify-between px-3 z-50">
      {/* Left Side: Brand, Doc Name, Project Metadata */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#a259ff] text-white shadow-md">
          <Palette className="w-4 h-4 shrink-0" />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          {isEditingDocName ? (
            <input
              type="text"
              value={docNameInput}
              onChange={(e) => setDocNameInput(e.target.value)}
              onBlur={handleDocNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleDocNameSave()}
              className="bg-[#1e1e1e] text-white px-2 py-0.5 rounded border border-[#0c8ce9] text-xs focus:outline-none w-32"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDocNameInput(docName);
                setIsEditingDocName(true);
              }}
              className="text-xs font-bold text-white hover:bg-[#3e3e3e] px-2 py-1 rounded flex items-center gap-1 transition-colors truncate"
            >
              <span>{docName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          )}

          <span className="text-[11px] text-slate-400 hidden sm:inline">/</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline truncate">Team project</span>
          <span className="rounded bg-[#2b4c7e]/40 text-[#63b3ed] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide border border-transparent">
            Free
          </span>
        </div>
      </div>

      {/* Right Side: Play, Share, Avatar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#3e3e3e] transition-colors cursor-pointer"
          title="Preview Presentation"
        >
          <Play className="w-3.5 h-3.5 fill-slate-300" />
          <span className="hidden md:inline">Play</span>
        </button>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="rounded-lg bg-[#0c8ce9] hover:bg-blue-600 active:scale-98 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer"
          >
            Share
          </button>
        )}

        {/* User Profile Avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} className="h-7 w-7 rounded-full object-cover border border-[#3e3e3e]" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xs font-bold text-white uppercase select-none">
            {username[0]}
          </div>
        )}
      </div>
    </header>
  );
};
