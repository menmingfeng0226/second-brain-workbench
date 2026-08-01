import {
  assertPlatform,
  corsHeaders,
  handleOptions,
  jsonResponse,
  requireAuth,
  isEmpty,
  type PlatformProxyRequest,
} from '../_shared/platform-utils';
import { mockChannels, videoLabs, articleLabs, dailyViewsTrend, publishRecords } from '../_shared/mock-shared';
import { runCrawler } from '../_shared/crawlers';
import type { CrawlContext } from '../_shared/crawlers';

const METHODS: Record<string, string[]> = {
  '/profile/me': ['GET', 'POST'],
  '/user/profile': ['GET', 'POST'],
  '/user/info': ['GET', 'POST'],
  '/finder/me': ['GET', 'POST'],
  '/channels/me': ['GET', 'POST'],
  '/mp/account-info': ['GET', 'POST'],
  '/anchor/profile': ['GET', 'POST'],
  '/podcast/profile': ['GET', 'POST'],
  '/me': ['GET', 'POST'],
  '/data/overview': ['GET', 'POST'],
  '/user/overview': ['GET', 'POST'],
  '/data/summary': ['GET', 'POST'],
  '/finder/overview': ['GET', 'POST'],
  '/channels/overview': ['GET', 'POST'],
  '/mp/overview': ['GET', 'POST'],
  '/anchor/overview': ['GET', 'POST'],
  '/podcast/overview': ['GET', 'POST'],
  '/creator/overview': ['GET', 'POST'],
  '/videos/self': ['GET', 'POST'],
  '/videos/list': ['GET', 'POST'],
  '/finder/videos': ['GET', 'POST'],
  '/videos/search': ['GET', 'POST'],
  '/notes/self': ['GET', 'POST'],
  '/mp/articles': ['GET', 'POST'],
  '/articles/self': ['GET', 'POST'],
  '/data/trend': ['GET', 'POST'],
  '/user/trend': ['GET', 'POST'],
  '/finder/trend': ['GET', 'POST'],
  '/channels/trend': ['GET', 'POST'],
  '/mp/trend': ['GET', 'POST'],
  '/anchor/trend': ['GET', 'POST'],
  '/podcast/trend': ['GET', 'POST'],
  '/creator/trend': ['GET', 'POST'],
  '/videos/published-records': ['GET', 'POST'],
  '/videos/records': ['GET', 'POST'],
  '/finder/publish-records': ['GET', 'POST'],
  '/videos/publish-records': ['GET', 'POST'],
  '/notes/published-records': ['GET', 'POST'],
  '/mp/publish-records': ['GET', 'POST'],
  '/anchor/publish-records': ['GET', 'POST'],
  '/podcast/publish-records': ['GET', 'POST'],
  '/articles/publish-records': ['GET', 'POST'],
};

const MOCK_PROFILES: Record<string, () => unknown> = {
  bilibili: () => ({ handle: '123456', displayName: '沉木野-哔哩哔哩', followerCount: 124800, avatarUrl: 'https://picsum.photos/seed/bili/200/200', profileUrl: 'https://space.bilibili.com/123456' }),
  xiaohongshu: () => ({ handle: 'xhs_abc', displayName: '沉木野·小红书', followerCount: 89200, avatarUrl: 'https://picsum.photos/seed/xhs/200/200', profileUrl: 'https://www.xiaohongshu.com/user/profile/xhs_abc' }),
  douyin: () => ({ handle: 'MSN_ABC', displayName: '沉木野·抖音', followerCount: 156400, avatarUrl: 'https://picsum.photos/seed/douyin/200/200', profileUrl: 'https://www.douyin.com/user/MSN_ABC' }),
  'wechat-video': () => ({ handle: 'sph_abc', displayName: '沉木野·视频号', followerCount: 42100, avatarUrl: 'https://picsum.photos/seed/weixinvideo/200/200', profileUrl: 'https://channels.weixin.qq.com/' }),
  kuaishou: () => ({ handle: 'ks_abc', displayName: '沉木野·快手', followerCount: 128900, avatarUrl: 'https://picsum.photos/seed/kuaishou/200/200', profileUrl: 'https://www.kuaishou.com/profile/ks_abc' }),
  'wechat-official': () => ({ handle: 'chenfengmuye_mp', displayName: '沉木野·公众号', followerCount: 68900, avatarUrl: 'https://picsum.photos/seed/mp/200/200', profileUrl: 'https://mp.weixin.qq.com/' }),
  ximalaya: () => ({ handle: 'anchor_123', displayName: '沉木野·喜马拉雅', followerCount: 15800, avatarUrl: 'https://picsum.photos/seed/xmly/200/200', profileUrl: 'https://www.ximalaya.com/zhubo/anchor_123/' }),
  xiaoyuzhou: () => ({ handle: 'xyz_abc', displayName: '沉木野·小宇宙', followerCount: 8400, avatarUrl: 'https://picsum.photos/seed/xyz/200/200', profileUrl: 'https://www.xiaoyuzhoufm.com/' }),
  zhihu: () => ({ handle: 'chenfengmuye', displayName: '沉木野·知乎', followerCount: 41200, avatarUrl: 'https://picsum.photos/seed/zhihu/200/200', profileUrl: 'https://www.zhihu.com/people/chenfengmuye' }),
};

