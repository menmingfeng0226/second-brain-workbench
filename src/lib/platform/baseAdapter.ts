import type {
  ChannelPlatform,
  ChannelData,
  PlatformCrawlResult,
  VideoLab,
  ArticleLab,
  AccountCredentialFields,
  DailyViewsTrend,
  PublishRecord,
} from '@/types';
import {
  channels,
  videoLabs,
  articleLabs,
  dailyViewsTrend,
  publishRecords,
} from '@/data/mockData';
const mockChannels = channels;
const mockAllVideos = videoLabs;
const mockAllArticles = articleLabs;
import type { PlatformAdapter, AdapterFetchOptions, FetchViaProxyArgs } from './types';
import { fetchViaProxy, filterMockByPlatform, PLATFORM_META } from './types';

type ProxySource = 'edge-proxy' | 'demo-mock' | 'fallback';

/** 私有 Symbol：给 ChannelData 打 datasource 标记（JSON.stringify 自动忽略 symbol，不污染持久化） */
export const __MARK_DATASOURCE = Symbol.for('__wb.channelDataSource');
/** 私有 Symbol：给 ChannelData 打 6 接口命中情况（real/mock/demo） */
export const __MARK_INTERFACE_HITS = Symbol.for('__wb.channelInterfaceHits');

/** 诊断辅助：从一个 ChannelData 上读取 datasource 标记（无标记 = mock/baseChannels） */
export function getChannelDataSourceTag(
  c: ChannelData | undefined,
): { source: CrawlDataSource | 'base-mock'; hits?: { real: string[]; mock: string[]; demo: string[] } } {
  if (!c) return { source: 'base-mock' };
  const obj = c as ChannelData & { [k: symbol]: unknown };
  const src = obj[__MARK_DATASOURCE] as CrawlDataSource | undefined;
  const hits = obj[__MARK_INTERFACE_HITS] as { real: string[]; mock: string[]; demo: string[] } | undefined;
  return { source: src ?? 'base-mock', hits };
}

type CrawlDataSource = 'edge-proxy' | 'demo-mock' | 'mock-fallback' | 'mock';

abstract class BaseAdapter implements PlatformAdapter {
  abstract readonly platform: ChannelPlatform;
  abstract readonly authMethods: readonly ('cookie' | 'oauth' | 'token' | 'apikey' | 'wechat-qrcode' | 'password')[];
  abstract readonly credentialFields: {
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    hint?: string;
    isSecret?: boolean;
  }[];

  /** 最近一次 callProxy 调用的 source（edge-proxy / demo-mock / fallback），fetch() 用于汇总最终抓取结果数据源 */
  protected _lastProxySource: ProxySource | null = null;

  /** ★ 诊断管道：每次 callProxy 遇到上游返回具体错误（B站 code=-101/-352 等）都会 push 进来，fetch() 末尾合并到 warnings 让用户能看懂 */
  protected _callWarnings: string[] = [];

  canHandle(platform: ChannelPlatform): boolean {
    return platform === this.platform;
  }

  get meta() {
    return PLATFORM_META[this.platform];
  }

  validateCredentials(creds: AccountCredentialFields): { ok: boolean; reason?: string } {
    for (const f of this.credentialFields) {
      if (f.required && !(creds as unknown as Record<string, unknown>)[f.key]) {
        return { ok: false, reason: `缺少必填字段：${f.label}` };
      }
    }
    return { ok: true };
  }

