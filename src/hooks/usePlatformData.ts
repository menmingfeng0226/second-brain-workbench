import { useQuery, useQueryClient, useMutation, keepPreviousData } from '@tanstack/react-query';
import type { ChannelPlatform, ChannelData, CrawlMetricsSummary } from '@/types';
import { scheduler, type SnapshotResult, type SyncAllOptions } from '@/lib/platform/scheduler';
import { useMemo } from 'react';
import {
  channels as fallbackChannels,
  videoLabs as fallbackVideos,
  articleLabs as fallbackArticles,
  dailyViewsTrend as fallbackTrend,
  publishRecords as fallbackRecords,
} from '@/data/mockData';

const QK = {
  snapshot: ['platform', 'snapshot'] as const,
  accounts: ['platform', 'accounts'] as const,
  crawlers: ['platform', 'crawl-jobs'] as const,
};

/** 页面级别默认全量 scope：所有派生 hook 共享同一个查询，不再各自调 scheduler（避免无限级联） */
const DEFAULT_FULL_SCOPE: SyncAllOptions = {
  scope: ['profile', 'channel-metrics', 'published-list', 'viral-videos', 'viral-articles', 'trend'],
  trigger: 'page-enter',
  onlyLinked: true,
};

export type UsePlatformSnapshotOpts =
  Partial<SyncAllOptions> & { rangeStart?: string; rangeEnd?: string };

const _ensureOpts = (opts?: UsePlatformSnapshotOpts): Partial<SyncAllOptions> => {
  if (!opts) return {};
  // ⚠️ rangeStart/rangeEnd 不是 SyncAllOptions 字段，用在 Dashboard 里做客户端过滤，不要传到 syncAllPlatforms（会被 JSON.stringify 进 dedupKey 但无害，过滤掉更干净）
  const { rangeStart: _rs, rangeEnd: _re, ...rest } = opts;
  void _rs; void _re;
  return rest;
};

export function usePlatformSnapshot(opts?: UsePlatformSnapshotOpts) {
  const baseOpts = _ensureOpts(opts);
  const qc = useQueryClient();
  const query = useQuery<SnapshotResult, Error>({
    queryKey: QK.snapshot,
    queryFn: () => scheduler.syncAllPlatforms({ ...DEFAULT_FULL_SCOPE, ...baseOpts }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    placeholderData: keepPreviousData,
  });

  const trigger = useMutation<SnapshotResult, Error, SyncAllOptions | undefined>({
    mutationFn: (extra?: SyncAllOptions) =>
      scheduler.syncAllPlatforms({ ...DEFAULT_FULL_SCOPE, ...baseOpts, ...(extra ?? {}), trigger: extra?.trigger ?? 'manual' }),
    onSuccess: (s: SnapshotResult) => {
      qc.setQueryData(QK.snapshot, s);
      // ✅ 强制重算一次（不是改 queryKey，避免 5 个派生 hook 级联全量重跑）
      void qc.invalidateQueries({ queryKey: QK.snapshot, exact: true });
    },
  });

  const snap = query.data;
  const channels = snap?.channels ?? fallbackChannels;
  const videos = snap?.videos ?? fallbackVideos;
  const articles = snap?.articles ?? fallbackArticles;
  const trendSeries = snap?.trendSeries ?? fallbackTrend;
  const publishRecords = snap?.publishRecords ?? fallbackRecords;
  const dataSource = snap?.dataSource;
  const summaryByPlatform = snap?.summaryByPlatform;

  const totals: CrawlMetricsSummary & { accountCount: number } = useMemo(() => {
    let totalF = 0, mF = 0, mP = 0, mV = 0, mL = 0, mC = 0, mS = 0, mR = 0;
    let avgEng = 0, avgLikes = 0, avgViews = 0, avgRead = 0, avgListen = 0, avgWatch = 0;
    let videoCount = 0, articleCount = 0;
    let engSum = 0, likesSum = 0, viewsSum = 0, readSum = 0, watchSum = 0;
    for (const c of channels) {
      totalF += c.totalFollowers;
      mF += c.monthFollowersDelta;
      mP += c.monthPublished;
      mV += c.monthViews;
      mL += c.monthLikes;
      mC += c.monthComments;
      mS += c.monthShares;
      mR += c.monthRevenue;
    }
    const vWithHot = videos.map(ensureVideoHot);
    for (const v of vWithHot) {
      videoCount++;
      const er = typeof v.engagementRate === 'number'
        ? v.engagementRate
        : (v.views ? ((v.likes ?? 0) + (v.comments ?? 0) + (v.shares ?? 0)) / v.views : 0);
      engSum += er;
      likesSum += v.likes ?? 0;
      viewsSum += v.views ?? 0;
      watchSum += typeof v.watchSeconds === 'number' ? v.watchSeconds : (v.avgWatch ?? 0);
    }
    const aWithHot = articles.map(ensureArticleHot);
    for (const a of aWithHot) {
      articleCount++;
      const er = typeof a.engagementRate === 'number'
        ? a.engagementRate
        : (a.views ? ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)) / a.views : 0);
      engSum += er;
      likesSum += a.likes ?? 0;
      viewsSum += a.views ?? 0;
      readSum += (a.readRate ?? 0) * 100;
    }
    const all = videoCount + articleCount;
    avgEng = all ? engSum / all : 0;
    avgLikes = all ? likesSum / all : 0;
    avgViews = all ? viewsSum / all : 0;
    avgWatch = videoCount ? watchSum / videoCount : 0;
    avgRead = articleCount ? readSum / articleCount : 0;
    avgListen = 0;
    return {
      accountCount: channels.length,
      totalFollowers: totalF,
      monthFollowersDelta: mF,
      monthPublished: mP,
      monthViews: mV,
      monthLikes: mL,
      monthComments: mC,
      monthShares: mS,
      monthRevenue: mR,
      avgEngagementRate: avgEng,
      avgLikesPerPublish: avgLikes,
      avgViewsPerPublish: avgViews,
      avgReadRate: avgRead / 100,
      avgListenSeconds: avgListen,
      avgWatchSeconds: avgWatch,
    };
  }, [channels, videos, articles]);

  return {
    ...query,
    snap,
    channels,
    videos,
    articles,
    trendSeries,
    publishRecords,
    dataSource,
    summaryByPlatform,
    totals,
    lastUpdatedAt: snap?.lastUpdatedAt,
    syncNow: trigger.mutateAsync,
    isSyncing: query.isFetching || trigger.isPending,
  };
}

