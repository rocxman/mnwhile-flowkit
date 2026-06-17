import type { ReactNode } from 'react';

export interface WorkspaceSidebarShellProps {
  open: boolean;
  /** Width when open — defaults to w-60 */
  width?: string;
  /** 'left' or 'right' — controls border side */
  side?: 'left' | 'right';
  children: ReactNode;
}

/**
 * Collapsible sidebar wrapper used by the left sidebars of
 * Design, Slides, Make, Buzz, and Site workspaces.
 *
 * Animates width to 0 with overflow-hidden when `open` is false.
 */
export function WorkspaceSidebarShell({
  open,
  width = 'w-60',
  side = 'left',
  children,
}: WorkspaceSidebarShellProps) {
  const borderClass =
    side === 'left'
      ? 'border-r border-[#2c2c2c]'
      : 'border-l border-[#2c2c2c]';

  return (
    <aside
      className={`bg-[#1e1e1e] ${borderClass} flex flex-col min-h-0 z-10 transition-all duration-300 ${
        open ? `${width}` : 'w-0 border-r-0 overflow-hidden'
      }`}
    >
      {children}
    </aside>
  );
}

/**
 * Sidebar collapse toggle button — the small icon that closes the sidebar.
 */
export function SidebarCollapseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 hover:bg-[#2c2c2c] rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
      title="Collapse Sidebar"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="12"
          height="12"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
