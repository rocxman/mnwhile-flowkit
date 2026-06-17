import { useState, useCallback } from 'react';

export interface UseWorkspacePanelStateReturn {
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
}

/**
 * Shared hook for the collapsible left sidebar state used by
 * Design, Slides, Make, Buzz, and Site workspaces.
 *
 * MnFlow has no left sidebar and does not use this hook.
 */
export function useWorkspacePanelState(
  initial = true
): UseWorkspacePanelStateReturn {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(initial);

  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarOpen((prev) => !prev);
  }, []);

  return { leftSidebarOpen, setLeftSidebarOpen, toggleLeftSidebar };
}
