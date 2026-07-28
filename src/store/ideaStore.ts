import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventBus } from '@/lib/eventBus';

export interface GeneratedIdeaExtra {
  id: string;
  title: string;
  tags: string[];
  sourceKind?: 'viral' | 'article';
  sourceId?: string;
  sourceTitle?: string;
  createdAt: number;
  usedCards: number;
}

export interface IdeaState {
  extraIdeas: GeneratedIdeaExtra[];
  generatedCount: number;
  createIdeaFromContent: (args: {
    kind: 'video' | 'article';
    id: string;
    title: string;
    tags?: string[];
    url?: string;
  }) => { id: string; title: string };
  deleteIdea: (id: string) => void;
  clearIdeas: () => void;
}

const uid = () =>
  `gen_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const useIdeaStore = create<IdeaState>()(
  persist(
    (set, get) => ({
      extraIdeas: [],
      generatedCount: 0,

      createIdeaFromContent: ({ kind, id, title, tags = [], url }) => {
        const baseTags = [`${kind === 'video' ? '视频' : '文章'}拆解`, ...tags.slice(0, 3)];
        const newIdea: GeneratedIdeaExtra = {
          id: uid(),
          title: `【拆解选题】${title}`,
          tags: Array.from(new Set(baseTags)),
          sourceKind: kind === 'video' ? 'viral' : 'article',
          sourceId: id,
          sourceTitle: title,
          createdAt: Date.now(),
          usedCards: 0,
        };
        const next = [newIdea, ...get().extraIdeas];
        set({ extraIdeas: next, generatedCount: next.length });
        eventBus.emit('idea:created', { idea: newIdea });
        if (newIdea.sourceKind) {
          eventBus.emit('idea:created_from_viral', {
            idea: newIdea,
            sourceContent: { kind: newIdea.sourceKind, id, title },
          });
        }
        eventBus.emit('toast:show', {
          type: 'success',
          title: '已生成选题',
          description: newIdea.title,
        });
        void url;
        return { id: newIdea.id, title: newIdea.title };
      },

      deleteIdea: (id) => {
        const next = get().extraIdeas.filter((i) => i.id !== id);
        set({ extraIdeas: next, generatedCount: next.length });
        eventBus.emit('idea:deleted', { id });
      },

      clearIdeas: () => set({ extraIdeas: [], generatedCount: 0 }),
    }),
    {
      name: 'wb:ideas',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useIdeaStore;
