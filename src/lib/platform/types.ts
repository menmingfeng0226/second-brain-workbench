import type {
  ChannelPlatform,
  CrawlTargetScope,
  PlatformCrawlResult,
  AccountCredentialFields,
  ChannelData,
} from '@/types';

export interface AdapterFetchOptions {
  platform: ChannelPlatform;
  credentials?: AccountCredentialFields;
  scope: CrawlTargetScope[];
  rangeStart?: string;
  rangeEnd?: string;
  accountId: string;
  jobId: string;
  handle?: string;
  proxyBaseUrl?: string;
  signal?: AbortSignal;
}

export interface PlatformAdapter {
  readonly platform: ChannelPlatform;
  readonly authMethods: readonly ('cookie' | 'oauth' | 'token' | 'apikey' | 'wechat-qrcode' | 'password')[];
  readonly credentialFields: {
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    hint?: string;
    isSecret?: boolean;
  }[];
  readonly profileDocUrl?: string;
  canHandle(platform: ChannelPlatform): boolean;
  fetch(opts: AdapterFetchOptions): Promise<PlatformCrawlResult>;
  validateCredentials(creds: AccountCredentialFields): { ok: boolean; reason?: string };
}

const NINE_PLATFORMS: ChannelPlatform[] = [
  'bilibili',
  'xiaohongshu',
  'douyin',
  'wechat-video',
  'kuaishou',
  'wechat-official',
  'ximalaya',
  'xiaoyuzhou',
  'zhihu',
];

export { NINE_PLATFORMS };

export interface AdapterPlatformMeta {
  platform: ChannelPlatform;
  name: string;
  color: string;
  category: ChannelData['category'];
  adapterHint: string;
  authDoc: string;
  defaultScope: CrawlTargetScope[];
}

export const PLATFORM_META: Record<ChannelPlatform, AdapterPlatformMeta> = {
  bilibili: {
    platform: 'bilibili',
    name: '哔哩哔哩',
    color: '#00AEEC',
    category: '视频',
    adapterHint: '开放API + Cookie（SESSDATA / bili_jct / DedeUserID / buvid3），支持官方 /x/web-interface 系列接口',
    authDoc: 'https://socialsister.github.io/bilibili-api/#/docs-api-mapping',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'viral-videos', 'trend'],
  },
  xiaohongshu: {
    platform: 'xiaohongshu',
    name: '小红书',
    color: '#FF2442',
    category: '图文',
    adapterHint: 'Web API 签名 x-s/x-t，需 Web Cookie（a1 / web_session）配合',
    authDoc: 'https://blog.csdn.net/weixin_43556432/article/details/131955791',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'viral-articles', 'trend'],
  },
  douyin: {
    platform: 'douyin',
    name: '抖音',
    color: '#000000',
    category: '视频',
    adapterHint: '开放平台 OAuth2 access_token，或 Hot List SSR 页面解析（需 cookie）',
    authDoc: 'https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/interface-request-credential/interface-access-token',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'hot-list', 'viral-videos'],
  },
  'wechat-video': {
    platform: 'wechat-video',
    name: '视频号',
    color: '#07C160',
    category: '视频',
    adapterHint: '微信视频号助手 Cookie（webwx_data_ticket / x5exportkey）或第三方开放平台授权',
    authDoc: 'https://channels.weixin.qq.com/',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'trend'],
  },
  kuaishou: {
    platform: 'kuaishou',
    name: '快手',
    color: '#FF4906',
    category: '视频',
    adapterHint: '快手开放平台 OAuth2 access_token，或网页 Cookie（kpf=PC_WEB）配合 API',
    authDoc: 'https://open.kuaishou.com/',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'hot-list', 'viral-videos'],
  },
  'wechat-official': {
    platform: 'wechat-official',
    name: '微信公众号',
    color: '#07C160',
    category: '图文',
    adapterHint: '公众号开发者 AppID/AppSecret（Access Token），或 mp 平台 Cookie（cookie / 数据中心导出）',
    authDoc: 'https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'viral-articles', 'revenue'],
  },
  ximalaya: {
    platform: 'ximalaya',
    name: '喜马拉雅',
    color: '#FF8800',
    category: '播客',
    adapterHint: '开放平台（appid/appSecret）或用户级 xm_token Cookie，声音列表 API',
    authDoc: 'https://open.ximalaya.com/doc/main/home',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'trend'],
  },
  xiaoyuzhou: {
    platform: 'xiaoyuzhou',
    name: '小宇宙',
    color: '#FF8A3D',
    category: '播客',
    adapterHint: '小宇宙 App WebView API（xyz_id + cookie），目前可通过「电台 RSS」+ 节目分析同步',
    authDoc: 'https://www.xiaoyuzhoufm.com/',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'trend'],
  },
  zhihu: {
    platform: 'zhihu',
    name: '知乎',
    color: '#0084FF',
    category: '图文',
    adapterHint: '知乎 z_c0（Bearer cookie）+ d_c0，官方 /api/v3 feed / columns 系列接口',
    authDoc: 'https://www.zhihu.com/signin?next=%2F',
    defaultScope: ['profile', 'channel-metrics', 'published-list', 'hot-list', 'viral-articles'],
  },
};

export function filterMockByPlatform<T extends { channel: ChannelPlatform }>(
  arr: T[],
  platform: ChannelPlatform,
): T[] {
  return arr.filter((v) => v.channel === platform);
}

export interface FetchViaProxyArgs {
  route: string;
  method?: 'GET' | 'POST';
  credentials?: AccountCredentialFields;
  platform: ChannelPlatform;
  payload?: Record<string, unknown>;
  signal?: AbortSignal;
  proxyBaseUrl?: string;
}

export async function fetchViaProxy(args: FetchViaProxyArgs): Promise<{
  ok: boolean;
  status: number;
  data: unknown;
  error?: string;
  source: 'edge-proxy' | 'fallback';
}> {
  const base = (args.proxyBaseUrl ?? import.meta.env.VITE_PROXY_BASE_URL ?? '').replace(/\/$/, '');
  const url = `${base}/api/platforms/${args.platform}${args.route.startsWith('/') ? args.route : '/' + args.route}`;
  try {
    const resp = await fetch(url, {
      method: args.method ?? 'GET',
      signal: args.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(args.credentials?.accessToken ? { Authorization: `Bearer ${args.credentials.accessToken}` } : {}),
      },
      body: args.payload
        ? JSON.stringify({ credentials: args.credentials, payload: args.payload })
        : undefined,
    });
    const data = await resp.json().catch(() => ({}));
    return {
      ok: resp.ok,
      status: resp.status,
      data,
      error: resp.ok ? undefined : (data as { message?: string }).message || (data as { error?: string }).error || 'HTTP_ERROR',
      source: 'edge-proxy',
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: (e as Error).message || 'NETWORK_ERROR',
      source: 'fallback',
    };
  }
}
