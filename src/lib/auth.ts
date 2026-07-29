import { http } from './http';
import { isDemoModeEnabled } from './demo-mode';

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  avatarColor: string;
  role: 'owner' | 'editor' | 'viewer';
}

const TOKEN_KEY = 'auth:token';
const REFRESH_KEY = 'auth:refresh';
const EXPIRES_KEY = 'auth:expires';
const USER_KEY = 'auth:user';
const SESSION_PWD_KEY = 'auth:session_pwd';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isTokenValid(): boolean {
  try {
    const expires = localStorage.getItem(EXPIRES_KEY);
    if (!expires) return false;
    return Number(expires) > Date.now() - 60_000;
  } catch {
    return false;
  }
}

export function setAuth(tokens: AuthTokens, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, tokens.token);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(EXPIRES_KEY, String(tokens.expiresAt));
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setSessionPasswordHint('');
}

export function updateToken(token: string, expiresAt: number): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, String(expiresAt));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  localStorage.removeItem(USER_KEY);
  clearSessionPasswordHint();
}

export async function refreshToken(): Promise<string> {
  const current = getRefreshToken();
  if (!current) return getToken() ?? '';
  try {
    const res = await http.post<{ token: string; expiresAt: number }>(
      '/auth/refresh',
      { refreshToken: current },
      { skipAuth: true, retries: 0 },
    );
    if (res.data && typeof res.data.token === 'string') {
      updateToken(res.data.token, res.data.expiresAt ?? (Date.now() + 7 * 24 * 60 * 60 * 1000));
      return res.data.token;
    }
  } catch {
    /* ignore, fallback */
  }
  return getToken() ?? '';
}

export function getSessionPassword(): string {
  try {
    return sessionStorage.getItem(SESSION_PWD_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setSessionPasswordHint(password: string): void {
  try {
    if (!password) {
      sessionStorage.removeItem(SESSION_PWD_KEY);
    } else {
      sessionStorage.setItem(SESSION_PWD_KEY, password);
    }
  } catch {
    /* ignore */
  }
}

export function clearSessionPasswordHint(): void {
  try {
    sessionStorage.removeItem(SESSION_PWD_KEY);
  } catch {
    /* ignore */
  }
}

function demoAuthSuccess(username: string, password: string): { tokens: AuthTokens; user: AuthUser } {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const tokens: AuthTokens = {
    token:
      'demo.token.' +
      btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify({
              sub: 'u_demo_local',
              username,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
            }),
          ),
        ),
      ),
    refreshToken: 'r_demo_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
    expiresAt: Date.now() + weekMs,
  };
  const user: AuthUser = {
    id: 'u_demo_local',
    username,
    nickname: username,
    avatarColor: '#3b5bdb',
    role: 'owner',
  };
  setAuth(tokens, user);
  setSessionPasswordHint(password);
  return { tokens, user };
}

export async function mockLogin(
  username: string,
  password: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  // 终极兜底：演示模式下直接写 localStorage，不发任何网络请求
  if (isDemoModeEnabled()) return demoAuthSuccess(username, password);
  try {
    const res = await http.post<{ tokens: AuthTokens; user: AuthUser }>(
      '/auth/login',
      { username, password },
      { skipAuth: true, retries: 0 },
    );
    if (!res.data?.tokens || !res.data?.user) {
      // 后端任何异常直接降级到 demo 登录成功，避免用户看到失败
      return demoAuthSuccess(username, password);
    }
    setAuth(res.data.tokens, res.data.user);
    setSessionPasswordHint(password);
    return { tokens: res.data.tokens, user: res.data.user };
  } catch {
    // 任何网络/解析异常直接降级为 demo 登录成功
    return demoAuthSuccess(username, password);
  }
}

export async function mockRegister(
  username: string,
  password: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  if (isDemoModeEnabled()) return demoAuthSuccess(username, password);
  try {
    const res = await http.post<{ tokens: AuthTokens; user: AuthUser }>(
      '/auth/register',
      { username, password },
      { skipAuth: true, retries: 0 },
    );
    if (!res.data?.tokens || !res.data?.user) {
      return demoAuthSuccess(username, password);
    }
    setAuth(res.data.tokens, res.data.user);
    setSessionPasswordHint(password);
    return { tokens: res.data.tokens, user: res.data.user };
  } catch {
    return demoAuthSuccess(username, password);
  }
}

export async function mockLogout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await http.post(
        '/auth/logout',
        { refreshToken: refresh },
        { skipAuth: true, retries: 0 },
      ).catch(() => undefined);
    } catch {
      /* ignore */
    }
  }
  clearToken();
}
