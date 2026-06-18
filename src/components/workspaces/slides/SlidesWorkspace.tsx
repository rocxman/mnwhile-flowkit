import React, { useState } from 'react';
import {
  Plus,
  Tv,
  Trash2,
  Play,
  HelpCircle,
  FileText,
  Layers,
  MousePointer2,
  Type,
  Image as ImageIcon,
  Square,
  Zap,
  MessageSquare,
  Sparkles,
  Package,
  ChevronDown,
} from 'lucide-react';
import { WorkspaceProps } from '../shared/workspaceTypes';
import { WorkspaceCanvas } from '../shared/WorkspaceCanvas';
import { WorkspaceOverlays } from '../shared/WorkspaceOverlays';
import {
  useWorkspaceDocument,
  useWorkspaceUser,
  useWorkspacePanelState,
} from '../shared/hooks';

export default function SlidesWorkspace(props: WorkspaceProps): React.ReactElement {
  const { docName, isEditingDocName, docNameInput, startEditDocName, setDocNameInput, saveDocName } =
    useWorkspaceDocument();
  const { username, avatarUrl } = useWorkspaceUser();
  const { leftSidebarOpen, setLeftSidebarOpen } = useWorkspacePanelState();

  const [transition, setTransition] = useState('fade');
  const [duration, setDuration] = useState('0.5s');
  const [slideBg, setSlideBg] = useState('#1e1e1e');
  const [speakerNotesOpen, setSpeakerNotesOpen] = useState(true);
  const [speakerNotes, setSpeakerNotes] = useState('');
  const [activeTool, setActiveTool] = useState<'move' | 'text' | 'image' | 'shape' | 'interaction' | 'comment'>('move');
  const [rightTab, setRightTab] = useState<'design' | 'animate'>('design');

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#1e1e1e] font-sans text-slate-200 select-none">
      {/* Left Navigation Bar - 56px wide, Figma Slides style */}
      <nav className="z-20 flex w-14 shrink-0 flex-col items-center border-r border-[#333333] bg-[#2c2c2c] py-3 gap-4">
        {/* MNWHILE Logo / Home */}
        <button
          type="button"
          onClick={props.topNav.onGoHome}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-[#3e3e3e] hover:text-white cursor-pointer"
          title="Go to Dashboard"
        >
          <svg className="h-5 w-5" viewBox="0 0 9144 7789.32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M3008.52 3828.91l-10.02 -2220.07 -1476.14 0.12 -0.22 6154.48 1400.99 -2.12 1612.4 -3775.19 -5.38 3775.81 1543.65 1.59 1522.8 -3734.4 -6.77 3731.05 1522.29 2.42 1.64 -7728.18 -1483.83 1.12 -1549.34 3677.44 -21.48 -3681.36 -1498.94 -5.83 -1551.65 3803.12zm-2978.28 -2209.71l1492.03 -10.41 -3.85 -1474.92 -1487.08 4.88 -1.1 1480.45z"/>
          </svg>
        </button>

        <div className="h-px w-4 bg-[#3e3e3e]" />

        {/* File button */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="group flex w-full flex-col items-center gap-1 cursor-pointer"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${leftSidebarOpen ? 'bg-[#0c8ce9] text-white shadow-sm shadow-[#0c8ce9]/25' : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'}`}>
            <FileText className="h-4 w-4" />
          </div>
          <span className={`text-[10px] font-medium ${leftSidebarOpen ? 'text-[#0c8ce9]' : 'text-slate-500'}`}>File</span>
        </button>

        {/* Slides button */}
        <button
          type="button"
          className="group flex w-full flex-col items-center gap-1 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all group-hover:bg-[#3e3e3e] group-hover:text-slate-200">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">Slides</span>
        </button>

        <div className="h-px w-4 bg-[#3e3e3e]" />

        {/* Assets button */}
        <button
          type="button"
          className="group flex w-full flex-col items-center gap-1 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all group-hover:bg-[#3e3e3e] group-hover:text-slate-200">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">Assets</span>
        </button>
      </nav>

      {/* Left Panel - 240px (Slides list) */}
      {leftSidebarOpen && (
        <aside className="z-10 flex w-60 shrink-0 flex-col border-r border-[#333333] bg-[#2c2c2c] min-h-0">
          {/* Header - Doc name + breadcrumb */}
          <div className="shrink-0 border-b border-[#333333] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              {isEditingDocName ? (
                <input
                  type="text"
                  value={docNameInput}
                  onChange={(e) => setDocNameInput(e.target.value)}
                  onBlur={saveDocName}
                  onKeyDown={(e) => e.key === 'Enter' && saveDocName()}
                  className="h-7 min-w-0 flex-1 rounded border border-[#0c8ce9] bg-[#383838] px-2 text-xs font-medium text-white outline-none"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={startEditDocName}
                  className="flex min-w-0 items-center gap-1.5 rounded px-1 py-1 text-left text-xs font-medium text-white transition-colors hover:bg-[#3e3e3e]"
                  title="Rename document"
                >
                  <span className="truncate">{docName}</span>
                  <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" />
                </button>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 px-1">
              <span className="text-[10px] text-slate-500">Team project</span>
              <span className="rounded border border-slate-600 bg-slate-700/50 px-1 text-[8px] font-medium text-slate-400">Free</span>
            </div>
          </div>

          {/* Slides header with add button */}
          <div className="flex shrink-0 items-center justify-between px-3 py-2 border-b border-[#333333]">
            <span className="text-[11px] font-semibold text-slate-300">Slides</span>
            <button
              type="button"
              onClick={props.topNav.onAddPage}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-[#3e3e3e] hover:text-white"
              title="Add Slide"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Slide thumbnails */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-2 space-y-1.5">
            {props.pages.map((page, index) => {
              const isActive = page.id === props.activePageId;
              return (
                <div
                  key={page.id}
                  onClick={() => props.topNav.onSwitchPage(page.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      props.topNav.onSwitchPage(page.id);
                    }
                  }}
                  className={`group relative flex gap-2 rounded-lg p-1.5 cursor-pointer transition-colors ${
                    isActive ? 'bg-[#0c8ce9]/15 ring-1 ring-[#0c8ce9]/50' : 'hover:bg-[#383838]'
                  }`}
                >
                  {/* Slide number */}
                  <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold ${
                    isActive ? 'text-[#0c8ce9]' : 'text-slate-500'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Slide preview */}
                  <div className="flex-1 min-w-0">
                    <div className="relative aspect-video overflow-hidden rounded border border-white/10 bg-[#1e1e1e]">
                      <div className="absolute inset-2 rounded-sm border border-white/5 bg-[#252525]" />
                      <div className="absolute left-3 top-3 h-1.5 w-8 rounded-full bg-[#0c8ce9]/60" />
                      <div className="absolute left-3 top-6 h-1 w-12 rounded-full bg-white/10" />
                      {isActive && (
                        <div className="absolute bottom-1 right-1">
                          <Tv className="h-3 w-3 text-[#0c8ce9]/50" />
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`truncate text-[10px] ${isActive ? 'text-white font-medium' : 'text-slate-400'}`}>
                        {page.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.topNav.onClosePage(page.id);
                        }}
                        className="flex h-4 w-4 items-center justify-center rounded text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                        title="Delete slide"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main Canvas Area */}
      <main className="relative flex min-w-0 flex-1 flex-col bg-[#1e1e1e]">
        {/* Canvas */}
        <div className="relative flex-1 min-h-0">
          <WorkspaceCanvas canvas={props.canvas} />
        </div>

        {/* Speaker Notes Area */}
        {speakerNotesOpen && (
          <div className="h-28 shrink-0 border-t border-[#333333] bg-[#2c2c2c] px-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-slate-500">Speaker Notes</span>
              <button
                type="button"
                onClick={() => setSpeakerNotesOpen(false)}
                className="text-slate-500 hover:text-white text-[10px]"
              >
                Hide
              </button>
            </div>
            <textarea
              value={speakerNotes}
              onChange={(e) => setSpeakerNotes(e.target.value)}
              placeholder="Add presenter notes…"
              className="h-16 w-full resize-none rounded border border-[#333333] bg-[#1e1e1e] px-2 py-1 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-[#0c8ce9]/50"
            />
          </div>
        )}
      </main>

      {/* Right Panel - 241px (Properties) */}
      <aside className="z-10 flex w-[241px] shrink-0 flex-col border-l border-[#333333] bg-[#2c2c2c] min-h-0">
        {/* Top bar: Multiplayer + zoom */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#333333] px-3">
          <div className="flex items-center gap-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="h-6 w-6 rounded-full border border-white/10 object-cover" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#0c8ce9] to-blue-600 text-[9px] font-bold uppercase text-white">
                {username[0]}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={props.topNav.onPlay}
              className="flex h-7 items-center gap-1.5 rounded-md bg-[#0c8ce9] px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#0a7dd4]"
              title="Present Slides"
            >
              <Play className="h-3 w-3 fill-white" />
              Play
            </button>
            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-md border border-[#444] bg-[#383838] px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#3e3e3e]"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Tabs: Design / Animate */}
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#333333] px-2">
          <div className="flex gap-0.5">
            <button
              type="button"
              onClick={() => setRightTab('design')}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                rightTab === 'design' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Design
            </button>
            <button
              type="button"
              onClick={() => setRightTab('animate')}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                rightTab === 'animate' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Animate
            </button>
          </div>
          <span className="text-[10px] text-slate-500">100%</span>
        </div>

        {/* Properties content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-3 space-y-4">
          {rightTab === 'design' ? (
            <>
              {/* Slide settings */}
              <section className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Background</label>
                <div className="flex items-center gap-2 rounded-lg border border-[#444] bg-[#383838] p-2">
                  <input
                    type="color"
                    value={slideBg}
                    onChange={(e) => setSlideBg(e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="text-[11px] text-white">{slideBg}</span>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Layout</label>
                <div className="grid grid-cols-3 gap-1">
                  {['Title', 'Content', 'Split'].map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      className="rounded-lg border border-[#444] bg-[#383838] py-2 text-[10px] font-medium text-slate-400 transition-colors hover:border-[#0c8ce9]/50 hover:text-white"
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Insert</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { icon: Type, label: 'Text' },
                    { icon: ImageIcon, label: 'Image' },
                    { icon: Square, label: 'Shape' },
                    { icon: Tv, label: 'Embed' },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => props.toolbar.onAddTextNode({ x: 100, y: 100 })}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-[#444] bg-[#383838] p-3 text-[10px] font-medium text-slate-400 transition-colors hover:border-[#0c8ce9]/50 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Animate tab */}
              <section className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Transition</label>
                <div className="relative">
                  <select
                    value={transition}
                    onChange={(e) => setTransition(e.target.value)}
                    className="h-8 w-full appearance-none rounded-lg border border-[#444] bg-[#383838] px-2 pr-7 text-[11px] text-white outline-none focus:border-[#0c8ce9]/50"
                  >
                    <option value="none">None</option>
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="zoom">Zoom</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-slate-500" />
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Duration</label>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-8 w-full appearance-none rounded-lg border border-[#444] bg-[#383838] px-2 pr-7 text-[11px] text-white outline-none focus:border-[#0c8ce9]/50"
                  >
                    <option value="0.2s">Fast (0.2s)</option>
                    <option value="0.5s">Medium (0.5s)</option>
                    <option value="1.0s">Slow (1.0s)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-slate-500" />
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Build Order</label>
                <div className="rounded-lg border border-[#444] bg-[#383838] p-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Sparkles className="h-3 w-3" />
                    Click to add build animations
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>

      {/* Bottom Toolbar - centered, Figma Slides style */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-3">
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-[#444] bg-[#2c2c2c] px-2 py-1.5 shadow-xl shadow-black/40">
          {/* Move */}
          <button
            type="button"
            onClick={() => setActiveTool('move')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'move' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Move (V)"
          >
            <MousePointer2 className="h-4 w-4" />
          </button>

          {/* Text */}
          <button
            type="button"
            onClick={() => {
              setActiveTool('text');
              props.toolbar.onAddTextNode({ x: 100, y: 100 });
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'text' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Text (T)"
          >
            <Type className="h-4 w-4" />
          </button>

          {/* Image */}
          <button
            type="button"
            onClick={() => setActiveTool('image')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'image' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          {/* Shapes */}
          <button
            type="button"
            onClick={() => {
              setActiveTool('shape');
              props.toolbar.onAddShape('rectangle', { x: 100, y: 100 });
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'shape' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Shapes (R)"
          >
            <Square className="h-4 w-4" />
          </button>

          {/* Live Interaction */}
          <button
            type="button"
            onClick={() => setActiveTool('interaction')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'interaction' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Live interaction"
          >
            <Zap className="h-4 w-4" />
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => setActiveTool('comment')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'comment' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Comment (C)"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-[#444]" />

          {/* Actions */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#383838] hover:text-white"
            title="Actions"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Assets */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#383838] hover:text-white"
            title="Assets"
          >
            <Package className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Speaker Notes toggle (if hidden) */}
      {!speakerNotesOpen && (
        <button
          type="button"
          onClick={() => setSpeakerNotesOpen(true)}
          className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 rounded-t-lg border border-b-0 border-[#444] bg-[#2c2c2c] px-3 py-1 text-[10px] text-slate-400 transition-colors hover:text-white"
        >
          Show presenter notes
        </button>
      )}

      {/* Help button - bottom right */}
      <div className="absolute bottom-3 right-3 z-40">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#444] bg-[#2c2c2c] text-slate-500 transition-colors hover:bg-[#383838] hover:text-white"
          title="Help"
        >
          <HelpCircle className="h-4 w-4" />
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
