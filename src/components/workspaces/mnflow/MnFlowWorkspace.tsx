import React from 'react';
import { WorkspaceProps } from '../shared/workspaceTypes';
import { WorkspaceHeader } from '../shared/WorkspaceHeader';
import { WorkspaceCanvas } from '../shared/WorkspaceCanvas';
import { WorkspaceOverlays } from '../shared/WorkspaceOverlays';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PropertiesPanel } from '@/components/PropertiesPanel';

export default function MnFlowWorkspace(props: WorkspaceProps): React.ReactElement {
  const hasSelection = Boolean(
    props.panels.properties.selectedNode ||
      props.panels.properties.selectedEdge ||
      props.panels.properties.selectedNodes.length > 1
  );

  const showPanel = hasSelection && props.shouldRenderPanels;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1e1e1e] text-slate-200 font-sans select-none">
      {/* ── Header: clean FigJam top bar ── */}
      <WorkspaceHeader onPlay={props.topNav.onPlay} onShare={props.onShare} />

      {/* ── Canvas + slide-in properties ── */}
      <div className="relative flex flex-1 min-h-0 min-w-0">
        <WorkspaceCanvas canvas={props.canvas} />

        {/* Properties panel — slides in from right only on selection */}
        <aside
          className={`absolute top-0 right-0 bottom-0 w-72 shrink-0 bg-[#2c2c2c] border-l border-[#3e3e3e] flex flex-col z-20 shadow-2xl shadow-black/40 transition-transform duration-200 ease-out ${
            showPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Panel header */}
          <div className="h-11 shrink-0 border-b border-[#3e3e3e] flex items-center justify-between px-4">
            <span className="text-xs font-semibold text-white tracking-wide">Properties</span>
            <button
              type="button"
              onClick={props.panels.properties.onClose}
              className="text-[11px] text-slate-400 hover:text-white font-medium px-2 py-1 rounded-md hover:bg-[#3e3e3e] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Panel body */}
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
      </div>

      {/* ── Overlays (toolbar, playback, collaboration, empty state) ── */}
      <WorkspaceOverlays
        collaborationEnabled={props.collaborationEnabled}
        remotePresence={props.remotePresence}
        collaborationNodePositions={props.collaborationNodePositions}
        isLayouting={props.isLayouting}
        layoutMessage={props.layoutMessage}
        toolbar={props.toolbar}
        playback={props.playback}
        emptyState={props.emptyState}
      />
    </div>
  );
}
