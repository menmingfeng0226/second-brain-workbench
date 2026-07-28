import type { AllowedPlatform } from './platform-utils';
import { mockChannels, videoLabs, articleLabs, dailyViewsTrend, publishRecords } from './mock-shared';

export interface CrawlCredentials {
  [k: string]: string | number | undefined;
}

export interface CrawlContext {
  platform: AllowedPlatform;
  route: string;
  credentials: CrawlCredentials;
  payload?: {
    accountHandle?: string;
    range?: [string | undefined, string | undefined];
    [k: string]: unknown;
  };
  signal?: AbortSignal;
}

export interface CrawlResult<T = unknown> {
  ok: boolean;
  data?: T;
  source?: 'direct' | 'mock' | 'hybrid';
  error?: string;
  code?: string;
}

type BiliVlistItem = {
  bvid: string; title: string; pic: string; play: number; comment: number; created: number;
  video_review?: number; description?: string;
};
type BiliVlistResp = { data?: { list?: { vlist?: BiliVlistItem[] } } };

type DouyinAwemeItem = {
  aweme_id: string; desc: string; cover?: { url_list?: string[] };
  statistics?: { play_count?: number; digg_count?: number; comment_count?: number; share_count?: number };
  create_time?: number;
};
type DouyinAwemeResp = { aweme_list?: DouyinAwemeItem[] };

type ZhihuArticleItem = {
  id?: string; title?: string; excerpt?: string; thumbnail?: string;
  voteup_count?: number; comment_count?: number; created?: number; url?: string;
};
type ZhihuArticlesResp = { data?: ZhihuArticleItem[] };

type WechatMpNewsItem = {
  title?: string; cover?: string; url?: string; create_time?: number; digests?: string;
  read_num?: number; like_num?: number; comment_num?: number;
};
type WechatMpItemContent = { news_item?: WechatMpNewsItem[] };
type WechatMpItem = { content?: WechatMpItemContent };
type WechatMpArticlesResp = { item?: WechatMpItem[] };

type KuaishouPhotoItem = {
  photo_id?: string; caption?: string; cover_url?: string; view_count?: number;
  like_count?: number; comment_count?: number; share_count?: number; timestamp?: number;
};
type KuaishouPhotosResp = { photos?: KuaishouPhotoItem[] };

type XimalayaUserInfo = {
  nickname?: string; avatarPath?: string; anchorGrade?: string;
  followCount?: number; uid?: string;
};
type XimalayaUserPage = { userInfo?: XimalayaUserInfo };
type XimalayaUserResp = { userPage?: XimalayaUserPage };
type XimalayaResp = { data?: XimalayaUserResp };

type KuaishouProfileFields = {
  user_name?: string; headurl?: string; fan_count?: number; user_id?: string;
};
type KuaishouProfileWrapper = { profile?: KuaishouProfileFields };
type KuaishouProfileResp = { userProfile?: KuaishouProfileWrapper };

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

function buildCookieString(creds: CrawlCredentials, keys: string[]): string {
  const parts: string[] = [];
  for (const k of keys) {
    const v = creds[k];
    if (typeof v === 'string' && v) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }
  if ((creds.cookie as string | undefined)?.includes('=')) parts.push(creds.cookie as string);
  return parts.join('; ');
}

async function safeFetch(url: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data?: unknown; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: (init as { signal?: AbortSignal }).signal,
      headers: { 'User-Agent': UA, ...(init.headers ?? {}) },
    });
    const text = await res.text();
    let data: unknown = null;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, error: (e as Error).message };
  }
}

