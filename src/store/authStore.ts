import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  mockLogin,
  mockRegister,
  mockLogout,
  getAuthUser,
  isTokenValid,
  clearToken,
  setAuth as saveAuth,
} from '@/lib/auth';
import type { AuthUser, AuthTokens } from '@/lib/auth';
import { eventBus } from '@/lib/eventBus';

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  error: string | null;
  hydrate: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isInitializing: true,
      user: null,
      tokens: null,
      error: null,

      hydrate: () => {
        if (!get().isInitializing) return;
        try {
          const user = getAuthUser();
          const ok = isTokenValid();
          if (user && ok) {
            const tokens: AuthTokens = {
              token: localStorage.getItem('auth:token') ?? '',
              refreshToken: localStorage.getItem('auth:refresh') ?? '',
              expiresAt: Number(localStorage.getItem('auth:expires') ?? '0'),
            };
            set({ isAuthenticated: true, user, tokens, isInitializing: false });
          } else {
            if (!ok) clearToken();
            set({ isAuthenticated: false, user: null, tokens: null, isInitializing: false });
          }
        } catch {
          set({ isAuthenticated: false, user: null, tokens: null, isInitializing: false });
        }
      },

      login: async (username, password) => {
        set({ error: null });
        try {
          const { user, tokens } = await mockLogin(username, password);
          saveAuth(tokens, user);
          set({ isAuthenticated: true, user, tokens });
          eventBus.emit('toast:show', { type: 'success', title: '登录成功', description: `欢迎回来，${user.nickname}` });
        } catch (err) {
          const msg = (err as Error).message || '登录失败';
          set({ error: msg });
          throw err;
        }
      },

      register: async (username, password) => {
        set({ error: null });
        try {
          const { user, tokens } = await mockRegister(username, password);
          saveAuth(tokens, user);
          set({ isAuthenticated: true, user, tokens });
          eventBus.emit('toast:show', { type: 'success', title: '注册成功', description: `欢迎加入，${user.nickname}` });
        } catch (err) {
          const msg = (err as Error).message || '注册失败';
          set({ error: msg });
          throw err;
        }
      },

      logout: async () => {
        await mockLogout();
        set({ isAuthenticated: false, user: null, tokens: null, error: null });
        eventBus.emit('toast:show', { type: 'info', title: '已退出登录' });
      },

      requireAuth: () => {
        const { isInitializing } = get();
        if (isInitializing) get().hydrate();
        return get().isAuthenticated;
      },
    }),
    {
      name: 'wb:auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user } as unknown as AuthState),
    },
  ),
);

export default useAuthStore;
