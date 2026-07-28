import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { authRoute } from './routes/auth';
import { runCrawler } from './_shared/crawlers';
import type { AllowedPlatform } from './_shared/platform-utils';
import { assertPlatform } from './_shared/platform-utils';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://upzhu-workbench.vercel.app'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id', 'X-Platform-Creds'],
    exposeHeaders: ['X-Trace-Id'],
    maxAge: 86400,
  }),
);

app.get('/api/health', (c) =>
  c.json({
    code: 0,
    message: 'UP主工作台后端运行中',
    data: {
      now: new Date().toISOString(),
      version: '1.0.0',
      runtime: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
    },
  }),
);

app.route('/api/auth', authRoute);

app.all('/api/platforms/:platform/:route{.+}', async (c) => {
  const platform = assertPlatform(c.req.param('platform') as AllowedPlatform);
  const route = '/' + (c.req.param('route') ?? '');
  const traceId = c.req.header('X-Trace-Id') ?? 't_' + Math.random().toString(36).slice(2, 10);
  const body = (await c.req.json().catch(() => ({}))) as {
    credentials?: Record<string, string | number | undefined>;
    payload?: Record<string, unknown>;
  };
  const credentials = body.credentials ?? {};
  const payload = body.payload ?? {};
  try {
    const result = await runCrawler({
      platform,
      route,
      credentials,
      payload,
    });
    c.header('X-Trace-Id', traceId);
    return c.json({
      ok: result.ok,
      data: result.data,
      source: result.source,
      error: result.error,
      code: result.code,
      traceId,
    });
  } catch (e) {
    c.header('X-Trace-Id', traceId);
    return c.json(
      {
        ok: false,
        error: (e as Error).message ?? '抓取异常',
        code: 'CRAWLER_ERROR',
        traceId,
        data: null,
      },
      500,
    );
  }
});

app.post('/api/platforms/:platform/_sync', async (c) => {
  const platform = assertPlatform(c.req.param('platform') as AllowedPlatform);
  const traceId = 'sync_' + Math.random().toString(36).slice(2, 10);
  const body = (await c.req.json().catch(() => ({}))) as {
    credentials?: Record<string, string | number | undefined>;
    scope?: string[];
    handle?: string;
    rangeStart?: string;
    rangeEnd?: string;
  };
  const credentials = body.credentials ?? {};
  const scope = body.scope ?? ['profile', 'overview', 'published-list', 'trend'];
  const jobs = scope.flatMap<string>((s) => {
    switch (s) {
      case 'profile':
        return ['/profile/me'];
      case 'overview':
        return ['/data/overview'];
      case 'published-list':
        return platform === 'wechat-official' || platform === 'xiaohongshu' || platform === 'zhihu'
          ? ['/articles/self', '/articles/publish-records']
          : ['/videos/self', '/videos/publish-records'];
      case 'viral-videos':
        return ['/videos/list'];
      case 'viral-articles':
        return ['/articles/self'];
      case 'trend':
        return ['/data/trend'];
      default:
        return [];
    }
  });
  const results: Array<{ route: string; ok: boolean; source?: string; error?: string }> = [];
  for (const route of jobs) {
    try {
      const r = await runCrawler({
        platform,
        route,
        credentials,
        payload: { accountHandle: body.handle, range: [body.rangeStart, body.rangeEnd] },
      });
      results.push({ route, ok: r.ok, source: r.source, error: r.error });
    } catch (e) {
      results.push({ route, ok: false, error: (e as Error).message });
    }
  }
  c.header('X-Trace-Id', traceId);
  return c.json({
    code: 0,
    message: '同步任务完成',
    data: { traceId, platform, scope, results },
  });
});

app.get('/api/hottrack', async (c) => {
  const platform = (c.req.query('platform') ?? 'all') as string;
  const limit = Number(c.req.query('limit') ?? '50');
  const resultMap: Record<string, unknown[]> = {};
  const platforms: AllowedPlatform[] = platform === 'all'
    ? (['bilibili', 'douyin', 'xiaohongshu', 'zhihu', 'kuaishou'] as AllowedPlatform[])
    : ([platform] as AllowedPlatform[]);
  for (const p of platforms) {
    try {
      const r = await runCrawler({
        platform: p,
        route: '/videos/self',
        credentials: {},
        payload: { hot: true },
      });
      if (r.ok && Array.isArray(r.data)) {
        resultMap[p] = (r.data as unknown[]).slice(0, limit);
      }
    } catch {
      resultMap[p] = [];
    }
  }
  return c.json({ code: 0, message: 'OK', data: { platform, items: resultMap, total: Object.values(resultMap).reduce((n, arr) => n + arr.length, 0) } });
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ code: err.status, message: err.message, data: null }, err.status);
  }
  console.error('[Hono Error]', err);
  return c.json({ code: 500, message: (err as Error).message ?? '服务器内部错误', data: null }, 500);
});

app.notFound((c) => c.json({ code: 404, message: `路由不存在: ${c.req.method} ${c.req.path}`, data: null }, 404));

export default app;