function mockForRoute(platform: AllowedPlatform, route: string, handle?: string) {
  const h = handle;
  if (route.includes('/profile') || route === '/me' || route.includes('/user/info') || route === '/finder/me' || route === '/channels/me' || route === '/mp/account-info' || route === '/anchor/profile' || route === '/podcast/profile') {
    const base = mockChannels.find(c => c.id === platform) ?? mockChannels[0];
    return {
      handle: h ?? platform,
      displayName: base.name,
      avatarUrl: base.avatarUrl,
      profileUrl: base.profileUrl,
      followerCount: base.totalFollowers,
    };
  }
  if (route.includes('/overview') || route.includes('/summary') || route === '/data/overview' || route === '/user/overview' || route === '/data/summary' || route === '/finder/overview' || route === '/channels/overview' || route === '/mp/overview' || route === '/anchor/overview' || route === '/podcast/overview' || route === '/creator/overview') {
    return mockChannels.find(c => c.id === platform) ?? mockChannels[0];
  }
  if (route.includes('/videos/')) {
    if (route.includes('records') || route.includes('publish-records')) {
      return publishRecords.filter(r => r.platform === platform);
    }
    return videoLabs.filter(v => v.channel === platform);
  }
  if (route.includes('/notes/') || route.includes('/mp/articles') || route.includes('/articles/')) {
    if (route.includes('records') || route.includes('publish-records')) {
      return publishRecords.filter(r => r.platform === platform);
    }
    return articleLabs.filter(a => a.channel === platform);
  }
  if (route.includes('/trend')) {
    return dailyViewsTrend;
  }
  return null;
}

// ========== Bilibili ==========
async function crawlBilibili(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = buildCookieString(credentials, ['SESSDATA', 'bili_jct', 'DedeUserID', 'buvid3']);
  const accessToken = credentials.accessToken as string | undefined;
  const mid = credentials.DedeUserID as string | undefined;
  const handle = payload?.accountHandle ?? mid;

  const headers: Record<string, string> = {
    Referer: 'https://www.bilibili.com/',
    Origin: 'https://www.bilibili.com',
  };
  if (cookie) headers.Cookie = cookie;

  try {
    // 1. Profile / me
    if (route === '/profile/me' || route === '/me') {
      // Web端用户空间API
      if (mid) {
        const r = await safeFetch(`https://api.bilibili.com/x/space/wbi/acc/info?mid=${encodeURIComponent(String(mid))}`, { headers });
        if (r.ok && (r.data as { code?: number })?.code === 0) {
          const d = (r.data as { data: { mid: string; name: string; face: string; fans: number } }).data;
          return {
            ok: true, source: 'direct',
            data: {
              handle: String(d.mid),
              displayName: d.name,
              avatarUrl: d.face,
              followerCount: d.fans ?? 0,
              profileUrl: `https://space.bilibili.com/${d.mid}`,
            },
          };
        }
      }
      // OAuth方式
      if (accessToken) {
        const r2 = await safeFetch(`https://api.bilibili.com/x/space/acc/info?access_key=${encodeURIComponent(accessToken)}`, { headers });
        if (r2.ok && (r2.data as { code?: number })?.code === 0) {
          const d = (r2.data as { data: { mid: string; name: string; face: string; fans: number } }).data;
          return { ok: true, source: 'direct', data: { handle: String(d.mid), displayName: d.name, avatarUrl: d.face, followerCount: d.fans ?? 0, profileUrl: `https://space.bilibili.com/${d.mid}` } };
        }
      }
    }

    // 2. Overview / data
    if (route === '/data/overview' || route.includes('/overview')) {
      const mockCh = mockChannels.find(c => c.id === 'bilibili') ?? mockChannels[0];
      // 尝试B站长视频数据统计API
      if (mid) {
        const r = await safeFetch(`https://api.bilibili.com/x/space/stat?mid=${encodeURIComponent(String(mid))}`, { headers });
        if (r.ok && (r.data as { code?: number })?.code === 0) {
          const d = (r.data as { data: { following?: number; follower?: number; view?: number; likes?: number } }).data;
          return {
            ok: true, source: 'hybrid',
            data: {
              ...mockCh,
              totalFollowers: d.follower ?? mockCh.totalFollowers,
              monthViews: d.view ?? mockCh.monthViews,
              monthLikes: d.likes ?? mockCh.monthLikes,
            },
          };
        }
      }
    }

    // 3. Videos
    if (route === '/videos/self' || route === '/videos/list') {
      if (mid) {
        const r = await safeFetch(`https://api.bilibili.com/x/space/wbi/arc/search?mid=${encodeURIComponent(String(mid))}&ps=20&pn=1&order=pubdate`, { headers });
        if (r.ok && (r.data as { code?: number })?.code === 0) {
          const list = ((r.data as BiliVlistResp)?.data?.list?.vlist) ?? [];
          const base = videoLabs.filter(v => v.channel === 'bilibili');
          const mapped = list.slice(0, 20).map((v, i) => ({
            id: `bili_${v.bvid}`,
            title: v.title,
            channel: 'bilibili' as const,
            thumbnail: v.pic?.startsWith('//') ? `https:${v.pic}` : v.pic,
            views: v.play ?? 0,
            likes: (v.video_review ?? 0),
            comments: v.comment ?? 0,
            shares: 0,
            hotIndex: Math.round((v.play ?? 0) * 0.6 + (v.video_review ?? 0) * 30 + (v.comment ?? 0) * 15),
            engagementRate: base[i]?.engagementRate ?? 0,
            watchSeconds: base[i]?.watchSeconds ?? 0,
            publishedAt: new Date(v.created * 1000).toISOString(),
            url: `https://www.bilibili.com/video/${v.bvid}`,
          }));
          return { ok: true, source: 'direct', data: mapped };
        }
      }
    }

    // 4. Trend
    if (route === '/data/trend' || route.includes('/trend')) {
      return { ok: true, source: 'mock', data: dailyViewsTrend };
    }

    // 5. Publish Records
    if (route.includes('publish-records') || route.includes('records')) {
      return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'bilibili') };
    }
  } catch (e) {
    // fall through
  }

  return { ok: true, source: 'mock', data: mockForRoute('bilibili', route, handle) };
}

