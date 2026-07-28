import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ChannelPlatform,
  PlatformAccount,
  CrawlJob,
  SchedulerPolicy,
  CrawlTargetScope,
} from '@/types';
import { encryptData, decryptData } from '@/lib/crypto';
import { useAuthStore } from './authStore';

export interface AccountState {
  accounts: PlatformAccount[];
  crawlJobs: CrawlJob[];
  policies: SchedulerPolicy[];
  lastPullSummary: Record<ChannelPlatform, string | null>;

  upsertAccount: (
    platform: ChannelPlatform,
    data: Partial<PlatformAccount> & {
      handle: string;
      displayName: string;
      authMethod: PlatformAccount['authMethod'];
      credentials: Record<string, string | number | undefined>;
    },
  ) => Promise<PlatformAccount>;
  updateAccountStatus: (
    accountId: string,
    patch: Partial<Pick<PlatformAccount, 'syncStatus' | 'lastSyncAt' | 'lastSyncError' | 'lastVerifiedAt' | 'followerCount'>>,
  ) => void;
  removeAccount: (accountId: string) => void;
  setDefaultAccount: (accountId: string) => void;
  decryptCredentials: (accountId: string) => Promise<Record<string, string | number | undefined> | null>;
  getDefaultAccount: (platform: ChannelPlatform) => PlatformAccount | undefined;
  listAccountsByPlatform: (platform: ChannelPlatform) => PlatformAccount[];
  addCrawlJob: (job: Omit<CrawlJob, 'id' | 'createdAt' | 'retryCount' | 'recordsFetched' | 'status'> & Partial<CrawlJob>) => CrawlJob;
  updateCrawlJob: (jobId: string, patch: Partial<CrawlJob>) => void;
  togglePolicy: (policyId: string, enabled: boolean) => void;
  runPolicyNow: (policyId: string | ChannelPlatform, trigger?: 'manual' | 'on-change' | 'on-login' | 'cron') => CrawlJob[] | undefined;
}

const DEFAULT_POLICIES: SchedulerPolicy[] = [
  {
    id: 'policy-hourly-hot',
    name: '热点&爆款（每小时）',
    cronExpr: '0 */1 * * *',
    cron: '0 */1 * * *',
    enabled: true,
    scope: ['hot-list', 'viral-videos', 'viral-articles'],
    platforms: ['bilibili', 'xiaohongshu', 'douyin', 'zhihu', 'wechat-official'],
    platform: 'bilibili',
    rangeDays: 30,
    onlyLinkedAccounts: true,
  },
  {
    id: 'policy-daily-channel',
    name: '渠道数据&趋势（每日 8:00）',
    cronExpr: '0 8 * * *',
    cron: '0 8 * * *',
    enabled: true,
    scope: ['profile', 'channel-metrics', 'published-list', 'trend'],
    platforms: ['bilibili', 'xiaohongshu', 'douyin', 'wechat-video', 'kuaishou', 'wechat-official', 'ximalaya', 'xiaoyuzhou', 'zhihu'],
    platform: 'bilibili',
    rangeDays: 30,
    onlyLinkedAccounts: true,
  },
  {
    id: 'policy-biweekly-revenue',
    name: '收益同步（每周一/四 9:30）',
    cronExpr: '30 9 * * 1,4',
    cron: '30 9 * * 1,4',
    enabled: false,
    scope: ['revenue'],
    platforms: ['bilibili', 'kuaishou', 'wechat-official'],
    platform: 'bilibili',
    rangeDays: 30,
    onlyLinkedAccounts: true,
  },
].flatMap((base) =>
  base.platforms.map<ChannelPlatform>((p) => p as ChannelPlatform).map((p) => ({
    ...base,
    id: `${base.id}-${p}`,
    platform: p,
    platforms: [p],
  })),
) as SchedulerPolicy[];

const EMPTY_LAST_PULL = {
  bilibili: null,
  xiaohongshu: null,
  douyin: null,
  'wechat-video': null,
  kuaishou: null,
  'wechat-official': null,
  ximalaya: null,
  xiaoyuzhou: null,
  zhihu: null,
} as Record<ChannelPlatform, string | null>;

