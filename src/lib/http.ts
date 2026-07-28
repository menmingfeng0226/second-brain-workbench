import { tryHandleDemoRequest } from './demo-mode';

export interface HttpRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipFallback?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
}

export class HttpError extends Error {
  status: number;
  code: string;
  detail?: unknown;
  constructor(status: number, code: string, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.name = 'HttpError';
  }
}

type RequestInterceptor = (
  config: HttpRequestConfig,
) => Promise<HttpRequestConfig> | HttpRequestConfig;

type ResponseInterceptor = (
  response: Response,
  config: HttpRequestConfig,
) => Promise<Response> | Response;

type ErrorInterceptor = (
  error: HttpError,
  config: HttpRequestConfig,
) => Promise<HttpRequestConfig | null>;

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');
const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 2;

class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  onRequest(fn: RequestInterceptor): () => void {
    this.requestInterceptors.push(fn);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter((f) => f !== fn);
    };
  }

  onResponse(fn: ResponseInterceptor): () => void {
    this.responseInterceptors.push(fn);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter((f) => f !== fn);
    };
  }

  onError(fn: ErrorInterceptor): () => void {
    this.errorInterceptors.push(fn);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter((f) => f !== fn);
    };
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    signal?: AbortSignal,
    ms: number = DEFAULT_TIMEOUT,
  ): Promise<T> {
    if (ms <= 0) return promise;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>(
      (_, rej) =>
        (timer = setTimeout(() => rej(new HttpError(408, 'TIMEOUT', '请求超时，请检查网络并重试')), ms)),
    );
    if (signal) {
      signal.addEventListener?.('abort', () => {
        if (timer) clearTimeout(timer);
      });
    }
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private buildUrl(url: string, params?: HttpRequestConfig['params']): string {
    const fullUrl = /^https?:\/\//i.test(url) ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    if (!params) return fullUrl;
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      usp.append(k, String(v));
    });
    const qs = usp.toString();
    return qs ? `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${qs}` : fullUrl;
  }

  async request<T>(url: string, config: HttpRequestConfig = {}): Promise<ApiResponse<T>> {
    const retries = config.retries ?? DEFAULT_RETRIES;
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await this.tryRequestOnce<T>(url, config, attempt);
      } catch (err) {
        lastErr = err;
        if (attempt < retries && this.isRetryable(err)) {
          await this.sleep(300 * Math.pow(2, attempt));
          continue;
        }
        throw err;
      }
    }
    throw lastErr ?? new HttpError(0, 'UNKNOWN', '未知错误');
  }

  private async tryRequestOnce<T>(
    url: string,
    config: HttpRequestConfig,
    attempt: number,
  ): Promise<ApiResponse<T>> {
    void attempt;
    let cfg: HttpRequestConfig = {
      method: 'GET',
      timeout: DEFAULT_TIMEOUT,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(config.headers ?? {}),
      },
    };

    for (const fn of this.requestInterceptors) cfg = await fn(cfg);

    const authHeader = !cfg.skipAuth ? this.tryGetAuthHeader() : null;
    if (authHeader) cfg.headers = { ...cfg.headers, ...authHeader };

    const finalUrl = this.buildUrl(url, cfg.params);
    const body =
      cfg.body === undefined || cfg.body instanceof FormData || typeof cfg.body === 'string'
        ? (cfg.body as BodyInit | null | undefined)
        : (JSON.stringify(cfg.body) as BodyInit);

    const demo = tryHandleDemoRequest(cfg.method ?? 'GET', finalUrl, cfg.body, cfg.headers as Record<string, string>);
    if (demo) return demo as ApiResponse<T>;

    const init: RequestInit = {
      method: cfg.method,
      headers: cfg.headers as Record<string, string>,
      body: cfg.method === 'GET' ? undefined : body,
      signal: cfg.signal,
    };

    try {
      const res = await this.withTimeout(fetch(finalUrl, init), cfg.signal, cfg.timeout);
      let final = res;
      for (const fn of this.responseInterceptors) final = await fn(final, cfg);
      const text = await final.text();
      const json: ApiResponse<T> | T = text ? (JSON.parse(text) as ApiResponse<T> | T) : (null as unknown as T);
      const payload =
        json && typeof json === 'object' && 'data' in json && 'code' in json
          ? (json as ApiResponse<T>)
          : ({ data: json as T, code: final.ok ? 0 : final.status, message: final.statusText } as ApiResponse<T>);
      if (!final.ok || (payload.code && payload.code >= 400)) {
        throw new HttpError(final.status || payload.code || 500, String(payload.code), payload.message || final.statusText, payload);
      }
      return payload;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new HttpError(500, 'BAD_JSON', '接口返回了非 JSON 数据，请稍后重试', err.message);
      }
      if (err instanceof HttpError) {
        for (const fn of this.errorInterceptors) {
          const retryCfg = await fn(err, cfg);
          if (retryCfg) return this.tryRequestOnce(url, retryCfg, attempt + 1);
        }
        throw err;
      }
      throw new HttpError(0, 'NETWORK', '网络异常，请检查网络后重试', (err as Error).message);
    }
  }

  private isRetryable(err: unknown): boolean {
    if (!(err instanceof HttpError)) return false;
    return err.code === 'TIMEOUT' || err.code === 'NETWORK' || (err.status >= 500 && err.status < 600);
  }

  private tryGetAuthHeader(): Record<string, string> | null {
    try {
      const token = localStorage.getItem('auth:token');
      return token ? { Authorization: `Bearer ${token}` } : null;
    } catch {
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  get<T>(url: string, config?: HttpRequestConfig) {
    return this.request<T>(url, { ...config, method: 'GET' });
  }
  post<T>(url: string, body?: unknown, config?: HttpRequestConfig) {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }
  put<T>(url: string, body?: unknown, config?: HttpRequestConfig) {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }
  patch<T>(url: string, body?: unknown, config?: HttpRequestConfig) {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }
  delete<T>(url: string, config?: HttpRequestConfig) {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  setRefreshTokenFlow(flow: () => Promise<string>) {
    this.onError(async (err, cfg) => {
      if (err.status !== 401 || cfg.skipAuth) return null;
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = flow()
          .catch((e) => {
            throw e;
          })
          .finally(() => {
            this.isRefreshing = false;
          });
      }
      await this.refreshPromise;
      return { ...cfg, retries: 0 };
    });
  }
}

export const http = new HttpClient();

export default http;
