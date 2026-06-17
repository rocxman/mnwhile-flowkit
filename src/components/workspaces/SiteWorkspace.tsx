import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { WorkspaceProps } from './shared/workspaceTypes';
import { WorkspaceCanvas } from './shared/WorkspaceCanvas';
import { WorkspaceOverlays } from './shared/WorkspaceOverlays';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { useSelectionActions } from '@/store/selectionHooks';
import { useFlowStore } from '@/store';
import { useWorkspaceDocumentActions } from '@/store/documentHooks';
import { useAuth } from '@/contexts/AuthContext';

export default function SiteWorkspace(props: WorkspaceProps): React.ReactElement {
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'settings' | 'seo'>('settings');

  // Interactive local states for domain & seo settings
  const [customDomain, setCustomDomain] = useState('my-site.flowkit.app');
  const [siteTitle, setSiteTitle] = useState('My Flowkit Landing Page');
  const [siteDesc, setSiteDesc] = useState('Create and map interactive workflows with Meanwhile Flowkit.');

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

  const hasSelection = Boolean(
    props.panels.properties.selectedNode ||
      props.panels.properties.selectedEdge ||
      props.panels.properties.selectedNodes.length > 1
  );

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

        {/* Site Builder Tab */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="flex flex-col items-center gap-1 w-full text-slate-200 cursor-pointer group"
          title="Toggle Site Panel"
        >
          <div className={`p-2 rounded-lg transition-all shadow-sm ${leftSidebarOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'}`}>
            <Globe className="w-4 h-4" />
          </div>
          <span className={`text-[9px] font-medium font-outfit transition-colors ${leftSidebarOpen ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-300'}`}>Site</span>
        </button>

        {/* Tools / Variables Tab */}
        <button
          type="button"
          onClick={props.toolbar.onCommandBar}
          className="flex flex-col items-center gap-1 w-full text-slate-400 hover:text-slate-200 cursor-pointer group"
          title="Open Command Bar"
        >
          <div className="p-2 rounded-lg group-hover:bg-[#3e3e3e] transition-all">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-medium font-outfit text-slate-500 group-hover:text-slate-300 transition-colors">Variables</span>
        </button>
      </nav>

      {/* Left Sidebar: Pages & UI Sections */}
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
                className="bg-[#2c2c2c] text-white px-2 py-0.5 rounded border border-indigo-500 text-xs focus:outline-none w-36 font-semibold"
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
            <span className="text-[10px] text-slate-500 font-medium font-outfit truncate">Site Builder</span>
            <span className="rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 text-[8px] font-bold tracking-wide select-none">
              Beta
            </span>
          </div>
        </div>

        {/* Left Sidebar Content */}
        <div className="p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {/* Sitemap Pages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Sitemap Pages</label>
              </div>
              <Plus className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
            </div>
            <div className="space-y-1">
              {['Home Page (index)', 'Pricing Plan', 'Feature Details', 'Blog List', 'Contact Us'].map((page, idx) => (
                <div
                  key={page}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    idx === 0
                      ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-[#2c2c2c]/40 hover:text-white'
                  }`}
                >
                  {page}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#2c2c2c] mx-1" />

          {/* Layout Sections */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Layout Sections</label>
            </div>
            <div className="space-y-1.5">
              {['Global Navbar', 'Hero Splash Header', '3-Column Features', 'Client Logos Strip', 'Dynamic FAQ Grid', 'Premium Footer'].map((sec) => (
                <div
                  key={sec}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-[#2c2c2c] bg-[#2c2c2c]/20 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer hover:border-indigo-500/40 transition-all"
                >
                  <span>{sec}</span>
                  <span className="text-[9px] text-slate-600 bg-[#2c2c2c] px-1 rounded shrink-0">Grid</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#2c2c2c] mx-1" />

          {/* Layers List */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Layers</label>
            <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
              {props.panels.commandBar.nodes.length === 0 ? (
                <div className="text-[10px] text-slate-500 py-2 italic text-center">
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
                      className={`flex w-full items-center gap-2 px-2 py-1 rounded text-[11px] text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2c2c2c] text-white font-semibold border-l-2 border-indigo-500'
                          : 'text-slate-400 hover:bg-[#2c2c2c]/20 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate flex-1">{label}</span>
                      <span className="text-[9px] px-1 bg-[#2c2c2c] rounded text-slate-500 shrink-0">
                        {node.type || 'node'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Center Canvas */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-[#0a0d10] justify-center items-center">
        {/* Floating Viewport Switcher (Framer/Webflow style) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#2c2c2c]/90 border border-[#3e3e3e]/80 shadow-xl px-2 py-1 rounded-xl flex items-center gap-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#3e3e3e]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#3e3e3e]'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#3e3e3e]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <div className="w-px h-4 bg-[#3e3e3e] mx-1" />
          <span className="text-[10px] text-slate-500 font-bold tracking-wider px-1">
            {viewport === 'desktop' ? '1200x800' : viewport === 'tablet' ? '768x1024' : '375x812'}
          </span>
        </div>

        <WorkspaceCanvas canvas={props.canvas} />

        {/* Premium placeholder banner */}
        <div className="absolute top-4 right-4 z-20 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Site Beta</span>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-[#11161d]/95 border border-[#1b222c] px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center max-w-md text-center backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-1 font-outfit">Site Builder Workspace</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Design production-ready wireframes or map website pages and view layout updates across device viewports.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Go Live</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-[#1b222c] hover:border-slate-500 text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:bg-slate-800/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview live</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Panel */}
      <aside className="w-64 shrink-0 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col min-h-0 z-10">
        {/* Top Row: User avatar, Play, Share */}
        <div className="h-12 border-b border-[#2c2c2c] flex items-center justify-between px-3 shrink-0">
          {/* User Profile Avatar */}
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
              title="Preview Wireframe"
            >
              <Play className="w-3.5 h-3.5 fill-slate-400 hover:fill-white" />
            </button>

            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Tab Headers */}
        <div className="h-10 border-b border-[#2c2c2c] flex items-center px-2 shrink-0">
          <button
            type="button"
            onClick={() => setRightPanelTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
              rightPanelTab === 'settings'
                ? 'text-white border-indigo-600'
                : 'text-slate-500 hover:text-slate-300 border-transparent'
            }`}
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => setRightPanelTab('seo')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
              rightPanelTab === 'seo'
                ? 'text-white border-indigo-600'
                : 'text-slate-500 hover:text-slate-300 border-transparent'
            }`}
          >
            SEO / Metadata
          </button>
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
            <div className="p-4 space-y-4.5">
              {/* Domain Settings */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Custom Domain</h4>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full bg-[#2c2c2c]/40 text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Publishing State</h4>
                <div className="bg-[#2c2c2c]/30 rounded-lg p-2.5 border border-[#2c2c2c] text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSL Certificate</span>
                    <span className="text-emerald-500 font-semibold">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Published</span>
                    <span className="text-slate-300">3 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2c2c2c]" />

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Export Site</h4>
                <button
                  type="button"
                  onClick={() => props.topNav.onExportPNG()}
                  className="w-full bg-[#2c2c2c]/80 hover:bg-[#3e3e3e] text-white py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-[#3e3e3e]"
                >
                  Export Wireframe as PNG
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4.5">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">SEO Site Title</h4>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-[#2c2c2c]/40 text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-outfit">Meta Description</h4>
                <textarea
                  value={siteDesc}
                  onChange={(e) => setSiteDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-[#2c2c2c]/40 text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:outline-none focus:border-indigo-500/60 resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
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
