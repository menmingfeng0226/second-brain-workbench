import type { ApiResponse } from './http';
import {
  channels,
  videoLabs,
  articleLabs,
  ideas,
  scripts,
  contentCards,
  dailyViewsTrend,
  publishRecords,
  tasks,
  feedbacks,
} from '@/data/mockData';
import type { AuthTokens, AuthUser } from '@/lib/auth';

const LS_KEY = 'workbench.demoMode';

function isGitHubPagesHost(): boolean {
  try {
    const host = window.location.hostname;
    // pages.github.com / *.github.io / 自定义 pages 域名但走静态托管（无后端时）统一强制演示
    if (host.endsWith('.github.io')) return true;
    if (host.includes('github.io')) return true;
    if (host === 'menmingfeng0226.github.io') return true;
    return false;
  } catch {
    return false;
  }
}

export function isDemoModeEnabled(): boolean {
  try {
    // GitHub Pages / Vercel static preview 等纯静态托管无 Hono 后端，自动启用演示模式
    if (isGitHubPagesHost()) return true;
    if (localStorage.getItem(LS_KEY) === '1') return true;
    const url = new URL(window.location.href);
    if (url.searchParams.get('demo') === '1') {
      localStorage.setItem(LS_KEY, '1');
      return true;
    }
    return false;
  } catch {
    return isGitHubPagesHost();
  }
}

export function setDemoMode(enabled: boolean) {
  try {
    if (enabled) {
      localStorage.setItem(LS_KEY, '1');
    } else {
      localStorage.removeItem(LS_KEY);
    }
  } catch {
    /* noop */
  }
}

export function toggleDemoMode(): boolean {
  const next = !isDemoModeEnabled();
  setDemoMode(next);
  return next;
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function weekMs(): number {
  return 7 * 24 * 3600 * 1000;
}

function mockUser(username?: string): AuthUser {
  return {
    id: 'u_demo_local',
    username: username ?? '晨枫暮叶',
    nickname: username ?? '晨枫暮叶',
    avatarColor: '#3b5bdb',
    role: 'owner',
  };
}

function mockTokens(): AuthTokens {
  const now = Date.now();
  const token =
    'demo.token.' +
    btoa(
      unescape(
        encodeURIComponent(
          JSON.stringify({
            sub: 'u_demo_local',
            username: '晨枫暮叶',
            iat: nowSec(),
            exp: nowSec() + 7 * 24 * 3600,
          }),
        ),
      ),
    );
  return {
    token,
    refreshToken: 'r_demo_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
    expiresAt: now + weekMs(),
  };
}

function ok<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { code: 0, message, data };
}

function fail<T>(code: number, message: string): ApiResponse<T> {
  return { code, message, data: null as unknown as T };
}

type HandleCtx = {
  method: string;
  url: string;
  pathname: string;
  search: URLSearchParams;
  body: unknown;
  headers: Record<string, string>;
};

export function tryHandleDemoRequest(
  method: string,
  url: string,
  body: unknown,
  headers: Record<string, string>,
): ApiResponse<unknown> | null {
  if (!isDemoModeEnabled()) return null;
  let u: URL;
  try {
    u = /^https?:\/\//i.test(url)
      ? new URL(url)
      : new URL('http://local' + (url.startsWith('/') ? '' : '/') + url);
  } catch {
    return null;
  }
  const pathname = u.pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
  const ctx: HandleCtx = { method: method.toUpperCase(), url, pathname, search: u.searchParams, body, headers };
  try {
    return handleRoutes(ctx);
  } catch (e) {
    return fail<unknown>(500, (e as Error).message || 'DEMO_UNKNOWN');
  }
}

