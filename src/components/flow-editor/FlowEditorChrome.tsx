import React, { Suspense, lazy, useState } from 'react';
import {
  Play,
  ChevronDown,
  Plus,
  Search,
  Eye,
  Sliders,
  FileText,
  Palette,
  Grid,
  Menu,
} from 'lucide-react';
import type { NodeData } from '@/lib/types';
import type { FlowEditorPanelsProps } from '@/components/FlowEditorPanels';
import type { CinematicExportRequest } from '@/services/export/cinematicExport';
import type {
  CollaborationRemotePresence,
  FlowEditorCollaborationTopNavState,
} from '@/hooks/useFlowEditorCollaboration';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { EditorPage } from '@/store/editorPageHooks';
import { useFlowStore } from '@/store';
import { useSelectionActions } from '@/store/selectionHooks';
import { useAuth } from '@/contexts/AuthContext';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { useWorkspaceDocumentActions } from '@/store/documentHooks';

const LazyToolbar = lazy(async () => {
  const module = await import('@/components/Toolbar');
  return { default: module.Toolbar };
});

const LazyPlaybackControls = lazy(async () => {
  const module = await import('@/components/PlaybackControls');
  return { default: module.PlaybackControls };
});

const LazyFlowEditorLayoutOverlay = lazy(async () => {
  const module = await import('@/components/FlowEditorLayoutOverlay');
  return { default: module.FlowEditorLayoutOverlay };
});

const LazyFlowEditorEmptyState = lazy(async () => {
  const module = await import('@/components/FlowEditorEmptyState');
  return { default: module.FlowEditorEmptyState };
});

const LazyDiffModeBanner = lazy(async () => {
  const module = await import('@/components/diagram-diff/DiffModeBanner');
  return { default: module.DiffModeBanner };
});

const LazyCollaborationPresenceOverlay = lazy(async () => {
  const module = await import('@/components/flow-editor/CollaborationPresenceOverlay');
  return { default: module.CollaborationPresenceOverlay };
});

