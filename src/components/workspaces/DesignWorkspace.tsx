import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Search,
  Eye,
  Sliders,
  FileText,
  Grid,
  Play,
  HelpCircle,
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

export default function DesignWorkspace(props: WorkspaceProps): React.ReactElement {
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();

  // Renaming page states
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [pageRenameInput, setPageRenameInput] = useState('');

  // Right sidebar active tab
  const [rightPanelTab, setRightPanelTab] = useState<'design' | 'prototype'>('design');

  // Sidebar collapse states
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

  function handlePageNameSave(pageId: string) {
    setRenamingPageId(null);
    if (pageRenameInput.trim()) {
      props.topNav.onRenamePage(pageId, pageRenameInput.trim());
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
        {/* Top Icon/Button (Meanwhile Logo) */}
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

        {/* File Tab */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="flex flex-col items-center gap-1 w-full text-slate-200 cursor-pointer group"
          title="Toggle Left Sidebar"
        >
          <div className={`p-2 rounded-lg transition-all shadow-sm ${leftSidebarOpen ? 'bg-[#0c8ce9] text-white' : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'}`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className={`text-[9px] font-medium font-outfit transition-colors ${leftSidebarOpen ? 'text-[#0c8ce9]' : 'text-slate-500 group-hover:text-slate-300'}`}>File</span>
        </button>

        {/* Assets Tab */}
        <button
          type="button"
          onClick={props.toolbar.onOpenAssets}
          className="flex flex-col items-center gap-1 w-full text-slate-400 hover:text-slate-200 cursor-pointer group"
          title="Open Asset Library"
        >
          <div className="p-2 rounded-lg group-hover:bg-[#3e3e3e] transition-all">
            <Grid className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-medium font-outfit text-slate-500 group-hover:text-slate-300 transition-colors">Assets</span>
        </button>

        {/* Variables Tab */}
        <button
          type="button"
          onClick={props.toolbar.onCommandBar}
          className="flex flex-col items-center gap-1 w-full text-slate-400 hover:text-slate-200 cursor-pointer group"
          title="Open Command Bar / Variables"
        >
          <div className="p-2 rounded-lg group-hover:bg-[#3e3e3e] transition-all">
            <Sliders className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-medium font-outfit text-slate-500 group-hover:text-slate-300 transition-colors">Variables</span>
        </button>
      </nav>

      {/* Left Pages / Layers Sidebar */}
      <aside
        className={`bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col min-h-0 z-10 transition-all duration-300 ${
          leftSidebarOpen ? 'w-60' : 'w-0 border-r-0 overflow-hidden'
        }`}
      >
        {/* Left Sidebar Header */}
        <div className="px-3 pt-3.5 pb-2 border-b border-[#2c2c2c] shrink-0">
          <div className="flex items-center justify-between min-w-0">
            {isEditingDocName ? (
              <input
                type="text"
                value={docNameInput}
                onChange={(e) => setDocNameInput(e.target.value)}
                onBlur={handleDocNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleDocNameSave()}
                className="bg-[#2c2c2c] text-white px-2 py-0.5 rounded border border-[#0c8ce9] text-xs focus:outline-none w-36 font-semibold"
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
            <span className="rounded bg-[#0c8ce9]/10 text-[#0c8ce9] border border-[#0c8ce9]/20 px-1.5 py-0.5 text-[8px] font-bold tracking-wide select-none">
              Free
            </span>
          </div>
        </div>

        {/* Pages Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages</span>
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" />
            <button
              type="button"
              onClick={props.topNav.onAddPage}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              title="Add Page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pages List */}
        <div className="px-2 py-1.5 space-y-0.5 overflow-y-auto max-h-48 custom-scrollbar shrink-0">
          {props.pages.map((page) => {
            const isSelected = page.id === props.activePageId;
            const isRenaming = renamingPageId === page.id;

            return (
              <div key={page.id} className="relative group">
                {isRenaming ? (
                  <input
                    type="text"
                    value={pageRenameInput}
                    onChange={(e) => setPageRenameInput(e.target.value)}
                    onBlur={() => handlePageNameSave(page.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePageNameSave(page.id)}
                    className="w-full bg-[#2c2c2c] text-white px-2 py-1 rounded border border-[#0c8ce9] text-xs focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => props.topNav.onSwitchPage(page.id)}
                    onDoubleClick={() => {
                      setPageRenameInput(page.name);
                      setRenamingPageId(page.id);
                    }}
                    className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2c2c2c] text-white font-semibold'
                        : 'text-slate-400 hover:bg-[#2c2c2c]/40 hover:text-white'
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? 'text-[#0c8ce9]' : 'opacity-70'}`} />
                    <span className="truncate flex-1 font-medium">{page.name}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Usage Banner Card */}
        <div className="mx-2.5 my-2.5 rounded-lg border border-[#2c2c2c] bg-[#2c2c2c]/20 p-3 text-[10px] text-slate-400 shrink-0">
          <p className="font-semibold text-white mb-0.5">2 free pages left</p>
          <p className="leading-tight text-slate-500">Upgrade for unlimited canvas structures and premium diagram types.</p>
          <button
            type="button"
            onClick={() => props.topNav.onHistory()}
            className="mt-2 text-[#0c8ce9] hover:underline font-semibold text-left cursor-pointer"
          >
            See plans that offer more
          </button>
        </div>

        <div className="border-t border-[#2c2c2c] mx-2 shrink-0" />

        {/* Layers List */}
        <div className="flex-1 min-h-0 flex flex-col mt-2">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Layers
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 custom-scrollbar">
            {props.panels.commandBar.nodes.length === 0 ? (
              <div className="text-[10px] text-slate-500 px-2.5 py-4 text-center italic">
                No canvas elements yet
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
                        ? 'bg-[#2c2c2c] text-white font-semibold border-l-2 border-[#0c8ce9]'
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
      </aside>

      {/* Center Canvas area */}
      <WorkspaceCanvas canvas={props.canvas} />

      {/* Right Design Sidebar Panel */}
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
              title="Preview Presentation"
            >
              <Play className="w-3.5 h-3.5 fill-slate-400 hover:fill-white" />
            </button>
            
            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-lg bg-[#0c8ce9] hover:bg-blue-600 active:scale-98 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Design / Prototype Tab Headers */}
        <div className="h-10 border-b border-[#2c2c2c] flex items-center justify-between px-2 shrink-0">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setRightPanelTab('design')}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                rightPanelTab === 'design'
                  ? 'text-white border-[#0c8ce9]'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Design
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab('prototype')}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                rightPanelTab === 'prototype'
                  ? 'text-white border-[#0c8ce9]'
                  : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              Prototype
            </button>
          </div>

          {/* Zoom Indicator */}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer hover:bg-[#2c2c2c] px-2 py-1 rounded transition-all">
            <span>100%</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        {/* Properties Area */}
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
          ) : (
            // Standard layout properties when nothing is selected
            <div className="p-4 space-y-5">
              {/* Page Swatch */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Page</h4>
                <div className="flex items-center justify-between bg-[#2c2c2c]/40 p-2 rounded-lg border border-[#2c2c2c]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border border-[#3e3e3e] bg-[#1e1e1e] shrink-0" />
                    <span className="text-xs font-semibold text-white">#1E1E1E</span>
                    <span className="text-[10px] text-slate-500 font-medium">100%</span>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" />
                </div>
              </div>

              <div className="border-t border-[#2c2c2c]" />

              {/* Local Styles Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Styles</h4>
                  <Plus className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                </div>
                <p className="text-[11px] text-slate-500 italic">No styles defined in this project</p>
              </div>

              <div className="border-t border-[#2c2c2c]" />

              {/* Export Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Export</h4>
                  <Plus className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                </div>
                <button
                  type="button"
                  onClick={() => props.topNav.onExportPNG()}
                  className="w-full bg-[#2c2c2c]/80 hover:bg-[#3e3e3e] text-white py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border border-[#3e3e3e]"
                >
                  Export active page to PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Floating help question mark button in bottom right corner */}
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
