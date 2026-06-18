import React, { useState } from 'react';
import {
  Megaphone,
  MessageSquare,
  Sparkles,
  Send,
  Compass,
  ChevronDown,
  ChevronRight,
  Play,
  HelpCircle,
  Sliders,
  Globe,
  Clock,
  TrendingUp,
  Palette,
  Film,
  Image as ImageIcon,
  Hash,
} from 'lucide-react';
import { WorkspaceProps } from '../shared/workspaceTypes';
import { WorkspaceCanvas } from '../shared/WorkspaceCanvas';
import { WorkspaceOverlays } from '../shared/WorkspaceOverlays';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { useSelectionActions } from '@/store/selectionHooks';
import {
  useWorkspaceDocument,
  useWorkspaceUser,
  useWorkspacePanelState,
} from '../shared/hooks';

/* ------------------------------------------------------------------ */
/*  Buzz Workspace – Figma-accurate marketing / campaign shell         */
/* ------------------------------------------------------------------ */

const CHANNELS = [
  { name: 'Twitter / X',        icon: Hash,       status: 'live'  as const },
  { name: 'LinkedIn Business',   icon: Globe,      status: 'live'  as const },
  { name: 'Instagram Feed',      icon: ImageIcon,  status: 'live'  as const },
  { name: 'TikTok Graphic',      icon: Film,       status: 'draft' as const },
];

const POST_OUTLINES = [
  'Feature Launch Thread',
  'Interactive Flow Diagram',
  'Systems Architecture Post',
  'Client Roadmap Visual',
  'Product Hunt Asset',
];

