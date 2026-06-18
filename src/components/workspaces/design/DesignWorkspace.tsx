import React, { useState } from 'react';
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
  Menu,
  Minus,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Square,
  PenTool,
  Type,
  MessageSquare,
  Image as ImageIcon,
  Star,
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

export default function DesignWorkspace(props: WorkspaceProps): React.ReactElement {
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
  const { docName, isEditingDocName, docNameInput, startEditDocName, setDocNameInput, saveDocName } =
    useWorkspaceDocument();
  const { username, avatarUrl } = useWorkspaceUser();
  const { leftSidebarOpen, setLeftSidebarOpen } = useWorkspacePanelState();

  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [pageRenameInput, setPageRenameInput] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState<'design' | 'prototype'>('design');
  const [activeTool, setActiveTool] = useState<'move' | 'frame' | 'shape' | 'pen' | 'text'>('move');

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
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#cecece] font-sans select-none text-[11px]">
      {/* Left Rail — 56px */}
      <nav className="w-14 shrink-0 bg-[#2c2c2c] border-r border-[#333333] flex flex-col items-center py-2 z-20">
        {/* Figma logo / Main menu */}
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#cecece] hover:bg-[#383838] rounded transition-colors cursor-pointer mb-1" title="Main menu">
          <svg className="w-5 h-5" viewBox="0 0 9144 7789.32" fill="none"><path fill="currentColor" d="M3008.52 3828.91l-10.02 -2220.07 -1476.14 0.12 -0.22 6154.48 1400.99 -2.12 1612.4 -3775.19 -5.38 3775.81 1543.65 1.59 1522.8 -3734.4 -6.77 3731.05 1522.29 2.42 1.64 -7728.18 -1483.83 1.12 -1549.34 3677.44 -21.48 -3681.36 -1498.94 -5.83 -1551.65 3803.12zm-2978.28 -2209.71l1492.03 -10.41 -3.85 -1474.92 -1487.08 4.88 -1.1 1480.45z"/></svg>
        </button>
        <div className="w-4 h-px bg-[#444444] my-2" />
        {/* File */}
        <button type="button" onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="flex flex-col items-center gap-0.5 w-full cursor-pointer group" title="File">
          <div className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${leftSidebarOpen ? 'bg-[#0c8ce9] text-white' : 'text-[#999999] group-hover:bg-[#383838] group-hover:text-[#cecece]'}`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className={`text-[10px] leading-tight ${leftSidebarOpen ? 'text-[#0c8ce9]' : 'text-[#999999] group-hover:text-[#cecece]'}`}>File</span>
        </button>
        {/* Assets */}
        <button type="button" onClick={props.toolbar.onOpenAssets} className="flex flex-col items-center gap-0.5 w-full text-[#999999] hover:text-[#cecece] cursor-pointer group" title="Assets">
          <div className="w-8 h-8 flex items-center justify-center rounded group-hover:bg-[#383838] transition-colors"><Grid className="w-4 h-4" /></div>
          <span className="text-[10px] leading-tight group-hover:text-[#cecece]">Assets</span>
        </button>
        <div className="w-4 h-px bg-[#444444] my-2" />
        {/* Variables */}
        <button type="button" onClick={props.toolbar.onCommandBar} className="flex flex-col items-center gap-0.5 w-full text-[#999999] hover:text-[#cecece] cursor-pointer group" title="Variables">
          <div className="w-8 h-8 flex items-center justify-center rounded group-hover:bg-[#383838] transition-colors"><Sliders className="w-4 h-4" /></div>
          <span className="text-[10px] leading-tight group-hover:text-[#cecece]">Variables</span>
        </button>
      </nav>

      {/* Left Panel — 240px */}
      <aside className={`bg-[#2c2c2c] border-r border-[#333333] flex flex-col min-h-0 z-10 transition-all duration-150 ${leftSidebarOpen ? 'w-60' : 'w-0 border-r-0 overflow-hidden'}`}>
        {/* File name + menu */}
        <div className="px-3 pt-2 pb-2 shrink-0">
          <div className="flex items-center justify-between min-w-0 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {isEditingDocName ? (
                <input type="text" value={docNameInput} onChange={(e) => setDocNameInput(e.target.value)} onBlur={saveDocName} onKeyDown={(e) => { if (e.key === 'Enter') saveDocName(); }} className="bg-[#1e1e1e] text-[#cecece] px-2 py-1 rounded border border-[#0c8ce9] text-[11px] focus:outline-none w-36 font-semibold" autoFocus />
              ) : (
                <button type="button" onClick={startEditDocName} className="text-[11px] font-semibold text-[#cecece] hover:bg-[#383838] px-1.5 py-1 rounded flex items-center gap-1 transition-colors truncate max-w-[200px]" title="Rename">
                  <span className="truncate">{docName}</span>
                  <button type="button" className="w-4 h-4 flex items-center justify-center text-[#999999] hover:text-[#cecece]"><Menu className="w-3 h-3" /></button>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="w-5 h-5 flex items-center justify-center text-[#999999] hover:bg-[#383838] rounded transition-colors"><Star className="w-3 h-3" /></button>
              <button type="button" onClick={() => setLeftSidebarOpen(false)} className="w-5 h-5 flex items-center justify-center text-[#999999] hover:bg-[#383838] rounded transition-colors" title="Collapse">
                <Minus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-[#999999] truncate">Team project</span>
            <span className="bg-[#0c8ce9]/10 text-[#0c8ce9] px-1 py-0.5 text-[9px] font-semibold rounded">Free</span>
          </div>
        </div>

        {/* Pages */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-[#cecece]">Pages</span>
            <button type="button" onClick={props.topNav.onAddPage} className="w-4 h-4 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors" title="Add page">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button type="button" className="w-4 h-4 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors">
            <Search className="w-3 h-3" />
          </button>
        </div>

        <div className="px-2 pb-2 space-y-0.5 overflow-y-auto max-h-40 shrink-0">
          {props.pages.map((page) => {
            const isSelected = page.id === props.activePageId;
            const isRenaming = renamingPageId === page.id;
            return (
              <div key={page.id} className="relative group">
                {isRenaming ? (
                  <input type="text" value={pageRenameInput} onChange={(e) => setPageRenameInput(e.target.value)} onBlur={() => handlePageNameSave(page.id)} onKeyDown={(e) => e.key === 'Enter' && handlePageNameSave(page.id)} className="w-full bg-[#1e1e1e] text-[#cecece] px-2 py-1 rounded border border-[#0c8ce9] text-[11px] focus:outline-none" autoFocus />
                ) : (
                  <button type="button" onClick={() => props.topNav.onSwitchPage(page.id)} onDoubleClick={() => { setPageRenameInput(page.name); setRenamingPageId(page.id); }} className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] text-left transition-colors cursor-pointer ${isSelected ? 'bg-[#383838] text-[#cecece]' : 'text-[#999999] hover:bg-[#383838]/50 hover:text-[#cecece]'}`}>
                    <FileText className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#0c8ce9]' : 'text-[#999999]'}`} />
                    <span className="truncate flex-1">{page.name}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-px bg-[#444444] mx-2 shrink-0" />

        {/* Layers */}
        <div className="flex-1 min-h-0 flex flex-col mt-1">
          <button type="button" className="flex items-center justify-between px-3 py-1 shrink-0 cursor-pointer hover:bg-[#383838] transition-colors">
            <span className="text-[11px] font-semibold text-[#cecece]">Layers</span>
            <ChevronDown className="w-3 h-3 text-[#999999]" />
          </button>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {props.panels.commandBar.nodes.length === 0 ? (
              <div className="text-[10px] text-[#999999] px-2 py-3 text-center">No layers yet</div>
            ) : (
              props.panels.commandBar.nodes.map((node) => {
                const label = node.data?.label || node.id;
                const isSelected =
                  props.panels.properties.selectedNode?.id === node.id ||
                  props.panels.properties.selectedNodes.some((n) => n.id === node.id);
                return (
                  <button key={node.id} type="button" onClick={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }} className={`flex w-full items-center gap-1.5 px-2 py-1 rounded text-[11px] text-left transition-colors cursor-pointer ${isSelected ? 'bg-[#0c8ce9]/15 text-[#cecece]' : 'text-[#999999] hover:bg-[#383838]/50 hover:text-[#cecece]'}`}>
                    <span className="truncate flex-1">{label}</span>
                    {isSelected && <Eye className="w-3 h-3 text-[#999999]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
        <WorkspaceCanvas canvas={props.canvas} />
      </div>

      {/* Right Panel — 240px */}
      <aside className="w-60 shrink-0 bg-[#2c2c2c] border-l border-[#333333] flex flex-col min-h-0 z-10">
        {/* Multiplayer + share bar */}
        <div className="h-12 border-b border-[#333333] flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="h-6 w-6 rounded-full object-cover border border-[#444444]" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#0c8ce9] to-blue-500 text-[10px] font-bold text-white uppercase">
                {username[0]}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={props.topNav.onPlay} className="w-6 h-6 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors" title="Preview">
              <Play className="w-3 h-3 fill-current" />
            </button>
            {props.onShare && (
              <button type="button" onClick={props.onShare} className="bg-[#0c8ce9] hover:bg-[#0b7bd4] text-white px-2.5 py-1 text-[11px] font-semibold rounded transition-colors">
                Share
              </button>
            )}
          </div>
        </div>

        {/* Design / Prototype tabs */}
        <div className="h-8 border-b border-[#333333] flex items-center px-3 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button type="button" onClick={() => setRightPanelTab('design')} className={`py-1 text-[11px] font-semibold transition-colors cursor-pointer relative ${rightPanelTab === 'design' ? 'text-[#cecece]' : 'text-[#999999] hover:text-[#cecece]'}`}>
              Design
              {rightPanelTab === 'design' && <div className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-[#0c8ce9]" />}
            </button>
            <button type="button" onClick={() => setRightPanelTab('prototype')} className={`py-1 text-[11px] font-semibold transition-colors cursor-pointer relative ${rightPanelTab === 'prototype' ? 'text-[#cecece]' : 'text-[#999999] hover:text-[#cecece]'}`}>
              Prototype
              {rightPanelTab === 'prototype' && <div className="absolute -bottom-[9px] left-0 right-0 h-0.5 bg-[#0c8ce9]" />}
            </button>
          </div>
          <button type="button" className="flex items-center gap-1 text-[11px] font-medium text-[#999999] hover:bg-[#383838] hover:text-[#cecece] px-1.5 py-0.5 rounded transition-colors">
            100%
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Properties */}
        <div className="flex-1 overflow-y-auto">
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
            <div className="px-3 py-3">
              {/* Empty selection frame */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Square className="w-3 h-3 text-[#999999]" />
                  <span className="text-[11px] font-semibold text-[#cecece]">Frame</span>
                </div>
                <div className="bg-[#1e1e1e] rounded p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#999999]">X</span>
                    <div className="flex items-center gap-1">
                      <input className="w-12 bg-[#2c2c2c] border border-[#444444] rounded px-1.5 py-0.5 text-[10px] text-[#cecece] text-center" placeholder="0" readOnly />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#999999]">Y</span>
                    <input className="w-12 bg-[#2c2c2c] border border-[#444444] rounded px-1.5 py-0.5 text-[10px] text-[#cecece] text-center" placeholder="0" readOnly />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#999999]">W</span>
                    <input className="w-12 bg-[#2c2c2c] border border-[#444444] rounded px-1.5 py-0.5 text-[10px] text-[#cecece] text-center" placeholder="0" readOnly />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#999999]">H</span>
                    <input className="w-12 bg-[#2c2c2c] border border-[#444444] rounded px-1.5 py-0.5 text-[10px] text-[#cecece] text-center" placeholder="0" readOnly />
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#444444] mb-4" />

              {/* Fill */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#cecece]">Fill</span>
                  <button type="button" className="w-4 h-4 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="bg-[#1e1e1e] rounded p-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded border border-[#444444] bg-[#ffffff]" />
                  <span className="text-[10px] text-[#cecece]">FFFFFF</span>
                  <span className="text-[10px] text-[#999999]">100%</span>
                </div>
              </div>

              <div className="h-px bg-[#444444] mb-4" />

              {/* Stroke */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#cecece]">Stroke</span>
                  <button type="button" className="w-4 h-4 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-[#999999] px-2 py-1">No strokes</p>
              </div>

              <div className="h-px bg-[#444444] mb-4" />

              {/* Effects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#cecece]">Effects</span>
                  <button type="button" className="w-4 h-4 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-[#999999] px-2 py-1">No effects</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom toolbar — Editor */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 bg-[#2c2c2c] border border-[#333333] rounded-lg px-1 py-1 shadow-xl">
        <button type="button" onClick={() => setActiveTool('move')} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${activeTool === 'move' ? 'bg-[#383838] text-[#cecece]' : 'text-[#999999] hover:bg-[#383838] hover:text-[#cecece]'}`} title="Move (V)">
          <MousePointer2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setActiveTool('frame')} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${activeTool === 'frame' ? 'bg-[#383838] text-[#cecece]' : 'text-[#999999] hover:bg-[#383838] hover:text-[#cecece]'}`} title="Frame (F)">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setActiveTool('shape')} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${activeTool === 'shape' ? 'bg-[#383838] text-[#cecece]' : 'text-[#999999] hover:bg-[#383838] hover:text-[#cecece]'}`} title="Rectangle (R)">
          <Square className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setActiveTool('pen')} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${activeTool === 'pen' ? 'bg-[#383838] text-[#cecece]' : 'text-[#999999] hover:bg-[#383838] hover:text-[#cecece]'}`} title="Pen (P)">
          <PenTool className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setActiveTool('text')} className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${activeTool === 'text' ? 'bg-[#383838] text-[#cecece]' : 'text-[#999999] hover:bg-[#383838] hover:text-[#cecece]'}`} title="Text (T)">
          <Type className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-[#444444] mx-0.5" />
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors" title="Comment (C)">
          <MessageSquare className="w-4 h-4" />
        </button>
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded transition-colors" title="Actions">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>
        </button>
      </div>

      {/* Bottom right — Zoom + Help */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1">
        <div className="flex items-center bg-[#2c2c2c] border border-[#333333] rounded-md">
          <button type="button" className="w-7 h-7 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded-l-md transition-colors" title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="w-7 h-7 flex items-center justify-center text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded-r-md transition-colors" title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        <button type="button" onClick={() => window.open('https://mnwhile-flowkit.com/docs', '_blank')} className="w-7 h-7 flex items-center justify-center bg-[#2c2c2c] border border-[#333333] text-[#999999] hover:bg-[#383838] hover:text-[#cecece] rounded-md transition-colors" title="Help">
          <HelpCircle className="w-3.5 h-3.5" />
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
