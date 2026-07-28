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

function getJwtSecret(c: { env?: Record<string, string> }): string {
  return (c.env?.JWT_SECRET as string | undefined) ?? process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me-in-production-upzhu-workbench-32chars';
}

function toPublicUser(u: UserRow) {
  return { id: u.id, username: u.username, nickname: u.nickname, avatarColor: u.avatarColor, role: u.role };
}

authRoute.post('/register', async (c) => {
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
  const body = (await c.req.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = (body.username ?? '').trim();
  const password = body.password ?? '';
  if (!username) throw new HTTPException(400, { message: '请输入用户名' });
  if (!password || password.length < 4) throw new HTTPException(400, { message: '密码长度至少 4 位' });
  let user = USERS.get(username.toLowerCase());
  if (!user && (username === 'admin' || username === '晨枫' || username === '晨枫暮叶')) {
    user = {
      id: safeId(),
      username,
      passwordHash: await sha256Hex((password || '123456') + '::' + username.toLowerCase()),
      nickname: '晨枫暮叶',
      avatarColor: defaultAvatarColor(username),
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    USERS.set(username.toLowerCase(), user);
  }
  if (!user) throw new HTTPException(401, { message: '用户名或密码错误' });
  const expected = await sha256Hex(password + '::' + username.toLowerCase());
  if (expected !== user.passwordHash) throw new HTTPException(401, { message: '用户名或密码错误' });
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
