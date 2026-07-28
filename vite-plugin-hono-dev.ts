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
 */
export default function vitePluginHonoDev() {
  let honoProcStarted = false;

  return {
    name: 'vite-plugin-hono-dev',
    apply: 'serve',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl ?? req.url ?? '/';
        const isApi = url === '/api' || url.startsWith('/api/') || url.startsWith('/api?');
        if (!isApi) return next();

        // 懒加载启动 hono 子进程（只有当有 /api 请求时才启动，避免 vite 冷启动过重）
        if (!honoProcStarted) {
          honoProcStarted = true;
          try {
            startHonoStandalone();
            await waitForTcp(HONO_HOST, HONO_PORT, 20000);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            process.stderr.write(`[vite-plugin-hono-dev] hono 进程启动失败: ${msg}\n`);
            try {
              res.statusCode = 502;
              res.setHeader('content-type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ code: 502, message: `[Hono Standalone] 启动失败: ${msg}`, data: null }));
            } catch { /* ignore */ }
            return;
          }
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

        try {
          await proxyToHono(req, res, rawBuf);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const stack = err instanceof Error ? err.stack : undefined;
          process.stderr.write(`[vite-plugin-hono-dev] ${method} ${url} 失败: ${message}\n`);
          if (stack) process.stderr.write(stack + '\n');
          try {
            res.statusCode = 502;
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ code: 502, message: `[Hono 代理转发] ${message}`, data: null }));
          } catch { /* ignore */ }
        }
      });
    },
  };
}
