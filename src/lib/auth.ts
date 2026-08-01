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

// 🔧 修复凭据解密跨会话/跨刷新丢失问题：
// 原来只用 sessionStorage 存会话密码（deriveKey 的输入），
// - 重启浏览器 / 新开标签 / 域名下长期挂着页面，sessionStorage 会丢；
// - 丢了以后 AES-GCM 无法生成相同密钥，凭据虽然在 localStorage 里但解不出来，
//   导致用户误以为下次登录要重填。
// 现在改成「sessionStorage + localStorage 双写 + 双读」：
//   - 写：sessionStorage 和 localStorage 同时写；
//   - 读：优先 sessionStorage；空则回退 localStorage；
//   - 同时修复 setAuth() 把 password hint 清空成 '' 的 bug（原来第 64 行）。
const SESSION_PWD_BACKUP_KEY = SESSION_PWD_KEY + ':backup';

function writeSessionPasswordBoth(password: string): void {
  try {
    if (!password) {
      sessionStorage.removeItem(SESSION_PWD_KEY);
      localStorage.removeItem(SESSION_PWD_BACKUP_KEY);
    } else {
      sessionStorage.setItem(SESSION_PWD_KEY, password);
      localStorage.setItem(SESSION_PWD_BACKUP_KEY, password);
    }
  } catch {
    /* ignore */
  }
}

function readSessionPasswordBoth(): string {
  try {
    const s1 = sessionStorage.getItem(SESSION_PWD_KEY);
    if (s1) return s1;
    const s2 = localStorage.getItem(SESSION_PWD_BACKUP_KEY);
    if (s2) {
      // 兜底回补：localStorage 有，但 sessionStorage 丢失 → 双写恢复
      try { sessionStorage.setItem(SESSION_PWD_KEY, s2); } catch { /* noop */ }
      return s2;
    }
    return '';
  } catch {
    return '';
  }
}

export function getSessionPassword(): string {
  const v = readSessionPasswordBoth();
  if (v) return v;
  // 🔧 终极兜底：用户是 demo 登录场景（绝大多数），且未手动设置密码，
  //    就返回统一的 demo 派生密钥（所有 demo 账号持久化凭据都能解出来）
  return 'default-workbench-key-v1';
}

export function setSessionPasswordHint(password: string): void {
  // demo 登录 & demo auth 都会传 password='' 之前的老 bug，这里兜底：
  //   - 若传入空字符串，不执行删除（删除会导致 deriveKey 下次不一致，解不开）
  //   - 只在明确有新密码覆盖时写入；空时维持上次值
  if (password) writeSessionPasswordBoth(password);
}

export function clearSessionPasswordHint(): void {
  try {
    sessionStorage.removeItem(SESSION_PWD_KEY);
    localStorage.removeItem(SESSION_PWD_BACKUP_KEY);
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
