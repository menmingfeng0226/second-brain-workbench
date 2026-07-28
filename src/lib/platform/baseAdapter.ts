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
import type { PlatformAdapter, AdapterFetchOptions } from './types';
import { fetchViaProxy, filterMockByPlatform, PLATFORM_META } from './types';

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

    const profileFromProxy = await this.fetchProfileViaProxy(opts).catch((e) => {
      warnings.push(`profile proxy error: ${(e as Error).message}`);
      return null;
    });

    const metricsFromProxy = await this.fetchChannelMetricsViaProxy(opts).catch((e) => {
      warnings.push(`metrics proxy error: ${(e as Error).message}`);
      return null;
    });

    const videosFromProxy = opts.scope.some((s) =>
      ['published-list', 'viral-videos'].includes(s),
    )
      ? await this.fetchVideosViaProxy(opts).catch((e) => {
          warnings.push(`videos proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;

    const articlesFromProxy = opts.scope.some((s) =>
      ['published-list', 'viral-articles'].includes(s),
    )
      ? await this.fetchArticlesViaProxy(opts).catch((e) => {
          warnings.push(`articles proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;

    const trendFromProxy = opts.scope.includes('trend')
      ? await this.fetchTrendViaProxy(opts).catch((e) => {
          warnings.push(`trend proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;

    const recordsFromProxy = opts.scope.includes('published-list')
      ? await this.fetchPublishRecordsViaProxy(opts).catch((e) => {
          warnings.push(`records proxy error: ${(e as Error).message}`);
          return null;
        })
      : null;

    const anyProxySuccess =
      profileFromProxy ||
      metricsFromProxy ||
      videosFromProxy ||
      articlesFromProxy ||
      trendFromProxy ||
      recordsFromProxy;

    const channelMetrics: ChannelData | undefined =
      metricsFromProxy ?? this.fallbackChannelMetrics(opts.platform);

    const videos: VideoLab[] | undefined = videosFromProxy ?? this.fallbackVideos(opts.platform);
    const articles: ArticleLab[] | undefined =
      articlesFromProxy ?? this.fallbackArticles(opts.platform);
    const trendSeries: DailyViewsTrend[] | undefined =
      trendFromProxy ?? this.fallbackTrend(opts.platform);
    const publishRecords2: PublishRecord[] | undefined =
      recordsFromProxy ?? this.fallbackRecords(opts.platform);

    const totalFollowers =
      profileFromProxy?.followerCount ?? channelMetrics?.totalFollowers ?? 0;

    return {
      jobId: opts.jobId,
      platform: opts.platform,
      accountId: opts.accountId,
      fetchedAt,
      source: anyProxySuccess ? 'edge-proxy' : 'mock-fallback',
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
    const r = await fetchViaProxy({
      route,
      method,
      credentials: opts.credentials,
      platform: opts.platform,
      payload: { accountHandle: opts.handle, range: [opts.rangeStart, opts.rangeEnd], ...(payload ?? {}) },
      signal: opts.signal,
      proxyBaseUrl: opts.proxyBaseUrl,
    });
    if (!r.ok) return null;
    return (r.data as { data?: T }).data ?? (r.data as T) ?? null;
  }
}

export { BaseAdapter };