// ========== Xiaohongshu ==========
async function crawlXiaohongshu(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = buildCookieString(credentials, ['a1', 'web_session', 'x_s', 'x_t']);
  const handle = payload?.accountHandle;

  const headers: Record<string, string> = {
    Referer: 'https://www.xiaohongshu.com/',
    Origin: 'https://www.xiaohongshu.com',
  };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/user/profile' || route === '/profile/me') {
      const userId = handle ?? credentials.xyz_id as string | undefined;
      if (userId && cookie) {
        const r = await safeFetch(`https://edith.xiaohongshu.com/api/sns/web/v1/user/otherinfo?target_user_id=${encodeURIComponent(userId)}`, { headers });
        if (r.ok && (r.data as { success?: boolean; code?: number })?.success !== false) {
          const d = (r.data as { data?: { nickname?: string; avatar?: string; fans?: number; user_id?: string; desc?: string } }).data ?? {};
          return {
            ok: true, source: 'direct',
            data: {
              handle: d.user_id ?? userId,
              displayName: d.nickname ?? '小红书创作者',
              avatarUrl: d.avatar,
              followerCount: d.fans ?? 0,
              profileUrl: `https://www.xiaohongshu.com/user/profile/${d.user_id ?? userId}`,
            },
          };
        }
      }
    }
    if (route === '/user/overview' || route === '/data/summary') {
      return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'xiaohongshu') ?? mockChannels[0] };
    }
    if (route === '/notes/self' || route.includes('/notes/')) {
      return { ok: true, source: 'mock', data: articleLabs.filter(a => a.channel === 'xiaohongshu') };
    }
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records') || route.includes('publish-records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'xiaohongshu') };
  } catch { /* fallthrough */ }

  return { ok: true, source: 'mock', data: mockForRoute('xiaohongshu', route, handle) };
}

