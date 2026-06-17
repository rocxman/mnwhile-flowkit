import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import type { AppState } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { useFlowStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { exportWhiteboardToPNG, exportWhiteboardToSVG } from '@/services/whiteboard/whiteboardExport';
import { saveWhiteboard, loadWhiteboard } from '@/services/whiteboard/whiteboardStorage';
import { saveWhiteboardToCloud, loadWhiteboardFromCloud } from '@/services/whiteboard/whiteboardCloudSync';

const Whiteboard = lazy(() =>
  import('../../Whiteboard').then((m) => ({ default: m.Whiteboard }))
);

function WhiteboardLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#1e1e1e]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading whiteboard...</p>
      </div>
    </div>
  );
}

export function WhiteboardWorkspace() {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const elementsRef = useRef<ExcalidrawElement[]>([]);
  const loadedCountRef = useRef(0);
  const sceneReadyRef = useRef(false);
  const activeDocument = useFlowStore((s) =>
    s.documents.find((d) => d.id === s.activeDocumentId)
  );
  const { user } = useAuth();

  const docName = activeDocument?.name || 'Untitled Whiteboard';

  // Load from IndexedDB on mount, fallback to cloud
  useEffect(() => {
    if (!activeDocument?.id) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state when document changes
    setHasLoaded(false);
    setElements([]);
    elementsRef.current = [];
    loadedCountRef.current = 0;
    sceneReadyRef.current = false;

    loadWhiteboard(activeDocument.id)
      .then(async (snapshot) => {
        if (cancelled) return;

        let loaded: ExcalidrawElement[] = [];

        if (snapshot?.elements && snapshot.elements.length > 0) {
          loaded = snapshot.elements;
        } else {
          // IndexedDB empty — try cloud
          try {
            const cloud = await loadWhiteboardFromCloud(activeDocument.id);
            if (!cancelled && cloud?.elements && cloud.elements.length > 0) {
              loaded = cloud.elements;
            }
          } catch (err) {
            console.error('Cloud whiteboard load failed:', err);
          }
        }

        if (!cancelled) {
          loadedCountRef.current = loaded.length;
          setElements(loaded);
          sceneReadyRef.current = true;
          setHasLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Whiteboard load failed:', err);
        if (!cancelled) setHasLoaded(true);
      });

    return () => { cancelled = true; };
  }, [activeDocument?.id]);

  // Debounced save to IndexedDB + cloud (fires after load completes)
  useEffect(() => {
    if (!activeDocument?.id || !hasLoaded) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- set status before async save
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const docId = activeDocument.id;

      saveWhiteboard(docId, elements)
        .then(() => {
          // IndexedDB saved — sync to cloud in background
          if (user) {
            saveWhiteboardToCloud(docId, docName, elements).catch((err) => {
              console.error('Cloud whiteboard save failed:', err);
            });
          }

          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        })
        .catch((err) => {
          console.error('Whiteboard save failed:', err);
          setSaveStatus('idle');
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [elements, activeDocument?.id, hasLoaded, user, docName]);

  const handleChange = useCallback(
    (newElements: ExcalidrawElement[], _appState: Partial<AppState>) => {
      // After loading saved elements, Excalidraw fires onChange([]) on init.
      // Ignore until Excalidraw starts sending real user-driven changes.
      if (sceneReadyRef.current && loadedCountRef.current > 0 && newElements.length === 0) {
        sceneReadyRef.current = false;
        return;
      }
      sceneReadyRef.current = false;

      if (elementsRef.current === newElements) return;

      elementsRef.current = newElements;
      setElements(newElements);
    },
    []
  );

  const handleExportPNG = async () => {
    try {
      await exportWhiteboardToPNG(elements, `${docName}.png`);
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  };

  const handleExportSVG = async () => {
    try {
      await exportWhiteboardToSVG(elements, `${docName}.svg`);
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  };

  const handleClear = () => {
    if (confirm('Clear all whiteboard content? This cannot be undone.')) {
      setElements([]);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1e1e1e] text-slate-200 select-none">
      {/* Header Bar */}
      <header className="h-12 shrink-0 bg-[#2c2c2c] border-b border-[#1e1e1e] flex items-center justify-between px-3 z-50">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo + Doc Name */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-white truncate">{docName}</span>
              <span className="rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 px-1.5 py-0.5 text-[8px] font-bold tracking-wide select-none">
                Whiteboard
              </span>
              {saveStatus === 'saving' && (
                <span className="text-[9px] text-slate-500 font-medium">Saving...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[9px] text-emerald-500 font-medium">Saved</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-[#3e3e3e] transition-all cursor-pointer"
            title="Clear whiteboard"
          >
            Clear
          </button>
          <div className="w-px h-4 bg-[#3e3e3e]" />
          <button
            type="button"
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-[#3e3e3e] transition-all cursor-pointer"
            title="Export as PNG"
          >
            PNG
          </button>
          <button
            type="button"
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-[#3e3e3e] transition-all cursor-pointer"
            title="Export as SVG"
          >
            SVG
          </button>
          {user && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-xs font-bold text-white uppercase select-none ml-1">
              {user.email?.[0] || '?'}
            </div>
          )}
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {hasLoaded ? (
          <Suspense fallback={<WhiteboardLoading />}>
            <Whiteboard
              initialElements={elements}
              onChange={handleChange}
            />
          </Suspense>
        ) : (
          <WhiteboardLoading />
        )}

        {/* Floating info badge */}
        <div className="absolute bottom-3 left-3 z-30 bg-[#2c2c2c]/80 border border-[#3e3e3e] rounded-lg px-2.5 py-1 text-[10px] text-slate-500 font-medium backdrop-blur-md select-none pointer-events-none">
          {elements.length} element{elements.length !== 1 ? 's' : ''} · Autosaved locally
        </div>
      </div>
    </div>
  );
}

export default WhiteboardWorkspace;
