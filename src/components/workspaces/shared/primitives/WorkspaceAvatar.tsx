export interface WorkspaceAvatarProps {
  username: string;
  avatarUrl?: string;
  /** Size class — defaults to h-7 w-7 */
  size?: string;
}

/**
 * User avatar with image-first / initials-fallback pattern.
 * Used in the right sidebar top bar of every workspace.
 */
export function WorkspaceAvatar({
  username,
  avatarUrl,
  size = 'h-7 w-7',
}: WorkspaceAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${size} rounded-full object-cover border border-[#3e3e3e]`}
      />
    );
  }

  return (
    <div
      className={`flex ${size} items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xs font-bold text-white uppercase select-none`}
    >
      {username[0]}
    </div>
  );
}
