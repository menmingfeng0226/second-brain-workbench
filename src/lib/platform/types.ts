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
    adapterHint: 'Cookie（SESSDATA / bili_jct / DedeUserID / buvid3），支持官方 /x/web-interface 系列接口',
    authDoc: 'https://www.bilibili.com/',
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

// 是否为演示模式本地拦截返回（demo-mode.ts 会在 /health 返回 runtime='demo'，其他接口返回 message='DEMO ...' 前缀）
function detectDemoMockResponse(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (d.runtime === 'demo') return true;
  if (typeof d.message === 'string' && (d.message.startsWith('DEMO') || d.message === 'DEMO 工作台后端运行中')) return true;
  // /platforms/* 接口命中演示模式 fallback 时返回 { message: 'DEMO 模式本地 mock 命中...' }
  if (typeof d.message === 'string' && /DEMO/.test(d.message)) return true;
  return false;
}

// ═══════════════════ ✅ 新增：后端「空壳 mock 骨架」检测 ═══════════════════
// 新的后端路由（api/platforms/[platform]/[route].ts）会返回 source 字段：
//   source='direct' → 真实平台 API 成功，可信数据
//   source='hybrid' → 部分真实字段+mock fallback 混合，KPI 字段优先真实，可信
//   source='mock'   → 真实接口完全失败（凭据错误/过期/缺字段），已降级示例假值（892450 等），不可信
// 注意：HTTP 200 但 source='mock' 属于「成功但内容是假值」，必须按 fallback 处理，不能让 UI 显示✅真实接口
function detectBackendMockSkeleton(data: unknown): {
  isMock: boolean;
  source?: 'direct' | 'hybrid' | 'mock';
  rawSource?: string;
} {
  if (!data || typeof data !== 'object') return { isMock: false };
  const d = data as Record<string, unknown>;
  const src = d.source;
  if (typeof src !== 'string') return { isMock: false };
  if (src === 'direct' || src === 'hybrid') return { isMock: false, source: src, rawSource: src };
  if (src === 'mock') return { isMock: true, source: 'mock', rawSource: src };
  // 其他未知 source（比如 direct/hybrid/mock 之外）：保守按 mock 处理（避免误判为真实）
  return { isMock: true, rawSource: src };
}

