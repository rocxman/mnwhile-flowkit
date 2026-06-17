import type { ReactNode } from 'react';

export interface WorkspaceRailButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  /** Active background color class — e.g. 'bg-[#0c8ce9]' for Design */
  accentColor?: string;
  /** Active text color class — e.g. 'text-[#0c8ce9]' for Design */
  activeTextColor?: string;
  onClick: () => void;
  title?: string;
}

/**
 * Icon + label button for the left rail.
 * Shows active state with workspace accent color when `active` is true.
 */
export function WorkspaceRailButton({
  icon,
  label,
  active = false,
  accentColor = 'bg-pink-600',
  activeTextColor = 'text-pink-500',
  onClick,
  title,
}: WorkspaceRailButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-full cursor-pointer group ${
        active ? 'text-slate-200' : 'text-slate-400 hover:text-slate-200'
      }`}
      title={title}
    >
      <div
        className={`p-2 rounded-lg transition-all shadow-sm ${
          active
            ? `${accentColor} text-white`
            : 'text-slate-400 group-hover:bg-[#3e3e3e] group-hover:text-slate-200'
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-[9px] font-medium font-outfit transition-colors ${
          active
            ? activeTextColor
            : 'text-slate-500 group-hover:text-slate-300'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