// ========== Douyin ==========
async function crawlDouyin(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const accessToken = credentials.accessToken as string | undefined;
  const openId = credentials.openId as string | undefined;
  const cookie = credentials.cookie as string | undefined;
  const handle = payload?.accountHandle ?? openId;

  const headers: Record<string, string> = { Referer: 'https://www.douyin.com/', Origin: 'https://www.douyin.com' };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/user/info' || route === '/profile/me') {
      // 抖音开放平台 OAuth 用户信息
      if (accessToken && openId) {
        const body = JSON.stringify({ access_token: accessToken, open_id: openId });
        const r = await safeFetch('https://open.douyin.com/oauth/userinfo/', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body,
        });
        if (r.ok && (r.data as { data?: { error_code?: number } })?.data?.error_code === 0) {
          const d = (r.data as { data: { nickname?: string; avatar?: string; union_id?: string; followers_count?: number } }).data;
          return {
            ok: true, source: 'direct',
            data: {
              handle: d.union_id ?? openId,
              displayName: d.nickname ?? '抖音创作者',
              avatarUrl: d.avatar,
              followerCount: d.followers_count ?? 0,
              profileUrl: `https://www.douyin.com/user/${openId ?? ''}`,
            },
          };
        }
      }
      // Web端 sec_uid 方式
      if (handle && cookie) {
        const r2 = await safeFetch(`https://www.douyin.com/aweme/v1/web/user/profile/other/?sec_user_id=${encodeURIComponent(handle)}`, { headers });
        if (r2.ok) {
          const user = (r2.data as { user?: { nickname?: string; avatar_thumb?: { url_list?: string[] }; follower_count?: number; sec_uid?: string } }).user;
          if (user) {
            return {
              ok: true, source: 'direct',
              data: {
                handle: user.sec_uid ?? handle,
                displayName: user.nickname ?? '抖音创作者',
                avatarUrl: user.avatar_thumb?.url_list?.[0],
                followerCount: user.follower_count ?? 0,
                profileUrl: `https://www.douyin.com/user/${user.sec_uid ?? handle}`,
              },
            };
          }
        }
      }
    }
    if (route === '/data/summary' || route === '/data/overview') {
      return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'douyin') ?? mockChannels[0] };
    }
    if (route === '/videos/list' || route === '/videos/self') {
      if (handle && cookie) {
        const r = await safeFetch(`https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=${encodeURIComponent(handle)}&count=20`, { headers });
        const list = (r.data as DouyinAwemeResp).aweme_list ?? [];
        if (list.length) {
          const base = videoLabs.filter(v => v.channel === 'douyin');
          const mapped = list.slice(0, 20).map((v, i) => ({
            id: `dy_${v.aweme_id}`,
            title: v.desc,
            channel: 'douyin' as const,
            thumbnail: v.cover?.url_list?.[0],
            views: v.statistics?.play_count ?? 0,
            likes: v.statistics?.digg_count ?? 0,
            comments: v.statistics?.comment_count ?? 0,
            shares: v.statistics?.share_count ?? 0,
            hotIndex: Math.round((v.statistics?.play_count ?? 0) * 0.5 + (v.statistics?.digg_count ?? 0) * 20 + (v.statistics?.comment_count ?? 0) * 10 + (v.statistics?.share_count ?? 0) * 30),
            engagementRate: base[i]?.engagementRate ?? 0,
            watchSeconds: base[i]?.watchSeconds ?? 0,
            publishedAt: v.create_time ? new Date(v.create_time * 1000).toISOString() : new Date().toISOString(),
            url: `https://www.douyin.com/video/${v.aweme_id}`,
          }));
          return { ok: true, source: 'direct', data: mapped };
        }
      }
      return { ok: true, source: 'mock', data: videoLabs.filter(v => v.channel === 'douyin') };
    }
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'douyin') };
  } catch { /* fallthrough */ }

  return { ok: true, source: 'mock', data: mockForRoute('douyin', route, handle) };
}

