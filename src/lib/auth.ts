import { http } from './http';

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

export async function mockLogin(
  username: string,
  password: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const res = await http.post<{ tokens: AuthTokens; user: AuthUser }>(
    '/auth/login',
    { username, password },
    { skipAuth: true, retries: 0 },
  );
  if (!res.data?.tokens || !res.data?.user) {
    throw new Error(res.message || '登录失败，请检查用户名和密码');
  }
  setAuth(res.data.tokens, res.data.user);
  setSessionPasswordHint(password);
  return { tokens: res.data.tokens, user: res.data.user };
}

export async function mockRegister(
  username: string,
  password: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const res = await http.post<{ tokens: AuthTokens; user: AuthUser }>(
    '/auth/register',
    { username, password },
    { skipAuth: true, retries: 0 },
  );
  if (!res.data?.tokens || !res.data?.user) {
    throw new Error(res.message || '注册失败');
  }
  setAuth(res.data.tokens, res.data.user);
  setSessionPasswordHint(password);
  return { tokens: res.data.tokens, user: res.data.user };
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