export default function BuzzWorkspace(props: WorkspaceProps): React.ReactElement {
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
  const { docName, isEditingDocName, docNameInput, startEditDocName, setDocNameInput, saveDocName } =
    useWorkspaceDocument();
  const { username, avatarUrl } = useWorkspaceUser();
  const { leftSidebarOpen, setLeftSidebarOpen } = useWorkspacePanelState();
  const [rightPanelTab, setRightPanelTab] = useState<'campaign' | 'publish'>('campaign');

  /* ---- interactive local state ---- */
  const [targetAudience, setTargetAudience] = useState('Product Designers & Developers');
  const [campaignBudget, setCampaignBudget] = useState('$5,000');
  const [scheduleDate, setScheduleDate] = useState('2026-07-01');

  const hasSelection = Boolean(
    props.panels.properties.selectedNode ||
      props.panels.properties.selectedEdge ||
      props.panels.properties.selectedNodes.length > 1,
  );

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#1e1e1e] text-slate-200 font-sans select-none">

      {/* ============================================================ */}
      {/*  LEFT RAIL  (56px)                                           */}
      {/* ============================================================ */}
      <nav className="w-14 shrink-0 bg-[#2c2c2c] border-r border-[#333333] flex flex-col items-center py-3 gap-4 z-20">

        {/* MNWHILE logo */}
        <button
          type="button"
          onClick={props.topNav.onGoHome}
          className="h-7 w-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#3e3e3e] rounded-lg transition-colors cursor-pointer"
          title="Go to Dashboard"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 9144 7789.32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M3008.52 3828.91l-10.02 -2220.07 -1476.14 0.12 -0.22 6154.48 1400.99 -2.12 1612.4 -3775.19 -5.38 3775.81 1543.65 1.59 1522.8 -3734.4 -6.77 3731.05 1522.29 2.42 1.64 -7728.18 -1483.83 1.12 -1549.34 3677.44 -21.48 -3681.36 -1498.94 -5.83 -1551.65 3803.12zm-2978.28 -2209.71l1492.03 -10.41 -3.85 -1474.92 -1487.08 4.88 -1.1 1480.45z"/>
          </svg>
        </button>

        {/* Buzz icon */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="flex flex-col items-center gap-0.5 w-full cursor-pointer group"
          title="Toggle Buzz Panel"
        >
          <div
            className={`p-2 rounded-lg transition-all duration-200 ${
              leftSidebarOpen
                ? 'bg-[#E54D4D] text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
          </div>
          <span
            className={`text-[8px] font-semibold tracking-wide transition-colors ${
              leftSidebarOpen ? 'text-rose-400' : 'text-slate-500 group-hover:text-slate-400'
            }`}
          >
            Buzz
          </span>
        </button>

        {/* Variables icon */}
        <button
          type="button"
          onClick={props.toolbar.onCommandBar}
          className="flex flex-col items-center gap-0.5 w-full cursor-pointer group"
          title="Variables"
        >
          <div className="p-2 rounded-lg text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200 transition-all duration-200">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-semibold tracking-wide text-slate-500 group-hover:text-slate-400 transition-colors">
            Vars
          </span>
        </button>
      </nav>

      {/* ============================================================ */}
      {/*  LEFT PANEL  (240px) – Campaign Hub                          */}
      {/* ============================================================ */}
      <aside
        className={`bg-[#2c2c2c] border-r border-[#333333] flex flex-col min-h-0 z-10 transition-[width] duration-150 ease-in-out ${
          leftSidebarOpen ? 'w-60' : 'w-0 border-r-0 overflow-hidden'
        }`}
      >
        {/* ---- header ---- */}
        <div className="px-3 pt-3 pb-2.5 border-b border-[#2c2c2c]/60 shrink-0">
          <div className="flex items-center justify-between min-w-0">
            {isEditingDocName ? (
              <input
                type="text"
                value={docNameInput}
                onChange={(e) => setDocNameInput(e.target.value)}
                onBlur={saveDocName}
                onKeyDown={(e) => e.key === 'Enter' && saveDocName()}
                className="bg-[#2c2c2c] text-white px-2 py-0.5 rounded border border-[#E54D4D]/60 text-xs focus:outline-none w-36 font-semibold"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={startEditDocName}
                className="text-xs font-bold text-white hover:bg-[#2c2c2c] px-1.5 py-1 rounded flex items-center gap-1 transition-colors truncate max-w-[80%]"
                title="Rename Document"
              >
                <span className="truncate">{docName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1 hover:bg-[#2c2c2c] rounded text-slate-500 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Campaign Hub</span>
            <span className="rounded bg-[#E54D4D]/10 text-[#E54D4D] border border-[#E54D4D]/20 px-1.5 py-px text-[7px] font-bold tracking-widest uppercase select-none">
              Beta
            </span>
          </div>
        </div>

        {/* ---- scrollable content ---- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pt-3 pb-4 space-y-5">

          {/* ── Channels ── */}
          <section>
            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1.5 block">
              Channels
            </label>
            <ul className="space-y-1">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                return (
                  <li
                    key={ch.name}
                    className="group flex items-center gap-2.5 bg-[#2c2c2c]/30 hover:bg-[#2c2c2c]/60 px-2.5 py-2 rounded-lg border border-transparent hover:border-[#E54D4D]/20 transition-all duration-200 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                    <span className="text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors truncate flex-1">
                      {ch.name}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        ch.status === 'live'
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-slate-600'
                      }`}
                    />
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ── AI Generator Card ── */}
          <section className="relative rounded-xl overflow-hidden">
            {/* gradient border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E54D4D]/40 via-rose-500/10 to-orange-500/20" />
            <div className="relative m-[1px] rounded-[11px] bg-[#1e1e1e] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[#E54D4D] to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-white tracking-tight">Buzzpilot AI</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Instantly map customer journeys or design premium graphic templates using AI.
              </p>
              <button
                type="button"
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#E54D4D] to-rose-500 hover:from-[#d44444] hover:to-[#e04545] text-white text-[11px] font-semibold shadow-lg shadow-rose-600/20 transition-all duration-200 active:scale-[0.97] cursor-pointer"
              >
                Generate Campaign Map
              </button>
            </div>
          </section>

          {/* ── Post Outlines ── */}
          <section>
            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1.5 block">
              Post Outlines
            </label>
            <ul className="space-y-0.5">
              {POST_OUTLINES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-white cursor-pointer py-1.5 px-1.5 rounded-md hover:bg-[#2c2c2c]/40 transition-all duration-150 group"
                >
                  <Compass className="w-3 h-3 text-[#E54D4D]/50 group-hover:text-[#E54D4D]/80 transition-colors shrink-0" />
                  <span className="truncate">{item}</span>
                  <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                </li>
              ))}
            </ul>
          </section>

          {/* ── divider ── */}
          <div className="border-t border-[#2c2c2c]/60" />

          {/* ── Layers ── */}
          <section>
            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1.5 block">
              Layers
            </label>
            <div className="space-y-0.5 max-h-44 overflow-y-auto custom-scrollbar">
              {props.panels.commandBar.nodes.length === 0 ? (
                <div className="text-[10px] text-slate-500 py-3 italic text-center">
                  No elements on canvas
                </div>
              ) : (
                props.panels.commandBar.nodes.map((node) => {
                  const label = node.data?.label || node.id;
                  const isSelected =
                    props.panels.properties.selectedNode?.id === node.id ||
                    props.panels.properties.selectedNodes.some((n) => n.id === node.id);

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }}
                      className={`flex w-full items-center gap-2 px-2 py-1 rounded text-[11px] text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#2c2c2c] text-white font-semibold border-l-2 border-[#E54D4D]'
                          : 'text-slate-400 hover:bg-[#2c2c2c]/30 hover:text-slate-200 border-l-2 border-transparent'
                      }`}
                    >
                      <span className="truncate flex-1">{label}</span>
                      <span className="text-[9px] px-1 bg-[#2c2c2c]/80 rounded text-slate-500 shrink-0">
                        {node.type || 'node'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  CENTER CANVAS                                               */}
      {/* ============================================================ */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-[#0d0f12]">
        <WorkspaceCanvas canvas={props.canvas} />

        {/* Beta badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#1e1e1e]/80 backdrop-blur-md border border-[#2c2c2c] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E54D4D]">
          <Sparkles className="w-3 h-3" />
          Buzz Beta
        </div>

        {/* Center hero placeholder */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-[420px] max-w-[90vw]">
          <div className="bg-[#1e1e1e]/95 backdrop-blur-xl border border-[#2c2c2c] rounded-2xl px-6 py-5 shadow-2xl shadow-black/40 text-center space-y-3">
            <h3 className="text-sm font-bold text-white">Buzz Marketing Workspace</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Design viral marketing diagrams, plan customer journeys, and schedule visual assets directly onto your channels.
            </p>
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-[#E54D4D] hover:bg-[#d44444] text-white px-3.5 py-1.5 text-[11px] font-semibold shadow-md shadow-rose-600/20 transition-all duration-200 cursor-pointer active:scale-[0.97]"
              >
                <Send className="w-3.5 h-3.5" />
                Publish Diagram
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-[#2c2c2c] hover:border-slate-500 text-slate-300 px-3.5 py-1.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer hover:bg-[#2c2c2c]/30"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Share Outline
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  RIGHT PANEL  – Campaign / Publish                           */}
      {/* ============================================================ */}
      <aside className="w-[241px] shrink-0 bg-[#2c2c2c] border-l border-[#333333] flex flex-col min-h-0 z-10">

        {/* user row */}
        <div className="h-11 border-b border-[#2c2c2c]/60 flex items-center justify-between px-3 shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="h-6 w-6 rounded-full object-cover border border-[#3e3e3e]" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#E54D4D] to-orange-500 text-[10px] font-bold text-white uppercase select-none">
              {username[0]}
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={props.topNav.onPlay}
              className="flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-[#2c2c2c] transition-colors cursor-pointer"
              title="Preview Campaign"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-lg bg-[#E54D4D] hover:bg-[#d44444] text-white px-2.5 py-1 text-[10px] font-semibold shadow transition-all duration-200 cursor-pointer active:scale-[0.97]"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* segmented tab selector */}
        <div className="h-10 border-b border-[#2c2c2c]/60 flex items-center px-2 shrink-0">
          {(['campaign', 'publish'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRightPanelTab(tab)}
              className={`relative px-3 py-1.5 text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                rightPanelTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
              {rightPanelTab === tab && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-[#E54D4D]" />
              )}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {hasSelection && props.shouldRenderPanels ? (
            <ErrorBoundary className="h-auto">
              <PropertiesPanel
                selectedNodes={props.panels.properties.selectedNodes}
                selectedNode={props.panels.properties.selectedNode}
                selectedEdge={props.panels.properties.selectedEdge}
                onChangeNode={props.panels.properties.onChangeNode}
                onBulkChangeNodes={props.panels.properties.onBulkChangeNodes}
                onChangeNodeType={props.panels.properties.onChangeNodeType}
                onChangeEdge={props.panels.properties.onChangeEdge}
                onDeleteNode={props.panels.properties.onDeleteNode}
                onDuplicateNode={props.panels.properties.onDuplicateNode}
                onDeleteEdge={props.panels.properties.onDeleteEdge}
                onUpdateZIndex={props.panels.properties.onUpdateZIndex}
                onFitSectionToContents={props.panels.properties.onFitSectionToContents}
                onReleaseFromSection={props.panels.properties.onReleaseFromSection}
                onBringContentsIntoSection={props.panels.properties.onBringContentsIntoSection}
                onAddMindmapChild={props.panels.properties.onAddMindmapChild}
                onAddMindmapSibling={props.panels.properties.onAddMindmapSibling}
                onAddArchitectureService={props.panels.properties.onAddArchitectureService}
                onCreateArchitectureBoundary={props.panels.properties.onCreateArchitectureBoundary}
                onApplyArchitectureTemplate={props.panels.properties.onApplyArchitectureTemplate}
                onGenerateEntityFields={props.panels.properties.onGenerateEntityFields}
                onSuggestArchitectureNode={props.panels.properties.onSuggestArchitectureNode}
                onConvertEntitySelectionToClassDiagram={props.panels.properties.onConvertEntitySelectionToClassDiagram}
                onOpenMermaidCodeEditor={props.panels.properties.onOpenMermaidCodeEditor}
                onClose={props.panels.properties.onClose}
              />
            </ErrorBoundary>
          ) : rightPanelTab === 'campaign' ? (
            /* ── Campaign tab ── */
            <div className="p-4 space-y-5">
              {/* audience */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  Audience Target
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-[#2c2c2c]/40 text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:outline-none focus:border-[#E54D4D]/50 transition-colors"
                />
              </div>

              {/* budget */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 flex items-center gap-1.5">
                  <Palette className="w-3 h-3" />
                  Estimated Budget
                </label>
                <input
                  type="text"
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(e.target.value)}
                  className="w-full bg-[#2c2c2c]/40 text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:outline-none focus:border-[#E54D4D]/50 transition-colors"
                />
              </div>

              <div className="border-t border-[#2c2c2c]/60" />

              {/* export */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  Export Options
                </label>
                <button
                  type="button"
                  onClick={() => props.topNav.onExportPNG()}
                  className="w-full bg-[#2c2c2c]/60 hover:bg-[#2c2c2c] text-white py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border border-[#3e3e3e] hover:border-[#E54D4D]/30"
                >
                  Export Buzz Map as PNG
                </button>
              </div>
            </div>
          ) : (
            /* ── Publish tab ── */
            <div className="p-4 space-y-5">
              {/* schedule */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-[#2c2c2c]/40 text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:outline-none focus:border-[#E54D4D]/50 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* queue */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  Publish Queue
                </label>
                <div className="rounded-lg bg-[#2c2c2c]/20 border border-[#2c2c2c]/60 overflow-hidden divide-y divide-[#2c2c2c]/60">
                  {[
                    { label: 'Twitter/X: Feature Launch',       status: 'Pending', color: 'text-[#E54D4D]' },
                    { label: 'LinkedIn: Architecture Visual',   status: 'Draft',   color: 'text-slate-500' },
                    { label: 'Instagram: Product Carousel',     status: 'Queued',  color: 'text-amber-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-3 py-2 text-[11px]">
                      <span className="text-slate-300 font-medium truncate">{item.label}</span>
                      <span className={`font-semibold shrink-0 ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  FLOATING HELP                                               */}
      {/* ============================================================ */}
      <div className="absolute bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => window.open('https://mnwhile-flowkit.com/docs', '_blank')}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2c2c2c] border border-[#3e3e3e] text-slate-500 hover:text-white hover:bg-[#3e3e3e] shadow-lg transition-all cursor-pointer"
          title="Help & Resources"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ============================================================ */}
      {/*  OVERLAYS                                                    */}
      {/* ============================================================ */}
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
