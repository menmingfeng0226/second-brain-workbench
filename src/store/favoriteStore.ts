import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventBus } from '@/lib/eventBus';
import type { FavoriteToggledPayload } from '@/lib/eventBus';

export interface FavoriteMeta {
  type: 'viral' | 'article' | 'idea' | 'script';
  title?: string;
  source?: string;
}

export interface FavoriteState {
  favorites: Record<string, FavoriteMeta>;
  toggleFavorite: (id: string, meta?: FavoriteMeta) => void;
  isFavorite: (id: string) => boolean;
  getMeta: (id: string) => FavoriteMeta | null;
  clearFavorites: () => void;
  favoriteIds: string[];
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: {},
      favoriteIds: [],

      toggleFavorite: (id, meta) => {
        const current = { ...get().favorites };
        const exists = !!current[id];
        let next: Record<string, FavoriteMeta>;
        if (exists) {
          next = { ...current };
          delete next[id];
        } else {
          next = { ...current, [id]: meta ?? { type: 'idea' } };
        }
        const payload: FavoriteToggledPayload = {
          id,
          isFavorited: !exists,
          meta: next[id],
        };
        set({ favorites: next, favoriteIds: Object.keys(next) });
        eventBus.emit('favorite:toggled', payload);
        eventBus.emit('toast:show', {
          type: 'success',
          title: exists ? '已取消收藏' : '已收藏',
          description: next[id]?.title ?? id,
        });
      },

      isFavorite: (id) => Boolean(get().favorites[id]),

      getMeta: (id) => get().favorites[id] ?? null,

      clearFavorites: () => {
        set({ favorites: {}, favoriteIds: [] });
      },
    }),
    {
      name: 'wb:favorites',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ favorites: s.favorites, favoriteIds: Object.keys(s.favorites) } as unknown as FavoriteState),
    },
  ),
);

export default useFavoriteStore;