function mockFor(platform: string, route: string, payload: PlatformProxyRequest['payload']) {
  const handle = payload?.accountHandle;
  if (route === '/profile/me' || route.includes('profile') || route === '/me' || route === '/user/info' || route === '/finder/me' || route === '/channels/me' || route === '/mp/account-info' || route === '/anchor/profile' || route === '/podcast/profile') {
    const base = (MOCK_PROFILES[platform] ?? MOCK_PROFILES.bilibili)() as Record<string, unknown>;
    if (handle) base.handle = handle;
    return base;
  }
  if (route.includes('/data/overview') || route.includes('/user/overview') || route.includes('/data/summary') || route.includes('/finder/overview') || route.includes('/channels/overview') || route.includes('/mp/overview') || route.includes('/anchor/overview') || route.includes('/podcast/overview') || route.includes('/creator/overview')) {
    return mockChannels.find((c) => c.id === platform) ?? mockChannels[0];
  }
  if (route.includes('/videos/')) {
    if (route.includes('records') || route.includes('publish-records')) {
      return publishRecords.filter((r) => r.platform === platform);
    }
    return videoLabs.filter((v) => v.channel === platform);
  }
  if (route.includes('/notes/') || route.includes('/mp/articles') || route.includes('/articles/')) {
    if (route.includes('records') || route.includes('publish-records')) {
      return publishRecords.filter((r) => r.platform === platform);
    }
    return articleLabs.filter((a) => a.channel === platform);
  }
  if (route.includes('/trend')) {
    return dailyViewsTrend;
  }
  return null;
}

interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  body?: PlatformProxyRequest;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (k: string, v: string) => void;
  send: (body: unknown) => void;
  json: (body: unknown) => void;
  end: () => void;
}

function vercel(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    const o = handleOptions();
    for (const [k, v] of Object.entries(o.headers ?? {})) res.setHeader(k, v);
    res.status(o.statusCode).end();
    return;
  }
  const cors = corsHeaders(req);
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  (async () => {
    try {
      const platform = assertPlatform(String(req.query?.platform ?? ''));
      const rawRoute = String(req.query?.route ?? (req.body?.payload ? '/me' : ''));
      const route = rawRoute.startsWith('/') ? rawRoute : '/' + rawRoute;
      const allowedMethods = METHODS[route] ?? ['GET', 'POST'];
      if (!allowedMethods.includes(req.method ?? 'GET')) {
        res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED', code: 405 });
        return;
      }
      const { credentials, traceId } = requireAuth(req);
      const hasCredentials = !isEmpty(credentials);
      // 🔧 DEBUG 日志：后端实际收到的凭据状态
      console.log(`[DEBUG][route.ts] platform=${platform}, route=${route}, method=${req.method}, credentialsKeys=${Object.keys(credentials || {})}, hasCredentials=${hasCredentials}, bodyCreds=${!!req.body?.credentials}`);

      // ═══════════════════ ✅ 核心修复：有凭据时优先调用 runCrawler 抓取真实数据 ═══════════════════
      if (hasCredentials) {
        const ctx: CrawlContext = {
          platform,
          route,
          credentials: credentials as CrawlContext['credentials'],
          payload: req.body?.payload,
        };
        const crawl = await runCrawler(ctx);
        // crawl.source = 'direct' → 真实接口成功（可信数据），'hybrid' → 部分真实+mock，'mock' → 真实接口失败降级mock
        const sourceOut: 'direct' | 'hybrid' | 'mock' = crawl.source === 'direct'
          ? 'direct'
          : crawl.source === 'hybrid'
          ? 'hybrid'
          : 'mock';
        if (crawl.ok && crawl.data !== null && crawl.data !== undefined) {
          res.status(200).json({
            ok: true,
            data: crawl.data,
            source: sourceOut,
            traceId,
            // ✅ 用标准 error/code 字段，和 B 站返回格式对齐，前端 fetchViaProxy 读 data.error 才能收到
            ...(crawl.error ? { error: crawl.error } : {}),
            ...(crawl.code ? { code: crawl.code } : {}),
            ...(sourceOut !== 'direct' ? { _note: '真实接口未完全成功，已自动降级混合/示例数据' } : {}),
          });
          return;
        }
        // runCrawler 返回 ok=false 或无数据 → 继续走 mock fallback，但带上错误信息（用标准 error/code 字段）
        const fallback = mockFor(platform, route, req.body?.payload);
        if (fallback !== null) {
          res.status(200).json({
            ok: true,
            data: fallback,
            source: 'mock',
            traceId,
            error: crawl.error || '真实接口失败（凭据过期/接口风控），已降级示例数据',
            code: crawl.code || 'CRAWLER_FAIL',
            _note: '真实接口失败，已降级示例数据（检查凭据是否正确/过期）',
          });
          return;
        }
        res.status(401).json({
          ok: false,
          error: `真实接口失败：${crawl.error || '无数据'}，且当前 route 无示例 fallback`,
          code: crawl.code || 'NO_FALLBACK',
          traceId,
        });
        return;
      }

      // ═══════════════════ 无凭据 → 走 mock fallback，但明确标记 source='mock' + 警告 ═══════════════════
      const data = mockFor(platform, route, req.body?.payload);
      if (data === null) {
        res.status(401).json({
          ok: false,
          error: '需要凭据（platform Cookie / OAuth access_token / apiKey 任一），当前为空。部署生产代理后可抓真实数据',
          code: 'NO_CREDENTIALS',
          traceId,
        });
        return;
      }
      res.status(200).json({
        ok: true,
        data,
        source: 'mock',
        traceId,
        _note: '当前未传凭据，返回的是示例静态数据（892450/467230 等假值），请在【系统管理】→【账号绑定】页绑定各平台 Cookie/Token 后才会抓取你真实账号。',
      });
    } catch (e) {
      res.status(400).json({ ok: false, error: (e as Error).message, code: 'BAD_REQUEST' });
    }
  })();
}

export default vercel;
