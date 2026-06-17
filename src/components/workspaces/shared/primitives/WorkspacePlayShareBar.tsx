import { Play } from 'lucide-react';
import { WorkspaceAvatar } from './WorkspaceAvatar';

export interface WorkspacePlayShareBarProps {
  username: string;
  avatarUrl?: string;
  onPlay: () => void;
  playTitle?: string;
  onShare?: () => void;
  /** Share button accent color — e.g. 'bg-[#0c8ce9]' for Design */
  accentColor?: string;
  hoverAccentColor?: string;
}

/**
 * Top bar row containing user avatar, play button, and share button.
 * Used in the right sidebar header of every workspace.
 */
export function WorkspacePlayShareBar({
  username,
  avatarUrl,
  onPlay,
  playTitle = 'Preview',
  onShare,
  accentColor = 'bg-pink-600',
  hoverAccentColor = 'hover:bg-pink-500',
}: WorkspacePlayShareBarProps) {
  return (
    <div className="h-12 border-b border-[#2c2c2c] flex items-center justify-between px-3 shrink-0">
      <WorkspaceAvatar username={username} avatarUrl={avatarUrl} />

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPlay}
          className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-[#2c2c2c] transition-colors cursor-pointer"
          title={playTitle}
        >
          <Play className="w-3.5 h-3.5 fill-slate-400 hover:fill-white" />
        </button>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className={`rounded-lg ${accentColor} ${hoverAccentColor} active:scale-98 text-white px-3 py-1.5 text-xs font-semibold shadow transition-all cursor-pointer`}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}
