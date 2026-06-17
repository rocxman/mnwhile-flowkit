import { useAuth } from '@/contexts/AuthContext';

export interface UseWorkspaceUserReturn {
  user: ReturnType<typeof useAuth>['user'];
  username: string;
  avatarUrl: string | undefined;
}

/**
 * Shared hook deriving the user identity used across every workspace shell:
 *   - `username`  → email prefix, fallback 'rocxman'
 *   - `avatarUrl` → Supabase user_metadata avatar/picture field
 *
 * Extracted from the 5 non-MnFlow workspaces which all duplicated these 3 lines.
 */
export function useWorkspaceUser(): UseWorkspaceUserReturn {
  const { user } = useAuth();
  const username = user?.email ? user.email.split('@')[0] : 'rocxman';
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  return { user, username, avatarUrl };
}
