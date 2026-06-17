import React, { useRef, useCallback, memo } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

export interface WhiteboardProps {
  initialElements?: ExcalidrawElement[];
  onChange?: (elements: ExcalidrawElement[], appState: Partial<AppState>) => void;
}

export const Whiteboard = memo(function Whiteboard({ initialElements, onChange }: WhiteboardProps) {
  const excalidrawAPI = useRef<ExcalidrawImperativeAPI>(null);
  const initialElementsRef = useRef(initialElements);
  const readyRef = useRef(false);
  const sceneLoadedRef = useRef(false);
  const frameCountRef = useRef(0);
  const renderStartRef = useRef<number | null>(null);
  const hasLoggedPerformanceRef = useRef(false);

  const handleAPIReady = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      excalidrawAPI.current = api;
      readyRef.current = true;
      renderStartRef.current = performance.now();

      if (initialElementsRef.current && initialElementsRef.current.length > 0) {
        api.updateScene({ elements: initialElementsRef.current });
        sceneLoadedRef.current = true;
        frameCountRef.current = 0;
      } else {
        sceneLoadedRef.current = true;
      }
    },
    []
  );

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: Partial<AppState>) => {
      if (!readyRef.current || !sceneLoadedRef.current) return;

      if (frameCountRef.current < 2) {
        frameCountRef.current++;
        return;
      }

      onChange?.([...elements], appState);

      if (elements.length === 100 && renderStartRef.current && !hasLoggedPerformanceRef.current) {
        const renderTime = performance.now() - renderStartRef.current;
        console.info('[Whiteboard] 100 elements render time:', renderTime.toFixed(2), 'ms');
        hasLoggedPerformanceRef.current = true;
      }
    },
    [onChange]
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Excalidraw
        excalidrawAPI={handleAPIReady}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
          },
        }}
      />
    </div>
  );
});
