import { createHashRouter, Navigate, type RouteObject, useRouteError } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PageSkeleton from '@/components/PageSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthGuard from './AuthGuard';
import AppLayout from './AppLayout';

const LoginPage = lazy(() => import('@/components/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/components/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/components/pages/NotFoundPage'));

const withSuspense = (node: React.ReactNode, key = 'page') => (
  <ErrorBoundary key={key}>
    <Suspense fallback={<PageSkeleton variant="full" />}>{node}</Suspense>
  </ErrorBoundary>
);

// 🔧 router 根级 errorElement 兜底：
// react-router 会在 ErrorBoundary 外部抛出的异常（如 useMemo 期间、同步渲染报错）
// 走到 errorElement，使用 useRouteError() 提取真实错误，再统一展示 ErrorBoundary 卡片。
// 避免用户看到白底 "Minified React error #xxx" 的裸错误。
function RootErrorFallback() {
  const errLike = useRouteError() as unknown;
  let error: Error | null = null;
  try {
    if (errLike instanceof Error) error = errLike;
    else if (errLike && typeof (errLike as Record<string, unknown>).error === 'object') {
      const e = (errLike as Record<string, unknown>).error;
      if (e instanceof Error) error = e;
    }
    if (!error) {
      const msg = typeof errLike === 'string' ? errLike : JSON.stringify(errLike ?? {});
      error = new Error(msg || 'Router level error');
      if (typeof errLike === 'object' && errLike !== null) {
        try {
          const stack = (errLike as { internal_stack?: string; stack?: string }).stack
            || (errLike as { internal?: string; toString?: () => string }).toString?.();
          if (stack) error.stack = String(stack);
        } catch { /* noop */ }
      }
    }
  } catch {
    error = new Error('Unexpected router error');
  }
  // 直接渲染一个 ErrorBoundary 实例，手动灌 hasError + error
  return <ErrorBoundary forcedError={error} />;
}

const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <RootErrorFallback />,
    children: [
      { index: true, element: <Navigate to="/app" replace /> },
      {
        path: 'login',
        element: withSuspense(<LoginPage />, 'login'),
      },
      {
        path: 'register',
        element: withSuspense(<RegisterPage />, 'register'),
      },
      {
        path: 'app',
        element: (
          <ErrorBoundary key="app-root">
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          </ErrorBoundary>
        ),
      },
      {
        path: '*',
        element: withSuspense(<NotFoundPage />, '404'),
      },
    ],
  },
];

export const router = createHashRouter(routes);

export default router;
