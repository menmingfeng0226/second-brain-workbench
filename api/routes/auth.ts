import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';

export const authRoute = new Hono();

interface UserRow {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatarColor: string;
  role: 'owner' | 'editor' | 'viewer';
  createdAt: string;
}

const USERS = new Map<string, UserRow>();
const REFRESH_TOKENS = new Map<string, string>();

const DEMO_ACCOUNTS: Array<{ username: string; password: string; nickname: string; role: UserRow['role'] }> = [
  { username: '晨枫暮叶', password: '123456', nickname: '晨枫暮叶', role: 'owner' },
  { username: 'admin', password: '123456', nickname: '管理员', role: 'owner' },
  { username: '晨枫', password: '123456', nickname: '晨枫', role: 'owner' },
];

function ensureDemoUsersSeeded() {
  for (const a of DEMO_ACCOUNTS) {
    const key = a.username.toLowerCase();
    if (USERS.has(key)) continue;
    const id = 'u_demo_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
    USERS.set(key, {
      id,
      username: a.username,
      passwordHash: 'DEMO::' + a.password,
      nickname: a.nickname,
      avatarColor: defaultAvatarColor(a.username),
      role: a.role,
      createdAt: new Date().toISOString(),
    });
  }
}

function defaultAvatarColor(name: string): string {
  const palette = [
    '#3b5bdb', '#7950f2', '#9775fa',
    '#1971c2', '#0c8599', '#099268',
    '#2f9e44', '#f08c00', '#d9480f',
    '#e03131', '#c2255c', '#ae3ec9',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function safeId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function b64EncodeUnicode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const arr = Array.from(new Uint8Array(digest));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signHS256(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encHeader = b64EncodeUnicode(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encPayload = b64EncodeUnicode(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${encHeader}.${encPayload}`;
  const keyData = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  const sigArr = Array.from(new Uint8Array(sig));
  const encSig = btoa(String.fromCharCode(...sigArr)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encHeader}.${encPayload}.${encSig}`;
}

function getJwtSecret(c: unknown): string {
  let fromEnv: string | undefined;
  try {
    const anyC = c as { env?: unknown };
    if (anyC.env && typeof anyC.env === 'object') {
      const env = anyC.env as Record<string, unknown>;
      if (typeof env.JWT_SECRET === 'string' && env.JWT_SECRET.length >= 8) fromEnv = env.JWT_SECRET;
    }
  } catch {
    /* noop */
  }
  if (fromEnv) return fromEnv;
  if (typeof process !== 'undefined' && process.env && typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.length >= 8) {
    return process.env.JWT_SECRET;
  }
  return 'dev-jwt-secret-change-me-in-production-upzhu-workbench-32chars';
}

function toPublicUser(u: UserRow) {
  return { id: u.id, username: u.username, nickname: u.nickname, avatarColor: u.avatarColor, role: u.role };
}

authRoute.post('/register', async (c) => {
  ensureDemoUsersSeeded();
  const body = (await c.req.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = (body.username ?? '').trim();
  const password = body.password ?? '';
  if (!username || username.length < 2) throw new HTTPException(400, { message: '用户名至少 2 位' });
  if (!password || password.length < 6) throw new HTTPException(400, { message: '密码长度至少 6 位' });
  if (USERS.has(username.toLowerCase())) throw new HTTPException(409, { message: '用户名已存在' });
  const id = safeId();
  const user: UserRow = {
    id,
    username,
    passwordHash: await sha256Hex(password + '::' + username.toLowerCase()),
    nickname: username === '晨枫' || username === '晨枫暮叶' ? '晨枫暮叶' : username,
    avatarColor: defaultAvatarColor(username),
    role: 'owner',
    createdAt: new Date().toISOString(),
  };
  USERS.set(username.toLowerCase(), user);
  const secret = getJwtSecret(c);
  const now = Math.floor(Date.now() / 1000);
  const token = await signHS256({ sub: id, username, role: user.role, iat: now, exp: now + 7 * 24 * 3600 }, secret);
  const refreshToken = 'r_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  REFRESH_TOKENS.set(refreshToken, id);
  return c.json({
    code: 0,
    message: '注册成功',
    data: {
      tokens: { token, refreshToken, expiresAt: (now + 7 * 24 * 3600) * 1000 },
      user: toPublicUser(user),
    },
  });
});

authRoute.post('/login', async (c) => {
  ensureDemoUsersSeeded();
  const body = (await c.req.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = (body.username ?? '').trim();
  const password = body.password ?? '';
  if (!username) throw new HTTPException(400, { message: '请输入用户名' });
  if (!password || password.length < 4) throw new HTTPException(400, { message: '密码长度至少 4 位' });

  const isDemoLogin =
    password === '123456' &&
    (username === '晨枫暮叶' || username === 'admin' || username === '晨枫');

  let user: UserRow | undefined;
  if (isDemoLogin) {
    const key = username.toLowerCase();
    user = USERS.get(key);
    if (!user) {
      const id = safeId();
      user = {
        id,
        username,
        passwordHash: 'DEMO::123456',
        nickname: username === '晨枫暮叶' || username === '晨枫' ? '晨枫暮叶' : '管理员',
        avatarColor: defaultAvatarColor(username),
        role: 'owner',
        createdAt: new Date().toISOString(),
      };
      USERS.set(key, user);
    }
  } else {
    user = USERS.get(username.toLowerCase());
  }

  if (!user) throw new HTTPException(401, { message: '用户名或密码错误' });

  const ok = isDemoLogin
    ? true
    : user.passwordHash.startsWith('DEMO::')
      ? ('DEMO::' + password) === user.passwordHash
      : (await sha256Hex(password + '::' + username.toLowerCase())) === user.passwordHash;

  if (!ok) throw new HTTPException(401, { message: '用户名或密码错误' });
  const secret = getJwtSecret(c);
  const now = Math.floor(Date.now() / 1000);
  const token = await signHS256({ sub: user.id, username, role: user.role, iat: now, exp: now + 7 * 24 * 3600 }, secret);
  const refreshToken = 'r_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  REFRESH_TOKENS.set(refreshToken, user.id);
  return c.json({
    code: 0,
    message: '登录成功',
    data: {
      tokens: { token, refreshToken, expiresAt: (now + 7 * 24 * 3600) * 1000 },
      user: toPublicUser(user),
    },
  });
});

authRoute.post('/refresh', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { refreshToken?: string };
  const refreshToken = body.refreshToken ?? '';
  const userId = REFRESH_TOKENS.get(refreshToken);
  if (!userId) throw new HTTPException(401, { message: '刷新令牌无效或已过期' });
  let user: UserRow | undefined;
  for (const u of USERS.values()) if (u.id === userId) { user = u; break; }
  if (!user) throw new HTTPException(401, { message: '用户不存在' });
  const secret = getJwtSecret(c);
  const now = Math.floor(Date.now() / 1000);
  const token = await signHS256({ sub: user.id, username: user.username, role: user.role, iat: now, exp: now + 7 * 24 * 3600 }, secret);
  return c.json({
    code: 0,
    message: '刷新成功',
    data: { token, expiresAt: (now + 7 * 24 * 3600) * 1000 },
  });
});

authRoute.post('/logout', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { refreshToken?: string };
  if (body.refreshToken) REFRESH_TOKENS.delete(body.refreshToken);
  return c.json({ code: 0, message: '已退出登录', data: null });
});

authRoute.get('/me', jwt({ secret: (c) => getJwtSecret(c), alg: 'HS256' }), (c) => {
  const payload = c.get('jwtPayload') as { sub?: string; username?: string };
  let user: UserRow | undefined;
  for (const u of USERS.values()) if (u.id === payload.sub || u.username === payload.username) { user = u; break; }
  if (!user) throw new HTTPException(401, { message: '用户不存在' });
  return c.json({ code: 0, message: 'OK', data: toPublicUser(user) });
});

export default authRoute;
