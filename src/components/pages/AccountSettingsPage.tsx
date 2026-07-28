import { useMemo, useState } from 'react';
import { useAccountStore } from '@/store/accountStore';
import { useSyncAll, usePlatformSnapshot } from '@/hooks/usePlatformData';
import { getAdapter } from '@/lib/platform/adapters';
import { NINE_PLATFORMS, PLATFORM_META } from '@/lib/platform/types';
import type { ChannelPlatform, AccountAuthMethod } from '@/types';
import {
  RefreshCw,
  ShieldCheck,
  Link2,
  Unlink2,
  PlayCircle,
  Copy,
  Check,
  AlertTriangle,
  Info,
  LockKeyhole,
  CircleDot,
  Clock,
  ListTodo,
} from 'lucide-react';

function timeAgo(iso?: string) {
  if (!iso) return '从未';
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} 秒前`;
  if (s < 3600) return `${Math.round(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.round(s / 3600)} 小时前`;
  return `${Math.round(s / 86400)} 天前`;
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  linked: { label: '已连接', cls: 'kpi-up' },
  expired: { label: '凭据过期', cls: 'kpi-down' },
  syncing: { label: '同步中…', cls: 'kpi-flat' },
  failed: { label: '同步失败', cls: 'kpi-down' },
  unlinked: { label: '未绑定', cls: 'kpi-flat' },
};

export default function AccountSettingsPage() {
  const { accounts, policies, crawlJobs, runPolicyNow, upsertAccount, removeAccount } = useAccountStore();
  const syncAll = useSyncAll();
  const { snap, dataSource, lastUpdatedAt, isSyncing, syncNow } = usePlatformSnapshot({ trigger: 'ui-refresh', onlyLinked: false });

  const [selected, setSelected] = useState<ChannelPlatform>('bilibili');
  const [form, setForm] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [handleInput, setHandleInput] = useState<Record<string, string>>({});
  const [displayNameInput, setDisplayNameInput] = useState<Record<string, string>>({});

  const current = accounts.find((a) => a.platform === selected);
  const adapter = getAdapter(selected);
  const meta = PLATFORM_META[selected];
  const jobs = useMemo(() => crawlJobs.filter((j) => j.platform === selected).slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 10), [crawlJobs, selected]);

  const handleSave = async () => {
    const creds = Object.fromEntries(
      adapter.credentialFields.map((f: { key: string }) => [f.key, form[f.key] ?? '']),
    ) as unknown as Record<string, string | number | undefined>;
    const firstAuth: AccountAuthMethod | undefined = adapter.authMethods[0];
    if (!firstAuth) return;
    const check = adapter.validateCredentials(creds as never);
    if (!check.ok) {
      window.alert(`凭据格式校验失败：${check.reason ?? '请填写必填字段后重试'}`);
      return;
    }
    const id = await upsertAccount(selected, {
      credentials: creds,
      authMethod: firstAuth,
      handle: handleInput[selected] ?? current?.handle ?? `@${selected}`,
      displayName: displayNameInput[selected] ?? current?.displayName ?? meta.name,
    });
    void id;
    await syncNow({ platforms: [selected], trigger: 'manual', onlyLinked: false });
  };

  const handleRemove = async () => {
    if (!current) return;
    if (!confirm(`确认解绑 ${meta.name} 账号？凭据将从本地清除。`)) return;
    removeAccount(current.id);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((s) => ({ ...s, [key]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 1200);
    });
  };

  const decrypted = current ? useMemo(() => {
    let val: Record<string, unknown> | null = null;
    useAccountStore.getState().decryptCredentials(current.id).then((d) => { val = d as Record<string, unknown> | null; });
    return val;
  }, [current.id, current.credentialsUpdatedAt]) : null;

  return (
    <div className="settings-root account-settings-root">
      <div className="account-header-row">
        <div>
          <h2 className="settings-title">
            <ShieldCheck className="title-icon" />
            平台账号绑定
          </h2>
          <p className="settings-sub">
            在本地加密存储你的平台凭据（AES-GCM + Web Crypto），调度器将通过
            Serverless 代理拉取真实账号数据。未绑定的平台会自动使用示例数据，方便你提前体验。
          </p>
        </div>
        <div className="account-actions-wrap">
          <button
            className="btn btn-secondary"
            onClick={() => syncAll.mutateAsync({ onlyLinked: true, trigger: 'manual' })}
            disabled={syncAll.isPending || isSyncing}
          >
            <RefreshCw className={`icon-sm ${isSyncing || syncAll.isPending ? 'spin' : ''}`} />
            同步全部已绑定账号
          </button>
          <a className="btn btn-primary" href={meta?.authDoc} target="_blank" rel="noreferrer">
            <LockKeyhole className="icon-sm" />
            获取凭据指引
          </a>
        </div>
      </div>

      <div className="grid-2-1">
        <section className="card">
          <div className="card-header-row">
            <h3>9 大平台连接状态</h3>
            <span className="muted">最后同步：{timeAgo(lastUpdatedAt)}</span>
          </div>
          <div className="platform-grid">
            {NINE_PLATFORMS.map((p: ChannelPlatform) => {
              const m = PLATFORM_META[p];
              const acc = accounts.find((a) => a.platform === p);
              const st = acc?.syncStatus ?? 'unlinked';
              const src = dataSource ? dataSource[p] : undefined;
              return (
                <button
                  key={p}
                  className={`platform-tile ${selected === p ? 'selected' : ''}`}
                  onClick={() => setSelected(p)}
                >
                  <div className="tile-top">
                    <span className="tile-dot" style={{ background: m.color }} />
                    <span className="tile-name">{m.name}</span>
                    <span className={`kpi-pill ${STATUS_STYLE[st].cls}`}>{STATUS_STYLE[st].label}</span>
                  </div>
                  <div className="tile-handle">{acc?.handle ?? `@${p}`}</div>
                  <div className="tile-meta-row">
                    <span className="muted">粉丝数</span>
                    <strong>{acc?.followerCount ?? 0}</strong>
                  </div>
                  <div className="tile-meta-row">
                    <span className="muted">数据源</span>
                    <strong className={src === 'edge-proxy' ? 'kpi-up' : 'kpi-flat'}>
                      {src === 'edge-proxy' ? '真实接口' : '示例数据'}
                    </strong>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-header-row">
            <h3>抓取任务队列（最近 30 条）</h3>
            <button
              className="btn btn-text"
              onClick={() => {
                for (const p of NINE_PLATFORMS) runPolicyNow(p, 'on-change');
                void syncNow({ trigger: 'manual', onlyLinked: false });
              }}
            >
              <PlayCircle className="icon-sm" /> 立即全量跑一次
            </button>
          </div>
          <div className="crawl-jobs-list">
            {crawlJobs.slice(0, 30).map((j) => (
              <div key={j.id} className="crawl-job-row">
                <div className="row-main">
                  <CircleDot className={`job-dot ${j.status}`} />
                  <div>
                    <div className="job-title">
                      <strong>{PLATFORM_META[j.platform]?.name ?? j.platform}</strong> · {j.trigger} · {j.scope.join('/')}
                    </div>
                    <div className="muted">
                      {j.status} {j.finishedAt ? `· 用时 ${j.durationMs ?? 0}ms · 记录 ${j.recordsFetched ?? 0}` : ''}
                      {j.errorMessage ? ` · 异常：${j.errorMessage}` : ''}
                    </div>
                  </div>
                </div>
                <div className="muted right">
                  <Clock className="icon-xs inline" /> {timeAgo(j.startedAt ?? j.createdAt)}
                </div>
              </div>
            ))}
            {crawlJobs.length === 0 && <div className="empty-state">暂无抓取任务，绑定账号后将自动触发</div>}
          </div>
        </section>
      </div>

      <div className="grid-2-1">
        <section className="card">
          <div className="card-header-row">
            <h3>
              绑定 <span style={{ color: meta.color }}>{meta.name}</span> 账号
            </h3>
            {current && (
              <span className={`kpi-pill ${STATUS_STYLE[current.syncStatus].cls}`}>
                {STATUS_STYLE[current.syncStatus].label}
              </span>
            )}
          </div>
          <p className="card-sub">
            <Info className="icon-xs inline" />
            <a href={meta.authDoc} target="_blank" rel="noreferrer" className="link-primary">
              {meta.adapterHint}
            </a>
          </p>

          <div className="form-grid">
            <label className="field">
              <span className="label">账号 Handle / ID（选填）</span>
              <input
                className="input"
                placeholder={meta.platform === 'bilibili' ? 'B站 UID，如 123456' : '例如 chenfengmuye'}
                value={handleInput[selected] ?? current?.handle ?? ''}
                onChange={(e) => setHandleInput((s) => ({ ...s, [selected]: e.target.value }))}
              />
            </label>
            <label className="field">
              <span className="label">展示名称（选填）</span>
              <input
                className="input"
                placeholder={`${meta.name}账号`}
                value={displayNameInput[selected] ?? current?.displayName ?? ''}
                onChange={(e) => setDisplayNameInput((s) => ({ ...s, [selected]: e.target.value }))}
              />
            </label>
          </div>

          <div className="form-grid">
            {adapter.credentialFields.map((f: { key: string; label: string; required?: boolean; isSecret?: boolean; placeholder?: string; hint?: string }) => (
              <label key={f.key} className="field">
                <span className="label">
                  {f.label}
                  {f.required && <span className="required">*</span>}
                  {f.isSecret && <LockKeyhole className="icon-xs inline secret" />}
                </span>
                <input
                  className="input"
                  type={f.isSecret ? 'password' : 'text'}
                  placeholder={f.placeholder ?? `输入${f.label}`}
                  value={form[f.key] ?? (decrypted ? String(decrypted[f.key] ?? '') : '')}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
                {f.hint && <span className="field-hint">{f.hint}</span>}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={syncAll.isPending || isSyncing}>
              <Link2 className="icon-sm" /> 保存凭据并抓取一次
            </button>
            {current && (
              <button className="btn btn-danger-ghost" onClick={handleRemove}>
                <Unlink2 className="icon-sm" /> 解绑账号
              </button>
            )}
            <span className="security-note">
              <ShieldCheck className="icon-xs inline" /> 凭据经 Web Crypto AES-GCM 加密后仅保存在当前浏览器 localStorage
            </span>
          </div>

          {snap?.warnings.filter((w) => w.platform === selected).length ? (
            <div className="warn-box">
              <AlertTriangle className="icon-xs inline" />
              <ul className="warn-list">
                {snap.warnings
                  .filter((w) => w.platform === selected)
                  .map((w, i) => (
                    <li key={i}>{w.message}</li>
                  ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="card">
          <div className="card-header-row">
            <h3>调度策略</h3>
            <span className="muted">Cron 表达式</span>
          </div>
          <div className="policy-list">
            {policies.map((p) => {
              const platformKey: ChannelPlatform | undefined =
                p.platform ?? p.platforms?.[0];
              if (!platformKey) return null;
              const platMeta = PLATFORM_META[platformKey];
              return (
                <div key={`${platformKey}-${p.name}`} className="policy-row">
                  <div className="row-main">
                    <span className="tile-dot" style={{ background: platMeta?.color ?? '#888' }} />
                    <div>
                      <div className="job-title">
                        <strong>{platMeta?.name ?? platformKey}</strong> · {p.name}
                      </div>
                      <div className="muted">
                        范围：{p.rangeDays ?? 30} 天 · 触发：{p.cron ?? p.cronExpr} · 默认执行：{p.scope.join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-text"
                    onClick={() => {
                      runPolicyNow(p.id, 'manual');
                      void syncNow({ platforms: [platformKey], trigger: 'manual', onlyLinked: false });
                    }}
                  >
                    <RefreshCw className="icon-sm" /> 立即触发
                  </button>
                </div>
              );
            })}
          </div>

          <h3 className="section-sub-title">
            <ListTodo className="icon-xs inline" /> {meta.name} · 本次抓取
          </h3>
          {jobs.length === 0 && <div className="empty-state">暂无抓取记录</div>}
          <div className="crawl-jobs-list">
            {jobs.map((j) => (
              <div key={j.id} className="crawl-job-row">
                <div className="row-main">
                  <CircleDot className={`job-dot ${j.status}`} />
                  <div>
                    <div className="job-title">
                      {j.status.toUpperCase()} · {j.trigger}
                    </div>
                    <div className="muted">
                      记录 {j.recordsFetched ?? 0}
                      {j.durationMs ? ` · 用时 ${j.durationMs}ms` : ''}
                      {j.errorMessage ? ` · 异常：${j.errorMessage}` : ''}
                    </div>
                  </div>
                </div>
                <div className="muted right">{timeAgo(j.startedAt ?? j.createdAt)}</div>
              </div>
            ))}
          </div>

          <h3 className="section-sub-title">同步调试信息</h3>
          <pre className="debug-block">
{`平台：${selected}
数据源：${dataSource?.[selected] ?? 'unknown'}
已绑账号：${current?.id ?? '—'}
凭据更新：${timeAgo(current?.credentialsUpdatedAt)}
最近同步：${timeAgo(current?.lastSyncAt)}
最后错误：${current?.lastSyncError ?? '无'}
绑定策略数量：${policies.filter((x) => x.platform === selected).length}
平台适配器：${adapter.authMethods.join('/')}`}
          </pre>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {['SESSDATA 示例=xxx，仅用于复制', 'a1=xx', 'accessToken=xx'].map((t, i) => (
              <button key={i} className="btn btn-ghost" onClick={() => copy(t, t)}>
                {copied[t] ? <Check className="icon-sm" /> : <Copy className="icon-sm" />}
                {t}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