export function useChannels(filter?: { platforms?: ChannelPlatform[]; categories?: ChannelData['category'][] }) {
  const { channels, ...rest } = usePlatformSnapshot();
  const filtered = useMemo(() => {
    return channels.filter((c: ChannelData) => {
      if (filter?.platforms?.length && !filter.platforms.includes(c.id)) return false;
      if (filter?.categories?.length && !filter.categories.includes(c.category)) return false;
      return true;
    });
  }, [channels, filter?.platforms, filter?.categories]);
  return { channels: filtered, ...rest };
}

function ensureVideoHot(v: any) {
  if (typeof v.hotIndex === 'number') return v;
  const eng = (v.likes ?? 0) + (v.comments ?? 0) * 2 + (v.shares ?? 0) * 3 + (v.favorites ?? 0) * 1.5;
  const hot = Math.round(Math.log10(1 + (v.views ?? 1)) * 100 + eng / 100);
  return { ...v, hotIndex: hot };
}
function ensureArticleHot(a: any) {
  if (typeof a.hotIndex === 'number') return a;
  const eng = (a.likes ?? 0) + (a.comments ?? 0) * 2 + (a.shares ?? 0) * 3 + (a.collects ?? 0) * 1.5;
  const hot = Math.round(Math.log10(1 + (a.views ?? 1)) * 100 + eng / 100);
  return { ...a, hotIndex: hot };
}

export function useVideoLabs(filter?: { platforms?: ChannelPlatform[]; tags?: string[]; limit?: number }) {
  const { videos, ...rest } = usePlatformSnapshot();
  const filtered = useMemo(() => {
    let list = videos.map(ensureVideoHot);
    if (filter?.platforms?.length) list = list.filter((v) => filter.platforms!.includes(v.channel));
    if (filter?.tags?.length) list = list.filter((v) => v.tags?.some((t: string) => filter!.tags!.includes(t)));
    list.sort((a, b) => b.hotIndex - a.hotIndex);
    if (filter?.limit) list = list.slice(0, filter.limit);
    return list;
  }, [videos, filter?.platforms, filter?.tags, filter?.limit]);
  return { videos: filtered, ...rest };
}

export function useArticleLabs(filter?: { platforms?: ChannelPlatform[]; tags?: string[]; limit?: number }) {
  const { articles, ...rest } = usePlatformSnapshot();
  const filtered = useMemo(() => {
    let list = articles.map(ensureArticleHot);
    if (filter?.platforms?.length) list = list.filter((a) => filter.platforms!.includes(a.channel));
    if (filter?.tags?.length) list = list.filter((a) => a.tags?.some((t: string) => filter!.tags!.includes(t)));
    list.sort((a, b) => b.hotIndex - a.hotIndex);
    if (filter?.limit) list = list.slice(0, filter.limit);
    return list;
  }, [articles, filter?.platforms, filter?.tags, filter?.limit]);
  return { articles: filtered, ...rest };
}

export function useDailyViewsTrend(rangeStart?: string, rangeEnd?: string) {
  const { trendSeries, ...rest } = usePlatformSnapshot();
  void rangeStart; void rangeEnd;
  return { trendSeries, ...rest };
}

export function usePublishRecords(filter?: { platforms?: ChannelPlatform[] }) {
  const { publishRecords, ...rest } = usePlatformSnapshot();
  const filtered = useMemo(() => {
    if (!filter?.platforms?.length) return publishRecords;
    return publishRecords.filter((r: { platform: ChannelPlatform }) => filter.platforms!.includes(r.platform));
  }, [publishRecords, filter?.platforms]);
  return { publishRecords: filtered, ...rest };
}

export function useSyncAll() {
  const qc = useQueryClient();
  return useMutation<SnapshotResult, Error, SyncAllOptions | undefined>({
    mutationFn: (opts?: SyncAllOptions) =>
      scheduler.syncAllPlatforms({ ...DEFAULT_FULL_SCOPE, ...(opts ?? {}), trigger: opts?.trigger ?? 'manual' }),
    onSuccess: (snap: SnapshotResult) => {
      qc.setQueryData(QK.snapshot, snap);
      // ✅ 不再改 lastSyncKey（改 queryKey → 级联 N 次调度，是卡死的根因），只 set + invalidate
      void qc.invalidateQueries({ queryKey: QK.snapshot, exact: true });
    },
  });
}

export { QK };
