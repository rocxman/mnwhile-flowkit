import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  HelpCircle,
  ChevronDown,
  Wand2,
  MessageSquare,
} from 'lucide-react';
import { WorkspaceProps } from './shared/workspaceTypes';
import { WorkspaceCanvas } from './shared/WorkspaceCanvas';
import { WorkspaceOverlays } from './shared/WorkspaceOverlays';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { StudioAIPanel } from '@/components/StudioAIPanel';
import { useFlowStore } from '@/store';
import { useWorkspaceDocumentActions } from '@/store/documentHooks';
import { useAuth } from '@/contexts/AuthContext';

export default function MakeWorkspace(props: WorkspaceProps): React.ReactElement {
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

        {/* AI Tab */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="flex flex-col items-center gap-1 w-full text-slate-200 cursor-pointer group"
          title="Toggle AI Panel"
        >
          <div className={`p-2 rounded-lg transition-all shadow-sm ${leftSidebarOpen ? 'bg-pink-600 text-white' : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className={`text-[9px] font-medium font-outfit transition-colors ${leftSidebarOpen ? 'text-pink-500' : 'text-slate-500 group-hover:text-slate-300'}`}>AI</span>
        </button>

        {/* Chat Tab */}
        <button
          type="button"
          onClick={props.toolbar.onCommandBar}
          className="flex flex-col items-center gap-1 w-full text-slate-400 hover:text-slate-200 cursor-pointer group"
          title="Command Bar"
        >
          <div className="p-2 rounded-lg group-hover:bg-[#3e3e3e] transition-all">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-medium font-outfit text-slate-500 group-hover:text-slate-300 transition-colors">Chat</span>
        </button>

        {/* Wand Tab */}
        <button
          type="button"
          onClick={props.toolbar.onOpenAssets}
          className="flex flex-col items-center gap-1 w-full text-slate-400 hover:text-slate-200 cursor-pointer group"
          title="Magic Tools"
        >
          <div className="p-2 rounded-lg group-hover:bg-[#3e3e3e] transition-all">
            <Wand2 className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-medium font-outfit text-slate-500 group-hover:text-slate-300 transition-colors">Tools</span>
        </button>
      </nav>

      {/* Left Sidebar: Flowpilot AI Chat Panel */}
      <aside
        className={`bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col min-h-0 z-10 transition-all duration-300 ${
          leftSidebarOpen ? 'w-80' : 'w-0 border-r-0 overflow-hidden'
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
                className="bg-[#2c2c2c] text-white px-2 py-0.5 rounded border border-pink-500 text-xs focus:outline-none w-36 font-semibold"
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
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-medium font-outfit truncate">Flowpilot AI</span>
            </div>
            {props.panels.studio.isGenerating && (
              <span className="text-[9px] text-pink-500 font-medium animate-pulse">Generating...</span>
            )}
          </div>
        </div>

        {/* AI Panel Content */}
        <div className="flex-1 overflow-hidden p-2 bg-[#1a1a1a]/50">
          <ErrorBoundary className="h-full">
            <StudioAIPanel
              onAIGenerate={props.panels.studio.onAIGenerate}
              isGenerating={props.panels.studio.isGenerating}
              streamingText={props.panels.studio.streamingText}
              retryCount={props.panels.studio.retryCount}
              onCancelGeneration={props.panels.studio.cancelGeneration}
              pendingDiff={props.panels.studio.pendingDiff}
              onConfirmDiff={props.panels.studio.onConfirmDiff}
              onDiscardDiff={props.panels.studio.onDiscardDiff}
              aiReadiness={props.panels.studio.aiReadiness}
              lastError={props.panels.studio.lastAIError}
              onClearError={props.panels.studio.onClearAIError}
              chatMessages={props.panels.studio.chatMessages}
              assistantThread={props.panels.studio.assistantThread}
              onClearChat={props.panels.studio.onClearChat}
              nodeCount={props.panels.commandBar.nodes.length}
              selectedNodeCount={props.panels.studio.selectedNodeCount}
              initialPrompt={props.panels.studio.initialPrompt}
              onInitialPromptConsumed={props.panels.studio.onInitialPromptConsumed}
            />
          </ErrorBoundary>
        </div>
      </aside>

      {/* Center Canvas */}
      <WorkspaceCanvas canvas={props.canvas} />

      {/* Right Sidebar Panel: Properties (slides in when selection is active) */}
      {hasSelection && props.shouldRenderPanels && (
        <aside className="w-64 shrink-0 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col min-h-0 z-10 animate-in slide-in-from-right duration-200">
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
                title="Preview"
              >
                <Play className="w-3.5 h-3.5 fill-slate-400 hover:fill-white" />
              </button>

              {props.onShare && (
                <button
                  type="button"
                  onClick={props.onShare}
                  className="rounded-lg bg-pink-600 hover:bg-pink-500 active:scale-98 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  Share
                </button>
              )}
            </div>
          </div>

          <div className="h-10 border-b border-[#2c2c2c] flex items-center justify-between px-3 shrink-0">
            <span className="text-xs font-semibold text-white">Properties</span>
            <button
              type="button"
              onClick={props.panels.properties.onClose}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-medium px-1.5 py-0.5 rounded hover:bg-[#2c2c2c] cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
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
          </div>
        </aside>
      )}

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

      {/* Floating Toolbar and Playback overlays */}
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
