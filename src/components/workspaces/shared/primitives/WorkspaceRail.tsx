import type { ReactNode } from 'react';

export interface WorkspaceRailProps {
  children: ReactNode;
}

/**
 * Left thin rail container — the w-14 dark sidebar present in
 * Design, Slides, Make, Buzz, and Site workspaces.
 *
 * Children are typically MNWHILELogo + WorkspaceRailButton instances.
 */
export function WorkspaceRail({ children }: WorkspaceRailProps) {
  return (
    <nav className="w-14 shrink-0 bg-[#2c2c2c] border-r border-[#1e1e1e] flex flex-col items-center py-3.5 gap-5 z-20">
      {children}
    </nav>
  );
}
