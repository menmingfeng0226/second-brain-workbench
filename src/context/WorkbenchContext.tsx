import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ChannelPlatform, FeedbackItem, IdeaItem, IdeaPriority, SyncConflict, SyncLogItem, SyncQueueItem, SyncVersion } from '../types';
import { useFavoriteStore, useIdeaStore, useUiStore, useWorkStore, useComputedCounts } from '../store';
import type { GeneratedIdeaExtra as StoreIdeaExtra } from '../store/ideaStore';
import type { TopbarDrawerView as UiTopbarDrawer } from '../store/uiStore';
import { eventBus } from '../lib/eventBus';

type FavKey = `video:${string}` | `article:${string}`;
export type TopbarDrawerView = UiTopbarDrawer;

export interface GeneratedIdeaExtra {
  originKey: FavKey;
  originTitle: string;
  originChannel: ChannelPlatform;
  originUrl: string;
}

type WorkbenchContextShape = {
  favorites: Set<FavKey>;
  toggleFavorite: (key: FavKey) => void;
  isFavorite: (key: FavKey) => boolean;

  extraIdeas: IdeaItem[];
  generatedCount: number;
  createIdeaFromContent: (args: {
    kind: 'video' | 'article';
    id: string;
    title: string;
    channel: ChannelPlatform;
    tags: string[];
    url: string;
    hook?: string;
  }) => { id: string; title: string };

  feedbacks: FeedbackItem[];
  markFeedbackRead: (id: string) => void;
  resolveFeedback: (id: string) => void;
  ignoreFeedback: (id: string) => void;
  unreadFeedbackCount: number;

  syncQueue: SyncQueueItem[];
  syncConflicts: SyncConflict[];
  syncVersions: SyncVersion[];
  syncLogs: SyncLogItem[];
  pendingSyncCount: number;

  isPrivateMode: boolean;
  togglePrivateMode: () => void;

  topbarDrawer: TopbarDrawerView;
  openTopbarDrawer: (view: Exclude<TopbarDrawerView, null>) => void;
  closeTopbarDrawer: () => void;

  setNav: (nav: string) => void;
  navigate: (target: string) => void;
  navTarget: string;
  bumpNavTick: number;
};

const WorkbenchContext = createContext<WorkbenchContextShape | null>(null);

const oldToStoreKey = (old: FavKey): string => old;

function adaptFavMapToSet(map: Record<string, { type: string }>): Set<FavKey> {
  const s = new Set<FavKey>();
  Object.keys(map).forEach((k) => {
    if (k.startsWith('video:') || k.startsWith('article:')) s.add(k as FavKey);
  });
  return s;
}

const uid5 = () => Math.random().toString(36).slice(2, 7);

const toIdeaItem = (e: StoreIdeaExtra): IdeaItem => {
  const kind: 'video' | 'article' = e.sourceKind === 'article' ? 'article' : 'video';
  const channels: ChannelPlatform[] = (
    e.sourceKind === 'article'
      ? (['xiaohongshu', 'wechat-official', 'zhihu'] as ChannelPlatform[])
      : (['bilibili', 'douyin', 'xiaohongshu'] as ChannelPlatform[])
  ).slice(0, 3) as ChannelPlatform[];
  return {
    id: e.id,
    title: e.title,
    hook: e.sourceTitle
      ? `我们拆解了爆款「${e.sourceTitle}」，尝试还原它的选题钩子、结构和可复用因子`
      : '选题由爆款内容拆解生成，支持一键入库',
    source: '爆款拆解',
    channels,
    status: 'idea',
    priority: kind === 'video' ? 'P1' : ('P2' as IdeaPriority),
    owner: '晨枫',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    heat: 82,
    tags: e.tags,
    usedCards: e.usedCards,
  };
};

