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
    <div className="flex h-screen w-screen items-center justify-center bg-[#1a1a1a]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent mx-auto mb-3" />
        <p className="text-xs text-slate-400 font-medium">Loading whiteboard...</p>
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1a1a1a] text-slate-200 select-none">
      {/* Header Bar */}
      <header className="h-12 shrink-0 bg-[#2c2c2c] border-b border-[#3e3e3e] flex items-center justify-between px-4 z-50">
        {/* Left: MNWHILE Logo + Doc Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 text-white shadow-md shadow-pink-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </div>
            <span className="text-[10px] font-black tracking-[0.22em] text-white/90 hidden sm:inline">
              MNWHILE
            </span>
          </div>
          <div className="h-4 w-px bg-[#454545] hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold text-white truncate">{docName}</span>
            <span className="rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase select-none shadow-sm shadow-pink-500/10">
              Whiteboard
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all cursor-pointer"
            title="Clear whiteboard"
          >
            Clear
          </button>
          <div className="w-px h-4 bg-[#3e3e3e]" />
          <button
            type="button"
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-[#3e3e3e] hover:shadow-sm hover:shadow-pink-500/10 transition-all cursor-pointer"
            title="Export as PNG"
          >
            PNG
          </button>
          <button
            type="button"
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-[#3e3e3e] hover:shadow-sm hover:shadow-violet-500/10 transition-all cursor-pointer"
            title="Export as SVG"
          >
            SVG
          </button>
          <div className="hidden sm:flex items-center gap-1.5 pl-1 text-[9px] text-slate-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
            <span>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'idle' && 'Autosaved'}
            </span>
          </div>
          {user && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 text-xs font-bold text-white uppercase select-none ml-1 shadow-md shadow-pink-500/20 ring-1 ring-white/10">
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

        {/* Floating element count badge */}
        <div className="absolute bottom-3 left-3 z-30 bg-[#2c2c2c]/90 border border-[#3e3e3e]/80 rounded-xl px-3 py-1.5 text-[10px] text-slate-500 font-medium backdrop-blur-md select-none pointer-events-none shadow-lg">
          <span className="text-slate-300 font-bold">{elements.length}</span> element{elements.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

export default WhiteboardWorkspace;