// ========== Zhihu ==========
async function crawlZhihu(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const zc0 = credentials.z_c0 as string | undefined;
  const dc0 = credentials.d_c0 as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const handle = payload?.accountHandle;
  const bearer = zc0 ? (zc0.startsWith('Bearer ') ? zc0 : `Bearer ${zc0}`) : (accessToken ? `Bearer ${accessToken}` : undefined);

  const headers: Record<string, string> = { Referer: 'https://www.zhihu.com/', Origin: 'https://www.zhihu.com' };
  if (bearer) headers.Authorization = bearer;
  if (dc0) headers['X-Xsrftoken'] = dc0.slice(0, 32);

  try {
    if (route === '/me' || route === '/profile/me') {
      if (bearer) {
        const r = await safeFetch('https://api.zhihu.com/members/me', { headers });
        if (r.ok) {
          const d = r.data as { id?: string; name?: string; avatar_url?: string; follower_count?: number; url_token?: string };
          return {
            ok: true, source: 'direct',
            data: {
              handle: d.url_token ?? d.id ?? handle,
              displayName: d.name ?? '知乎创作者',
              avatarUrl: d.avatar_url,
              followerCount: d.follower_count ?? 0,
              profileUrl: `https://www.zhihu.com/people/${d.url_token ?? d.id ?? ''}`,
            },
          };
        }
      }
    }
    if (route === '/creator/overview') {
      return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'zhihu') ?? mockChannels[0] };
    }
    if (route === '/articles/self' || route.includes('/articles/')) {
      if (handle && bearer) {
        const r = await safeFetch(`https://api.zhihu.com/members/${encodeURIComponent(handle)}/articles?limit=20&offset=0`, { headers });
        if (r.ok) {
          const list = (r.data as ZhihuArticlesResp).data ?? [];
          const base = articleLabs.filter(a => a.channel === 'zhihu');
          const mapped = list.slice(0, 20).map((a, i) => ({
            id: `zh_${a.id ?? i}`,
            title: a.title ?? '(无标题)',
            summary: a.excerpt ?? '',
            channel: 'zhihu' as const,
            thumbnail: a.thumbnail,
            views: Math.round((a.voteup_count ?? 0) * 20),
            likes: a.voteup_count ?? 0,
            comments: a.comment_count ?? 0,
            hotIndex: Math.round((a.voteup_count ?? 0) * 50 + (a.comment_count ?? 0) * 25),
            engagementRate: base[i]?.engagementRate ?? 0,
            readRate: base[i]?.readRate ?? 0,
            publishedAt: a.created ? new Date(a.created * 1000).toISOString() : new Date().toISOString(),
            url: a.url ?? `https://zhuanlan.zhihu.com/p/${a.id ?? ''}`,
          }));
          return { ok: true, source: 'direct', data: mapped };
        }
      }
      return { ok: true, source: 'mock', data: articleLabs.filter(a => a.channel === 'zhihu') };
    }
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'zhihu') };
  } catch { /* fallthrough */ }

  return { ok: true, source: 'mock', data: mockForRoute('zhihu', route, handle) };
}

// ========== WeChat Video ==========
async function crawlWechatVideo(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = credentials.cookie as string | undefined;
  const token = credentials.accessToken as string | undefined;
  const handle = payload?.accountHandle;
  const headers: Record<string, string> = { Referer: 'https://channels.weixin.qq.com/', Origin: 'https://channels.weixin.qq.com' };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/finder/me' || route === '/profile/me') {
      // 视频号助手后台接口
      if (cookie) {
        const r = await safeFetch('https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/homepage/home_page_info', { headers, method: 'POST', body: '{}' });
        const d = (r.data as { data?: { finder_username?: string; finder_nickname?: string; head_buffer?: string; follower_count?: number } }).data;
        if (d?.finder_nickname) {
          return {
            ok: true, source: 'direct',
            data: {
              handle: d.finder_username ?? handle,
              displayName: d.finder_nickname,
              avatarUrl: d.head_buffer,
              followerCount: d.follower_count ?? 0,
              profileUrl: 'https://channels.weixin.qq.com/',
            },
          };
        }
      }
    }
    if (route === '/finder/overview' || route === '/data/summary') {
      return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'wechat-video') ?? mockChannels[0] };
    }
    if (route === '/finder/videos') return { ok: true, source: 'mock', data: videoLabs.filter(v => v.channel === 'wechat-video') };
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'wechat-video') };
  } catch { /* fallthrough */ }
  void token;
  return { ok: true, source: 'mock', data: mockForRoute('wechat-video', route, handle) };
}

