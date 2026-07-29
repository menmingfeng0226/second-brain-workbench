import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
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

const routes: RouteObject[] = [
  {
    path: '/',
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
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: withSuspense(<NotFoundPage />, '404'),
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
