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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1e1e1e] text-slate-200 font-sans select-none">
      <WorkspaceHeader onPlay={props.topNav.onPlay} onShare={props.onShare} />

      <div className="flex flex-1 min-h-0 min-w-0">
        <WorkspaceCanvas canvas={props.canvas} />

        {/* Right Sidebar Panel: Slides in only when selection is active */}
        {hasSelection && props.shouldRenderPanels && (
          <aside className="w-64 shrink-0 bg-[#1e1e1e] border-l border-[#2c2c2c] flex flex-col min-h-0 z-10 animate-in slide-in-from-right duration-200">
            <div className="h-10 border-b border-[#2c2c2c] flex items-center justify-between px-3">
              <span className="text-xs font-semibold text-white">Properties</span>
              <button
                type="button"
                onClick={props.panels.properties.onClose}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-medium px-1.5 py-0.5 rounded hover:bg-[#2c2c2c]"
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
      </div>

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
