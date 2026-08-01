// @ts-nocheck 本地开发插件（Node ESM 环境）：跳过 tsc 类型检查
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HONO_PORT = Number(process.env.HONO_DEV_PORT ?? 5174);
const HONO_HOST = '127.0.0.1';
const STANDALONE_SCRIPT = path.resolve(__dirname, 'api', '_hono-standalone.ts');
const TSX_BIN = path.resolve(__dirname, 'node_modules', '.bin', 'tsx');

function waitForTcp(host, port, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConn = () => {
      const sock = net.createConnection(port, host);
      sock.once('connect', () => {
        try { sock.end(); } catch { /* ignore */ }
        resolve(true);
      });
      sock.once('error', () => {
        try { sock.destroy(); } catch { /* ignore */ }
        if (Date.now() - start >= timeoutMs) return reject(new Error(`timeout waiting hono on ${host}:${port}`));
        setTimeout(tryConn, 200);
      });
    };
    tryConn();
  });
}

function startHonoStandalone() {
  const ps = spawn(
    process.execPath,
    [TSX_BIN, STANDALONE_SCRIPT, String(HONO_PORT)],
    {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        HONO_PORT: String(HONO_PORT),
        HONO_HOST,
        NODE_ENV: process.env.NODE_ENV ?? 'development',
      },
    },
  );

  const bufOut = [];
  const bufErr = [];
  ps.stdout.on('data', (d) => {
    const s = String(d);
    bufOut.push(s);
    if (bufOut.length > 50) bufOut.shift();
    process.stdout.write(`[hono-dev] ${s.replace(/\n$/, '')}\n`);
  });
  ps.stderr.on('data', (d) => {
    const s = String(d);
    bufErr.push(s);
    if (bufErr.length > 50) bufErr.shift();
    process.stderr.write(`[hono-dev][err] ${s.replace(/\n$/, '')}\n`);
  });

  ps.on('exit', (code, signal) => {
    process.stderr.write(`[hono-dev] process exited code=${code ?? ''} sig=${signal ?? ''}\n`);
  });

  return { ps };
}

/**
 * 代理 Node http 客户端请求 (IncomingMessage) → 目标 Hono (localhost:HONO_PORT)
 * 直接用 http.request + pipe，避免构造/解析二次开销。
 */
function proxyToHono(incomingReq, res, rawBuf) {
  const url = incomingReq.originalUrl ?? incomingReq.url ?? '/';
  const options = {
    hostname: HONO_HOST,
    port: HONO_PORT,
    method: incomingReq.method ?? 'GET',
    path: url,
    headers: { ...(incomingReq.headers ?? {}) },
    timeout: 30000,
  };
  // Vite proxy 可能带 host=localhost:5173，需要重写为目标端口 host，避免后端生成的绝对 url 出错
  options.headers['host'] = `${HONO_HOST}:${HONO_PORT}`;
  // 不要让 hono 认为是分块 (除非上游已经是 chunked)，若已有 body 就用 content-length
  if (rawBuf && rawBuf.length > 0) {
    options.headers['content-length'] = String(rawBuf.length);
    delete options.headers['transfer-encoding'];
  }
  return new Promise((resolve, reject) => {
    const req = http.request(options, (upstream) => {
      try {
        res.statusCode = upstream.statusCode ?? 502;
        // 安全写回 headers：移除 content-encoding / transfer-encoding，避免 vite/gzip 双重压缩
        for (const [k, vals] of Object.entries(upstream.headers)) {
          const lower = String(k).toLowerCase();
          if (lower === 'content-encoding' || lower === 'transfer-encoding') continue;
          if (vals === undefined || vals === null) continue;
          try { res.removeHeader(k); } catch { /* ignore */ }
          if (Array.isArray(vals)) for (const v of vals) res.setHeader(k, v);
          else res.setHeader(k, vals);
        }
      } catch (e) {
        return reject(e);
      }
      upstream.on('data', (c) => res.write(c));
      upstream.on('end', () => {
        try { res.end(); } catch { /* ignore */ }
        resolve();
      });
      upstream.on('error', (e) => reject(e));
    });
    req.on('error', (e) => {
      try { res.destroy(); } catch { /* ignore */ }
      reject(e);
    });
    req.on('timeout', () => {
      try { req.destroy(new Error('proxy timeout')); } catch { /* ignore */ }
    });
    if (rawBuf && rawBuf.length > 0) req.write(rawBuf);
    req.end();
  });
}

