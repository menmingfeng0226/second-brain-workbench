import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import PageSkeleton from '@/components/PageSkeleton';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    if (isInitializing) hydrate();
  }, [isInitializing, hydrate]);

  if (isInitializing) {
    return <PageSkeleton variant="full" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
