import { HelpCircle } from 'lucide-react';

/**
 * Floating help button (bottom-right corner).
 * Used by all 5 non-MnFlow workspaces.
 */
export function WorkspaceFloatingHelp() {
  return (
    <div className="absolute bottom-4 right-4 z-40">
      <button
        type="button"
        onClick={() => window.open('https://mnwhile-flowkit.com/docs', '_blank')}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2c2c2c] border border-[#3e3e3e] text-slate-400 hover:text-white hover:bg-[#3e3e3e] shadow-lg transition-all cursor-pointer font-bold text-sm"
        title="Help & Resources"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
