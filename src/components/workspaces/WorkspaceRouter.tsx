import React, { Suspense, lazy } from 'react';
import { useFlowStore } from '@/store';
import { WorkspaceProps } from './shared/workspaceTypes';

const MnFlowWorkspace = lazy(() => import('./MnFlowWorkspace'));
const DesignWorkspace = lazy(() => import('./DesignWorkspace'));
const SlidesWorkspace = lazy(() => import('./SlidesWorkspace'));
const MakeWorkspace = lazy(() => import('./MakeWorkspace'));
const BuzzWorkspace = lazy(() => import('./BuzzWorkspace'));
const SiteWorkspace = lazy(() => import('./SiteWorkspace'));
const WhiteboardWorkspace = lazy(() => import('./WhiteboardWorkspace'));

function WorkspaceLoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#1e1e1e]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
    </div>
  );
}

export function WorkspaceRouter(props: WorkspaceProps): React.ReactElement {
  const workspaceType = useFlowStore((state) => {
    const doc = state.documents.find((d) => d.id === state.activeDocumentId);
    return doc?.workspaceType ?? 'mnflow';
  });

  const Component = {
    mnflow: MnFlowWorkspace,
    design: DesignWorkspace,
    slides: SlidesWorkspace,
    make: MakeWorkspace,
    buzz: BuzzWorkspace,
    site: SiteWorkspace,
    whiteboard: WhiteboardWorkspace,
  }[workspaceType];

  return (
    <Suspense fallback={<WorkspaceLoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
}