  async fetch(opts: AdapterFetchOptions): Promise<PlatformCrawlResult> {
    const warnings: string[] = [];
    const fetchedAt = new Date().toISOString();
    const proxySources: ProxySource[] = [];
    // 每个 fetch() 周期重置：避免上次的错误残留到下一次
    this._callWarnings = [];

    const collect = <T,>(v: T, src: ProxySource | null): T => {
      if (src) proxySources.push(src);
      return v;
    };

    this._lastProxySource = null;
    const profileFromProxy = await this.fetchProfileViaProxy(opts).catch((e) => {
      warnings.push(`profile proxy error: ${(e as Error).message}`);
      return null;
    });
    collect(profileFromProxy, this._lastProxySource);

    this._lastProxySource = null;
    const metricsFromProxy = await this.fetchChannelMetricsViaProxy(opts).catch((e) => {
      warnings.push(`metrics proxy error: ${(e as Error).message}`);
      return null;
    });
    collect(metricsFromProxy, this._lastProxySource);

    this._lastProxySource = null;
    const videosFromProxy = opts.scope.some((s) =>
      ['published-list', 'viral-videos'].includes(s),
    )
      ? await this.fetchVideosViaProxy(opts).catch((e) => {
          warnings.push(`videos proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;
    collect(videosFromProxy, this._lastProxySource);

    this._lastProxySource = null;
    const articlesFromProxy = opts.scope.some((s) =>
      ['published-list', 'viral-articles'].includes(s),
    )
      ? await this.fetchArticlesViaProxy(opts).catch((e) => {
          warnings.push(`articles proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;
    collect(articlesFromProxy, this._lastProxySource);

    this._lastProxySource = null;
    const trendFromProxy = opts.scope.includes('trend')
      ? await this.fetchTrendViaProxy(opts).catch((e) => {
          warnings.push(`trend proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;
    collect(trendFromProxy, this._lastProxySource);

    this._lastProxySource = null;
    const recordsFromProxy = opts.scope.includes('published-list')
      ? await this.fetchPublishRecordsViaProxy(opts).catch((e) => {
          warnings.push(`records proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;
    collect(recordsFromProxy, this._lastProxySource);

    // （保留作调试参考，不再作为「已连接」判定条件：仅当 channel-metrics 真实成功才判真实）
    const _anyProxySuccess =
      (profileFromProxy && proxySources[0] === 'edge-proxy') ||
      (metricsFromProxy && proxySources[1] === 'edge-proxy') ||
      (videosFromProxy && proxySources[2] === 'edge-proxy') ||
      (articlesFromProxy && proxySources[3] === 'edge-proxy') ||
      (trendFromProxy && proxySources[4] === 'edge-proxy') ||
      (recordsFromProxy && proxySources[5] === 'edge-proxy');
    void _anyProxySuccess;

    const demoModeTookOver = proxySources.includes('demo-mock');

    // ──────────────────────────────────────────────────────────────
    //  ✅【核心修复 1】channelMetrics 是粉丝/播放/收入 KPI 的来源，**必须是真实接口成功才算真数据**！
    //     6 个接口中只要 channel-metrics（proxySources[1]）走 fallback mock，
    //     哪怕其他 5 个接口全是真实成功 → 该平台整体降级 mock-fallback，
    //     UI 显示「真实失败·已降级」橙标，不能再欺骗用户显示✅真实接口
    //     但数值却是 892450 这种假的静态示例粉丝！
    // ──────────────────────────────────────────────────────────────
    const channelMetricsReal =
      !!metricsFromProxy && proxySources[1] === 'edge-proxy';
    const channelMetricsDemo =
      (!metricsFromProxy && proxySources[1] === 'demo-mock') ||
      (metricsFromProxy === null && demoModeTookOver);
    // 6 接口真实命中数（用于 warnings 里告诉用户哪些成功/失败）
    const interfaceNames = ['profile', 'channel-metrics', 'videos', 'articles', 'trend', 'records'];
    const realHits: string[] = [];
    const mockHits: string[] = [];
    const demoHits: string[] = [];
    interfaceNames.forEach((n, i) => {
      const src = proxySources[i];
      const has = i === 0 ? profileFromProxy : i === 1 ? metricsFromProxy :
                    i === 2 ? videosFromProxy : i === 3 ? articlesFromProxy :
                    i === 4 ? trendFromProxy : recordsFromProxy;
      if (src === 'edge-proxy' && has) realHits.push(n);
      else if (src === 'demo-mock' || (src === null && demoModeTookOver)) demoHits.push(n);
      else mockHits.push(n);
    });

    const channelMetrics: ChannelData | undefined =
      metricsFromProxy ?? this.fallbackChannelMetrics(opts.platform);
    // **关键**：给 channelMetrics 打一个私有标记，后续 scheduler/Dashboard 可以判断是真的还是 mock fallback
    //           用 Symbol 不会污染序列化（JSON.stringify 自动忽略 symbol key）
    if (channelMetrics) {
      (channelMetrics as ChannelData & { [k: symbol]: unknown })[__MARK_DATASOURCE] =
        channelMetricsReal ? 'edge-proxy' : channelMetricsDemo ? 'demo-mock' : 'mock-fallback';
      (channelMetrics as ChannelData & { [k: symbol]: unknown })[__MARK_INTERFACE_HITS] =
        { real: realHits.slice(), mock: mockHits.slice(), demo: demoHits.slice() };
    }

    const videos: VideoLab[] | undefined = videosFromProxy ?? this.fallbackVideos(opts.platform);
    const articles: ArticleLab[] | undefined =
      articlesFromProxy ?? this.fallbackArticles(opts.platform);
    const trendSeries: DailyViewsTrend[] | undefined =
      trendFromProxy ?? this.fallbackTrend(opts.platform);
    const publishRecords2: PublishRecord[] | undefined =
      recordsFromProxy ?? this.fallbackRecords(opts.platform);

    const totalFollowers =
      profileFromProxy?.followerCount ?? channelMetrics?.totalFollowers ?? 0;

    // 四态 source 总结（**修复：不再以「任一接口成功」判真实**）
    //   edge-proxy    → 绿 ✅【条件】channel-metrics 真实成功（proxySources[1]==='edge-proxy' && metricsFromProxy!=null）
    //                      + 未被演示模式拦截
    //   demo-mock     → 橙 ⚠️ 演示模式拦截命中（任一接口 demo 或全局 demo 开）
    //   mock-fallback → 橙 ⚠️ 已绑定账号但 channel-metrics 未真实成功（用了示例粉丝数）
    //   mock          → 灰 💡 未绑定账号/无凭据，全量示例数据
    let source: PlatformCrawlResult['source'];
    if (channelMetricsReal) {
      source = 'edge-proxy';
    } else if (demoModeTookOver || channelMetricsDemo) {
      source = 'demo-mock';
    } else if (opts.credentials && Object.keys(opts.credentials).length) {
      source = 'mock-fallback';
    } else {
      source = 'mock';
    }

    // warnings 头部自动注入用户能直接看懂的原因（中英双语不，中文，可直接复制给 AI）
    if (source === 'demo-mock' && !warnings.some((w) => w.includes('演示模式'))) {
      const hits = demoHits.length
        ? `（命中接口：${demoHits.join('/')}）`
        : '';
      warnings.unshift(
        `演示模式已启用：所有 /api 平台请求被本地 mock 拦截${hits}，channel-metrics（粉丝/播放/收入）用的是示例账号 892450/467230 这种静态假数值！请在数据看板顶部红色 BIG 警告条点「🔓 关闭演示模式·立刻重抓真实数据」按钮，关闭后约 10 秒同步你真实账号。`,
      );
    }
    if (source === 'mock-fallback') {
      const reason = realHits.length
        ? `虽然 ${realHits.length}/6 接口（${realHits.join('/')}）真实后端 2xx 成功，但 channel-metrics（粉丝/月播放/月互动/月收入 KPI 主数据）未返回真实数值，已自动降级示例账号静态数据（bilibili 892450/抖音 634180 等）。`
        : `所有 6 个接口均未命中真实后端（mockHits=${mockHits.join('/')}），channel-metrics 用的是示例账号静态数据。`;
      const suggest = `修复建议：(1) 看板蓝色 BIG 条一键复制 dev:server 命令启动 Hono 后端；(2) 后端起来后点「🔄 强制重抓全平台」；(3) 仍失败则账号 tile →「抓取一次验证」重绑凭据（Cookie/Token 2h~7d 过期）。`;
      if (!warnings.some((w) => w.includes('channel-metrics') && w.includes('示例'))) {
        warnings.unshift(reason + ' ' + suggest);
      }
      if (realHits.length && !warnings.some((w) => w.includes('部分真实接口成功'))) {
        warnings.unshift(
          `【注意】该平台${realHits.length}/6 接口真实成功（${realHits.join('/')}），但 channel-metrics 这一个关键接口没返回真实数据 → **看板 KPI（粉丝/播放/互动）仍然是假的示例值**，不能作为经营数据参考。只有当 channel-metrics 也是真实时才显示 ✅真实接口。`,
        );
      }
    }

    // ★ 末尾合并 callProxy 管道里收集到的具体上游错误（B站 code/message）
    //   去重后 push 进 warnings 给 scheduler/CrawlJob errorMessage 展示
    if (this._callWarnings.length) {
      const seen = new Set<string>();
      for (const w of this._callWarnings) {
        if (!seen.has(w)) { seen.add(w); warnings.push(w); }
      }
    }

    return {
      jobId: opts.jobId,
      platform: opts.platform,
      accountId: opts.accountId,
      fetchedAt,
      source,
      profile: profileFromProxy ?? {
        handle: opts.handle ?? this.defaultHandle(opts.platform),
        displayName: PLATFORM_META[opts.platform].name + '账号',
        avatarUrl: undefined,
        profileUrl: this.defaultProfileUrl(opts.platform, opts.handle),
        followerCount: totalFollowers,
      },
      channelMetrics,
      videos,
      articles,
      publishRecords: publishRecords2,
      trendSeries,
      summary: this.buildSummary(channelMetrics),
      warnings: warnings.length ? warnings : undefined,
      rawSizeBytes: 0,
    };
  }

  protected abstract fetchProfileViaProxy(
    opts: AdapterFetchOptions,
  ): Promise<PlatformCrawlResult['profile'] | null>;
  protected abstract fetchChannelMetricsViaProxy(
    opts: AdapterFetchOptions,
  ): Promise<ChannelData | null>;
  protected abstract fetchVideosViaProxy(opts: AdapterFetchOptions): Promise<VideoLab[] | null>;
  protected abstract fetchArticlesViaProxy(opts: AdapterFetchOptions): Promise<ArticleLab[] | null>;
  protected abstract fetchTrendViaProxy(
    opts: AdapterFetchOptions,
  ): Promise<DailyViewsTrend[] | null>;
  protected abstract fetchPublishRecordsViaProxy(
    opts: AdapterFetchOptions,
  ): Promise<PublishRecord[] | null>;

  protected defaultHandle(_platform: ChannelPlatform): string {
    return 'chenfengmuye';
  }

  protected defaultProfileUrl(platform: ChannelPlatform, handle?: string): string | undefined {
    const h = handle ?? 'chenfengmuye';
    switch (platform) {
      case 'bilibili':
        return `https://space.bilibili.com/${encodeURIComponent(h)}`;
      case 'xiaohongshu':
        return `https://www.xiaohongshu.com/user/profile/${encodeURIComponent(h)}`;
      case 'zhihu':
        return `https://www.zhihu.com/people/${encodeURIComponent(h)}`;
      case 'kuaishou':
        return `https://www.kuaishou.com/profile/${encodeURIComponent(h)}`;
      case 'douyin':
        return `https://www.douyin.com/user/${encodeURIComponent(h)}`;
      case 'wechat-official':
      case 'wechat-video':
        return 'https://mp.weixin.qq.com/';
      case 'ximalaya':
        return `https://www.ximalaya.com/zhubo/${encodeURIComponent(h)}/`;
      case 'xiaoyuzhou':
        return 'https://www.xiaoyuzhoufm.com/';
      default:
        return undefined;
    }
  }

  protected fallbackChannelMetrics(platform: ChannelPlatform): ChannelData | undefined {
    return mockChannels.find((c) => c.id === platform);
  }

  protected fallbackVideos(platform: ChannelPlatform): VideoLab[] {
    return filterMockByPlatform(mockAllVideos, platform);
  }

  protected fallbackArticles(platform: ChannelPlatform): ArticleLab[] {
    return filterMockByPlatform(mockAllArticles, platform);
  }

  protected fallbackTrend(_platform: ChannelPlatform): DailyViewsTrend[] {
    return dailyViewsTrend;
  }

  protected fallbackRecords(platform: ChannelPlatform): PublishRecord[] {
    return publishRecords.filter((r) => r.platform === platform);
  }

  protected buildSummary(channel?: ChannelData): PlatformCrawlResult['summary'] {
    if (!channel) return undefined;
    return {
      totalFollowers: channel.totalFollowers,
      monthFollowersDelta: channel.monthFollowersDelta,
      monthPublished: channel.monthPublished,
      monthViews: channel.monthViews,
      monthLikes: channel.monthLikes,
      monthComments: channel.monthComments,
      monthShares: channel.monthShares,
      monthRevenue: channel.monthRevenue,
      avgEngagementRate: channel.avgEngagementRate,
      avgWatchSeconds: channel.avgWatchSeconds,
      avgReadRate: channel.avgReadRate,
      avgListenSeconds: channel.avgListenSeconds,
    };
  }

  protected async callProxy<T = unknown>(
    opts: AdapterFetchOptions,
    route: string,
    payload?: Record<string, unknown>,
    method: 'GET' | 'POST' = 'POST',
  ): Promise<T | null> {
    void opts;
    const r = await fetchViaProxy({
      route,
      method,
      credentials: opts.credentials,
      platform: opts.platform,
      payload: { accountHandle: opts.handle, range: [opts.rangeStart, opts.rangeEnd], ...(payload ?? {}) },
      signal: opts.signal,
      proxyBaseUrl: opts.proxyBaseUrl,
    } as FetchViaProxyArgs);
    // 记录最近一次调用的来源，供 fetch() 判断四态（edge-proxy / demo-mock / fallback）
    this._lastProxySource = r.source;
    // ★ 关键：把 fetchViaProxy 透传的上游具体错误（B站实际 code=-101/-352/-401 等）收集进 _callWarnings
    //   这样 scheduler/Dashboard 能直接告诉用户「凭据过期」「WBI 签名失败」，而不是泛化的「接口报错」
    if (r.error) {
      this._callWarnings.push(`${route}: ${r.error}`);
    }
    if (!r.ok) return null;
    return (r.data as { data?: T }).data ?? (r.data as T) ?? null;
  }
}

export { BaseAdapter };
