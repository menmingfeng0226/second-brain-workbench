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

  // 收集所有真实接口的 code/message 供前端展示
  const upstreamErrors: string[] = [];
  const pushBiliErr = (label: string, data: unknown) => {
    if (data && typeof data === 'object' && 'code' in data && typeof (data as { code?: unknown }).code === 'number' && (data as { code: number }).code !== 0) {
      const msg = (data as { message?: string }).message ?? '';
      upstreamErrors.push(`${label}[code=${(data as { code: number }).code}]${msg ? `: ${msg}` : ''}`);
    }
  };

  try {
    // 1. Profile / me
    if (route === '/profile/me' || route === '/me') {
      // ✅ 优先：/x/web-interface/card（免 WBI 签名、免登录公开接口，100-500ms 秒回）
      //   之前放第二位导致 WBI 接口 hang 住 15s timeout 时直接把后续 fallback 都 kill 了！
      if (mid) {
        const rQuick = await safeFetch(`https://api.bilibili.com/x/web-interface/card?mid=${encodeURIComponent(String(mid))}`, { headers });
        pushBiliErr('web-interface/card', rQuick.data);
        if (rQuick.ok && (rQuick.data as { code?: number })?.code === 0) {
          const card = (rQuick.data as { data?: { card?: { mid?: number|string; name?: string; face?: string; fans?: number; } } }).data?.card;
          if (card && card.mid) {
            return {
              ok: true, source: 'direct',
              data: {
                handle: String(card.mid),
                displayName: card.name ?? '',
                avatarUrl: card.face ?? '',
                followerCount: card.fans ?? 0,
                profileUrl: `https://space.bilibili.com/${card.mid}`,
              },
            };
          }
        }
        // 备选：Web 端 WBI 用户空间信息（需 WBI 签名 — 若 web-interface/card 不可用再调）
        const r = await safeFetch(`https://api.bilibili.com/x/space/wbi/acc/info?mid=${encodeURIComponent(String(mid))}`, { headers });
        pushBiliErr('wbi/acc/info', r.data);
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
      // OAuth 方式（次选
      if (accessToken) {
        const r2 = await safeFetch(`https://api.bilibili.com/x/space/acc/info?access_key=${encodeURIComponent(accessToken)}`, { headers });
        pushBiliErr('acc/info[access_key]', r2.data);
        if (r2.ok && (r2.data as { code?: number })?.code === 0) {
          const d = (r2.data as { data: { mid: string; name: string; face: string; fans: number } }).data;
          return { ok: true, source: 'direct', data: { handle: String(d.mid), displayName: d.name, avatarUrl: d.face, followerCount: d.fans ?? 0, profileUrl: `https://space.bilibili.com/${d.mid}` } };
        }
      }
    }

    // 2. Overview / data
    if (route === '/data/overview' || route.includes('/overview')) {
      const mockCh = mockChannels.find(c => c.id === 'bilibili') ?? mockChannels[0];
      if (mid) {
        // ✅ 优先：/x/web-interface/card（免签名公开接口秒回，粉丝数 99% 情况下能拿到）
        const rQuick = await safeFetch(`https://api.bilibili.com/x/web-interface/card?mid=${encodeURIComponent(String(mid))}`, { headers });
        pushBiliErr('web-interface/card[overview quick]', rQuick.data);
        if (rQuick.ok && (rQuick.data as { code?: number })?.code === 0) {
          const card = (rQuick.data as { data?: { card?: { fans?: number; archive_count?: number; } } }).data?.card;
          if (card?.fans) {
            return {
              ok: true, source: 'direct',
              data: {
                ...mockCh,
                totalFollowers: card.fans ?? mockCh.totalFollowers,
              },
            };
          }
        }
        // 备选 2：B 站长视频数据统计 API（有粉丝+月播放+月点赞三字段）
        const r = await safeFetch(`https://api.bilibili.com/x/space/stat?mid=${encodeURIComponent(String(mid))}`, { headers });
        pushBiliErr('space/stat', r.data);
        if (r.ok && (r.data as { code?: number })?.code === 0) {
          const d = (r.data as { data: { following?: number; follower?: number; view?: number; likes?: number } }).data;
          return {
            ok: true, source: 'direct',
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
        // 首选 WBI 版本，失败后回落到无 wbi 前缀的老接口 /x/space/arc/search
        const r1 = await safeFetch(`https://api.bilibili.com/x/space/wbi/arc/search?mid=${encodeURIComponent(String(mid))}&ps=20&pn=1&order=pubdate`, { headers });
        pushBiliErr('wbi/arc/search', r1.data);
        let list: BiliVlistItem[] = [];
        if (r1.ok && (r1.data as { code?: number })?.code === 0) {
          list = ((r1.data as BiliVlistResp)?.data?.list?.vlist) ?? [];
        } else {
            const rFb = await safeFetch(`https://api.bilibili.com/x/space/arc/search?mid=${encodeURIComponent(String(mid))}&ps=20&pn=1&order=pubdate`, { headers });
            pushBiliErr('space/arc/search', rFb.data);
            if (rFb.ok && (rFb.data as { code?: number })?.code === 0) {
              list = ((rFb.data as BiliVlistResp)?.data?.list?.vlist) ?? [];
            }
        }
        if (list.length > 0) {
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
    upstreamErrors.push(`exception:${(e as Error).message}`);
    // fall through
  }

  const fallback = mockForRoute('bilibili', route, handle);
  return {
    ok: true,
    source: 'mock',
    data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== Xiaohongshu ==========
async function crawlXiaohongshu(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = buildCookieString(credentials, ['a1', 'web_session', 'x_s', 'x_t']);
  const handle = payload?.accountHandle;
  const upstreamErrors: string[] = [];
  // 🔧 增强 pushErr：HTTP_FAIL 时把真实 status 写出来（406/401/403/429 都是小红书常见返回）
  const pushErr = (label: string, data: unknown, ok?: boolean, status?: number) => {
    if (ok === false) {
      const sc = status ?? 0;
      upstreamErrors.push(`${label}[HTTP_FAIL${sc ? `|status=${sc}` : ''}]`);
      return;
    }
    if (data && typeof data === 'object') {
      if ('success' in data && (data as { success?: boolean }).success === false) {
        const msg = (data as { msg?: string; code?: number|string }).msg ?? '';
        const code = (data as { code?: number|string }).code;
        upstreamErrors.push(`${label}[success=false${code !== undefined ? ` code=${code}` : ''}]${msg ? `: ${msg}` : ''}`);
      } else if ('code' in data && typeof (data as { code?: unknown }).code === 'number' && (data as { code: number }).code !== 0 && (data as { code: number }).code !== 200) {
        const code = (data as { code: number }).code;
        const msg = (data as { message?: string; msg?: string }).message ?? (data as { msg?: string }).msg ?? '';
        upstreamErrors.push(`${label}[code=${code}]${msg ? `: ${msg}` : ''}`);
      }
    }
  };

  const headers: Record<string, string> = {
    'User-Agent': UA,
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: 'https://www.xiaohongshu.com/',
    Origin: 'https://www.xiaohongshu.com',
  };
  if (cookie) headers.Cookie = cookie;

  // 🔴【小红书核心诊断：为什么 99ms + mockHits=6/6？】
  // 先把前置检查做了：没 user_id 或 没 a1+web_session Cookie 时，提前写清楚错误原因，
  // 不要只写空泛的 user/otherinfo[HTTP_FAIL] → 用户根本不知道是哪栏没填！
  const userId = (handle as string | undefined) ?? credentials.xyz_id as string | undefined;
  const hasCookie = !!cookie;
  const hasA1 = typeof credentials.a1 === 'string' && credentials.a1.length >= 8;
  const hasWebSession = typeof credentials.web_session === 'string' && credentials.web_session.length >= 8;
  if (!userId) {
    upstreamErrors.push(`🔴 前置检查失败：未提供【账号 Handle / ID】（页面顶部第一个栏位）→ 必须填你的小红书主页 URL 里的 user_id（长字符串，如 65a1b2c3d4e5f67890abcdef 或 xyz 字母+数字），不能留空！否则永远走示例 467,230 假粉丝`);
  }
  if (userId && !(hasA1 && hasWebSession) && !hasCookie) {
    upstreamErrors.push(`🔴 前置检查失败：user_id 已填【${userId}】，但没找到有效 Cookie → 必须在下方 credentialFields 填 **a1** + **web_session** 两栏（.xiaohongshu.com Cookies 里直接复制 value，缺一不可），或者直接填「完整Cookie 整行」≥40 字符。只填 user_id 没有 a1/web_session 小红书会拒绝（406/401），不会返回真实粉丝数！`);
  }

  const fallbackProfile = (() => mockForRoute('xiaohongshu', '/profile/me', handle)) as () => CrawlResult['data'];

  try {
    // 🎯 小红书 2026 统一抓取策略：只要有 user_id + Cookie，先并行打 4 个 profile 接口，
    // 任何一个返回 fans / followerCount / nickname 任一有值，就立即采用，不会因为某个接口 406 而整条链路失败。
    // （之前：只单一打 edith.xiaohongshu.com/.../user/otherinfo → 2026 小红书强制 X-s 签名 → 永远 406，
    //  即使 a1/web_session 完整也抓不到，导致你永远 tile 橙！）
    type ProfileHit = {
      handle?: string; displayName?: string; avatarUrl?: string;
      followerCount: number; bio?: string; profileUrl?: string;
    };
    let profileHit: ProfileHit | null = null;
    let fansFromOverview: number | undefined;
    if (userId && hasCookie) {
      // 🔁 Fallback 链：edith X-s 签名接口 → webpage 旧接口 → web-interface/card → 兜底 webv2
      // 每个失败立即 pushErr 到 upstreamErrors 给诊断，但继续试下一个。
      const tryFetchProfile = async (label: string, url: string): Promise<ProfileHit | null> => {
        const r = await safeFetch(url, { headers });
        pushErr(label, r.data, r.ok, r.status);
        if (!r.ok || !r.data || typeof r.data !== 'object') return null;
        const rd = r.data as any;
        // 标准化几种返回结构：
        //   /user/otherinfo → { data: { nickname, avatar, fans, user_id, desc } }
        //   /web-interface/card → { data: { follower, nickname, avatar, user_id } }
        //   /user/webpage → { data: { basic_info: { name, avatar, fans_count } } }
        //   直接 { nickname, fans, avatar, user_id }
        const d = rd.data ?? rd;
        if (!d || typeof d !== 'object') return null;
        const fansCandidates: (number|undefined)[] = [
          typeof d.fans === 'number' ? d.fans : undefined,
          typeof d.follower_count === 'number' ? d.follower_count : undefined,
          typeof d.followerCount === 'number' ? d.followerCount : undefined,
          typeof d.followers === 'number' ? d.followers : undefined,
          typeof d.fans_count === 'number' ? d.fans_count : undefined,
          d && typeof d.basic_info === 'object' && typeof (d.basic_info as any).fans_count === 'number' ? (d.basic_info as any).fans_count : undefined,
        ];
        const fans = fansCandidates.find(n => typeof n === 'number') as number | undefined;
        const nickname: string | undefined = d.nickname ?? d.name ?? (d.basic_info as any)?.name ?? d.user_name;
        const avatar: string | undefined = d.avatar ?? d.avatar_url ?? d.avatarUrl ?? d.images?.[0] ?? (d.basic_info as any)?.avatar;
        const uid: string | undefined = d.user_id ?? d.userId ?? d.uid ?? d.red_id ?? d.id;
        if (typeof fans === 'number' || nickname) {
          return {
            handle: uid ?? userId,
            displayName: nickname ?? '小红书创作者',
            avatarUrl: avatar,
            followerCount: fans ?? 0,
            bio: typeof d.desc === 'string' ? d.desc : typeof d.description === 'string' ? d.description : undefined,
            profileUrl: `https://www.xiaohongshu.com/user/profile/${uid ?? userId}`,
          };
        }
        return null;
      };

      const urls: Array<{label: string; url: string}> = [
        { label: 'user/otherinfo(edith)',
          url: `https://edith.xiaohongshu.com/api/sns/web/v1/user/otherinfo?target_user_id=${encodeURIComponent(userId)}` },
        { label: 'user/otherinfo(www-ns1)',
          url: `https://www.xiaohongshu.com/ns1/api/sns/web/v1/user/otherinfo?target_user_id=${encodeURIComponent(userId)}` },
        { label: 'web-interface/card',
          url: `https://www.xiaohongshu.com/web-interface/card?target_user_id=${encodeURIComponent(userId)}` },
        { label: 'user/webpage',
          url: `https://edith.xiaohongshu.com/api/sns/web/v1/user/webpage?target_user_id=${encodeURIComponent(userId)}` },
      ];

      for (const u of urls) {
        const hit = await tryFetchProfile(u.label, u.url);
        if (hit) { profileHit = hit; break; }
      }
      if (typeof profileHit?.followerCount === 'number') fansFromOverview = profileHit.followerCount;
    }

    if (route === '/user/profile' || route === '/profile/me') {
      if (profileHit) {
        return { ok: true, source: 'direct', data: profileHit };
      }
    }
    if (route === '/user/overview' || route === '/data/summary' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'xiaohongshu') ?? mockChannels[0];
      if (typeof fansFromOverview === 'number') {
        return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: fansFromOverview, handle: userId ?? mockCh.handle } };
      }
      return { ok: true, source: 'mock', data: mockCh };
    }
    if (route === '/notes/self' || route.includes('/notes/')) {
      return { ok: true, source: 'mock', data: articleLabs.filter(a => a.channel === 'xiaohongshu') };
    }
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records') || route.includes('publish-records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'xiaohongshu') };
    if (route.includes('/videos/self') || route.includes('/published-list')) return { ok: true, source: 'mock', data: [] };
    if (route.includes('/viral-videos')) return { ok: true, source: 'mock', data: viralVideos.filter(v => v.platform === 'xiaohongshu') };
    if (route.includes('/viral-articles')) return { ok: true, source: 'mock', data: viralArticles.filter(a => a.platform === 'xiaohongshu') };
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }

  const fallback = mockForRoute('xiaohongshu', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== Douyin ==========
async function crawlDouyin(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const accessToken = credentials.accessToken as string | undefined;
  const openId = credentials.openId as string | undefined;
  const cookie = credentials.cookie as string | undefined;
  const handle = payload?.accountHandle ?? openId;
  const upstreamErrors: string[] = [];
  const pushErr = (label: string, data: unknown, ok?: boolean) => {
    if (ok === false) { upstreamErrors.push(`${label}[HTTP_FAIL]`); return; }
    if (data && typeof data === 'object' && 'data' in data && data && typeof (data as { data?: unknown }).data === 'object' && (data as { data: { error_code?: number } }).data?.error_code !== undefined && (data as { data: { error_code: number } }).data.error_code !== 0) {
      const code = (data as { data: { error_code: number } }).data.error_code;
      const desc = (data as { data: { description?: string } }).data?.description ?? '';
      upstreamErrors.push(`${label}[oauth_error_code=${code}]${desc ? `: ${desc}` : ''}`);
    } else if (data && typeof data === 'object' && 'status_code' in data && typeof (data as { status_code?: number }).status_code === 'number' && (data as { status_code: number }).status_code !== 0) {
      upstreamErrors.push(`${label}[status_code=${(data as { status_code: number }).status_code}]`);
    }
  };

  const headers: Record<string, string> = { Referer: 'https://www.douyin.com/', Origin: 'https://www.douyin.com' };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/user/info' || route === '/profile/me') {
      // ✅ 先 Web 端 Cookie 方式（sec_uid + 完整 Cookie，秒回，不需要签名），失败再 OAuth
      if (handle && cookie) {
        const r2 = await safeFetch(`https://www.douyin.com/aweme/v1/web/user/profile/other/?sec_user_id=${encodeURIComponent(handle)}`, { headers });
        pushErr('aweme/user/profile/other', r2.data, r2.ok);
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
      // 抖音开放平台 OAuth 用户信息
      if (accessToken && openId) {
        const body = JSON.stringify({ access_token: accessToken, open_id: openId });
        const r = await safeFetch('https://open.douyin.com/oauth/userinfo/', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body,
        });
        pushErr('oauth/userinfo', r.data, r.ok);
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
    }
    if (route === '/data/summary' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'douyin') ?? mockChannels[0];
      // ✅ 兜底：Web profile 拿真实粉丝填 overview
      let realFans: number | undefined;
      if (handle && cookie) {
        const rp = await safeFetch(`https://www.douyin.com/aweme/v1/web/user/profile/other/?sec_user_id=${encodeURIComponent(handle)}`, { headers });
        pushErr('aweme/user/profile/other[overview]', rp.data, rp.ok);
        realFans = (rp.data as { user?: { follower_count?: number } }).user?.follower_count;
      } else if (accessToken && openId) {
        const rp = await safeFetch('https://open.douyin.com/oauth/userinfo/', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: accessToken, open_id: openId }),
        });
        pushErr('oauth/userinfo[overview]', rp.data, rp.ok);
        const d = (rp.data as { data?: { followers_count?: number } })?.data;
        realFans = d?.followers_count;
      }
      if (typeof realFans === 'number') return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: realFans } };
      return { ok: true, source: 'mock', data: mockCh };
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
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }

  const fallback = mockForRoute('douyin', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== Zhihu ==========
async function crawlZhihu(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const zc0 = credentials.z_c0 as string | undefined;
  const dc0 = credentials.d_c0 as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const handle = payload?.accountHandle;
  const bearer = zc0 ? (zc0.startsWith('Bearer ') ? zc0 : `Bearer ${zc0}`) : (accessToken ? `Bearer ${accessToken}` : undefined);
  const upstreamErrors: string[] = [];
  const pushErr = (label: string, data: unknown, ok?: boolean) => {
    if (ok === false) { upstreamErrors.push(`${label}[HTTP_FAIL]`); return; }
    if (data && typeof data === 'object') {
      const code = (data as { code?: number }).code;
      const msg = (data as { message?: string; msg?: string }).message ?? (data as { msg?: string }).msg ?? '';
      const name = (data as { name?: string }).name ?? '';
      if (code !== undefined && typeof code === 'number' && code !== 0) {
        upstreamErrors.push(`${label}[code=${code}]${msg || name ? `: ${msg || name}` : ''}`);
      } else if (name === 'Unauthorized' || msg?.includes('401') || msg?.includes('unauthorized')) {
        upstreamErrors.push(`${label}[401 Unauthorized]${msg ? `: ${msg}` : ''}`);
      }
    }
  };

  const headers: Record<string, string> = { Referer: 'https://www.zhihu.com/', Origin: 'https://www.zhihu.com' };
  if (bearer) headers.Authorization = bearer;
  if (dc0) headers['X-Xsrftoken'] = dc0.slice(0, 32);

  try {
    if (route === '/me' || route === '/profile/me') {
      if (bearer) {
        const r = await safeFetch('https://api.zhihu.com/members/me', { headers });
        pushErr('members/me', r.data, r.ok);
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
    if (route === '/creator/overview' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'zhihu') ?? mockChannels[0];
      // ✅ 兜底：members/me 拿真实粉丝填 overview
      let realFans: number | undefined;
      if (bearer) {
        const rp = await safeFetch('https://api.zhihu.com/members/me', { headers });
        pushErr('members/me[overview]', rp.data, rp.ok);
        realFans = (rp.data as { follower_count?: number }).follower_count;
      }
      if (typeof realFans === 'number') return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: realFans } };
      return { ok: true, source: 'mock', data: mockCh };
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
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }

  const fallback = mockForRoute('zhihu', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== WeChat Video ==========
async function crawlWechatVideo(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = credentials.cookie as string | undefined;
  const token = credentials.accessToken as string | undefined;
  const handle = payload?.accountHandle;
  const upstreamErrors: string[] = [];
  const pushErr = (label: string, data: unknown, ok?: boolean) => {
    if (ok === false) { upstreamErrors.push(`${label}[HTTP_FAIL]`); return; }
    if (data && typeof data === 'object') {
      const errcode = (data as { errcode?: number; ret?: number; base_resp?: { errcode?: number } }).errcode ?? (data as { ret?: number }).ret ?? (data as { base_resp?: { errcode?: number } }).base_resp?.errcode;
      if (errcode !== undefined && errcode !== 0) {
        const msg = (data as { errmsg?: string }).errmsg ?? '';
        upstreamErrors.push(`${label}[errcode=${errcode}]${msg ? `: ${msg}` : ''}`);
      }
    }
  };
  const headers: Record<string, string> = { Referer: 'https://channels.weixin.qq.com/', Origin: 'https://channels.weixin.qq.com' };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/finder/me' || route === '/profile/me') {
      if (cookie) {
        const r = await safeFetch('https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/homepage/home_page_info', { headers, method: 'POST', body: '{}' });
        pushErr('finder/homepage_info', r.data, r.ok);
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
    if (route === '/finder/overview' || route === '/data/summary' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'wechat-video') ?? mockChannels[0];
      // ✅ 兜底：homepage_info 拿真实粉丝填 overview
      let realFans: number | undefined;
      if (cookie) {
        const rp = await safeFetch('https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/homepage/home_page_info', { headers, method: 'POST', body: '{}' });
        pushErr('finder/homepage_info[overview]', rp.data, rp.ok);
        realFans = (rp.data as { data?: { follower_count?: number } }).data?.follower_count;
      }
      if (typeof realFans === 'number') return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: realFans } };
      return { ok: true, source: 'mock', data: mockCh };
    }
    if (route === '/finder/videos') return { ok: true, source: 'mock', data: videoLabs.filter(v => v.channel === 'wechat-video') };
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'wechat-video') };
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }
  void token;
  const fallback = mockForRoute('wechat-video', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== WeChat Official ==========
async function crawlWechatOfficial(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const appid = credentials.appid as string | undefined;
  const appSecret = credentials.appSecret as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const cookie = credentials.cookie as string | undefined;
  const handle = payload?.accountHandle;
  const upstreamErrors: string[] = [];
  const pushErr = (label: string, data: unknown, ok?: boolean) => {
    if (ok === false) { upstreamErrors.push(`${label}[HTTP_FAIL]`); return; }
    if (data && typeof data === 'object') {
      const errcode = (data as { errcode?: number }).errcode;
      if (errcode !== undefined && errcode !== 0) {
        const msg = (data as { errmsg?: string }).errmsg ?? '';
        upstreamErrors.push(`${label}[errcode=${errcode}]${msg ? `: ${msg}` : ''}`);
      }
    }
  };
  const headers: Record<string, string> = { Referer: 'https://mp.weixin.qq.com/', Origin: 'https://mp.weixin.qq.com' };
  if (cookie) headers.Cookie = cookie;

  try {
    if (route === '/mp/account-info' || route === '/profile/me') {
      if (accessToken) {
        const r = await safeFetch(`https://api.weixin.qq.com/cgi-bin/account/getaccountbasicinfo?access_token=${encodeURIComponent(accessToken)}`, { headers });
        pushErr('getaccountbasicinfo', r.data, r.ok);
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
    if (route === '/mp/overview' || route === '/data/summary' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'wechat-official') ?? mockChannels[0];
      // ✅ 兜底：getaccountbasicinfo 拿真实粉丝填 overview
      let realFans: number | undefined;
      if (accessToken) {
        const rp = await safeFetch(`https://api.weixin.qq.com/cgi-bin/account/getaccountbasicinfo?access_token=${encodeURIComponent(accessToken)}`, { headers });
        pushErr('getaccountbasicinfo[overview]', rp.data, rp.ok);
        realFans = (rp.data as { account_info?: { fans_count?: number } }).account_info?.fans_count;
      }
      if (typeof realFans === 'number') return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: realFans } };
      return { ok: true, source: 'mock', data: mockCh };
    }
    if (route === '/mp/articles') {
      const base = articleLabs.filter(a => a.channel === 'wechat-official');
      if (accessToken) {
        const body = JSON.stringify({ action: 'list_all', count: 20, offset: 0 });
        const r = await safeFetch(`https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${encodeURIComponent(accessToken)}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body });
        const list = (r.data as WechatMpArticlesResp).item ?? [];
        const arr = list.flatMap(x => x.content?.news_item ?? []).slice(0, 20);
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
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }
  void appSecret;
  const fallback = mockForRoute('wechat-official', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== Ximalaya ==========
async function crawlXimalaya(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const appid = credentials.appid as string | undefined;
  const appSecret = credentials.appSecret as string | undefined;
  const token = credentials.xm_token ?? credentials.token_1 as string | undefined;
  const mid = credentials.mid as string | undefined;
  const handle = payload?.accountHandle ?? mid;
  const upstreamErrors: string[] = [];
  const pushErr = (label: string, data: unknown, ok?: boolean) => {
    if (ok === false) { upstreamErrors.push(`${label}[HTTP_FAIL]`); return; }
    if (data && typeof data === 'object') {
      const ret = (data as { ret?: number; code?: number; error_no?: number }).ret ?? (data as { code?: number }).code ?? (data as { error_no?: number }).error_no;
      if (ret !== undefined && ret !== 0 && ret !== 200) {
        const msg = (data as { msg?: string; message?: string; error_msg?: string }).msg ?? (data as { message?: string }).message ?? (data as { error_msg?: string }).error_msg ?? '';
        upstreamErrors.push(`${label}[ret=${ret}]${msg ? `: ${msg}` : ''}`);
      }
    }
  };
  const headers: Record<string, string> = { Referer: 'https://www.ximalaya.com/', Origin: 'https://www.ximalaya.com' };
  if (token) headers.Cookie = `1&_token=${token};`;
  if (credentials.cookie && typeof credentials.cookie === 'string' && credentials.cookie.length >= 20) {
    headers.Cookie = credentials.cookie;
  }
  try {
    if (route === '/anchor/profile' || route === '/profile/me') {
      if (mid) {
        const r = await safeFetch(`https://www.ximalaya.com/revision/user/personal?pageSize=1&uid=${encodeURIComponent(String(mid))}`, { headers });
        pushErr('ximalaya/user/personal', r.data, r.ok);
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
    if (route === '/anchor/overview' || route === '/data/summary' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'ximalaya') ?? mockChannels[0];
      let realFans: number | undefined;
      if (mid) {
        const rp = await safeFetch(`https://www.ximalaya.com/revision/user/personal?pageSize=1&uid=${encodeURIComponent(String(mid))}`, { headers });
        pushErr('ximalaya/user/personal[overview]', rp.data, rp.ok);
        realFans = (rp.data as XimalayaResp).data?.userPage?.userInfo?.followCount;
      }
      if (typeof realFans === 'number') return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: realFans } };
      return { ok: true, source: 'mock', data: mockCh };
    }
    if (route.includes('/podcast') && route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'ximalaya') };
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'ximalaya') };
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }
  void appid; void appSecret;
  const fallback = mockForRoute('ximalaya', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== Xiaoyuzhou ==========
async function crawlXiaoyuzhou(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const id = credentials.xyz_id as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const cookie = credentials.cookie as string | undefined;
  const handle = payload?.accountHandle ?? id;
  const upstreamErrors: string[] = [];
  // 🔧 增强 pushErr：HTTP_FAIL 时把真实 status（404/5xx）写出来，而不是只写 [HTTP_FAIL]，用户一眼能诊断
  const pushErr = (label: string, data: unknown, ok?: boolean, status?: number) => {
    if (ok === false) {
      const sc = status ?? 0;
      upstreamErrors.push(`${label}[HTTP_FAIL${sc ? `|status=${sc}` : ''}]`);
      return;
    }
    if (data && typeof data === 'object') {
      const code = (data as { code?: number; status?: number }).code ?? (data as { status?: number }).status;
      if (code !== undefined && code !== 0 && code !== 200) {
        const msg = (data as { message?: string; error?: string }).message ?? (data as { error?: string }).error ?? '';
        upstreamErrors.push(`${label}[code=${code}]${msg ? `: ${msg}` : ''}`);
      }
    }
  };
  const headers: Record<string, string> = {
    'User-Agent': UA,
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: 'https://www.xiaoyuzhoufm.com/',
    Origin: 'https://www.xiaoyuzhoufm.com',
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (cookie) headers.Cookie = cookie;
  try {
    // 🎯【小宇宙真实接口 V2】：rapi.xiaoyuzhoufm.com 已在 2026 年下线（404）。
    //   现在走公开 Web SSR HTML 页面 + <script id="__NEXT_DATA__">，公开、免登录、稳定，已实测 200 OK。
    //   JSON 里有完整 podcast 对象：pid, title, author, image.picUrl, subscriptionCount, episodeCount, latestEpisodePubDate
    const podcastId = id ?? handle;
    let scraped: {
      pid: string; title: string; author: string; imageUrl: string | undefined;
      subscriberCount: number; episodeCount: number; description?: string;
    } | null = null;
    if (podcastId) {
      const url = `https://www.xiaoyuzhoufm.com/podcast/${encodeURIComponent(podcastId)}`;
      const r = await safeFetch(url, { headers });
      if (!r.ok) {
        pushErr('xiaoyuzhou/podcast[web-scrape]', r.data, false, r.status);
      } else if (typeof r.data === 'string') {
        const m = /<script\s+id="__NEXT_DATA__"\s+type="application\/json">(.*?)<\/script>/s.exec(r.data);
        if (m?.[1]) {
          try {
            const json = JSON.parse(m[1]) as unknown;
            // 递归查找 podcast 对象（Next.js 会在多个地方塞，如 pageProps.dehydratedState.queries[].state.data.podcast）
            // 匹配条件：pid 等于目标 ID + subscriptionCount 是数字
            const findPodcast = (node: unknown): any => {
              if (!node || typeof node !== 'object') return null;
              if (Array.isArray(node)) {
                for (const n of node) { const f = findPodcast(n); if (f) return f; }
                return null;
              }
              const o = node as Record<string, unknown>;
              if (
                typeof o.pid === 'string' &&
                o.pid === podcastId &&
                typeof o.subscriptionCount === 'number'
              ) return o;
              for (const k of Object.keys(o)) {
                const f = findPodcast(o[k]); if (f) return f;
              }
              return null;
            };
            const p = findPodcast(json);
            if (p) {
              scraped = {
                pid: p.pid,
                title: p.title ?? '小宇宙电台',
                author: p.author ?? '主播',
                imageUrl: p.image && typeof p.image === 'object' ? (p.image as any).picUrl : undefined,
                subscriberCount: p.subscriptionCount,
                episodeCount: typeof p.episodeCount === 'number' ? p.episodeCount : 0,
                description: typeof p.description === 'string' ? p.description : undefined,
              };
            } else {
              upstreamErrors.push(`xiaoyuzhou/podcast[HTML解析失败：没找到 pid=${podcastId} 的 podcast 对象，检查 ID 是否正确]`);
            }
          } catch (e) {
            upstreamErrors.push(`xiaoyuzhou/podcast[__NEXT_DATA__ JSON.parse fail: ${(e as Error).message}]`);
          }
        } else {
          upstreamErrors.push(`xiaoyuzhou/podcast[HTML 中未找到 __NEXT_DATA__ script 标签，可能页面结构改版]`);
        }
      } else if (typeof r.data === 'object' && r.data) {
        // 如果返回的是对象（纯 JSON），尝试直接解析（但 404 时一般是 HTML 字符串）
        const sc = typeof (r.data as any).status === 'number' ? (r.data as any).status : r.status;
        pushErr('xiaoyuzhou/podcast[web-scrape]', r.data, false, sc);
      }
    }

    if (route === '/podcast/profile' || route === '/profile/me') {
      if (scraped) {
        return {
          ok: true, source: 'direct',
          data: {
            handle: scraped.pid,
            displayName: scraped.title,
            avatarUrl: scraped.imageUrl,
            followerCount: scraped.subscriberCount,
            bio: scraped.description,
            profileUrl: `https://www.xiaoyuzhoufm.com/podcast/${scraped.pid}`,
            worksCount: scraped.episodeCount,
          },
        };
      }
    }
    if (route === '/podcast/overview' || route === '/data/summary' || route === '/data/overview') {
      const mockCh = mockChannels.find(c => c.id === 'xiaoyuzhou') ?? mockChannels[0];
      if (scraped) {
        return {
          ok: true, source: 'hybrid',
          data: {
            ...mockCh,
            id: scraped.pid as any ?? mockCh.id,
            handle: scraped.pid ?? mockCh.handle,
            name: scraped.title,
            displayName: scraped.title,
            avatar: scraped.imageUrl ?? mockCh.avatar,
            totalFollowers: scraped.subscriberCount,
            publishedCount: scraped.episodeCount,
            bio: scraped.description,
            profileUrl: `https://www.xiaoyuzhoufm.com/podcast/${scraped.pid}`,
          },
        };
      }
      return { ok: true, source: 'mock', data: mockCh };
    }
    if (route.includes('/trend')) return { ok: true, source: 'mock', data: dailyViewsTrend };
    if (route.includes('records')) return { ok: true, source: 'mock', data: publishRecords.filter(r => r.platform === 'xiaoyuzhou') };
    if (route.includes('/videos/self') || route.includes('/published-list')) return { ok: true, source: 'mock', data: [] };
    if (route.includes('/viral-videos')) return { ok: true, source: 'mock', data: viralVideos.filter(v => v.platform === 'xiaoyuzhou') };
    if (route.includes('/viral-articles')) return { ok: true, source: 'mock', data: viralArticles.filter(a => a.platform === 'xiaoyuzhou') };
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }
  const fallback = mockForRoute('xiaoyuzhou', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
}

// ========== Kuaishou ==========
async function crawlKuaishou(ctx: CrawlContext): Promise<CrawlResult> {
  const { route, credentials, payload } = ctx;
  const cookie = credentials.cookie as string | undefined;
  const accessToken = credentials.accessToken as string | undefined;
  const openId = credentials.openId as string | undefined;
  // ✅ 关键修复：设备 ID（did/did_web/kuaishou_web_did）绝对不能做主播用户 ID（principalId）！
  //    之前把 credentials.did 塞进 handle fallback 导致「单字段填 did 永远 principalId=设备ID → profile/other 返回空用户 → source:mock → tile 橙色」这个伪 bug，已移除！
  //    handle 仅用 payload.accountHandle（用户在绑定页面顶部填的「账号 Handle / ID」）或 credentials.userId（纯数字主播ID）或 OAuth openId
  const handle = payload?.accountHandle ?? credentials.userId ?? openId;
  const upstreamErrors: string[] = [];
  const pushErr = (label: string, data: unknown, ok?: boolean) => {
    if (ok === false) { upstreamErrors.push(`${label}[HTTP_FAIL]`); return; }
    if (data && typeof data === 'object') {
      const result = (data as { result?: number; code?: number; error_code?: number }).result ?? (data as { code?: number }).code ?? (data as { error_code?: number }).error_code;
      if (result !== undefined && result !== 1 && result !== 0 && result !== 200) {
        const msg = (data as { error_msg?: string; msg?: string; message?: string }).error_msg ?? (data as { msg?: string }).msg ?? (data as { message?: string }).message ?? '';
        upstreamErrors.push(`${label}[result=${result}]${msg ? `: ${msg}` : ''}`);
      }
    }
  };
  const headers: Record<string, string> = { Referer: 'https://www.kuaishou.com/', Origin: 'https://www.kuaishou.com' };
  // ✅ 合并：用户填了 did/kuaishou_web_did/did_web/token/userId 都塞进 Cookie 里（快手接口不挑，有啥算啥）
  const cookieParts: string[] = [];
  if (cookie) cookieParts.push(cookie.replace(/^Cookie:\s*/i, ''));
  if (credentials.did && typeof credentials.did === 'string' && !cookie?.includes('did=')) cookieParts.push(`did=${credentials.did}`);
  if (credentials.kuaishou_web_did && typeof credentials.kuaishou_web_did === 'string') cookieParts.push(`did=${credentials.kuaishou_web_did}`);
  if (credentials.did_web && typeof credentials.did_web === 'string') cookieParts.push(`did_web=${credentials.did_web}`);
  if (credentials.userId && typeof credentials.userId === 'string') cookieParts.push(`userId=${credentials.userId}`);
  if (credentials.token && typeof credentials.token === 'string') cookieParts.push(`kuaishou_token=${credentials.token}`);
  if (cookieParts.length) headers.Cookie = cookieParts.join('; ');
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    if (route === '/user/profile' || route === '/profile/me' || route === '/me') {
      // ✅ 先 Web Cookie + principalId（最常用），失败再 OAuth
      if (handle && (cookie || credentials.did || credentials.userId)) {
        const r = await safeFetch('https://www.kuaishou.com/rest/n/profile/v1/profile/other', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ principalId: handle }),
        });
        pushErr('kuaishou/profile/other', r.data, r.ok);
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
      // 1. 快手开放平台 OAuth
      if (accessToken && openId) {
        const body = JSON.stringify({ app_id: credentials.appId ?? '', access_token: accessToken, open_id: openId });
        const r = await safeFetch('https://open.kuaishou.com/openapi/user_info', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body,
        });
        pushErr('openapi/user_info', r.data, r.ok);
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
    }
    if (route === '/data/overview' || route === '/user/overview' || route === '/data/summary') {
      const mockCh = mockChannels.find(c => c.id === 'kuaishou') ?? mockChannels[0];
      let realFans: number | undefined;
      if (handle && (cookie || credentials.did || credentials.userId)) {
        const rp = await safeFetch('https://www.kuaishou.com/rest/n/profile/v1/profile/other', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ principalId: handle }),
        });
        pushErr('kuaishou/profile/other[overview]', rp.data, rp.ok);
        realFans = (rp.data as KuaishouProfileResp)?.userProfile?.profile?.fan_count;
      } else if (accessToken && openId) {
        const rp = await safeFetch('https://open.kuaishou.com/openapi/user_info', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ app_id: credentials.appId ?? '', access_token: accessToken, open_id: openId }),
        });
        pushErr('openapi/user_info[overview]', rp.data, rp.ok);
        realFans = (rp.data as { user_info?: { fan?: number } })?.user_info?.fan;
      }
      if (typeof realFans === 'number') return { ok: true, source: 'hybrid', data: { ...mockCh, totalFollowers: realFans } };
      return { ok: true, source: 'mock', data: mockCh };
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
  } catch (e) { upstreamErrors.push(`exception:${(e as Error).message}`); }
  const fallback = mockForRoute('kuaishou', route, handle);
  return {
    ok: true, source: 'mock', data: fallback ?? undefined,
    error: upstreamErrors.length ? upstreamErrors.join(' | ') : undefined,
  };
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