// ========== WeChat Official ==========
async function crawlWechatOfficial(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const appid = credentials.appid as string | undefined;
  const appSecret = credentials.appSecret as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const cookie = credentials.cookie as string | undefined;
  const handle = payload?.accountHandle;
  const headers: Record<string, string> = { Referer: 'https://mp.weixin.qq.com/', Origin: 'https://mp.weixin.qq.com' };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/mp/account-info' || route === '/profile/me') {
      if (accessToken) {
        const r = await safeFetch(`https://api.weixin.qq.com/cgi-bin/account/getaccountbasicinfo?access_token=${encodeURIComponent(accessToken)}`, { headers });
        if (r.ok) {
          const info = (r.data as { account_info?: { nickname?: string; head_image?: string; alias?: string; appid?: string; fans_count?: number } }).account_info;
          if (info?.nickname) {
            return {
              ok: true, source: 'direct',
              data: {
                handle: info.appid ?? info.alias ?? appid ?? handle,
                displayName: info.nickname,
                avatarUrl: info.head_image,
                followerCount: info.fans_count ?? 0,
                profileUrl: 'https://mp.weixin.qq.com/',
              },
            };
          }
        }
      }
    }
    if (route === '/mp/overview') return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'wechat-official') ?? mockChannels[0] };
    if (route === '/mp/articles') {
      if (accessToken) {
        const body = JSON.stringify({ action: 'list_all', count: 20, offset: 0 });
        const r = await safeFetch(`https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${encodeURIComponent(accessToken)}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body });
        const list = (r.data as WechatMpArticlesResp).item ?? [];
        const arr = list.flatMap(x => x.content?.news_item ?? []).slice(0, 20);
        const base = articleLabs.filter(a => a.channel === 'wechat-official');
        if (arr.length) {
          const mapped = arr.map((a, i) => ({
            id: `mp_${i}`,
            title: a.title ?? base[i]?.title ?? '公众号文章',
            summary: a.digests ?? '',
            channel: 'wechat-official' as const,
            thumbnail: a.cover,
            views: a.read_num ?? base[i]?.views ?? 0,
            likes: a.like_num ?? base[i]?.likes ?? 0,
            comments: a.comment_num ?? base[i]?.comments ?? 0,
            hotIndex: Math.round((a.read_num ?? base[i]?.views ?? 0) * 0.5 + (a.like_num ?? base[i]?.likes ?? 0) * 5),
            engagementRate: base[i]?.engagementRate ?? 0,
            readRate: base[i]?.readRate ?? 0,
            publishedAt: a.create_time ? new Date(a.create_time * 1000).toISOString() : new Date().toISOString(),
            url: a.url ?? base[i]?.url,
          }));
          return { ok: true, source: 'direct', data: mapped };
        }
      }
      return { ok: true, source: 'mock', data: base };
    }
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'wechat-official') };
  } catch { /* fallthrough */ }
  void appSecret;
  return { ok: true, source: 'mock', data: mockForRoute('wechat-official', route, handle) };
}

// ========== Ximalaya ==========
async function crawlXimalaya(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const appid = credentials.appid as string | undefined;
  const appSecret = credentials.appSecret as string | undefined;
  const token = credentials.xm_token as string | undefined;
  const mid = credentials.mid as string | undefined;
  const handle = payload?.accountHandle ?? mid;
  const headers: Record<string, string> = { Referer: 'https://www.ximalaya.com/', Origin: 'https://www.ximalaya.com' };
  if (token) headers.Cookie = `1&_token=${token};`;
  try {
    if (route === '/anchor/profile' || route === '/profile/me') {
      if (mid) {
        const r = await safeFetch(`https://www.ximalaya.com/revision/user/personal?pageSize=1&uid=${encodeURIComponent(String(mid))}`, { headers });
        const u = (r.data as XimalayaResp).data?.userPage?.userInfo;
        if (u?.nickname) {
          return {
            ok: true, source: 'direct',
            data: {
              handle: u.uid ?? mid,
              displayName: u.nickname,
              avatarUrl: u.avatarPath,
              followerCount: u.followCount ?? 0,
              profileUrl: `https://www.ximalaya.com/zhubo/${u.uid ?? mid}/`,
            },
          };
        }
      }
    }
    if (route === '/anchor/overview') return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'ximalaya') ?? mockChannels[0] };
    if (route.includes('/podcast') && route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'ximalaya') };
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'ximalaya') };
  } catch { /* fallthrough */ }
  void appid; void appSecret;
  return { ok: true, source: 'mock', data: mockForRoute('ximalaya', route, handle) };
}

