// 由 vite-plugin-hono-dev 通过 `tsx api/_hono-standalone.ts 5174` 启动独立 HTTP 服务
// 作用：绕开 Vite ssrLoadModule，让前端 /api/* 请求直接交给本机 localhost:5174 的 hono fetch() 处理
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import honoApp from './[[...route]].ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.HONO_PORT ?? process.argv[2] ?? 5174);
const HOST = process.env.HONO_HOST ?? '127.0.0.1';

// 把 Node http IncomingMessage → Web Request
function toRequest(req, rawBodyBuf) {
  const host = req.headers['x-forwarded-host'] ?? req.headers['host'] ?? `${HOST}:${PORT}`;
  const proto = req.headers['x-forwarded-proto'] ?? 'http';
  const url = req.originalUrl ?? req.url ?? '/';
  const fullUrl = /^https?:\/\//i.test(url) ? url : `${proto}://${host}${url.startsWith('/') ? '' : '/'}${url}`;

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) for (const val of v) headers.append(k, val);
    else headers.set(k, v);
  }

  const method = (req.method ?? 'GET').toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  let body = null;
  if (hasBody && rawBodyBuf && rawBodyBuf.length > 0) {
    body = new Uint8Array(rawBodyBuf);
    if (!headers.has('content-length')) headers.set('content-length', String(rawBodyBuf.length));
  }
  try {
    // @ts-ignore
    return new Request(fullUrl, { method, headers, body, duplex: hasBody && body ? 'half' : undefined });
  } catch {
    // @ts-ignore
    return new Request(fullUrl, { method, headers, body });
  }
}

const server = http.createServer(async (req, res) => {
  const method = (req.method ?? 'GET').toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  let rawBuf = null;
  if (hasBody) {
    const chunks = [];
    await new Promise((resolve) => {
      req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => { rawBuf = chunks.length ? Buffer.concat(chunks) : null; resolve(); });
      req.on('error', () => resolve());
    });
  }

  try {
    const webReq = toRequest(req, rawBuf);
    const webRes = await honoApp.fetch(webReq);
    const status = webRes.status;
    res.statusCode = status;
    webRes.headers.forEach((v, k) => {
      const l = String(k).toLowerCase();
      if (l === 'content-encoding' || l === 'transfer-encoding') return;
      try { res.removeHeader(k); } catch { /* ignore */ }
      res.setHeader(k, v);
    });
    const ab = await webRes.arrayBuffer();
    if (ab && ab.byteLength > 0) res.end(Buffer.from(ab));
    else res.end();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    console.error('[hono-standalone] HTTP error:', message);
    if (stack) console.error(stack);
    const payload = JSON.stringify({
      code: 500,
      message: `[Hono Standalone] ${message}`,
      data: null,
      stack: process.env.NODE_ENV === 'production' ? undefined : stack,
    });
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('content-length', String(Buffer.byteLength(payload, 'utf8')));
    res.end(payload);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[hono-standalone] ✅ Hono 独立服务启动 http://${HOST}:${PORT}`);
  // 打印关键路由（用于调试）
  const routes = [];
  try {
    const tree = honoApp.routes ?? [];
    for (const r of tree.slice(0, 30)) routes.push(`${String(r.method).padEnd(6)} ${r.path}`);
    if (routes.length) console.log('[hono-standalone] mounted:\n' + routes.join('\n'));
  } catch { /* ignore */ }
});

process.on('SIGINT', () => { try { server.close(); } catch { /* ignore */ } process.exit(0); });
process.on('SIGTERM', () => { try { server.close(); } catch { /* ignore */ } process.exit(0); });
