export interface PlatformProxyRequest {
  credentials?: Record<string, string | number | undefined>;
  payload?: {
    accountHandle?: string;
    range?: [string | undefined, string | undefined];
    [k: string]: unknown;
  };
  headers?: Record<string, string>;
}

export interface PlatformProxyResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
  fetchedAt?: string;
  source?: 'direct' | 'mock';
}

export const ALLOWED_PLATFORMS = [
  'bilibili',
  'xiaohongshu',
  'douyin',
  'wechat-video',
  'kuaishou',
  'wechat-official',
  'ximalaya',
  'xiaoyuzhou',
  'zhihu',
] as const;

export type AllowedPlatform = (typeof ALLOWED_PLATFORMS)[number];

export function assertPlatform(p: string): AllowedPlatform {
  if (!ALLOWED_PLATFORMS.includes(p as AllowedPlatform)) {
    throw new Error(`不支持的平台: ${p}`);
  }
  return p as AllowedPlatform;
}

export function corsHeaders(req: { method?: string; headers?: { origin?: string } } = {}): Record<string, string> {
  const origin = req.headers?.origin ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Trace-Id',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  };
}

export function handleOptions() {
  return { statusCode: 204, headers: corsHeaders(), body: '' };
}

export function jsonResponse<T = unknown>(
  body: PlatformProxyResponse<T>,
  status = 200,
  req: { headers?: { origin?: string } } = {},
) {
  return {
    statusCode: status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ fetchedAt: new Date().toISOString(), ...body }),
  };
}

export function requireAuth(req: {
  headers?: Record<string, string>;
  body?: PlatformProxyRequest;
}): {
  credentials?: Record<string, string | number | undefined>;
  traceId: string;
} {
  const h = (req.headers ?? {}) as Record<string, string>;
  const traceId = h['x-trace-id'] ?? `trace_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    credentials: req.body?.credentials ?? {},
    traceId,
  };
}

export function isEmpty(obj: Record<string, unknown> | undefined): boolean {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}
