import type { FeedbackItem, SyncQueueItem, IdeaItem } from '@/types';

export interface FavoriteToggledPayload {
  id: string;
  isFavorited: boolean;
  meta?: { type: 'viral' | 'article' | 'idea' | 'script'; title?: string; source?: string };
}

export interface IdeaCreatedPayload {
  idea: IdeaItem | { id: string; title: string; tags: string[] };
  sourceContent?: { kind: 'viral' | 'article'; id: string; title: string };
}

export interface FeedbackReceivedPayload {
  feedback: FeedbackItem;
}

export interface SyncCompletedPayload {
  count: number;
  timestamp: string;
}

export interface SyncFailedPayload {
  error: string;
  item?: SyncQueueItem;
}

export interface PrivateModeChangedPayload {
  isPrivate: boolean;
}

export interface NavigatePayload {
  to: string;
  params?: Record<string, string>;
}

export interface EventDefinition {
  'favorite:toggled': FavoriteToggledPayload;
  'idea:created': IdeaCreatedPayload;
  'idea:created_from_viral': IdeaCreatedPayload;
  'idea:updated': { idea: IdeaItem };
  'idea:deleted': { id: string };
  'sync:completed': SyncCompletedPayload;
  'sync:failed': SyncFailedPayload;
  'feedback:received': FeedbackReceivedPayload;
  'feedback:read': { id: string };
  'private:mode_changed': PrivateModeChangedPayload;
  'navigate': NavigatePayload;
  'toast:show': { type?: 'success' | 'error' | 'info' | 'warning'; title: string; description?: string };
  'app:booted': { at: number };
  'scheduler:sync-start': { platforms: ChannelPlatform[]; onlyLinked: boolean };
  'scheduler:sync-done': { snap: unknown; totals: unknown };
}
import type { ChannelPlatform } from '@/types';

export type EventName = keyof EventDefinition;

type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private history: { event: string; payload: unknown; timestamp: number }[] = [];
  private maxHistory = 50;

  on<K extends EventName>(event: K, handler: EventHandler<EventDefinition[K]>): () => void {
    const key = event as string;
    if (!this.handlers.has(key)) this.handlers.set(key, new Set());
    const bucket = this.handlers.get(key)!;
    bucket.add(handler as EventHandler);
    return () => {
      bucket.delete(handler as EventHandler);
      if (bucket.size === 0) this.handlers.delete(key);
    };
  }

  once<K extends EventName>(event: K, handler: EventHandler<EventDefinition[K]>): () => void {
    const unsub = this.on(event, (payload) => {
      unsub();
      void handler(payload);
    });
    return unsub;
  }

  emit<K extends EventName>(event: K, payload: EventDefinition[K]): void {
    this.history.push({ event: event as string, payload, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) this.history.shift();
    const handlers = this.handlers.get(event as string);
    if (!handlers) return;
    for (const handler of handlers) {
      Promise.resolve()
        .then(() => handler(payload))
        .catch((err) => {
          console.error(`[EventBus] Handler error for "${event}":`, err);
        });
    }
    if (import.meta.env.DEV) {
      console.debug(`[EventBus] ${event}`, payload);
    }
  }

  off(event: EventName): void {
    this.handlers.delete(event as string);
  }

  clear(): void {
    this.handlers.clear();
  }

  getHistory(): readonly { event: string; payload: unknown; timestamp: number }[] {
    return this.history;
  }
}

export const eventBus = new EventBus();

export default eventBus;
