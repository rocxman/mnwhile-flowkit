import React, { useState } from 'react';
import {
  Bot,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  Play,
  Settings2,
  Sparkles,
  Wand2,
  X,
  MousePointer2,
  Type,
  Square,
  PenTool,
  Image as ImageIcon,
  Package,
  Layers,
} from 'lucide-react';
import { WorkspaceProps } from '../shared/workspaceTypes';
import { WorkspaceCanvas } from '../shared/WorkspaceCanvas';
import { WorkspaceOverlays } from '../shared/WorkspaceOverlays';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { StudioAIPanel } from '@/components/StudioAIPanel';
import {
  useWorkspaceDocument,
  useWorkspaceUser,
  useWorkspacePanelState,
} from '../shared/hooks';

export default function MakeWorkspace(props: WorkspaceProps): React.ReactElement {
  const { docName, isEditingDocName, docNameInput, startEditDocName, setDocNameInput, saveDocName } =
    useWorkspaceDocument();
  const { username, avatarUrl } = useWorkspaceUser();
  const { leftSidebarOpen, setLeftSidebarOpen } = useWorkspacePanelState();

  const [activeTool, setActiveTool] = useState<'move' | 'frame' | 'shape' | 'pen' | 'text'>('move');

  const hasSelection = Boolean(
    props.panels.properties.selectedNode ||
      props.panels.properties.selectedEdge ||
      props.panels.properties.selectedNodes.length > 1
  );

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#1e1e1e] font-sans text-slate-200 select-none">
      {/* Left Navigation Bar - 56px wide, Figma Make style */}
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

        {/* AI / Flowpilot button */}
        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="group flex w-full flex-col items-center gap-1 cursor-pointer"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${leftSidebarOpen ? 'bg-[#EC6FDA] text-white shadow-sm shadow-[#EC6FDA]/25' : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'}`}>
            <Sparkles className="h-4 w-4" />
          </div>
          <span className={`text-[10px] font-medium ${leftSidebarOpen ? 'text-[#EC6FDA]' : 'text-slate-500'}`}>AI</span>
        </button>

        {/* Chat button */}
        <button
          type="button"
          onClick={props.toolbar.onCommandBar}
          className="group flex w-full flex-col items-center gap-1 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all group-hover:bg-[#3e3e3e] group-hover:text-slate-200">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">Chat</span>
        </button>

        {/* Tools button */}
        <button
          type="button"
          onClick={props.toolbar.onOpenAssets}
          className="group flex w-full flex-col items-center gap-1 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all group-hover:bg-[#3e3e3e] group-hover:text-slate-200">
            <Wand2 className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">Tools</span>
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

      {/* Left Panel - 320px (AI Chat - wider for Make) */}
      {leftSidebarOpen && (
        <aside className="z-10 flex w-80 shrink-0 flex-col border-r border-[#333333] bg-[#2c2c2c] min-h-0">
          {/* Header - Doc name + Flowpilot branding */}
          <div className="shrink-0 border-b border-[#333333] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              {isEditingDocName ? (
                <input
                  type="text"
                  value={docNameInput}
                  onChange={(e) => setDocNameInput(e.target.value)}
                  onBlur={saveDocName}
                  onKeyDown={(e) => e.key === 'Enter' && saveDocName()}
                  className="h-7 min-w-0 flex-1 rounded border border-[#EC6FDA] bg-[#383838] px-2 text-xs font-medium text-white outline-none"
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
              <button
                type="button"
                onClick={() => setLeftSidebarOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-[#3e3e3e] hover:text-white"
                title="Collapse AI panel"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
            <div className="mt-1 flex items-center gap-1.5 px-1">
              <span className="text-[10px] text-slate-500">Team project</span>
              <span className="rounded border border-[#EC6FDA]/30 bg-[#EC6FDA]/10 px-1 text-[8px] font-medium text-[#EC6FDA]">Make</span>
            </div>
          </div>

          {/* Flowpilot AI header */}
          <div className="shrink-0 border-b border-[#333333] p-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#EC6FDA] text-white">
                <Bot className="h-4 w-4" />
                {props.panels.studio.isGenerating && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#2c2c2c]">
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[11px] font-semibold text-white">Flowpilot</span>
                  <span className="rounded-full bg-[#EC6FDA]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#EC6FDA]">AI</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {props.panels.studio.isGenerating ? 'Generating…' : 'Ready to build'}
                </span>
              </div>
              {props.panels.studio.chatMessages.length > 0 && (
                <button
                  type="button"
                  onClick={props.panels.studio.onClearChat}
                  className="text-[10px] text-slate-500 transition-colors hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* AI Chat Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
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
      )}

      {/* Main Canvas Area */}
      <main className="relative flex min-w-0 flex-1 bg-[#1e1e1e]">
        <WorkspaceCanvas canvas={props.canvas} />
      </main>

      {/* Right Panel - 241px (Properties) */}
      <aside className="z-10 flex w-[241px] shrink-0 flex-col border-l border-[#333333] bg-[#2c2c2c] min-h-0">
        {/* Top bar: Multiplayer + zoom */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#333333] px-3">
          <div className="flex items-center gap-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="h-6 w-6 rounded-full border border-white/10 object-cover" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#EC6FDA] to-pink-500 text-[9px] font-bold uppercase text-white">
                {username[0]}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={props.topNav.onPlay}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-[#3e3e3e] hover:text-white"
              title="Preview"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="rounded-md bg-[#EC6FDA] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[#f088df]"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Tabs: Design / Prototype */}
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#333333] px-2">
          <div className="flex gap-0.5">
            <span className="rounded bg-[#383838] px-2 py-1 text-[11px] font-medium text-white">Design</span>
          </div>
          <span className="text-[10px] text-slate-500">100%</span>
        </div>

        {/* Properties content */}
        {hasSelection && props.shouldRenderPanels ? (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#333333] px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-[#EC6FDA]" />
                <span className="text-[10px] font-medium text-slate-300">Properties</span>
              </div>
              <button
                type="button"
                onClick={props.panels.properties.onClose}
                className="flex h-5 w-5 items-center justify-center rounded text-slate-500 transition-colors hover:bg-[#3e3e3e] hover:text-white"
                title="Close properties"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
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
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar">
            <p className="text-[10px] text-slate-500 text-center mt-8">Select a node to see properties</p>
          </div>
        )}
      </aside>

      {/* Bottom Toolbar - centered, Figma style */}
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

          {/* Frame */}
          <button
            type="button"
            onClick={() => setActiveTool('frame')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'frame' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Frame (F)"
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Shape */}
          <button
            type="button"
            onClick={() => {
              setActiveTool('shape');
              props.toolbar.onAddShape('rectangle', { x: 100, y: 100 });
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'shape' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Shape (R)"
          >
            <Square className="h-4 w-4" />
          </button>

          {/* Pen */}
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              activeTool === 'pen' ? 'bg-[#383838] text-white' : 'text-slate-400 hover:bg-[#383838] hover:text-white'
            }`}
            title="Pen (P)"
          >
            <PenTool className="h-4 w-4" />
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#383838] hover:text-white"
            title="Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-[#444]" />

          {/* Comment */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#383838] hover:text-white"
            title="Comment (C)"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>

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