/**
 * vite-plugin-hono-dev
 *
 * 方案变化（2026-07-26）：
 *   之前：用 server.ssrLoadModule 直接加载 Hono TS → 在 Vite 8.1 + Node 22 下出现
 *         "Failed to load url /@fs/... (resolved id: ...). Does the file exist?"
 *   现在：通过子进程 `tsx api/_hono-standalone.ts <PORT>` 在本机 5174 端口独立启动
 *         Hono HTTP 服务；Vite 的中间件把 /api/* 请求代理到这个子进程。
 *         这样 Hono 与 Vite 完全解耦，不再依赖 ssrLoadModule 的路径解析。
 *
 * 修复（2026-08-01）：
 *   ① 启动竞态：浏览器一次加载并发打 9 平台，第 1 个请求在 waitForTcp() 等待时，
 *      后续请求看到 honoProcStarted=true 直接代理，此时 Hono 仍未 listen() →
 *      ECONNREFUSED 3~9 条随机报错，看起来像 dev server 卡住。
 *      → 改用「启动 Promise latch」：所有请求 await 同一个启动 Promise，并发安全。
 *   ② 代理失败兜底：proxyToHono EConnRefused/超时，先内部 retry 最多 3 次（间隔 300ms），
 *      仍失败则写 502 JSON body（不再留浏览器 hanging），最后调用 next() 避免
 *      Vite middleware pipeline 悬挂。
 *   ③ 保证每个请求最终有响应（要么代理成功，要么 502，要么走 next）。
 */
export default function vitePluginHonoDev() {
  /** 启动 latch：所有并发请求 await 同一个 Promise，直到 Hono TCP 真的能连上 */
  let honoReadyPromise = null;

  function ensureHonoStarted() {
    if (honoReadyPromise) return honoReadyPromise;
    honoReadyPromise = (async () => {
      try {
        startHonoStandalone();
        await waitForTcp(HONO_HOST, HONO_PORT, 20000);
        return true;
      } catch (e) {
        // 失败了清掉 latch（下一次请求重试启动），避免永远失败
        honoReadyPromise = null;
        throw e;
      }
    })();
    return honoReadyPromise;
  }

  function write502(res, message) {
    try {
      if (res.writableEnded) return;
      res.statusCode = 502;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        ok: false,
        code: 502,
        error: message,
        source: 'mock',
        message,
        data: null,
      }));
    } catch { /* ignore */ }
  }

  return {
    name: 'vite-plugin-hono-dev',
    apply: 'serve',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl ?? req.url ?? '/';
        const isApi = url === '/api' || url.startsWith('/api/') || url.startsWith('/api?');
        if (!isApi) return next();

        // 1) 等 Hono 真的 listen（所有并发请求都 await 同一个启动 latch，无竞态）
        try {
          await ensureHonoStarted();
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          process.stderr.write(`[vite-plugin-hono-dev] hono 启动失败: ${msg}\n`);
          write502(res, `[Hono Standalone] 启动失败: ${msg}`);
          return next?.();
        }

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

        // 2) Hono 刚 listen 的前几十毫秒偶发 EConnRefused（TCP backlog）→ 内部重试 3 次
        let lastErr = null;
        for (let i = 0; i < 3; i++) {
          try {
            await proxyToHono(req, res, rawBuf);
            return;
          } catch (err) {
            lastErr = err;
            const message = err instanceof Error ? err.message : String(err);
            // 启动瞬时的连接拒绝 / 超时 → 重试
            if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT|proxy timeout|socket hang up/i.test(message) && i < 2) {
              await new Promise((r) => setTimeout(r, 300));
              continue;
            }
            // 其他错误 → 不再重试
            break;
          }
        }

        // 3) 所有重试都失败 → 写 502 body（保证浏览器不 hanging），再走 next 兜底
        const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
        process.stderr.write(`[vite-plugin-hono-dev] ${method} ${url} 失败: ${message}\n`);
        if (lastErr instanceof Error && lastErr.stack) process.stderr.write(lastErr.stack + '\n');
        write502(res, `[Hono 代理转发] ${message}`);
        return next?.();
      });
    },
  };
}