export async function fetchViaProxy(args: FetchViaProxyArgs): Promise<{
  ok: boolean;
  status: number;
  data: unknown;
  error?: string;
  // 注意：不再是只有两态
  //   'edge-proxy'   → 真实 Hono 后端 2xx 返回，source=direct/hybrid → 可信真实数据
  //   'demo-mock'    → HTTP 2xx 但检测到是 demo-mode.ts 本地 mock → 演示模式拦截，数据不是你的
  //   'fallback'     → 网络错误 / 非 2xx HTTP / (HTTP 2xx 但 source=mock 后端空壳假值) → 内容不可信
  source: 'edge-proxy' | 'demo-mock' | 'fallback';
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
    const isDemo = detectDemoMockResponse(data);
    const backendSk = detectBackendMockSkeleton(data);

    let source: 'edge-proxy' | 'demo-mock' | 'fallback';
    if (!resp.ok) {
      source = 'fallback';
    } else if (isDemo) {
      // 最高优先级：演示模式前端拦截
      source = 'demo-mock';
    } else if (backendSk.source === 'direct' || backendSk.source === 'hybrid') {
      // 后端返回 direct/hybrid → 真实可信
      source = 'edge-proxy';
    } else if (backendSk.source === 'mock') {
      // HTTP 2xx 但 source=mock → 后端空壳/真实失败降级，内容不可信 → fallback
      // （这样 baseAdapter 的 proxySources[i] 才会正确记录，channelMetricsReal=false）
      source = 'fallback';
    } else {
      // 没有 source 字段（老版本）+ 也不是 demo-mode → 保守按 edge-proxy，兼容可能遗漏的老接口
      source = 'edge-proxy';
    }

    const upstreamErr =
      (data && typeof data === 'object' && 'error' in data && typeof (data as { error?: unknown }).error === 'string')
        ? (data as { error: string }).error
        : undefined;

    return {
      ok: resp.ok,
      status: resp.status,
      data,
      // HTTP 2xx 但后端业务失败（source=mock）→ 把后端返回的 error（B站 code/message）透传给前端 warnings，用户一眼能诊断
      error: resp.ok ? upstreamErr : (data as { message?: string }).message || (data as { error?: string }).error || 'HTTP_ERROR',
      source,
    };
  } catch (e) {
    const rawErr = (e as Error).message || 'NETWORK_ERROR';
    // 兜底：网络层面的失败（fetch 抛异常）= 不是 HTTP 4xx/5xx，100% 是后端没起来 / 跨域 / 网络断
    //        → 立刻补做 /api/health 探测，给用户明确的修复路径
    const backendAlive = await probeBackendHealth(base, { cacheSeconds: 15 });
    let errorMsg: string;
    if (!backendAlive.ok) {
      errorMsg = `真实后端未启动/不可达（/api/health ${backendAlive.reason}）。`
        + `本地请在 upzhu-workbench 目录执行：npm run dev:server （启动 Hono 独立服务 :5174），或使用 Vite+hono-dev 插件模式。`
        + `原始错误：${rawErr}`;
    } else {
      errorMsg = rawErr;
    }
    return {
      ok: false,
      status: 0,
      data: null,
      error: errorMsg,
      source: 'fallback',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
//  后端健康探测：缓存 15 秒，避免 9 平台 × 6 接口 = 54 次失败时打 54 次 /health
// ═══════════════════════════════════════════════════════════════════
interface HealthProbe {
  ok: boolean;
  reason: string;
  at: number;
}
let _healthCache: Map<string, HealthProbe> = new Map();
const HEALTH_CACHE_MS = 15_000;

export async function probeBackendHealth(
  proxyBaseUrl = '',
  opts: { cacheSeconds?: number; force?: boolean } = {},
): Promise<{ ok: boolean; reason: string; data?: unknown; status?: number }> {
  const base = (proxyBaseUrl || import.meta.env.VITE_PROXY_BASE_URL || '').replace(/\/$/, '');
  const ttl = typeof opts.cacheSeconds === 'number' ? opts.cacheSeconds * 1000 : HEALTH_CACHE_MS;
  if (!opts.force) {
    const cached = _healthCache.get(base);
    if (cached && Date.now() - cached.at < ttl) {
      return { ok: cached.ok, reason: cached.reason };
    }
  }
  try {
    // 注意：用原生 fetch，不走 http.ts 的 request() —— 否则会被 tryHandleDemoRequest 拦截，后端没开也返回 runtime='demo' 200
    const url = `${base}/api/health`;
    const t0 = performance.now();
    const resp = await fetch(url, {
      method: 'GET',
      // credentials 不传 —— /api/health 是开放接口
      headers: { Accept: 'application/json' },
      // 6 秒超时，别卡到用户其他请求
      signal: AbortSignal.timeout?.(6000) ?? undefined,
    });
    const dt = Math.round(performance.now() - t0);
    let data: unknown = null;
    try { data = await resp.json(); } catch { /* health 非 JSON 也没事 */ }
    // 如果后端没开，fetch 会直接抛异常（走到 catch 分支）—— 到这里说明至少 HTTP 层面通了
    // 再用 detectDemoMockResponse 反推：如果 runtime = demo → 前端拦截 mock，真实后端实际上没在监听
    //   （因为 tryHandleDemoRequest 是在 http.ts request() 里拦截的，原生 fetch 不会命中；
    //     但万一 vite-plugin-hono-dev 本地插件没启，或者 localhost:5173 本身没跑 dev，这里会走 catch；
    //     如果 resp.ok 但 runtime=demo，说明用户使用的是 demo-mode.ts fallback 而不是后端，也算未启动）
    const isDemoFromBackend = detectDemoMockResponse(data);
    const ok = resp.ok && !isDemoFromBackend;
    const reason = ok
      ? `后端已就绪（HTTP ${resp.status}, RTT ${dt}ms）`
      : isDemoFromBackend
        ? `HTTP 通但响应是演示模式 fallback（runtime=demo），真实 Hono 后端没在跑，当前用的是前端 mock`
        : `HTTP ${resp.status}（非 2xx，RTT ${dt}ms）`;
    _healthCache.set(base, { ok, reason, at: Date.now() });
    return { ok, reason, data, status: resp.status };
  } catch (e) {
    const msg = (e as Error).message || 'NETWORK_ERROR';
    let reason: string;
    if (/Failed to fetch|NetworkError|net::|ECONNREFUSED|connection refused/i.test(msg)) {
      reason = `后端未监听（fetch 直接拒绝连接：${msg}）—— 请执行 npm run dev:server 启动 Hono，或启用 vite-plugin-hono-dev`;
    } else if (/timed?out|timeout|abort/i.test(msg)) {
      reason = `后端健康探测超时（6s）：${msg} —— 本地 Vite/Hono 进程可能卡死，重启 npm run dev:server`;
    } else if (/CORS|cross.origin|cors/i.test(msg)) {
      reason = `后端跨域拒绝（CORS）：${msg} —— Hono 需启用 cors() 中间件，或用 vite-plugin-hono-dev 同域代理`;
    } else {
      reason = msg;
    }
    _healthCache.set(base, { ok: false, reason, at: Date.now() });
    return { ok: false, reason };
  }
}

/** 供 UI 一键清空 health 缓存（用户点了「启动后端」后手动调用，立刻重检） */
export function clearBackendHealthCache() {
  _healthCache = new Map();
}

export type CrawlDataSource =
  | 'platform-api'
  | 'edge-proxy'
  | 'mock-fallback'
  | 'local-cache'
  | 'demo-mock'
  | 'mock'
  | 'base-mock';

/** 私有 Symbol：给 ChannelData 打 datasource 标记（JSON.stringify 自动忽略 symbol，不污染持久化） */
export const __MARK_DATASOURCE = Symbol.for('__wb.channelDataSource');
/** 私有 Symbol：给 ChannelData 打 6 接口命中情况（real/mock/demo） */
export const __MARK_INTERFACE_HITS = Symbol.for('__wb.channelInterfaceHits');

/** 诊断辅助：从一个 ChannelData 上读取 datasource 标记（无标记 = mock/baseChannels） */
export function getChannelDataSourceTag(
  c: ChannelData | undefined | null,
): { source: CrawlDataSource; hits?: { real: string[]; mock: string[]; demo: string[] } } {
  if (!c) return { source: 'base-mock' };
  const obj = c as ChannelData & { [k: symbol]: unknown };
  const src = obj[__MARK_DATASOURCE] as CrawlDataSource | undefined;
  const hits = obj[__MARK_INTERFACE_HITS] as { real: string[]; mock: string[]; demo: string[] } | undefined;
  return { source: src ?? 'base-mock', hits };
}

export interface DataSourceStyle {
  /** 背景色（pill / chip 背景） */
  bg: string;
  /** 文字颜色 */
  color: string;
  /** 边框颜色，可选 */
  border?: string;
  /** 展示在 UI 上的中文字段名 */
  label: string;
  /** true = 真实后端成功（可信数据） */
  real: boolean;
  /** 分类标记，用于 UI 分组渲染 */
  tier: 'real' | 'demo' | 'warn' | 'mock';
}

/** 根据 CrawlDataSource 返回 UI 染色样式（AccountSettingsPage 平台卡 + Dashboard 都用同一套） */
export function getDataSourceStyle(src?: CrawlDataSource | string | null): DataSourceStyle {
  switch (src) {
    case 'edge-proxy':
    case 'platform-api':
    case 'local-cache':
      return {
        bg: '#dcfce7',
        color: '#065f46',
        border: '1px solid #86efac',
        label: '✅ 真实接口',
        real: true,
        tier: 'real',
      };
    case 'demo-mock':
      return {
        bg: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d',
        label: '⚠️ 演示模式·拦截',
        real: false,
        tier: 'demo',
      };
    case 'mock-fallback':
      return {
        bg: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
        label: '⚠️ 真实失败·已降级',
        real: false,
        tier: 'warn',
      };
    case 'base-mock':
      return {
        bg: '#e0f2fe',
        color: '#075985',
        border: '1px solid #7dd3fc',
        label: '💡 静态示例数据（未抓取）',
        real: false,
        tier: 'mock',
      };
    case 'mock':
    default:
      return {
        bg: '#f1f5f9',
        color: '#475569',
        border: '1px solid #e2e8f0',
        label: '💡 示例数据·未同步',
        real: false,
        tier: 'mock',
      };
  }
}
