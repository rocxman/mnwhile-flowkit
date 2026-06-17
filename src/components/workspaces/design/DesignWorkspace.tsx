import React, { useState } from 'react';
import {
  ChevronDown,
  Plus,
  Search,
  Eye,
  Sliders,
  FileText,
  Grid,
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
import {
  WorkspaceLogoButton,
  WorkspaceRail,
  WorkspaceRailButton,
  WorkspaceDocTitle,
  WorkspacePlayShareBar,
  SidebarCollapseButton,
  WorkspaceFloatingHelp,
} from '../shared/primitives';

export default function DesignWorkspace(props: WorkspaceProps): React.ReactElement {
  const { setSelectedNodeId, setSelectedEdgeId } = useSelectionActions();
  const { docName, isEditingDocName, docNameInput, startEditDocName, setDocNameInput, saveDocName } =
    useWorkspaceDocument();
  const { username, avatarUrl } = useWorkspaceUser();
  const { leftSidebarOpen, setLeftSidebarOpen } = useWorkspacePanelState();

  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [pageRenameInput, setPageRenameInput] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState<'design' | 'prototype'>('design');

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
      <WorkspaceRail>
        <WorkspaceLogoButton onClick={props.topNav.onGoHome} />
        <WorkspaceRailButton
          icon={<FileText className="w-4 h-4" />}
          label="File"
          active={leftSidebarOpen}
          accentColor="bg-[#0c8ce9]"
          activeTextColor="text-[#0c8ce9]"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          title="Toggle Left Sidebar"
        />
        <WorkspaceRailButton
          icon={<Grid className="w-4 h-4" />}
          label="Assets"
          onClick={props.toolbar.onOpenAssets}
          title="Open Asset Library"
        />
        <WorkspaceRailButton
          icon={<Sliders className="w-4 h-4" />}
          label="Variables"
          onClick={props.toolbar.onCommandBar}
          title="Open Command Bar / Variables"
        />
      </WorkspaceRail>

      {/* Left Pages / Layers Sidebar */}
      <aside
        className={`bg-[#1e1e1e] border-r border-[#2c2c2c] flex flex-col min-h-0 z-10 transition-all duration-300 ${
          leftSidebarOpen ? 'w-60' : 'w-0 border-r-0 overflow-hidden'
        }`}
      >
        <div className="px-3 pt-3.5 pb-2 border-b border-[#2c2c2c] shrink-0">
          <div className="flex items-center justify-between min-w-0">
            <WorkspaceDocTitle
              docName={docName}
              isEditing={isEditingDocName}
              inputValue={docNameInput}
              onStartEdit={startEditDocName}
              onInputChange={setDocNameInput}
              onSave={saveDocName}
              accentColor="border border-[#0c8ce9]"
            />
            <SidebarCollapseButton onClick={() => setLeftSidebarOpen(false)} />
          </div>
          <div className="flex items-center gap-1.5 mt-1 px-1.5">
            <span className="text-[10px] text-slate-500 font-medium font-outfit truncate">Team project</span>
            <span className="rounded bg-[#0c8ce9]/10 text-[#0c8ce9] border border-[#0c8ce9]/20 px-1.5 py-0.5 text-[8px] font-bold tracking-wide select-none">Free</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 pt-3 pb-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages</span>
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer" />
            <button type="button" onClick={props.topNav.onAddPage} className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer" title="Add Page">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-2 py-1.5 space-y-0.5 overflow-y-auto max-h-48 custom-scrollbar shrink-0">
          {props.pages.map((page) => {
            const isSelected = page.id === props.activePageId;
            const isRenaming = renamingPageId === page.id;
            return (
              <div key={page.id} className="relative group">
                {isRenaming ? (
                  <input type="text" value={pageRenameInput} onChange={(e) => setPageRenameInput(e.target.value)} onBlur={() => handlePageNameSave(page.id)} onKeyDown={(e) => e.key === 'Enter' && handlePageNameSave(page.id)} className="w-full bg-[#2c2c2c] text-white px-2 py-1 rounded border border-[#0c8ce9] text-xs focus:outline-none" autoFocus />
                ) : (
                  <button type="button" onClick={() => props.topNav.onSwitchPage(page.id)} onDoubleClick={() => { setPageRenameInput(page.name); setRenamingPageId(page.id); }} className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${isSelected ? 'bg-[#2c2c2c] text-white font-semibold' : 'text-slate-400 hover:bg-[#2c2c2c]/40 hover:text-white'}`}>
                    <FileText className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? 'text-[#0c8ce9]' : 'opacity-70'}`} />
                    <span className="truncate flex-1 font-medium">{page.name}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-2.5 my-2.5 rounded-lg border border-[#2c2c2c] bg-[#2c2c2c]/20 p-3 text-[10px] text-slate-400 shrink-0">
          <p className="font-semibold text-white mb-0.5">2 free pages left</p>
          <p className="leading-tight text-slate-500">Upgrade for unlimited canvas structures and premium diagram types.</p>
          <button type="button" onClick={() => props.topNav.onHistory()} className="mt-2 text-[#0c8ce9] hover:underline font-semibold text-left cursor-pointer">See plans that offer more</button>
        </div>

        <div className="border-t border-[#2c2c2c] mx-2 shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col mt-2">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Layers</div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 custom-scrollbar">
            {props.panels.commandBar.nodes.length === 0 ? (
              <div className="text-[10px] text-slate-500 px-2.5 py-4 text-center italic">No canvas elements yet</div>
            ) : (
              props.panels.commandBar.nodes.map((node) => {
                const label = node.data?.label || node.id;
                const isSelected = props.panels.properties.selectedNode?.id === node.id || props.panels.properties.selectedNodes.some((n) => n.id === node.id);
                return (
                  <button key={node.id} type="button" onClick={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }} className={`flex w-full items-center gap-2 px-2 py-1 rounded text-[11px] text-left transition-colors cursor-pointer ${isSelected ? 'bg-[#2c2c2c] text-white font-semibold border-l-2 border-[#0c8ce9]' : 'text-slate-400 hover:bg-[#2c2c2c]/20 hover:text-slate-200'}`}>
                    <span className="truncate flex-1">{label}</span>
                    <span className="text-[9px] px-1 bg-[#2c2c2c] rounded text-slate-500 shrink-0">{node.type || 'node'}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      <WorkspaceCanvas canvas={props.canvas} />

      {/* Right Design Sidebar Panel */}
      <aside className="w-64 shrink-0 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col min-h-0 z-10">
        <WorkspacePlayShareBar
          username={username}
          avatarUrl={avatarUrl}
          onPlay={props.topNav.onPlay}
          playTitle="Preview Presentation"
          onShare={props.onShare}
          accentColor="bg-[#0c8ce9]"
          hoverAccentColor="hover:bg-blue-600"
        />

        <div className="h-10 border-b border-[#2c2c2c] flex items-center justify-between px-2 shrink-0">
          <div className="flex items-center">
            <button type="button" onClick={() => setRightPanelTab('design')} className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${rightPanelTab === 'design' ? 'text-white border-[#0c8ce9]' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}>Design</button>
            <button type="button" onClick={() => setRightPanelTab('prototype')} className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${rightPanelTab === 'prototype' ? 'text-white border-[#0c8ce9]' : 'text-slate-500 hover:text-slate-300 border-transparent'}`}>Prototype</button>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer hover:bg-[#2c2c2c] px-2 py-1 rounded transition-all">
            <span>100%</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {hasSelection && props.shouldRenderPanels ? (
            <ErrorBoundary className="h-auto">
              <PropertiesPanel selectedNodes={props.panels.properties.selectedNodes} selectedNode={props.panels.properties.selectedNode} selectedEdge={props.panels.properties.selectedEdge} onChangeNode={props.panels.properties.onChangeNode} onBulkChangeNodes={props.panels.properties.onBulkChangeNodes} onChangeNodeType={props.panels.properties.onChangeNodeType} onChangeEdge={props.panels.properties.onChangeEdge} onDeleteNode={props.panels.properties.onDeleteNode} onDuplicateNode={props.panels.properties.onDuplicateNode} onDeleteEdge={props.panels.properties.onDeleteEdge} onUpdateZIndex={props.panels.properties.onUpdateZIndex} onFitSectionToContents={props.panels.properties.onFitSectionToContents} onReleaseFromSection={props.panels.properties.onReleaseFromSection} onBringContentsIntoSection={props.panels.properties.onBringContentsIntoSection} onAddMindmapChild={props.panels.properties.onAddMindmapChild} onAddMindmapSibling={props.panels.properties.onAddMindmapSibling} onAddArchitectureService={props.panels.properties.onAddArchitectureService} onCreateArchitectureBoundary={props.panels.properties.onCreateArchitectureBoundary} onApplyArchitectureTemplate={props.panels.properties.onApplyArchitectureTemplate} onGenerateEntityFields={props.panels.properties.onGenerateEntityFields} onSuggestArchitectureNode={props.panels.properties.onSuggestArchitectureNode} onConvertEntitySelectionToClassDiagram={props.panels.properties.onConvertEntitySelectionToClassDiagram} onOpenMermaidCodeEditor={props.panels.properties.onOpenMermaidCodeEditor} onClose={props.panels.properties.onClose} />
            </ErrorBoundary>
          ) : (
            <div className="p-4 space-y-5">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Styles</h4>
                  <Plus className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                </div>
                <p className="text-[11px] text-slate-500 italic">No styles defined in this project</p>
              </div>
              <div className="border-t border-[#2c2c2c]" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Export</h4>
                  <Plus className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer" />
                </div>
                <button type="button" onClick={() => props.topNav.onExportPNG()} className="w-full bg-[#2c2c2c]/80 hover:bg-[#3e3e3e] text-white py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border border-[#3e3e3e]">Export active page to PNG</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <WorkspaceFloatingHelp />
      <WorkspaceOverlays collaborationEnabled={props.collaborationEnabled} remotePresence={props.remotePresence} collaborationNodePositions={props.collaborationNodePositions} isLayouting={props.isLayouting} layoutMessage={props.layoutMessage} toolbar={props.toolbar} playback={props.playback} />
    </div>
  );
}
