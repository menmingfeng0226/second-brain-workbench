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
import { NINE_PLATFORMS, __MARK_DATASOURCE, __MARK_INTERFACE_HITS } from './types';
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
  /** 每个平台的 profile 真实信息（handle/profileId/followerCount）—— 用于账号绑定页 tile，优先级大于账号绑定时手填值 */
  perPlatformProfile: Record<ChannelPlatform, PlatformCrawlResult['profile'] | null>;
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

  // ✅【核心修复】无论 onlyLinked 真假，先尝试加载当前平台已绑定账号的凭据：
  //   · onlyLinked=true  → 是「仅同步已绑定」，没绑账号就跳过打 warning
  //   · onlyLinked=false → 是「同步所有 9 平台」，没绑的走 mock，但有绑的必须用真实 credentials！
  //     （之前代码：onlyLinked=false 时 account=undefined 写死，导致用户保存了账号也永远拿不到真实数据 → 22ms mock）
  const account = store.getDefaultAccount(platform);

  if (opts.onlyLinked && !account) {
    warnings.push(`未绑定 ${platform} 账号，跳过真实抓取，使用示例数据`);
  }

  // 有绑定账号但 credentials 不存在（解密失败）时，单独打一条诊断警告
  let credentials: Record<string, string | number | undefined> | undefined;
  let hasAccountNoCredentials = false;
  if (account) {
    credentials = (await store.decryptCredentials(account.id)) ?? undefined;
    if (!credentials || Object.keys(credentials).every(k => !credentials![k])) {
      hasAccountNoCredentials = true;
      warnings.push(`${platform} 账号已绑定但凭据解密为空，请删除后重新绑定并重填 Cookie`);
    }
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

  // credentials 已在上方先拿到，这里只负责把账号状态改成 syncing
  if (account) {
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

    // 🧭 可观测性增强：在 CrawlJob 里写清楚抓取口径，方便用户从右侧队列一眼看懂发生了什么
    //   partial = 有账号但结果是 mock-fallback（说明：凭据过期 / 后端抓失败，已降级示例）
    //   success + credentials 有 = 走了真实 fetch 链路，看 source 是否 edge-proxy
    //   success + account=null = 未绑定，走示例数据
    const allWarns = [...warnings, ...(result.warnings ?? [])];
    const jobMsg: string[] = [];
    if (!account) jobMsg.push('未绑定账号：跳过真实抓取，展示示例数据');
    if (hasAccountNoCredentials) jobMsg.push('⚠️ 【致命】已绑定账号但**凭据解密失败/为空** → 删除此账号后重新绑定·重填凭据即可（AES-GCM 会话密码跨会话丢失，之前保存的密文解不出来），不要直接 retry！');
    if (account && !result.warnings?.length && result.source === 'edge-proxy') {
      jobMsg.unshift('✅ 真实抓取成功（源=edge-proxy）');
    } else if (account && result.source === 'mock-fallback') {
      // ★ 关键：把上游真实接口的 B 站 code/message（如 -101 未登录/-352 WBI 失败/-401 凭据过期）直接拼到 errorMessage，用户一眼能诊断
      const upstream = (result.warnings ?? []).filter(w =>
        w.includes('code=') || w.includes('凭据') || w.includes('过期') || w.includes('未登录') || w.includes('账号风险') || w.includes('解密失败') || w.includes('HTTP_FAIL') || w.includes('exception')
      ).slice(0, 2);
      const extra = upstream.length ? ` · 上游提示：${upstream.join('；')}` : '';
      // 🔴 小宇宙这种 42ms mockHits=profile/channel-metrics 全 6 接口 mock → 提示真实失败的原因，不要再让用户瞎猜
      const allMock = (result as { interfaceMockHits?: string[] }).interfaceMockHits ??
        (allWarns.find(w => w.includes('mockHits=')) ? '' : '');
      void allMock;
      jobMsg.push(`⚠️ 真实抓取失败（凭据过期/接口报错）→ 已自动降级示例数据${extra}`);
      if (hasAccountNoCredentials) {
        jobMsg.push('→ 点此账号 tile 的「解绑账号」按钮 → 重新填凭据 → 保存（重新生成 AES-GCM 加密对），下次一定能解密成功！');
      } else if (!upstream.length) {
        jobMsg.push(`诊断信息：mockHits=6/6（接口未发出真实请求） → 原因：凭据对象 0 字段有效 OR 平台路由没命中 hybrid/direct。处理：点「解绑账号」→ 重新填顶部【账号 Handle/ID】栏 + 下方必填凭据，确保两栏都非空后保存。`);
      }
    }
    store.updateCrawlJob(created.id, {
      status: !account ? 'success' : (result.source === 'mock-fallback' ? 'partial' : 'success'),
      finishedAt: new Date().toISOString(),
      durationMs: Math.round(t1 - t0),
      recordsFetched: records,
      errorMessage: (jobMsg.join(' · ') || undefined) || (allWarns.length ? allWarns.join(' | ') : undefined),
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
  // ✅ Promise 级去重：1.5s 窗口内完全相同参数的并发调用共享同一个调度 Promise（前端多 hook 并列调用不会真跑 N 次 9 平台抓取，避免雪崩 / 无限级联）
  const dedupKey =
    (opts.platforms ?? NINE_PLATFORMS).join(',') +
    '|' +
    String(opts.onlyLinked ?? true) +
    '|' +
    (opts.trigger ?? 'page-enter') +
    '|' +
    JSON.stringify(opts.scope ?? []);
  const inFlight = _inFlightMap.get(dedupKey);
  if (inFlight) return inFlight;
  const runPromise = _syncAllPlatformsImpl(opts).finally(() => {
    // 完成后保留 1.5s 内去重窗口，再从 map 删除
    setTimeout(() => _inFlightMap.delete(dedupKey), 1500);
  });
  _inFlightMap.set(dedupKey, runPromise);
  return runPromise;
}

/** 去重 map：key=上述 dedupKey，value=当前飞行中（in-flight）的调度 Promise */
const _inFlightMap = new Map<string, Promise<SnapshotResult>>();

async function _syncAllPlatformsImpl(opts: SyncAllOptions): Promise<SnapshotResult> {
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
  const perPlatformProfile = {} as SnapshotResult['perPlatformProfile'];
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
    perPlatformProfile[platform] = r?.profile ?? null;
    totals = mergeMetrics(totals, r?.summary);
    if (r?.channelMetrics) {
      channelsOut.push(r.channelMetrics);
    } else {
      // ✅【核心修复 2】按 platform 一对一兜底：只有该平台真实 channelMetrics 完全没拿到时，才补 baseChannels 里对应 platform 的 1 条
      const base = baseChannels.find((c) => c.id === platform);
      if (base) {
        const marked = { ...base };
        (marked as unknown as { [k: symbol]: unknown })[__MARK_DATASOURCE] = 'base-mock';
        (marked as unknown as { [k: symbol]: unknown })[__MARK_INTERFACE_HITS] = {
          real: [], mock: ['channel-metrics:baseChannels:fallback'], demo: [],
        };
        channelsOut.push(marked);
      }
    }
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
    perPlatformProfile,
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
