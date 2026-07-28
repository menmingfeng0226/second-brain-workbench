import type {
  ChannelPlatform,
  CrawlTargetScope,
  PlatformCrawlResult,
  VideoLab,
  ArticleLab,
  ChannelData,
  DailyViewsTrend,
  PublishRecord,
  CrawlMetricsSummary,
} from '@/types';
import { getAdapter } from './adapters';
import { NINE_PLATFORMS } from './types';
import { useAccountStore } from '@/store/accountStore';
import { useAuthStore } from '@/store/authStore';
import eventBus from '@/lib/eventBus';
import { channels as baseChannels } from '@/data/mockData';

export interface SyncAllOptions {
  scope?: CrawlTargetScope[];
  platforms?: ChannelPlatform[];
  trigger?: 'manual' | 'cron' | 'on-login' | 'page-enter' | 'ui-refresh';
  onlyLinked?: boolean;
  rangeStart?: string;
  rangeEnd?: string;
  signal?: AbortSignal;
}

export interface SnapshotResult {
  channels: ChannelData[];
  videos: VideoLab[];
  articles: ArticleLab[];
  trendSeries: DailyViewsTrend[];
  publishRecords: PublishRecord[];
  summaryByPlatform: Record<ChannelPlatform, CrawlMetricsSummary | null>;
  lastUpdatedAt: string;
  dataSource: Record<ChannelPlatform, PlatformCrawlResult['source']>;
  warnings: { platform: ChannelPlatform; message: string }[];
}

function uid(prefix = 'snap'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function runSinglePlatform(
  platform: ChannelPlatform,
  opts: SyncAllOptions,
): Promise<{ result: PlatformCrawlResult | null; warnings: string[] }> {
  const warnings: string[] = [];
  const store = useAccountStore.getState();
  const account = opts.onlyLinked ? store.getDefaultAccount(platform) : undefined;

  if (opts.onlyLinked && !account) {
    warnings.push(`未绑定 ${platform} 账号，跳过真实抓取，使用示例数据`);
  }

  const adapter = getAdapter(platform);
  const jobId = uid('job');
  const accountId = account?.id ?? 'global';

  const created = store.addCrawlJob({
    platform,
    accountId,
    scope: opts.scope ?? ['full'],
    rangeStart: opts.rangeStart,
    rangeEnd: opts.rangeEnd,
    trigger: opts.trigger ?? 'manual',
  });

  store.updateCrawlJob(created.id, { status: 'running', startedAt: new Date().toISOString() });

  let credentials: Record<string, string | number | undefined> | undefined;
  if (account) {
    credentials = (await store.decryptCredentials(account.id)) ?? undefined;
    store.updateAccountStatus(account.id, { syncStatus: 'syncing' });
  }

  const t0 = performance.now();
  try {
    const result = await adapter.fetch({
      platform,
      credentials,
      scope: opts.scope ?? ['full'],
      rangeStart: opts.rangeStart,
      rangeEnd: opts.rangeEnd,
      accountId,
      jobId,
      handle: account?.handle,
      signal: opts.signal,
    });

    const t1 = performance.now();
    const records =
      (result.videos?.length ?? 0) +
      (result.articles?.length ?? 0) +
      (result.publishRecords?.length ?? 0);

    store.updateCrawlJob(created.id, {
      status: result.source === 'mock-fallback' ? 'partial' : 'success',
      finishedAt: new Date().toISOString(),
      durationMs: Math.round(t1 - t0),
      recordsFetched: records,
      errorMessage: result.warnings?.join(' | '),
    });

    if (account) {
      store.updateAccountStatus(account.id, {
        syncStatus: result.source === 'mock-fallback' ? 'linked' : 'linked',
        lastSyncAt: new Date().toISOString(),
        lastSyncError: result.warnings?.[0],
        followerCount: result.profile?.followerCount ?? account.followerCount,
      });
    }

    useAccountStore.setState((s) => ({
      lastPullSummary: {
        ...s.lastPullSummary,
        [platform]: new Date().toISOString(),
      },
    }));

    if (result.warnings?.length) warnings.push(...result.warnings);
    return { result, warnings };
  } catch (e) {
    const msg = (e as Error).message || '抓取失败';
    store.updateCrawlJob(created.id, {
      status: 'failed',
      finishedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - t0),
      errorMessage: msg,
    });
    if (account) {
      store.updateAccountStatus(account.id, {
        syncStatus: 'failed',
        lastSyncAt: new Date().toISOString(),
        lastSyncError: msg,
      });
    }
    warnings.push(`${platform}: ${msg}`);
    return { result: null, warnings };
  }
}