function fingerprintCreds(creds: Record<string, string | number | undefined>): string {
  const keys = Object.keys(creds).sort();
  const core: string[] = [];
  for (const k of keys) {
    const v = creds[k];
    if (!v) continue;
    const s = String(v);
    core.push(`${k}:${s.slice(0, 6)}…${s.slice(-4)}`);
  }
  let hash = 0;
  const src = core.join('|');
  for (let i = 0; i < src.length; i++) hash = ((hash << 5) - hash + src.charCodeAt(i)) | 0;
  return `fp:${Math.abs(hash).toString(36)}:${src.length}`;
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentUserId(): string {
  try {
    const u = useAuthStore.getState().user;
    return u?.id ?? 'local-user';
  } catch {
    return 'local-user';
  }
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      crawlJobs: [],
      policies: DEFAULT_POLICIES,
      lastPullSummary: EMPTY_LAST_PULL,

      async upsertAccount(platform, data) {
        const encrypted = await encryptData(data.credentials);
        const fp = fingerprintCreds(data.credentials);
        const userId = getCurrentUserId();

        const existing = get().accounts.find(
          (a) => a.platform === platform && a.handle === data.handle,
        );

        const now = new Date().toISOString();

        const fresh: PlatformAccount = {
          id: existing?.id ?? uid('acc'),
          platform,
          handle: data.handle,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl ?? existing?.avatarUrl,
          profileUrl: data.profileUrl ?? existing?.profileUrl,
          authMethod: data.authMethod,
          credentialsEncrypted: encrypted,
          credentialFingerprint: fp,
          scopes: data.scopes ?? existing?.scopes ?? [],
          followerCount: data.followerCount ?? existing?.followerCount ?? 0,
          linkedAt: existing?.linkedAt ?? now,
          credentialsUpdatedAt: now,
          lastVerifiedAt: now,
          lastSyncAt: existing?.lastSyncAt,
          lastSyncError: existing?.lastSyncError,
          syncStatus: 'linked',
          isDefault: existing?.isDefault ?? get().listAccountsByPlatform(platform).length === 0,
          userId,
        } as PlatformAccount;

        set((s) => {
          const others = s.accounts.filter((a) => a.id !== fresh.id);
          if (fresh.isDefault) {
            others.forEach((a) => {
              if (a.platform === fresh.platform) a.isDefault = false;
            });
          }
          return { accounts: [...others, fresh] };
        });

        return fresh;
      },

      updateAccountStatus(accountId, patch) {
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === accountId ? { ...a, ...patch } : a)),
        }));
      },

      removeAccount(accountId) {
        set((s) => {
          const toRemove = s.accounts.find((a) => a.id === accountId);
          const remaining = s.accounts.filter((a) => a.id !== accountId);
          if (toRemove?.isDefault) {
            const sibling = remaining.find((a) => a.platform === toRemove.platform);
            if (sibling) sibling.isDefault = true;
          }
          return { accounts: remaining };
        });
      },

      setDefaultAccount(accountId) {
        set((s) => {
          const target = s.accounts.find((a) => a.id === accountId);
          if (!target) return {};
          return {
            accounts: s.accounts.map((a) => ({
              ...a,
              isDefault: a.id === accountId ? true : a.platform === target.platform ? false : a.isDefault,
            })),
          };
        });
      },

      async decryptCredentials(accountId) {
        const account = get().accounts.find((a) => a.id === accountId);
        if (!account) return null;
        try {
          const raw = await decryptData<Record<string, string | number | undefined>>(
            account.credentialsEncrypted,
          );
          return raw ?? null;
        } catch {
          return null;
        }
      },

      getDefaultAccount(platform) {
        return (
          get().accounts.find((a) => a.platform === platform && a.isDefault) ??
          get().accounts.find((a) => a.platform === platform)
        );
      },

      listAccountsByPlatform(platform) {
        return get().accounts.filter((a) => a.platform === platform);
      },

      addCrawlJob(job) {
        const fresh: CrawlJob = {
          id: uid('job'),
          createdAt: new Date().toISOString(),
          retryCount: 0,
          recordsFetched: 0,
          status: 'queued',
          ...job,
        } as CrawlJob;
        set((s) => ({ crawlJobs: [fresh, ...s.crawlJobs].slice(0, 200) }));
        return fresh;
      },

      updateCrawlJob(jobId, patch) {
        set((s) => ({
          crawlJobs: s.crawlJobs.map((j) => (j.id === jobId ? { ...j, ...patch } : j)),
        }));
      },

      togglePolicy(policyId, enabled) {
        set((s) => ({
          policies: s.policies.map((p) => (p.id === policyId ? { ...p, enabled } : p)),
        }));
      },

      runPolicyNow(policyId, trigger = 'cron') {
        const CHANNEL_PLATFORMS: ChannelPlatform[] = [
          'bilibili', 'xiaohongshu', 'douyin', 'wechat-video', 'kuaishou',
          'wechat-official', 'ximalaya', 'xiaoyuzhou', 'zhihu',
        ];
        const isPlatformId = CHANNEL_PLATFORMS.includes(policyId as ChannelPlatform);
        const policies = isPlatformId
          ? get().policies.filter((p) => p.platform === policyId || p.platforms.includes(policyId as ChannelPlatform))
          : [get().policies.find((p) => p.id === policyId)].filter(Boolean) as SchedulerPolicy[];
        if (policies.length === 0) return undefined;
        const nowStr = new Date().toISOString();
        const queued: CrawlJob[] = [];
        const policy = policies[0];
        set((s) => ({
          policies: s.policies.map((p) =>
            policies.find((x) => x.id === p.id) ? { ...p, lastRunAt: nowStr } : p,
          ),
        }));
        const platforms = (policy.platform ?? policy.platforms) ? [policy.platform ?? policy.platforms[0]].flat().filter(Boolean) as ChannelPlatform[] : [];
        for (const p of platforms) {
          const acc = policy.onlyLinkedAccounts ? get().getDefaultAccount(p) : undefined;
          const accountId = acc?.id ?? 'global';
          queued.push(
            get().addCrawlJob({
              platform: p,
              accountId,
              scope: policy.scope as CrawlTargetScope[],
              trigger: trigger as 'manual' | 'cron' | 'on-login' | 'page-enter' | 'ui-refresh',
            }),
          );
        }
        return queued;
      },
    }),
    {
      name: 'wb:accounts',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          accounts: s.accounts.map((a) => ({ ...a })),
          crawlJobs: s.crawlJobs,
          policies: s.policies,
          lastPullSummary: s.lastPullSummary,
        }) as unknown as AccountState,
    },
  ),
);