export function WorkbenchProvider({
  children,
  onNavRequest,
  initialFeedbacks,
  initialSyncQueue,
  initialSyncConflicts,
  initialSyncVersions,
  initialSyncLogs,
}: {
  children: ReactNode;
  onNavRequest?: (target: string) => void;
  initialFeedbacks?: FeedbackItem[];
  initialSyncQueue?: SyncQueueItem[];
  initialSyncConflicts?: SyncConflict[];
  initialSyncVersions?: SyncVersion[];
  initialSyncLogs?: SyncLogItem[];
}) {
  const favMap = useFavoriteStore((s) => s.favorites);
  const toggleFav = useFavoriteStore((s) => s.toggleFavorite);
  const isFav = useFavoriteStore((s) => s.isFavorite);

  const extraIdeas = useIdeaStore((s) => s.extraIdeas);
  const generatedCount = useIdeaStore((s) => s.generatedCount);
  const createIdeaFromStore = useIdeaStore((s) => s.createIdeaFromContent);

  const feedbacksStore = useWorkStore((s) => s.feedbacks);
  const markRead = useWorkStore((s) => s.markFeedbackRead);
  const markAllRead = useWorkStore((s) => s.markAllFeedbacksRead);
  const resolveFb = useWorkStore((s) => s.resolveFeedback);
  const ignoreFb = useWorkStore((s) => s.ignoreFeedback);
  const queue = useWorkStore((s) => s.syncQueue);
  const conflicts = useWorkStore((s) => s.syncConflicts);
  const versions = useWorkStore((s) => s.syncVersions);
  const logs = useWorkStore((s) => s.syncLogs);
  const { unreadFeedbackCount, pendingSyncCount } = useComputedCounts();

  const isPrivateMode = useUiStore((s) => s.isPrivateMode);
  const togglePrivateMode = useUiStore((s) => s.togglePrivateMode);
  const topbarDrawer = useUiStore((s) => s.topbarDrawer);
  const openDrawer = useUiStore((s) => s.openTopbarDrawer);
  const closeDrawer = useUiStore((s) => s.closeTopbarDrawer);
  const activeNav = useUiStore((s) => s.activeNav);
  const navTick = useUiStore((s) => s.navTick);
  const setActiveNav = useUiStore((s) => s.setActiveNav);
  const bumpNav = useUiStore((s) => s.bumpNavTick);

  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (seeded) return;
    setSeeded(true);
    try {
      if (initialFeedbacks && initialFeedbacks.length > 0) {
        useWorkStore.setState({ feedbacks: initialFeedbacks.map((f) => ({ ...f })) });
      }
      if (initialSyncQueue && initialSyncQueue.length > 0) {
        useWorkStore.setState({ syncQueue: initialSyncQueue.map((x) => ({ ...x })) });
      }
      if (initialSyncConflicts && initialSyncConflicts.length > 0) {
        useWorkStore.setState({ syncConflicts: initialSyncConflicts.map((x) => ({ ...x })) });
      }
      if (initialSyncVersions && initialSyncVersions.length > 0) {
        useWorkStore.setState({ syncVersions: initialSyncVersions.map((x) => ({ ...x })) });
      }
      if (initialSyncLogs && initialSyncLogs.length > 0) {
        useWorkStore.setState({ syncLogs: initialSyncLogs.map((x) => ({ ...x })) });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const favorites = useMemo(() => adaptFavMapToSet(favMap), [favMap]);

  const toggleFavorite = useCallback(
    (key: FavKey) => {
      const exists = isFav(key);
      const [type] = key.split(':') as ['video' | 'article', string];
      toggleFav(oldToStoreKey(key), { type: type === 'video' ? 'viral' : 'article' });
      eventBus.emit('toast:show', {
        type: 'success',
        title: exists ? '已取消收藏' : '已加入收藏',
        description: key,
      });
    },
    [isFav, toggleFav],
  );

  const isFavorite = useCallback((key: FavKey) => isFav(key), [isFav]);

  const markFeedbackRead = useCallback(
    (id: string) => {
      markRead(id);
      eventBus.emit('feedback:read', { id });
    },
    [markRead],
  );

  const openTopbarDrawer = useCallback(
    (view: Exclude<TopbarDrawerView, null>) => {
      openDrawer(view);
      if (view === 'feedback') {
        markAllRead();
      }
    },
    [openDrawer, markAllRead],
  );

  const setNav = useCallback(
    (nav: string) => {
      setActiveNav(nav);
      onNavRequest?.(nav);
    },
    [setActiveNav, onNavRequest],
  );

  const navigate = useCallback(
    (target: string) => {
      setActiveNav(target);
      bumpNav();
      onNavRequest?.(target);
    },
    [setActiveNav, bumpNav, onNavRequest],
  );

  const ideas = useMemo<IdeaItem[]>(() => extraIdeas.map(toIdeaItem), [extraIdeas]);

  const createIdeaFromContent: WorkbenchContextShape['createIdeaFromContent'] = useCallback(
    ({ kind, id, title, channel, tags, url }) => {
      const res = createIdeaFromStore({ kind, id, title, tags });
      void channel;
      void url;
      void uid5;
      return res;
    },
    [createIdeaFromStore],
  );

  const value = useMemo<WorkbenchContextShape>(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      extraIdeas: ideas,
      generatedCount,
      createIdeaFromContent,
      feedbacks: feedbacksStore,
      markFeedbackRead,
      resolveFeedback: resolveFb,
      ignoreFeedback: ignoreFb,
      unreadFeedbackCount,
      syncQueue: queue,
      syncConflicts: conflicts,
      syncVersions: versions,
      syncLogs: logs,
      pendingSyncCount,
      isPrivateMode,
      togglePrivateMode,
      topbarDrawer,
      openTopbarDrawer,
      closeTopbarDrawer: closeDrawer,
      setNav,
      navigate,
      navTarget: activeNav,
      bumpNavTick: navTick,
    }),
    [
      favorites,
      toggleFavorite,
      isFavorite,
      ideas,
      generatedCount,
      createIdeaFromContent,
      feedbacksStore,
      markFeedbackRead,
      resolveFb,
      ignoreFb,
      unreadFeedbackCount,
      queue,
      conflicts,
      versions,
      logs,
      pendingSyncCount,
      isPrivateMode,
      togglePrivateMode,
      topbarDrawer,
      openTopbarDrawer,
      closeDrawer,
      setNav,
      navigate,
      activeNav,
      navTick,
    ],
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error('useWorkbench must be used inside WorkbenchProvider');
  return ctx;
}
