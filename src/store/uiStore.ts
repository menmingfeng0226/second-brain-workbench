import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventBus } from '@/lib/eventBus';

export type TopbarDrawerView = 'feedback' | 'sync' | null;

export interface UiState {
  activeNav: string;
  navTick: number;
  topbarDrawer: TopbarDrawerView;
  isPrivateMode: boolean;
  timeRange: '7d' | '30d' | '90d' | 'custom';
  customRange: { from: string | null; to: string | null };
  setActiveNav: (id: string) => void;
  bumpNavTick: () => void;
  openTopbarDrawer: (view: Exclude<TopbarDrawerView, null>) => void;
  closeTopbarDrawer: () => void;
  togglePrivateMode: () => void;
  setPrivateMode: (v: boolean) => void;
  setTimeRange: (r: UiState['timeRange']) => void;
  setCustomRange: (r: UiState['customRange']) => void;
}

const DEFAULT_NAV = 'dashboard';

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      activeNav: DEFAULT_NAV,
      navTick: 0,
      topbarDrawer: null,
      isPrivateMode: false,
      timeRange: '30d',
      customRange: { from: null, to: null },

      setActiveNav: (id) => {
        const current = get().activeNav;
        if (current !== id) {
          set({ activeNav: id, navTick: get().navTick + 1 });
          eventBus.emit('navigate', { to: id });
        }
      },

      bumpNavTick: () => set({ navTick: get().navTick + 1 }),

      openTopbarDrawer: (view) => {
        set({ topbarDrawer: view });
        if (view === 'feedback') {
          eventBus.emit('feedback:read', { id: '*' });
        }
      },
      closeTopbarDrawer: () => set({ topbarDrawer: null }),

      togglePrivateMode: () => {
        const next = !get().isPrivateMode;
        set({ isPrivateMode: next });
        eventBus.emit('private:mode_changed', { isPrivate: next });
        eventBus.emit('toast:show', {
          type: next ? 'warning' : 'info',
          title: next ? '已开启私密模式' : '已关闭私密模式',
          description: next ? '被标记为私密的笔记不会进入同步队列' : '所有内容均可同步',
        });
      },

      setPrivateMode: (v) => {
        if (get().isPrivateMode !== v) {
          set({ isPrivateMode: v });
          eventBus.emit('private:mode_changed', { isPrivate: v });
        }
      },

      setTimeRange: (r) => set({ timeRange: r }),
      setCustomRange: (r) => set({ customRange: r }),
    }),
    {
      name: 'wb:ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          activeNav: s.activeNav,
          isPrivateMode: s.isPrivateMode,
          timeRange: s.timeRange,
          customRange: s.customRange,
        }) as unknown as UiState,
    },
  ),
);

export default useUiStore;