// ========== Xiaoyuzhou ==========
async function crawlXiaoyuzhou(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const id = credentials.xyz_id as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const cookie = credentials.cookie as string | undefined;
  const handle = payload?.accountHandle ?? id;
  const headers: Record<string, string> = { Referer: 'https://www.xiaoyuzhoufm.com/', Origin: 'https://www.xiaoyuzhoufm.com' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (cookie) headers.Cookie = cookie;
  try {
    if (route === '/podcast/profile' || route === '/profile/me') {
      if (id) {
        const r = await safeFetch(`https://rapi.xiaoyuzhoufm.com/v1/podcast/${encodeURIComponent(id)}`, { headers });
        const p = (r.data as { data?: { title?: string; image?: string; subscriber_count?: number; id?: string } }).data;
        if (p?.title) {
          return {
            ok: true, source: 'direct',
            data: {
              handle: p.id ?? id,
              displayName: p.title,
              avatarUrl: p.image,
              followerCount: p.subscriber_count ?? 0,
              profileUrl: `https://www.xiaoyuzhoufm.com/podcast/${p.id ?? id}`,
            },
          };
        }
      }
    }
    if (route === '/podcast/overview') return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'xiaoyuzhou') ?? mockChannels[0] };
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'xiaoyuzhou') };
  } catch { /* fallthrough */ }
  return { ok: true, source: 'mock', data: mockForRoute('xiaoyuzhou', route, handle) };
}

