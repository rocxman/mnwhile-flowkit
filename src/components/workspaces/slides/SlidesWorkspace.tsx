import React, { useState, useEffect } from 'react';
import {
  Plus,
  Tv,
  ChevronDown,
  Trash2,
  Settings2,
  Image as ImageIcon,
  Type,
  Presentation,
  Play,
  HelpCircle,
} from 'lucide-react';
import { WorkspaceProps } from '../shared/workspaceTypes';
import { WorkspaceCanvas } from '../shared/WorkspaceCanvas';
import { WorkspaceOverlays } from '../shared/WorkspaceOverlays';
import { useFlowStore } from '@/store';
import { useWorkspaceDocumentActions } from '@/store/documentHooks';
import { useAuth } from '@/contexts/AuthContext';

export default function SlidesWorkspace(props: WorkspaceProps): React.ReactElement {
  const [transition, setTransition] = useState('fade');
  const [duration, setDuration] = useState('0.5s');
  const [slideBg, setSlideBg] = useState('#1e1e1e');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  // Document states from store
  const activeDocument = useFlowStore((state) =>
    state.documents.find((doc) => doc.id === state.activeDocumentId)
  );
  const docName = activeDocument?.name || 'Untitled';
  const [isEditingDocName, setIsEditingDocName] = useState(false);
  const [docNameInput, setDocNameInput] = useState(docName);
  const { renameDocument } = useWorkspaceDocumentActions();

  const { user } = useAuth();
  const username = user?.email ? user.email.split('@')[0] : 'rocxman';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  useEffect(() => {
    setDocNameInput(docName);
  }, [docName]);

  function handleDocNameSave() {
    setIsEditingDocName(false);
    if (activeDocument && docNameInput.trim()) {
      renameDocument(activeDocument.id, docNameInput.trim());
    }
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#1e1e1e] text-slate-200 font-sans select-none">
      {/* Leftmost Thin Rail */}
      <nav className="w-14 shrink-0 bg-[#2c2c2c] border-r border-[#1e1e1e] flex flex-col items-center py-3.5 gap-5 z-20">
        {/* Meanwhile Logo */}
        <button
          type="button"
          onClick={props.topNav.onGoHome}
          className="h-8 w-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#3e3e3e] rounded-lg transition-colors cursor-pointer mb-1"
          title="Go to Dashboard"
        >
          <svg className="w-5 h-5" viewBox="0 0 9144 7789.32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M3008.52 3828.91l-10.02 -2220.07 -1476.14 0.12 -0.22 6154.48 1400.99 -2.12 1612.4 -3775.19 -5.38 3775.81 1543.65 1.59 1522.8 -3734.4 -6.77 3731.05 1522.29 2.42 1.64 -7728.18 -1483.83 1.12 -1549.34 3677.44 -21.48 -3681.36 -1498.94 -5.83 -1551.65 3803.12zm-2978.28 -2209.71l1492.03 -10.41 -3.85 -1474.92 -1487.08 4.88 -1.1 1480.45z"/>
          </svg>
        </button>

        {/* Slides Tab */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="flex flex-col items-center gap-1 w-full text-slate-200 cursor-pointer group"
          title="Toggle Slides Panel"
        >
          <div className={`p-2 rounded-lg transition-all shadow-sm ${leftSidebarOpen ? 'bg-orange-600 text-white' : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'}`}>
            <Presentation className="w-4 h-4" />
          </div>
          <span className={`text-[9px] font-medium font-outfit transition-colors ${leftSidebarOpen ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'}`}>Slides</span>
        </button>

        {/* Insert Tab */}
        <button
          type="button"
          onClick={() => props.toolbar.onAddTextNode({ x: 100, y: 100 })}
          className="flex flex-col items-center gap-1 w-full text-slate-400 hover:text-slate-200 cursor-pointer group"
          title="Insert Element"
        >
          <div className="p-2 rounded-lg group-hover:bg-[#3e3e3e] transition-all">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-medium font-outfit text-slate-500 group-hover:text-slate-300 transition-colors">Insert</span>
        </button>
      </nav>

      {/* Left Sidebar: Slide thumbnails */}
      <aside
        className={`bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col min-h-0 z-10 transition-all duration-300 ${
          leftSidebarOpen ? 'w-60' : 'w-0 border-r-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-3 pt-3.5 pb-2 border-b border-[#2c2c2c] shrink-0">
          <div className="flex items-center justify-between min-w-0">
            {isEditingDocName ? (
              <input
                type="text"
                value={docNameInput}
                onChange={(e) => setDocNameInput(e.target.value)}
                onBlur={handleDocNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleDocNameSave()}
                className="bg-[#2c2c2c] text-white px-2 py-0.5 rounded border border-orange-500 text-xs focus:outline-none w-36 font-semibold"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDocNameInput(docName);
                  setIsEditingDocName(true);
                }}
                className="text-xs font-bold text-white hover:bg-[#2c2c2c] px-1.5 py-1 rounded flex items-center gap-1 transition-colors truncate font-outfit max-w-[80%]"
                title="Rename Document"
              >
                <span className="truncate">{docName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1 hover:bg-[#2c2c2c] rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-1 px-1.5">
            <span className="text-[10px] text-slate-500 font-medium font-outfit truncate">Team project</span>
            <span className="rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 text-[8px] font-bold tracking-wide select-none">
              Free
            </span>
          </div>
        </div>

        {/* Slides Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slides</span>
          <button
            type="button"
            onClick={props.topNav.onAddPage}
            className="flex items-center justify-center p-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Add New Slide"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slide List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2.5 custom-scrollbar">
          {props.pages.map((page, index) => {
            const isActive = page.id === props.activePageId;
            return (
              <div
                key={page.id}
                onClick={() => props.topNav.onSwitchPage(page.id)}
                className={`group relative flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/5 shadow-md'
                    : 'border-[#2c2c2c] bg-[#1e1e1e] hover:border-slate-500'
                }`}
              >
                {/* Thumbnail area */}
                <div className="h-24 w-full bg-[#151515] relative flex items-center justify-center border-b border-[#2c2c2c] overflow-hidden">
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <div className="scale-75 opacity-60 flex flex-col items-center">
                    <Tv className="w-7 h-7 text-slate-500 mb-1" />
                    <span className="text-[9px] text-slate-400 font-medium truncate max-w-[120px]">
                      {page.name}
                    </span>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="p-1.5 flex items-center justify-between bg-[#1c1c1c] text-[10px] font-semibold text-slate-400">
                  <span className="truncate max-w-[120px]">{page.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.topNav.onClosePage(page.id);
                      }}
                      className="p-0.5 hover:bg-[#2c2c2c] rounded text-slate-500 hover:text-red-400"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Center Presentation canvas */}
      <WorkspaceCanvas canvas={props.canvas} />

      {/* Right Sidebar: Settings */}
      <aside className="w-64 shrink-0 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col min-h-0 z-10">
        {/* Top Row: User avatar, Play, Share */}
        <div className="h-12 border-b border-[#2c2c2c] flex items-center justify-between px-3 shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="h-7 w-7 rounded-full object-cover border border-[#3e3e3e]" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xs font-bold text-white uppercase select-none">
              {username[0]}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={props.topNav.onPlay}
              className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              title="Present Slides"
            >
              <Play className="w-3.5 h-3.5 fill-slate-400 hover:fill-white" />
            </button>

            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-98 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Settings Header */}
        <div className="h-10 border-b border-[#2c2c2c] flex items-center px-3 shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Slide Settings</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Slide Background Color */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Background</label>
            <div className="flex items-center gap-2 bg-[#2c2c2c]/40 p-2 rounded-lg border border-[#2c2c2c]">
              <input
                type="color"
                value={slideBg}
                onChange={(e) => setSlideBg(e.target.value)}
                className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-semibold text-white uppercase">{slideBg}</span>
            </div>
          </div>

          {/* Slide Transition Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transition Effect</label>
            <div className="relative">
              <select
                value={transition}
                onChange={(e) => setTransition(e.target.value)}
                className="w-full bg-[#2c2c2c] border border-[#3e3e3e] text-white rounded-lg p-2 text-xs font-semibold focus:outline-none appearance-none cursor-pointer"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Slide Transition Duration */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</label>
            <div className="relative">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#2c2c2c] border border-[#3e3e3e] text-white rounded-lg p-2 text-xs font-semibold focus:outline-none appearance-none cursor-pointer"
              >
                <option value="0.2s">Fast (0.2s)</option>
                <option value="0.5s">Medium (0.5s)</option>
                <option value="1.0s">Slow (1.0s)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="border-t border-[#2c2c2c]" />

          {/* Quick Insertion Panel */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Insert Elements</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => props.toolbar.onAddTextNode({ x: 100, y: 100 })}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#2c2c2c] hover:border-orange-500 bg-[#2c2c2c]/20 hover:bg-[#2c2c2c]/40 transition-colors text-[10px] font-semibold gap-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <Type className="w-4 h-4 text-orange-500" />
                <span>Title Text</span>
              </button>
              <button
                type="button"
                onClick={() => props.toolbar.onAddShape('rectangle', { x: 100, y: 100 })}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#2c2c2c] hover:border-orange-500 bg-[#2c2c2c]/20 hover:bg-[#2c2c2c]/40 transition-colors text-[10px] font-semibold gap-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <span>Media Block</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating help button */}
      <div className="absolute bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => window.open('https://mnwhile-flowkit.com/docs', '_blank')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2c2c2c] border border-[#3e3e3e] text-slate-400 hover:text-white hover:bg-[#3e3e3e] shadow-lg transition-all cursor-pointer font-bold text-sm"
          title="Help & Resources"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <WorkspaceOverlays
        collaborationEnabled={props.collaborationEnabled}
        remotePresence={props.remotePresence}
        collaborationNodePositions={props.collaborationNodePositions}
        isLayouting={props.isLayouting}
        layoutMessage={props.layoutMessage}
        toolbar={props.toolbar}
        playback={props.playback}
      />
    </div>
  );
}
