import './dom-polyfills';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import router from './router';
import eventBus from './lib/eventBus';
import { http } from './lib/http';
import { refreshToken as refreshFn } from './lib/auth';

http.setRefreshTokenFlow(async () => {
  const token = await refreshFn();
  return token;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

eventBus.emit('app:booted', { at: Date.now() });

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