function mergeMetrics(existing: CrawlMetricsSummary | null, add?: CrawlMetricsSummary): CrawlMetricsSummary | null {
  if (!add) return existing;
  if (!existing) return { ...add };
  return {
    totalFollowers: (existing.totalFollowers ?? 0) + (add.totalFollowers ?? 0),
    monthFollowersDelta: (existing.monthFollowersDelta ?? 0) + (add.monthFollowersDelta ?? 0),
    monthPublished: (existing.monthPublished ?? 0) + (add.monthPublished ?? 0),
    monthViews: (existing.monthViews ?? 0) + (add.monthViews ?? 0),
    monthLikes: (existing.monthLikes ?? 0) + (add.monthLikes ?? 0),
    monthComments: (existing.monthComments ?? 0) + (add.monthComments ?? 0),
    monthShares: (existing.monthShares ?? 0) + (add.monthShares ?? 0),
    monthRevenue: (existing.monthRevenue ?? 0) + (add.monthRevenue ?? 0),
  };
}

export async function syncAllPlatforms(opts: SyncAllOptions = {}): Promise<SnapshotResult> {
  const platforms = opts.platforms ?? NINE_PLATFORMS;
  const onlyLinked = opts.onlyLinked ?? true;
  const user = useAuthStore.getState().user;
  void user;

  eventBus.emit('scheduler:sync-start', { platforms, onlyLinked });

  const results: PlatformCrawlResult[] = [];
  const allWarnings: SnapshotResult['warnings'] = [];

  const tasks = platforms.map(async (p) => {
    const { result, warnings } = await runSinglePlatform(p, { ...opts, onlyLinked });
    if (result) results.push(result);
    for (const w of warnings) allWarnings.push({ platform: p, message: w });
  });

  await Promise.all(tasks);

  const summaryByPlatform = {} as SnapshotResult['summaryByPlatform'];
  const dataSource = {} as SnapshotResult['dataSource'];
  const channelsOut: ChannelData[] = [];
  const videosOut: VideoLab[] = [];
  const articlesOut: ArticleLab[] = [];
  const trendMap: Record<string, DailyViewsTrend[]> = {};
  const recordsOut: PublishRecord[] = [];
  let totals: CrawlMetricsSummary | null = null;

  for (const platform of NINE_PLATFORMS) {
    const r = results.find((x) => x.platform === platform);
    dataSource[platform] = r?.source ?? 'mock-fallback';
    summaryByPlatform[platform] = r?.summary ?? null;
    totals = mergeMetrics(totals, r?.summary);
    if (r?.channelMetrics) channelsOut.push(r.channelMetrics);
    if (r?.videos) videosOut.push(...r.videos);
    if (r?.articles) articlesOut.push(...r.articles);
    if (r?.trendSeries) {
      for (const t of r.trendSeries) {
        const arr = trendMap[t.date] ?? (trendMap[t.date] = []);
        arr.push(t);
      }
    }
    if (r?.publishRecords) recordsOut.push(...r.publishRecords);
  }

  // fill missing channels with base mock (so UI never empty)
  for (const base of baseChannels) {
    if (!channelsOut.find((c) => c.id === base.id)) {
      channelsOut.push(base);
    }
  }

  // aggregate trends
  const trendSeries = Object.entries(trendMap)
    .map(([date, items]) => ({
      date,
      views: items.reduce((a, b) => a + (b.views ?? 0), 0),
      likes: items.reduce((a, b) => a + (b.likes ?? 0), 0),
      newFollowers: items.reduce((a, b) => a + (b.newFollowers ?? 0), 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const snap: SnapshotResult = {
    channels: channelsOut,
    videos: videosOut,
    articles: articlesOut,
    trendSeries,
    publishRecords: recordsOut,
    summaryByPlatform,
    lastUpdatedAt: new Date().toISOString(),
    dataSource,
    warnings: allWarnings,
  };

  eventBus.emit('scheduler:sync-done', { snap, totals });
  return snap;
}

export interface SchedulerHandle {
  stop: () => void;
  triggerNow: (platforms?: ChannelPlatform[]) => Promise<SnapshotResult>;
}

export function startPeriodicSync(
  options: SyncAllOptions & { intervalMs?: number },
): SchedulerHandle {
  const interval = options.intervalMs ?? 30 * 60 * 1000;
  let stopped = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    if (stopped) return;
    const auth = useAuthStore.getState();
    if (!auth.isAuthenticated) return;
    void syncAllPlatforms({ ...options, trigger: 'cron' }).catch(() => {});
  };

  timer = setInterval(tick, interval);
  void tick();

  return {
    stop() {
      stopped = true;
      if (timer) clearInterval(timer);
      timer = null;
    },
    triggerNow(platforms) {
      return syncAllPlatforms({ ...options, platforms: platforms ?? options.platforms, trigger: 'manual' });
    },
  };
}

export const scheduler = {
  syncAllPlatforms,
  startPeriodicSync,
};

export default scheduler;