function mockAccount() {
  return {
    profile: {
      username: '晨枫暮叶',
      nickname: '晨枫暮叶',
      email: 'demo@upzhu.local',
      bio: 'DEMO 模式：演示账号，数据为本地 Mock',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    preferences: {
      uiTheme: 'light',
      accentColor: '#3b5bdb',
      notificationsEnabled: true,
      digestTime: '09:00',
    },
    security: {
      lastLogin: new Date().toISOString(),
      mfaEnabled: false,
      devices: [{ id: 'demo_local', name: '当前设备', ip: '127.0.0.1', lastSeen: new Date().toISOString() }],
    },
    plans: {
      current: 'Pro (演示)',
      expiresAt: '2099-12-31T23:59:59.999Z',
      limits: { channels: 9, storageGb: 500, aiCreditsMonthly: 10000 },
    },
  };
}

function handleRoutes(ctx: HandleCtx): ApiResponse<unknown> | null {
  const { method, pathname, body } = ctx;

  if (pathname === '/health' || pathname === '') {
    return ok(
      { now: new Date().toISOString(), version: '1.0.0', runtime: 'demo' },
      'DEMO 工作台后端运行中',
    );
  }

  if (method === 'POST' && pathname === '/auth/register') {
    const { username, password } = (body as { username?: string; password?: string } | null) ?? {};
    if (!username || username.length < 2) return fail(400, '用户名至少 2 位');
    if (!password || password.length < 6) return fail(400, '密码长度至少 6 位');
    const tokens = mockTokens();
    const user: AuthUser = { ...mockUser(username) };
    try {
      localStorage.setItem('auth:user', JSON.stringify(user));
      localStorage.setItem('auth:token', tokens.token);
      localStorage.setItem('auth:refresh', tokens.refreshToken);
      localStorage.setItem('auth:expires', String(tokens.expiresAt));
    } catch {
      /* noop */
    }
    return ok<{ tokens: AuthTokens; user: AuthUser }>({ tokens, user }, 'DEMO 注册成功');
  }

  if (method === 'POST' && pathname === '/auth/login') {
    const { username, password } = (body as { username?: string; password?: string } | null) ?? {};
    if (!username) return fail(400, '请输入用户名');
    if (!password || password.length < 4) return fail(400, '密码长度至少 4 位');
    const tokens = mockTokens();
    const user: AuthUser = { ...mockUser(username) };
    try {
      localStorage.setItem('auth:user', JSON.stringify(user));
      localStorage.setItem('auth:token', tokens.token);
      localStorage.setItem('auth:refresh', tokens.refreshToken);
      localStorage.setItem('auth:expires', String(tokens.expiresAt));
    } catch {
      /* noop */
    }
    return ok<{ tokens: AuthTokens; user: AuthUser }>({ tokens, user }, 'DEMO 登录成功');
  }

  if (method === 'POST' && pathname === '/auth/refresh') {
    const tokens = mockTokens();
    return ok<{ token: string; expiresAt: number }>(
      { token: tokens.token, expiresAt: Date.now() + weekMs() },
      'DEMO 刷新成功',
    );
  }

  if (method === 'POST' && pathname === '/auth/logout') {
    return ok<null>(null, 'DEMO 已退出登录');
  }

  if (method === 'GET' && pathname === '/auth/me') {
    const saved = (() => {
      try {
        const raw = localStorage.getItem('auth:user');
        return raw ? (JSON.parse(raw) as AuthUser) : null;
      } catch {
        return null;
      }
    })();
    return ok<AuthUser>(saved ?? mockUser());
  }

  if (method === 'GET' && pathname.startsWith('/account')) {
    return ok(mockAccount());
  }

  if (method === 'GET' && pathname.startsWith('/platforms/')) {
    const segs = pathname.replace(/^\/platforms\//, '').split('/');
    const platform = segs[0];
    const rest = '/' + (segs.slice(1).join('/') || 'overview');
    if (rest.includes('/account-info') || rest.includes('/profile/me')) {
      const ch = channels.find((c: { id: string }) => c.id === platform) ?? channels[0];
      return ok({
        handle: (ch as { id: string; name: string }).id,
        displayName: (ch as { name: string }).name,
        avatarUrl: '',
        followerCount: (ch as { totalFollowers: number }).totalFollowers ?? 0,
        profileUrl: '',
      });
    }
    if (rest.includes('/overview')) {
      const ch = channels.find((c: { id: string }) => c.id === platform) ?? channels[0];
      return ok(ch);
    }
    if (rest.includes('/videos')) {
      return ok(
        videoLabs.map((v) => ({
          id: (v as { id: string }).id,
          title: (v as { title: string }).title,
          cover: (v as { cover?: string }).cover ?? '',
          views: (v as { views?: number }).views ?? 0,
          likes: (v as { likes?: number }).likes ?? 0,
          comments: (v as { comments?: number }).comments ?? 0,
          publishedAt: (v as { publishedAt?: string }).publishedAt ?? new Date().toISOString(),
          channel: platform,
          score: (v as { score?: number }).score ?? 0,
          hotIndex: (v as { hotIndex?: number }).hotIndex ?? 0,
        })),
      );
    }
    if (rest.includes('/articles')) {
      return ok(
        articleLabs.map((a) => ({
          id: (a as { id: string }).id,
          title: (a as { title: string }).title,
          channel: (a as { channel?: string }).channel ?? platform,
          views: (a as { views?: number }).views ?? 0,
          likes: (a as { likes?: number }).likes ?? 0,
          comments: (a as { comments?: number }).comments ?? 0,
          publishedAt: (a as { publishedAt?: string }).publishedAt ?? new Date().toISOString(),
          score: (a as { score?: number }).score ?? 0,
          hotIndex: (a as { hotIndex?: number }).hotIndex ?? 0,
        })),
      );
    }
    if (rest.includes('/trend')) {
      return ok(dailyViewsTrend);
    }
    if (rest.includes('records')) {
      return ok(publishRecords.filter((r: { platform: string }) => r.platform === platform));
    }
    const fallback = channels.find((c: { id: string }) => c.id === platform) ?? {
      code: 0,
      message: 'DEMO mock fallback',
    };
    return ok(fallback as unknown);
  }

  if (method === 'GET' && pathname === '/hottrack') {
    return ok({
      videos: videoLabs,
      articles: articleLabs,
      trend: dailyViewsTrend,
      records: publishRecords,
      channels,
    });
  }

  if (method === 'GET' && pathname.startsWith('/ideas')) return ok(ideas);
  if (method === 'GET' && pathname.startsWith('/drafts')) return ok(scripts);
  if (method === 'GET' && pathname.startsWith('/favorites')) return ok(contentCards);
  if (method === 'GET' && pathname.startsWith('/tasks')) return ok(tasks);
  if (method === 'GET' && pathname.startsWith('/feedback')) return ok(feedbacks);

  return ok(
    {
      message: 'DEMO 模式本地 mock 命中，请忽略任何后端连接问题',
      pathname,
      method,
      at: new Date().toISOString(),
    },
    'DEMO',
  );
}
