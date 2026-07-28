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
    const data = mockFor(platform, route, req.body?.payload);
    if (isEmpty(credentials) && data === null) {
      res.status(401).json({
        ok: false,
        error: '需要凭据（platform Cookie / OAuth access_token / apiKey 任一），当前为空。部署生产代理后可抓真实数据',
        code: 'NO_CREDENTIALS',
        traceId,
      });
      return;
    }
    res.status(200).json({ ok: true, data, source: 'mock', traceId });
  } catch (e) {
    res.status(400).json({ ok: false, error: (e as Error).message, code: 'BAD_REQUEST' });
  }
}

export default vercel;