export interface FlowEditorChromeProps {
  pages: EditorPage[];
  activePageId: string;
  topNav: {
    onSwitchPage: (pageId: string) => void;
    onAddPage: () => void;
    onClosePage: (pageId: string) => void;
    onRenamePage: (pageId: string, newName: string) => void;
    onReorderPage: (draggedPageId: string, targetPageId: string) => void;
    onExportPNG: (format?: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
    onCopyImage: (format?: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
    onUploadImageToCloud: (format?: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
    onExportSVG: () => void;
    onCopySVG: () => void;
    onUploadSVGToCloud: () => void;
    onExportPDF: () => void;
    onExportCinematic: (request: CinematicExportRequest) => void;
    onExportJSON: () => void;
    onCopyJSON: () => void;
    onUploadJSONToCloud: () => void;
    onExportMermaid: () => void;
    onDownloadMermaid: () => void;
    onDownloadPlantUML: () => void;
    onExportOpenFlowDSL: () => void;
    onDownloadOpenFlowDSL: () => void;
    onExportFigma: () => void;
    onDownloadFigma: () => void;
    onImportJSON: () => void;
    onHistory: () => void;
    onGoHome: () => void;
    onPlay: () => void;
    collaboration?: FlowEditorCollaborationTopNavState;
  };
  canvas: React.ReactNode;
  shouldRenderPanels: boolean;
  panels: FlowEditorPanelsProps;
  collaborationEnabled: boolean;
  remotePresence: CollaborationRemotePresence[];
  collaborationNodePositions?: Map<string, { x: number; y: number; width: number; height: number }>;
  layoutMessage: string;
  isLayouting: boolean;
  playback: {
    currentStepIndex: number;
    totalSteps: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onStop: () => void;
  };
  toolbar: {
    isVisible: boolean;
    onCommandBar: () => void;
    onToggleStudio: () => void;
    isStudioOpen: boolean;
    onOpenAssets: () => void;
    onAddShape: (shape: NodeData['shape'], position: { x: number; y: number }) => void;
    onAddAnnotation: (position: { x: number; y: number }) => void;
    onAddSection: (position: { x: number; y: number }) => void;
    onAddTextNode: (position: { x: number; y: number }) => void;
    onAddClassNode: (position: { x: number; y: number }) => void;
    onAddEntityNode: (position: { x: number; y: number }) => void;
    onAddMindmapNode: (position: { x: number; y: number }) => void;
    onAddJourneyNode: (position: { x: number; y: number }) => void;
    onAddArchitectureNode: (position: { x: number; y: number }) => void;
    onAddSequenceParticipant: (position: { x: number; y: number }) => void;
    onAddWireframe: (variant: string, position: { x: number; y: number }) => void;
    onUndo: () => void;
    onRedo: () => void;
    onLayout: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isSelectMode: boolean;
    onToggleSelectMode: () => void;
    isCommandBarOpen: boolean;
    onTogglePanMode: () => void;
    getCenter: () => { x: number; y: number };
  };
  emptyState?: {
    title: string;
    description: string;
    generateLabel: string;
    templatesLabel: string;
    addNodeLabel: string;
    onGenerate: () => void;
    onTemplates: () => void;
    onAddNode: () => void;
    onSuggestionClick?: (prompt: string) => void;
  };
  onShare?: () => void;
}

export function FlowEditorChrome({
  pages,
  activePageId,
  topNav,
  canvas,
  shouldRenderPanels,
  panels,
  collaborationEnabled,
  remotePresence,
  collaborationNodePositions,
  layoutMessage,
  isLayouting,
  playback,
  toolbar,
  emptyState,
  onShare,
}: FlowEditorChromeProps): React.ReactElement {
  const { user } = useAuth();
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
  const { renameDocument } = useWorkspaceDocumentActions();

  // Selected document information from store
  const activeDocument = useFlowStore((state) =>
    state.documents.find((doc) => doc.id === state.activeDocumentId)
  );
  const docName = activeDocument?.name || 'Untitled';

  // State states for renaming document & pages
  const [isEditingDocName, setIsEditingDocName] = useState(false);
  const [docNameInput, setDocNameInput] = useState(docName);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [pageRenameInput, setPageRenameInput] = useState('');

  // Right sidebar active tab
  const [rightPanelTab, setRightPanelTab] = useState<'design' | 'prototype'>('design');

  const username = user?.email ? user.email.split('@')[0] : 'rocxman';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const toolbarProps = {
    onCommandBar: toolbar.onCommandBar,
    onToggleStudio: toolbar.onToggleStudio,
    isStudioOpen: toolbar.isStudioOpen,
    onOpenAssets: toolbar.onOpenAssets,
    onAddShape: toolbar.onAddShape,
    onAddAnnotation: toolbar.onAddAnnotation,
    onAddSection: toolbar.onAddSection,
    onAddTextNode: toolbar.onAddTextNode,
    onAddClassNode: toolbar.onAddClassNode,
    onAddEntityNode: toolbar.onAddEntityNode,
    onAddMindmapNode: toolbar.onAddMindmapNode,
    onAddJourneyNode: toolbar.onAddJourneyNode,
    onAddArchitectureNode: toolbar.onAddArchitectureNode,
    onAddSequenceParticipant: toolbar.onAddSequenceParticipant,
    onAddWireframe: toolbar.onAddWireframe,
    onUndo: toolbar.onUndo,
    onRedo: toolbar.onRedo,
    onLayout: toolbar.onLayout,
    canUndo: toolbar.canUndo,
    canRedo: toolbar.canRedo,
    isSelectMode: toolbar.isSelectMode,
    onToggleSelectMode: toolbar.onToggleSelectMode,
    isCommandBarOpen: toolbar.isCommandBarOpen,
    onTogglePanMode: toolbar.onTogglePanMode,
    getCenter: toolbar.getCenter,
  };

  const playbackProps = {
    isPlaying: playback.isPlaying,
    currentStepIndex: playback.currentStepIndex,
    totalSteps: playback.totalSteps,
    onPlayPause: playback.onPlayPause,
    onNext: playback.onNext,
    onPrev: playback.onPrev,
    onStop: playback.onStop,
  };

  const isMnFlowMode = activeDocument?.name
    ? (() => {
        const nameLower = activeDocument.name.toLowerCase();
        return (
          nameLower.includes('figjam') ||
          nameLower.includes('mnflow') ||
          nameLower.includes('flowchart') ||
          nameLower.includes('board') ||
          nameLower.includes('diagram')
        );
      })()
    : false;

  const emptyStateProps = (emptyState && isMnFlowMode)
    ? {
        title: emptyState.title,
        description: emptyState.description,
        generateLabel: emptyState.generateLabel,
        templatesLabel: emptyState.templatesLabel,
        addNodeLabel: emptyState.addNodeLabel,
        onGenerate: emptyState.onGenerate,
        onTemplates: emptyState.onTemplates,
        onAddNode: emptyState.onAddNode,
        onSuggestionClick: emptyState.onSuggestionClick,
      }
    : null;

  function handleDocNameSave() {
    setIsEditingDocName(false);
    if (activeDocument && docNameInput.trim()) {
      renameDocument(activeDocument.id, docNameInput.trim());
    }
  }

  function handlePageNameSave(pageId: string) {
    setRenamingPageId(null);
    if (pageRenameInput.trim()) {
      topNav.onRenamePage(pageId, pageRenameInput.trim());
    }
  }

  const hasSelection = Boolean(
    panels.properties.selectedNode ||
      panels.properties.selectedEdge ||
      panels.properties.selectedNodes.length > 1
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1e1e1e] text-slate-200 font-sans select-none">
      
      {/* 1. Figma Dark Header / Top Nav */}
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
            onClick={topNav.onPlay}
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

      {/* 2. Workspace Content Layout */}
      <div className="flex flex-1 min-h-0 min-w-0">
        
        {/* Leftmost Thin Rail */}
        <nav className="w-12 shrink-0 bg-[#2c2c2c] border-r border-[#1e1e1e] flex flex-col items-center py-3 gap-4">
          <button
            type="button"
            onClick={topNav.onGoHome}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#3e3e3e] transition-colors"
            title="Go to Dashboard"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 border-t border-[#3e3e3e] my-1" />
          <button
            type="button"
            onClick={topNav.onHistory}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#3e3e3e] transition-colors"
            title="File History"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toolbar.onOpenAssets}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#3e3e3e] transition-colors"
            title="Asset Library"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toolbar.onCommandBar}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#3e3e3e] transition-colors"
            title="Command Bar"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </nav>

        {/* Left Pages / Layers Sidebar */}
        <aside className="w-56 shrink-0 bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col min-h-0">
          
          {/* Pages Header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="text-[11px] font-bold text-white tracking-wide">Pages</span>
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" />
              <button
                type="button"
                onClick={topNav.onAddPage}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Add Page"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pages List */}
          <div className="px-2 py-1.5 space-y-0.5 overflow-y-auto max-h-48 custom-scrollbar">
            {pages.map((page) => {
              const isSelected = page.id === activePageId;
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
                      onClick={() => topNav.onSwitchPage(page.id)}
                      onDoubleClick={() => {
                        setPageRenameInput(page.name);
                        setRenamingPageId(page.id);
                      }}
                      className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-[#0c8ce9] text-white font-semibold'
                          : 'text-slate-400 hover:bg-[#2c2c2c] hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate flex-1">{page.name}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Usage Banner Card */}
          <div className="mx-2.5 my-2.5 rounded-lg border border-[#3e3e3e] bg-[#2c2c2c]/60 p-3 text-[10px] text-slate-400">
            <p className="font-semibold text-white mb-0.5">2 free pages left</p>
            <p className="leading-tight">Upgrade for unlimited canvas structures and premium diagram types.</p>
            <button
              type="button"
              onClick={() => topNav.onHistory()}
              className="mt-2 text-[#63b3ed] hover:underline font-medium text-left cursor-pointer"
            >
              See plans that offer more
            </button>
          </div>

          <div className="border-t border-[#2c2c2c] mx-2" />

          {/* Layers List */}
          <div className="flex-1 min-h-0 flex flex-col mt-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Layers
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
              {panels.commandBar.nodes.length === 0 ? (
                <div className="text-[10px] text-slate-500 px-2.5 py-4 text-center italic">
                  No canvas elements yet
                </div>
              ) : (
                panels.commandBar.nodes.map((node) => {
                  const label = node.data?.label || node.id;
                  const isSelected =
                    panels.properties.selectedNode?.id === node.id ||
                    panels.properties.selectedNodes.some((n) => n.id === node.id);

                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => {
                        setSelectedEdgeId(null);
                        setSelectedNodeId(node.id);
                      }}
                      className={`flex w-full items-center gap-2 px-2 py-1 rounded text-[11px] text-left transition-colors ${
                        isSelected
                          ? 'bg-[#2c2c2c] text-white font-semibold border-l-2 border-[#0c8ce9]'
                          : 'text-slate-400 hover:bg-[#2c2c2c]/40 hover:text-slate-200'
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
        <main className="flex-1 min-w-0 relative flex flex-col bg-[#1e1e1e] h-full">
          <ErrorBoundary className="h-full">{canvas}</ErrorBoundary>
          
          <Suspense fallback={null}>
            <LazyDiffModeBanner />
          </Suspense>
        </main>

        {/* Right Design Sidebar Panel */}
        <aside className="w-64 shrink-0 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col min-h-0 z-10">
          
          {/* Design / Prototype Tab Headers */}
          <div className="h-10 border-b border-[#2c2c2c] flex items-center justify-between px-2">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setRightPanelTab('design')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  rightPanelTab === 'design'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Design
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('prototype')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  rightPanelTab === 'prototype'
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Prototype
              </button>
            </div>
            
            {/* Zoom Indicator */}
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer hover:bg-[#2c2c2c] px-1.5 py-1 rounded">
              <span>100%</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Properties Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {hasSelection && shouldRenderPanels ? (
              // Embedded inline Properties Panel matching the mockup!
              <ErrorBoundary className="h-auto">
                <PropertiesPanel
                  selectedNodes={panels.properties.selectedNodes}
                  selectedNode={panels.properties.selectedNode}
                  selectedEdge={panels.properties.selectedEdge}
                  onChangeNode={panels.properties.onChangeNode}
                  onBulkChangeNodes={panels.properties.onBulkChangeNodes}
                  onChangeNodeType={panels.properties.onChangeNodeType}
                  onChangeEdge={panels.properties.onChangeEdge}
                  onDeleteNode={panels.properties.onDeleteNode}
                  onDuplicateNode={panels.properties.onDuplicateNode}
                  onDeleteEdge={panels.properties.onDeleteEdge}
                  onUpdateZIndex={panels.properties.onUpdateZIndex}
                  onFitSectionToContents={panels.properties.onFitSectionToContents}
                  onReleaseFromSection={panels.properties.onReleaseFromSection}
                  onBringContentsIntoSection={panels.properties.onBringContentsIntoSection}
                  onAddMindmapChild={panels.properties.onAddMindmapChild}
                  onAddMindmapSibling={panels.properties.onAddMindmapSibling}
                  onAddArchitectureService={panels.properties.onAddArchitectureService}
                  onCreateArchitectureBoundary={panels.properties.onCreateArchitectureBoundary}
                  onApplyArchitectureTemplate={panels.properties.onApplyArchitectureTemplate}
                  onGenerateEntityFields={panels.properties.onGenerateEntityFields}
                  onSuggestArchitectureNode={panels.properties.onSuggestArchitectureNode}
                  onConvertEntitySelectionToClassDiagram={panels.properties.onConvertEntitySelectionToClassDiagram}
                  onOpenMermaidCodeEditor={panels.properties.onOpenMermaidCodeEditor}
                  onClose={panels.properties.onClose}
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
                    onClick={() => topNav.onExportPNG()}
                    className="w-full bg-[#2c2c2c]/80 hover:bg-[#3e3e3e] text-white py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border border-[#3e3e3e]"
                  >
                    Export active page to PNG
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Global Overlays & Floating Panels */}
      {collaborationEnabled && (
        <Suspense fallback={null}>
          <LazyCollaborationPresenceOverlay
            remotePresence={remotePresence}
            nodePositions={collaborationNodePositions}
          />
        </Suspense>
      )}

      {isLayouting && (
        <Suspense fallback={null}>
          <LazyFlowEditorLayoutOverlay message={layoutMessage} />
        </Suspense>
      )}

      {toolbar.isVisible ? (
        <Suspense fallback={null}>
          <LazyToolbar {...toolbarProps} />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <LazyPlaybackControls {...playbackProps} />
        </Suspense>
      )}

      {emptyStateProps && (
        <Suspense fallback={null}>
          <LazyFlowEditorEmptyState {...emptyStateProps} />
        </Suspense>
      )}
    </div>
  );
}