// ========== Kuaishou ==========
async function crawlKuaishou(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = credentials.cookie as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const openId = credentials.openId as string | undefined;
  const handle = payload?.accountHandle ?? openId;
  const headers: Record<string, string> = { Referer: 'https://www.kuaishou.com/', Origin: 'https://www.kuaishou.com' };
  if (cookie) headers.Cookie = cookie;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    if (route === '/user/profile' || route === '/profile/me' || route === '/me') {
      // 1. 快手开放平台 OAuth
      if (accessToken && openId) {
        const body = JSON.stringify({ app_id: '', access_token: accessToken, open_id: openId });
        const r = await safeFetch('https://open.kuaishou.com/openapi/user_info', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body,
        });
        const d = (r.data as { result?: number; user_info?: { name?: string; head?: string; fan?: number; open_id?: string } })?.user_info;
        if (d?.name) {
          return {
            ok: true, source: 'direct',
            data: {
              handle: d.open_id ?? openId,
              displayName: d.name,
              avatarUrl: d.head,
              followerCount: d.fan ?? 0,
              profileUrl: `https://www.kuaishou.com/profile/${d.open_id ?? openId}`,
            },
          };
        }
      }
      // 2. Web 端 Cookie + principalId
      if (handle && cookie) {
        const r = await safeFetch('https://www.kuaishou.com/rest/n/profile/v1/profile/other', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ principalId: handle }),
        });
        const u = (r.data as KuaishouProfileResp).userProfile?.profile;
        if (u?.user_name) {
          return {
            ok: true, source: 'direct',
            data: {
              handle: u.user_id ?? handle,
              displayName: u.user_name,
              avatarUrl: u.headurl,
              followerCount: u.fan_count ?? 0,
              profileUrl: `https://www.kuaishou.com/profile/${u.user_id ?? handle}`,
            },
          };
        }
      }
    }
    if (route === '/data/overview' || route === '/user/overview' || route === '/data/summary') {
      return { ok: true, source: 'mock', data: mockChannels.find(c => c.id === 'kuaishou') ?? mockChannels[0] };
    }
    if (route === '/videos/self' || route === '/videos/list') {
      if (handle && cookie) {
        const body = JSON.stringify({ userId: handle, pcursor: '', count: 20 });
        const r = await safeFetch('https://www.kuaishou.com/rest/n/profile/v1/profile/photoList', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body,
        });
        const list = ((r.data as KuaishouPhotosResp)?.photos) ?? [];
        if (list.length) {
          const base = videoLabs.filter(v => v.channel === 'kuaishou');
          const mapped = list.slice(0, 20).map((p, i) => ({
            id: `ks_${p.photo_id ?? i}`,
            title: p.caption ?? base[i]?.title ?? '快手作品',
            channel: 'kuaishou' as const,
            thumbnail: p.cover_url ?? base[i]?.thumbnail,
            views: p.view_count ?? base[i]?.views ?? 0,
            likes: p.like_count ?? base[i]?.likes ?? 0,
            comments: p.comment_count ?? base[i]?.comments ?? 0,
            shares: p.share_count ?? base[i]?.shares ?? 0,
            hotIndex: Math.round((p.view_count ?? 0) * 0.5 + (p.like_count ?? 0) * 15 + (p.comment_count ?? 0) * 10 + (p.share_count ?? 0) * 30),
            engagementRate: base[i]?.engagementRate ?? 0,
            watchSeconds: base[i]?.watchSeconds ?? 0,
            publishedAt: p.timestamp ? new Date(p.timestamp * 1000).toISOString() : new Date().toISOString(),
            url: `https://www.kuaishou.com/short-video/${p.photo_id ?? ''}`,
          }));
          return { ok: true, source: 'direct', data: mapped };
        }
      }
      return { ok: true, source: 'mock', data: videoLabs.filter(v => v.channel === 'kuaishou') };
    }
    if (route === '/data/trend' || route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records') || route.includes('publish-records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'kuaishou') };
  } catch { /* fallthrough */ }
  return { ok: true, source: 'mock', data: mockForRoute('kuaishou', route, handle) };
}

export const CRAWLERS: Record<AllowedPlatform, (ctx: CrawlContext) => Promise<CrawlResult>> = {
  bilibili: crawlBilibili,
  xiaohongshu: crawlXiaohongshu,
  douyin: crawlDouyin,
  'wechat-video': crawlWechatVideo,
  kuaishou: crawlKuaishou,
  'wechat-official': crawlWechatOfficial,
  ximalaya: crawlXimalaya,
  xiaoyuzhou: crawlXiaoyuzhou,
  zhihu: crawlZhihu,
};

export async function runCrawler(ctx: CrawlContext): Promise<CrawlResult> {
  const fn = CRAWLERS[ctx.platform];
  if (!fn) return { ok: false, code: 'PLATFORM_NOT_SUPPORTED', error: `不支持的平台: ${ctx.platform}` };
  try {
    return await Promise.race([
      fn(ctx),
      new Promise<CrawlResult>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 15000)),
    ]);
  } catch (e) {
    const msg = (e as Error).message;
    const fallback = mockForRoute(ctx.platform, ctx.route, ctx.payload?.accountHandle);
    return {
      ok: fallback !== null,
      source: 'mock',
      data: fallback ?? undefined,
      error: msg,
      code: msg === 'TIMEOUT' ? 'TIMEOUT' : 'CRAWLER_ERROR',
    };
  }
}
