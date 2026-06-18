import React, { useState } from 'react';
import {
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  LayoutGrid,
  Layers,
  ExternalLink,
  ChevronDown,
  Play,
  HelpCircle,
  Plus,
  Sliders,
  Check,
  Rocket,
  FileText,
  Search,
  Lock,
  MoreHorizontal,
  Eye,
  Zap,
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
/*  Figma Sites-style workspace                                       */
/* ------------------------------------------------------------------ */

const VIEWPORT_LABELS = {
  desktop: '1200 x 800',
  tablet: '768 x 1024',
  mobile: '375 x 812',
} as const;

const SITE_PAGES = [
  { label: 'Home Page (index)', icon: Globe },
  { label: 'Pricing Plan', icon: FileText },
  { label: 'Feature Details', icon: Zap },
  { label: 'Blog List', icon: Search },
  { label: 'Contact Us', icon: ExternalLink },
] as const;

const LAYOUT_SECTIONS = [
  { label: 'Global Navbar', badge: 'Flex' },
  { label: 'Hero Splash Header', badge: 'Grid' },
  { label: '3-Column Features', badge: 'Grid' },
  { label: 'Client Logos Strip', badge: 'Flex' },
  { label: 'Dynamic FAQ Grid', badge: 'Grid' },
  { label: 'Premium Footer', badge: 'Grid' },
] as const;

export default function SiteWorkspace(props: WorkspaceProps): React.ReactElement {
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
  const { docName, isEditingDocName, docNameInput, startEditDocName, setDocNameInput, saveDocName } =
    useWorkspaceDocument();
  const { username, avatarUrl } = useWorkspaceUser();
  const { leftSidebarOpen, setLeftSidebarOpen } = useWorkspacePanelState();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [rightPanelTab, setRightPanelTab] = useState<'settings' | 'seo'>('settings');

  // Interactive local states for domain & seo settings
  const [customDomain, setCustomDomain] = useState('my-site.flowkit.app');
  const [siteTitle, setSiteTitle] = useState('My Flowkit Landing Page');
  const [siteDesc, setSiteDesc] = useState('Create and map interactive workflows with Meanwhile Flowkit.');

  const hasSelection = Boolean(
    props.panels.properties.selectedNode ||
      props.panels.properties.selectedEdge ||
      props.panels.properties.selectedNodes.length > 1
  );

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#1a1a1a] text-slate-200 font-sans select-none">
      {/* ============================================================ */}
      {/*  Left Rail — 56px icon bar                                    */}
      {/* ============================================================ */}
      <nav className="w-14 shrink-0 bg-[#2c2c2c] border-r border-[#333333] flex flex-col items-center py-3 gap-1 z-20">
        {/* MNWHILE Logo */}
        <button
          type="button"
          onClick={props.topNav.onGoHome}
          className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer mb-2"
          title="Go to Dashboard"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 9144 7789.32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M3008.52 3828.91l-10.02 -2220.07 -1476.14 0.12 -0.22 6154.48 1400.99 -2.12 1612.4 -3775.19 -5.38 3775.81 1543.65 1.59 1522.8 -3734.4 -6.77 3731.05 1522.29 2.42 1.64 -7728.18 -1483.83 1.12 -1549.34 3677.44 -21.48 -3681.36 -1498.94 -5.83 -1551.65 3803.12zm-2978.28 -2209.71l1492.03 -10.41 -3.85 -1474.92 -1487.08 4.88 -1.1 1480.45z"/>
          </svg>
        </button>

        <div className="w-6 border-t border-white/[0.06] mb-1" />

        {/* Site Builder Tab */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="flex flex-col items-center gap-0.5 w-full text-slate-200 cursor-pointer group px-1"
          title="Toggle Site Panel"
        >
          <div
            className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 ${
              leftSidebarOpen
                ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-white/[0.04]'
            }`}
          >
            <Globe className="w-[15px] h-[15px]" />
          </div>
          <span
            className={`text-[9px] font-semibold tracking-wide transition-colors ${
              leftSidebarOpen ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
            }`}
          >
            Site
          </span>
        </button>

        {/* Variables Tab */}
        <button
          type="button"
          onClick={props.toolbar.onCommandBar}
          className="flex flex-col items-center gap-0.5 w-full text-slate-500 hover:text-slate-300 cursor-pointer group px-1"
          title="Open Command Bar"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg group-hover:bg-white/[0.04] transition-colors">
            <Sliders className="w-[15px] h-[15px]" />
          </div>
          <span className="text-[9px] font-semibold tracking-wide text-slate-600 group-hover:text-slate-400 transition-colors">
            Vars
          </span>
        </button>

        {/* Spacer pushes remaining items to bottom */}
        <div className="flex-1" />

        {/* Publish status dot */}
        <div className="flex items-center justify-center h-8 w-8 rounded-lg" title="Site Published">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  Left Sidebar — Sitemap, Layout Sections, Layers              */}
      {/* ============================================================ */}
      <aside
        className={`bg-[#1e1e1e] border-r border-[#252525] flex flex-col min-h-0 z-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          leftSidebarOpen ? 'w-60' : 'w-0 border-r-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-3 pt-3 pb-2.5 border-b border-[#252525] shrink-0">
          <div className="flex items-center justify-between min-w-0">
            {isEditingDocName ? (
              <input
                type="text"
                value={docNameInput}
                onChange={(e) => setDocNameInput(e.target.value)}
                onBlur={saveDocName}
                onKeyDown={(e) => e.key === 'Enter' && saveDocName()}
                className="bg-[#2c2c2c] text-white px-2 py-1 rounded-md border border-[#6366F1] text-xs focus:outline-none focus:ring-1 focus:ring-[#6366F1]/40 w-36 font-semibold"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={startEditDocName}
                className="text-[13px] font-bold text-white hover:bg-white/[0.04] px-1.5 py-1 rounded-md flex items-center gap-1 transition-colors truncate max-w-[80%]"
                title="Rename Document"
              >
                <span className="truncate">{docName}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1 hover:bg-white/[0.06] rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5 px-1">
            <span className="text-[10px] text-slate-500 font-medium truncate">Site Builder</span>
            <span className="rounded bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-widest select-none">
              Beta
            </span>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="p-2.5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {/* Sitemap Pages */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between px-1.5 mb-1">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#6366F1]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sitemap</span>
              </div>
              <button
                type="button"
                className="w-4 h-4 flex items-center justify-center rounded text-slate-600 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Add page"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-0.5">
              {SITE_PAGES.map((page, idx) => {
                const Icon = page.icon;
                return (
                  <div
                    key={page.label}
                    className={`group flex items-center gap-2 px-2 py-[7px] rounded-md text-[11px] font-semibold cursor-pointer transition-all duration-150 ${
                      idx === 0
                        ? 'bg-[#6366F1]/[0.12] text-indigo-300 shadow-sm shadow-indigo-500/5'
                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        idx === 0 ? 'text-[#6366F1]' : 'text-slate-600 group-hover:text-slate-500'
                      }`}
                    />
                    <span className="truncate flex-1">{page.label}</span>
                    {idx === 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="border-t border-[#252525] mx-1" />

          {/* Layout Sections */}
          <section className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1.5 mb-1">
              <LayoutGrid className="w-3 h-3 text-[#6366F1]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Layout Sections</span>
            </div>
            <div className="space-y-1">
              {LAYOUT_SECTIONS.map((sec) => (
                <div
                  key={sec.label}
                  className="group flex items-center justify-between px-2.5 py-[7px] rounded-md bg-white/[0.01] border border-transparent hover:border-[#6366F1]/20 text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer transition-all duration-150"
                >
                  <span className="truncate">{sec.label}</span>
                  <span className="text-[8px] font-bold text-slate-600 bg-white/[0.04] border border-white/[0.06] px-1.5 py-[1px] rounded shrink-0 uppercase tracking-wider group-hover:text-slate-400 group-hover:border-white/[0.08] transition-colors">
                    {sec.badge}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-[#252525] mx-1" />

          {/* Layers List */}
          <section className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1.5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Layers</span>
            </div>
            <div className="space-y-0.5 max-h-44 overflow-y-auto custom-scrollbar">
              {props.panels.commandBar.nodes.length === 0 ? (
                <div className="text-[10px] text-slate-600 py-3 text-center">
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
                      onClick={() => {
                        setSelectedEdgeId(null);
                        setSelectedNodeId(node.id);
                      }}
                      className={`flex w-full items-center gap-2 px-2 py-[6px] rounded-md text-[11px] text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#6366F1]/[0.12] text-indigo-200 font-semibold'
                          : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full shrink-0 transition-colors ${
                          isSelected ? 'bg-[#6366F1]' : 'bg-slate-700'
                        }`}
                      />
                      <span className="truncate flex-1">{label}</span>
                      <span className="text-[8px] px-1 bg-white/[0.03] border border-white/[0.04] rounded text-slate-600 shrink-0 uppercase tracking-wider">
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
      {/*  Center Canvas                                                */}
      {/* ============================================================ */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-[#0c0c0e] justify-center items-center">
        {/* Floating Viewport Switcher Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 group/vp">
          <div className="bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 rounded-2xl p-1 flex items-center gap-0.5 transition-shadow duration-300 group-hover/vp:shadow-indigo-500/[0.06]">
            {(
              [
                { key: 'desktop', label: 'Desktop', Icon: Monitor },
                { key: 'tablet', label: 'Tablet', Icon: Tablet },
                { key: 'mobile', label: 'Mobile', Icon: Smartphone },
              ] as const
            ).map((vp) => (
              <button
                key={vp.key}
                type="button"
                onClick={() => setViewport(vp.key)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  viewport === vp.key
                    ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <vp.Icon className="w-3.5 h-3.5" />
                <span>{vp.label}</span>
              </button>
            ))}

            <div className="w-px h-5 bg-white/[0.06] mx-1.5" />

            <span className="text-[10px] text-slate-600 font-mono font-semibold tracking-wide px-2 select-none">
              {VIEWPORT_LABELS[viewport]}
            </span>
          </div>
        </div>

        <WorkspaceCanvas canvas={props.canvas} />

        {/* Site Beta badge */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
          <div className="bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-3 h-3" />
            <span>Site Beta</span>
          </div>
        </div>

        {/* Center CTA card */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
          <div className="bg-[#141418]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-2xl shadow-black/50 flex flex-col items-center text-center">
            {/* Icon cluster */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 mb-3">
              <Globe className="w-5 h-5 text-[#6366F1]" />
            </div>
            <h3 className="text-[13px] font-bold text-white mb-1">Site Builder Workspace</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4 max-w-xs">
              Design production-ready wireframes or map website pages and view layout updates across device viewports.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl bg-[#6366F1] hover:bg-[#5558E6] text-white px-4 py-2 text-[11px] font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200 cursor-pointer hover:shadow-indigo-500/40 active:scale-[0.97]"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Go Live</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.14] text-slate-300 hover:text-white px-4 py-2 text-[11px] font-bold transition-all duration-200 cursor-pointer active:scale-[0.97]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Live</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Right Sidebar Panel — Settings / SEO                         */}
      {/* ============================================================ */}
      <aside className="w-[241px] shrink-0 bg-[#2c2c2c] border-l border-[#333333] flex flex-col min-h-0 z-10">
        {/* Top Row: User avatar, Play, Share */}
        <div className="h-11 border-b border-[#252525] flex items-center justify-between px-3 shrink-0">
          {/* User Profile Avatar */}
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="h-6 w-6 rounded-full object-cover ring-1 ring-white/[0.06]" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] text-[9px] font-bold text-white uppercase select-none">
                {username[0]}
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[80px]">{username}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={props.topNav.onPlay}
              className="flex items-center justify-center rounded-lg h-7 w-7 text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Preview Wireframe"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg h-7 w-7 text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-lg bg-[#6366F1] hover:bg-[#5558E6] text-white px-2.5 py-1 text-[10px] font-bold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer ml-1"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Tab Headers */}
        <div className="h-9 border-b border-[#252525] flex items-center px-2 shrink-0">
          {(['settings', 'seo'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRightPanelTab(tab)}
              className={`relative px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                rightPanelTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {tab === 'settings' ? 'Settings' : 'SEO'}
              {rightPanelTab === tab && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#6366F1] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Right Sidebar Content */}
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
          ) : rightPanelTab === 'settings' ? (
            /* ---- Settings Tab ---- */
            <div className="p-3 space-y-5">
              {/* Domain */}
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-[#6366F1]" />
                  Custom Domain
                </h4>
                <div className="relative">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full bg-white/[0.02] text-[11px] text-white px-2.5 py-2 rounded-lg border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/20 transition-all placeholder:text-slate-600"
                  />
                  <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                </div>
              </section>

              {/* Publishing State */}
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Publishing</h4>
                <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">SSL Certificate</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Last Published</span>
                    <span className="text-[10px] text-slate-400">3 hours ago</span>
                  </div>
                </div>
              </section>

              <div className="border-t border-white/[0.04]" />

              {/* Export */}
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Export</h4>
                <button
                  type="button"
                  onClick={() => props.topNav.onExportPNG()}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.06] text-white py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-white/[0.06] hover:border-white/[0.1] active:scale-[0.98]"
                >
                  Export Wireframe as PNG
                </button>
              </section>
            </div>
          ) : (
            /* ---- SEO Tab ---- */
            <div className="p-3 space-y-5">
              <section className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-[#6366F1]" />
                  SEO Title
                </h4>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-white/[0.02] text-[11px] text-white px-2.5 py-2 rounded-lg border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/20 transition-all placeholder:text-slate-600"
                />
                <p className="text-[9px] text-slate-600">
                  {siteTitle.length}/60 characters
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-[#6366F1]" />
                  Meta Description
                </h4>
                <textarea
                  value={siteDesc}
                  onChange={(e) => setSiteDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-white/[0.02] text-[11px] text-white px-2.5 py-2 rounded-lg border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/20 resize-none leading-relaxed transition-all placeholder:text-slate-600"
                />
                <p className="text-[9px] text-slate-600">
                  {siteDesc.length}/160 characters
                </p>
              </section>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  Floating Help Button                                         */}
      {/* ============================================================ */}
      <div className="absolute bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => window.open('https://mnwhile-flowkit.com/docs', '_blank')}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-600 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.1] shadow-lg shadow-black/30 transition-all cursor-pointer"
          title="Help & Resources"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ============================================================ */}
      {/*  Workspace Overlays (collaboration, playback, toolbar)        */}
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
