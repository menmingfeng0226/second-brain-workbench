import { useEffect, useMemo, useState } from 'react';
import { useAccountStore } from '@/store/accountStore';
import { useSyncAll, usePlatformSnapshot } from '@/hooks/usePlatformData';
import { getAdapter } from '@/lib/platform/adapters';
import { NINE_PLATFORMS, PLATFORM_META, getDataSourceStyle } from '@/lib/platform/types';
import type { ChannelPlatform, AccountAuthMethod } from '@/types';
import type { CrawlDataSource } from '@/lib/platform/types';
import { isDemoModeEnabled, setDemoMode } from '@/lib/demo-mode';
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
} from '@/components/icons';

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
  const [demoOn, setDemoOn] = useState<boolean>(() => isDemoModeEnabled());

  const [selected, setSelected] = useState<ChannelPlatform>('bilibili');
  const [form, setForm] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [handleInput, setHandleInput] = useState<Record<string, string>>({});
  const [displayNameInput, setDisplayNameInput] = useState<Record<string, string>>({});
  // 🔧 修复：异步解密凭据绝对不能放进 useMemo（会触发 React #310 无限重渲染）
  const [decrypted, setDecrypted] = useState<Record<string, unknown> | null>(null);
  const [, setDecrypting] = useState(false);
  const [credentialVersion, setCredentialVersion] = useState(0);

  const current = accounts.find((a) => a.platform === selected);
  const adapter = getAdapter(selected);
  const meta = PLATFORM_META[selected];
  const jobs = useMemo(() => crawlJobs.filter((j) => j.platform === selected).slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 10), [crawlJobs, selected]);

  // 🔧 修复 1/3：凭据解密改为 useEffect + 状态 + race 防冲突
  useEffect(() => {
    if (!current) {
      setDecrypted(null);
      setDecrypting(false);
      return;
    }
    let alive = true;
    setDecrypting(true);
    setDecrypted(null);
    // version 强制切平台时重新跑（哪怕同一个账号 id）
    const ver = credentialVersion;
    useAccountStore
      .getState()
      .decryptCredentials(current.id)
      .then((d) => {
        if (!alive) return;
        setDecrypted((d as Record<string, unknown> | null) ?? {});
      })
      .catch((err) => {
        if (!alive) return;
        console.warn('[AccountSettings] 凭据解密失败：', err);
        setDecrypted({});
      })
      .finally(() => {
        if (!alive) return;
        setDecrypting(false);
        void ver;
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current?.credentialsUpdatedAt, selected, credentialVersion]);

  // 🔧 修复 2/3：解密结果出来后把解密出的字段回填到表单（只在用户未主动改过该字段时生效）
  useEffect(() => {
    if (!decrypted || Object.keys(decrypted).length === 0) return;
    setForm((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const f of adapter.credentialFields) {
        const k = f.key;
        if (decrypted[k] == null) continue;
        const existing = prev[k];
        if (existing && existing.length > 0) continue; // 用户已经在输入框填过，别覆盖
        const v = String(decrypted[k]);
        if (v !== existing) {
          next[k] = v;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [decrypted, adapter.credentialFields]);

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
    // 保存成功后 bump 一下 version，强制重新跑解密（解密出来的结果就是刚刚保存的真实凭据）
    setCredentialVersion((v) => v + 1);
    // ✅【核心修复】onlyLinked: true + 显式传 platforms = [当前选中平台]
    //   必须 onlyLinked=true，确保 scheduler 从 store.getDefaultAccount 拿到刚 upsert 的账号，decryptCredentials 拿到刚才存的凭据
    //   之前传 onlyLinked: false → scheduler 把 account 写死 undefined → credentials=undefined → 22ms 跑 mock 不碰真实接口
    await syncNow({ platforms: [selected], trigger: 'manual', onlyLinked: true });
  };

  const handleRemove = async () => {
    if (!current) return;
    if (!confirm(`确认解绑 ${meta.name} 账号？凭据将从本地清除。`)) return;
    removeAccount(current.id);
    // 解绑后清空当前平台的表单
    setForm((prev) => {
      const next = { ...prev };
      for (const f of adapter.credentialFields) delete next[f.key];
      return next;
    });
    setDecrypted(null);
    setCredentialVersion((v) => v + 1);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((s) => ({ ...s, [key]: true }));
      setTimeout(() => setCopied((s) => ({ ...s, [key]: false })), 1200);
    }).catch(() => {
      // clipboard 被禁用的兜底
      window.prompt('请手动复制：', text);
    });
  };

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
          <button
            className="btn btn-primary"
            onClick={() => {
              const lines = adapter.credentialFields.flatMap((f: { key: string; label: string; hint?: string }) => {
                const header = `· ${f.label.replace(/\s*\（[^)]*\）/g, '').trim()}`;
                const hint = f.hint ? f.hint.split(/(?<=[；。])/).map(s => s.trim()).filter(Boolean).map(s => `    - ${s}`) : [];
                return [header, ...hint];
              });
              const msg = `【${meta.name}】各凭据字段获取方法（Chrome/Safari 通用）\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n通用技巧：\n① 登录对应平台网页版 → F12 打开开发者工具\n② Application (Safari 叫「存储」) → Cookies → 找对应域名\n③ 复制对应字段 Value（不要复制 Name 列），粘贴到下方同名字段即可`;
              window.alert(msg);
            }}
            title={`查看 ${meta.name} 各凭据字段在浏览器里的获取方法`}
          >
            <LockKeyhole className="icon-sm" />
            获取凭据指引
          </button>
        </div>
      </div>

      {demoOn && (
        <div
          style={{
            marginBottom: 18,
            padding: '14px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%)',
            border: '1px solid #fdba74',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            boxShadow: '0 4px 18px rgba(239,68,68,0.08)',
          }}
        >
          <AlertTriangle
            className="icon-sm"
            style={{ color: '#c2410c', marginTop: 2, flexShrink: 0, width: 22, height: 22 }}
          />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#9a3412', marginBottom: 4 }}>
              ⚠️ 演示模式已启用 —— 你 9 个平台即使全「已连接」，真实数据也 **永远抓不到你的账号！**
            </div>
            <div style={{ fontSize: 12.5, color: '#7c2d12', lineHeight: 1.6 }}>
              演示模式会在前端拦截<b>所有</b> /api/platforms/* 请求（当前 localStorage workbench.demoMode=1 已命中），
              全部返回本地 mock 假数据。点下面按钮关闭演示模式，关闭后系统会自动重新抓取你绑定的真实账号数据。
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{
              background: '#dc2626',
              border: '1px solid #dc2626',
              color: '#fff',
              padding: '9px 18px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              setDemoMode(false);
              setDemoOn(false);
              void syncNow({ trigger: 'manual', onlyLinked: true });
            }}
          >
            🔓 关闭演示模式 · 立刻重抓真实账号
          </button>
        </div>
      )}

      {snap?.warnings?.length ? (
        <div
          style={{
            marginBottom: 18,
            padding: '12px 16px',
            borderRadius: 12,
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, color: '#92400e' }}>
            <Info className="icon-sm" /> 同步警告（{snap.warnings.length}）
          </div>
          {snap.warnings.slice(0, 8).map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6, paddingLeft: 26 }}>
              · <b style={{ color: '#92400e' }}>{w.platform}</b>：{w.message}
            </div>
          ))}
        </div>
      ) : null}

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
              // ✅【核心修复 3】优先级：
              //   1. snap.perPlatformProfile[p] 真实抓取的 profile（handle/followerCount/displayName）
              //   2. summary.totalFollowers 作为粉丝数兜底
              //   3. account 绑定保存的值（acc.followerCount / acc.handle）
              //   4. fallback mock（@p / 0）
              //   这样 tile 永远不会显示 892450 这种 mock 静态粉丝（除非真实后端完全没返回）
              const prof = snap?.perPlatformProfile?.[p];
              const summary = snap?.summaryByPlatform?.[p];
              const snapFollowers =
                (prof?.followerCount && prof.followerCount > 0) ? prof.followerCount
                : (summary?.totalFollowers ?? null);
              const finalFollower = (snapFollowers != null && snapFollowers > 0)
                ? snapFollowers
                : (acc?.followerCount && acc.followerCount > 0) ? acc.followerCount : 0;
              const snapHandle =
                (prof?.handle && prof.handle.length > 1) ? prof.handle
                : '';
              const finalHandle = (snapHandle && snapHandle.length > 1)
                ? snapHandle
                : (acc?.handle?.length ? acc.handle : `@${p}`);
              const isFromRealProfile = !!(prof && (prof.handle || prof.followerCount) && src && (src === 'edge-proxy' || src === 'local-cache' || src === 'platform-api'));
              // 🎯【数据源标签语义化】区分两种"不是真实数据"的场景：
              //   ① 已有账号绑定（st=linked/failed/expired/syncing）但数据是 mock → 真实抓取失败（凭据过期/接口错）→ 显示「⚠️ 真实失败·降级」
              //   ② 根本没绑定账号（st=unlinked）→ 显示「💡 示例数据·未绑定账号」
              //   这样能一眼看懂「示例数据」到底是没绑还是绑了但是假，避免误判修错方向
              const hasAccountBound = !!acc && st !== 'unlinked';
              const resolvedSrc: CrawlDataSource | 'base-mock' =
                (src === 'mock' || !src) && hasAccountBound
                  ? 'mock-fallback'   // 有账号但还是 mock → 是真失败了
                  : (src === 'mock-fallback' || src === 'mock' || !src) && !hasAccountBound
                    ? 'base-mock'     // 没绑账号 → 是静态示例
                    : (src as CrawlDataSource ?? 'base-mock');
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
                  <div
                    className="tile-handle"
                    title={isFromRealProfile ? `该 handle 来自 scheduler 真实抓取 profile.handle = ${snapHandle}` : undefined}
                  >
                    {finalHandle}
                    {isFromRealProfile && snapHandle !== acc?.handle ? (
                      <span style={{ color: isFromRealProfile ? '#047857' : '#64748b', fontSize: 10, marginLeft: 6 }}>
                        （已同步真实ID）
                      </span>
                    ) : null}
                  </div>
                  <div className="tile-meta-row">
                    <span className="muted">粉丝数</span>
                    <strong
                      title={
                        snapFollowers != null
                          ? (isFromRealProfile ? `来源：scheduler 真实抓取 profile.followerCount = ${snapFollowers}` : `来源：summary.totalFollowers = ${snapFollowers}`)
                          : `来源：accountStore 绑定值 = ${acc?.followerCount ?? 0}`
                      }
                    >
                      {typeof finalFollower === 'number' ? finalFollower.toLocaleString('zh-CN') : finalFollower}
                      {snapFollowers != null && acc?.followerCount && snapFollowers !== (acc.followerCount ?? 0) ? (
                        <span
                          style={{
                            color: isFromRealProfile ? '#059669' : '#d97706',
                            fontSize: 10,
                            marginLeft: 4,
                            fontWeight: 600,
                          }}
                        >
                          {isFromRealProfile ? '真实✓' : '同步'}
                        </span>
                      ) : null}
                    </strong>
                  </div>
                  {(() => {
                    const s = getDataSourceStyle(resolvedSrc);
                    const tooltips: Record<string, string> = {
                      real: '✅ 该平台真实抓取成功，粉丝/播放量与平台后台一致',
                      warn: '⚠️ 已绑定账号但抓取失败（凭据过期？Cookie 拿错？），已自动降级显示示例数据。请解绑后重新填正确凭据再抓。',
                      demo: '🚨 演示模式已开启，永远拦截真实请求！点上方红色「关闭演示模式」按钮。',
                      mock: '💡 未绑定账号，仅展示示例假数据预览 UI。点击下方「绑定哔哩哔哩账号」表单填凭据。',
                    };
                    const tip = s.label.includes('示例') && !hasAccountBound ? tooltips.mock
                      : s.tier === 'warn' ? tooltips.warn
                      : s.tier === 'demo' ? tooltips.demo
                      : s.real ? tooltips.real
                      : `数据源：${s.label}`;
                    return (
                      <div
                        className="tile-meta-row"
                        title={tip}
                      >
                        <span className="muted">数据源</span>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: s.bg,
                            color: s.color,
                            fontSize: 11,
                            fontWeight: 700,
                            border: s.border,
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })()}
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
          <p className="card-sub" style={{ cursor: 'help' }} title="点击右上角「获取凭据指引」按钮，弹出每个字段详细获取方法（含步骤说明）">
            <Info className="icon-xs inline" />
            <span
              className="link-primary"
              style={{
                textDecorationLine: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: 3,
              }}
            >
              {meta.adapterHint}
            </span>
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
