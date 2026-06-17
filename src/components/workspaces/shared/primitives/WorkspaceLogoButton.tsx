import { MNWHILELogo } from './MNWHILELogo';

export interface WorkspaceLogoButtonProps {
  onClick: () => void;
}

/**
 * MNWHILE logo button in the rail — navigates to dashboard on click.
 * Used by all 5 non-MnFlow workspaces.
 */
export function WorkspaceLogoButton({ onClick }: WorkspaceLogoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#3e3e3e] rounded-lg transition-colors cursor-pointer mb-1"
      title="Go to Dashboard"
    >
      <MNWHILELogo className="w-5 h-5" />
    </button>
  );
}
