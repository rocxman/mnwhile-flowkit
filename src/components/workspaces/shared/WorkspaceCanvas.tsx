import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const LazyDiffModeBanner = lazy(async () => {
  const module = await import('@/components/diagram-diff/DiffModeBanner');
  return { default: module.DiffModeBanner };
});

export interface WorkspaceCanvasProps {
  canvas: React.ReactNode;
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ canvas }) => {
  return (
    <main className="flex-1 min-w-0 relative flex flex-col bg-[#1e1e1e] h-full">
      <ErrorBoundary className="h-full">{canvas}</ErrorBoundary>
      
      <Suspense fallback={null}>
        <LazyDiffModeBanner />
      </Suspense>
    </main>
  );
};
