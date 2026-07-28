import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FeedbackItem, SyncQueueItem, SyncConflict, SyncVersion, SyncLogItem } from '@/types';
import { feedbacks as seedFeedbacks, syncQueue as seedQueue, syncConflicts as seedConflicts, syncVersions as seedVersions, syncLogs as seedLogs } from '@/data/mockData';
import { eventBus } from '@/lib/eventBus';

export interface WorkState {
  feedbacks: FeedbackItem[];
  syncQueue: SyncQueueItem[];
  syncConflicts: SyncConflict[];
  syncVersions: SyncVersion[];
  syncLogs: SyncLogItem[];

  markFeedbackRead: (id: string) => void;
  markAllFeedbacksRead: () => void;
  resolveFeedback: (id: string) => void;
  ignoreFeedback: (id: string) => void;

  queueTick: () => void;
  unreadFeedbackCount: number;
  pendingSyncCount: number;
}

export const useWorkStore = create<WorkState>()(
  persist(
    (set, get) => ({
      feedbacks: seedFeedbacks.map((f) => ({ ...f })),
      syncQueue: seedQueue.map((s) => ({ ...s })),
      syncConflicts: seedConflicts.map((c) => ({ ...c })),
      syncVersions: seedVersions.map((v) => ({ ...v })),
      syncLogs: seedLogs.map((l) => ({ ...l })),

      markFeedbackRead: (id) =>
        set({
          feedbacks: get().feedbacks.map((f) => (f.id === id ? { ...f, isUnread: false } : f)),
        }),

      markAllFeedbacksRead: () =>
        set({
          feedbacks: get().feedbacks.map((f) =>
            f.isUnread && f.status === 'pending' ? { ...f, isUnread: false } : f,
          ),
        }),

      resolveFeedback: (id) =>
        set({
          feedbacks: get().feedbacks.map((f) =>
            f.id === id
              ? { ...f, status: 'resolved', isUnread: false, resolvedBy: '晨枫', resolvedAt: '刚刚' }
              : f,
          ),
        }),

      ignoreFeedback: (id) =>
        set({
          feedbacks: get().feedbacks.map((f) =>
            f.id === id ? { ...f, status: 'ignored', isUnread: false } : f,
          ),
        }),

      queueTick: () => {
        eventBus.emit('sync:completed', { count: 1, timestamp: new Date().toISOString() });
      },

      unreadFeedbackCount: 0,
      pendingSyncCount: 0,
    }),
    {
      name: 'wb:work',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          feedbacks: s.feedbacks,
          syncQueue: s.syncQueue,
          syncConflicts: s.syncConflicts,
          syncVersions: s.syncVersions,
          syncLogs: s.syncLogs,
        }) as unknown as WorkState,
    },
  ),
);

export function useComputedCounts() {
  const unreadFeedbackCount = useWorkStore(
    (s) => s.feedbacks.filter((f) => f.isUnread && f.status === 'pending').length,
  );
  const pendingSyncCount = useWorkStore((s) =>
    s.syncQueue.filter((q) => ['pending', 'syncing', 'failed'].includes(q.status)).length,
  );
  return { unreadFeedbackCount, pendingSyncCount };
}

export default useWorkStore;
