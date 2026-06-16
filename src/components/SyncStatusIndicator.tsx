import { useState, useEffect } from 'react';
import { subscribeCloudSync, getCloudSyncState } from '@/services/storage/cloudSyncService';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncState {
  status: SyncStatus;
  error: string | null;
  lastSyncedAt: Date | null;
}

export function SyncStatusIndicator(): React.ReactElement {
  const [state, setState] = useState<SyncState>(() => {
    const current = getCloudSyncState();
    return {
      status: current.status,
      error: current.error,
      lastSyncedAt: current.lastSyncedAt ? new Date(current.lastSyncedAt) : null,
    };
  });

  useEffect(() => {
    const unsubscribe = subscribeCloudSync((syncState) => {
      setState({
        status: syncState.status,
        error: syncState.error,
        lastSyncedAt: syncState.lastSyncedAt ? new Date(syncState.lastSyncedAt) : null,
      });
    });

    return unsubscribe;
  }, []);

  const { status, error, lastSyncedAt } = state;

  const statusConfig: Record<SyncStatus, { text: string; className: string; icon: string }> = {
    idle: {
      text: 'Local',
      className: 'text-gray-500 dark:text-gray-400',
      icon: '○',
    },
    syncing: {
      text: 'Syncing…',
      className: 'text-blue-500 animate-pulse',
      icon: '●',
    },
    synced: {
      text: 'Synced',
      className: 'text-green-500',
      icon: '✓',
    },
    error: {
      text: error ?? 'Sync error',
      className: 'text-red-500',
      icon: '✗',
    },
  };

  const { text, className, icon } = statusConfig[status];

  const formatLastSynced = (date: Date | null): string => {
    if (!date) return '';
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2 text-xs font-medium" title={error ?? text}>
      <span className={className}>{icon}</span>
      <span className={className}>{text}</span>
      {status === 'synced' && lastSyncedAt && (
        <span className="text-gray-400 dark:text-gray-500">
          {formatLastSynced(lastSyncedAt)}
        </span>
      )}
    </div>
  );
}
