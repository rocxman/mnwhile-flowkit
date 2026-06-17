import React, { Suspense, lazy } from 'react';
import type { WorkspaceProps } from './workspaceTypes';

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

const LazyCollaborationPresenceOverlay = lazy(async () => {
  const module = await import('@/components/flow-editor/CollaborationPresenceOverlay');
  return { default: module.CollaborationPresenceOverlay };
});

export interface WorkspaceOverlaysProps {
  collaborationEnabled: boolean;
  remotePresence: WorkspaceProps['remotePresence'];
  collaborationNodePositions?: WorkspaceProps['collaborationNodePositions'];
  isLayouting: boolean;
  layoutMessage: string;
  toolbar: WorkspaceProps['toolbar'];
  playback: WorkspaceProps['playback'];
  emptyState?: WorkspaceProps['emptyState'];
}

export const WorkspaceOverlays: React.FC<WorkspaceOverlaysProps> = ({
  collaborationEnabled,
  remotePresence,
  collaborationNodePositions,
  isLayouting,
  layoutMessage,
  toolbar,
  playback,
  emptyState,
}) => {
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

  return (
    <>
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

      {emptyState && (
        <Suspense fallback={null}>
          <LazyFlowEditorEmptyState {...emptyState} />
        </Suspense>
      )}
    </>
  );
};
