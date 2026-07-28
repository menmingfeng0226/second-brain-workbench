import { useMemo, useState } from 'react';
import {
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpDown,
  FolderOpen,
  FileText,
  Video,
  FolderKanban,
  History,
  ArrowLeftRight,
  UploadCloud,
  DownloadCloud,
  Database,
  Activity,
  ShieldCheck,
  ChevronRight,
  User,
  RotateCcw,
} from 'lucide-react';
import { useWorkbench } from '../../context/WorkbenchContext';
import type { SyncStatus } from '../../types';

const statusMeta: Record<SyncStatus, { label: string; color: string; bg: string; Icon: typeof Clock }> = {
  pending: { label: '待同步', color: '#92400e', bg: '#fef3c7', Icon: Clock },
  syncing: { label: '同步中', color: '#1d4ed8', bg: '#dbeafe', Icon: RefreshCw },
  synced: { label: '已同步', color: '#047857', bg: '#d1fae5', Icon: CheckCircle2 },
  failed: { label: '同步失败', color: '#b91c1c', bg: '#fee2e2', Icon: XCircle },
};

const typeMeta: Record<string, { label: string; Icon: typeof FileText; color: string; bg: string }> = {
  note: { label: '笔记', Icon: FileText, color: '#2563eb', bg: '#dbeafe' },
  video: { label: '视频脚本', Icon: Video, color: '#7c3aed', bg: '#ede9fe' },
  idea: { label: '选题', Icon: FolderKanban, color: '#ea580c', bg: '#ffedd5' },
  asset: { label: '素材', Icon: FolderOpen, color: '#0891b2', bg: '#cffafe' },
  feedback: { label: '反馈批注', Icon: Activity, color: '#be185d', bg: '#fce7f3' },
};

export default function SyncPage() {
  const {
    syncQueue,
    syncConflicts,
    syncVersions,
    syncLogs,
    pendingSyncCount,
    isPrivateMode,
    togglePrivateMode,
  } = useWorkbench();

  const [tab, setTab] = useState<'queue' | 'conflict' | 'version' | 'log'>('queue');

  const stats = useMemo(() => {
    const pendingN = syncQueue.filter((i) => i.status === 'pending').length;
    const syncingN = syncQueue.filter((i) => i.status === 'syncing').length;
    const syncedN = syncQueue.filter((i) => i.status === 'synced').length;
    const failedN = syncQueue.filter((i) => i.status === 'failed').length;
    const kb = Math.round(syncQueue.reduce((s, i) => s + i.sizeKb, 0));
    const avgSpeed = Math.round(syncQueue.filter((i) => i.status === 'synced').reduce((s, i) => s + (i.speedKbps || 0), 0) / Math.max(1, syncedN));
    return {
      total: syncQueue.length,
      pendingN,
      syncingN,
      syncedN,
      failedN,
      conflicts: syncConflicts.length,
      versions: syncVersions.length,
      logs: syncLogs.length,
      totalSizeKb: kb,
      avgSpeedKbps: avgSpeed,
    };
  }, [syncQueue, syncConflicts, syncVersions, syncLogs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 01 · 同步态势 KPI + 私密模式开关 */}
      <section>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '3px 12px 3px 4px',
            borderRadius: 999,
            background: 'linear-gradient(135deg,#dcfce7,#ecfeff)',
            border: '1px solid #a7f3d0',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: 'linear-gradient(135deg,#10b981,#06b6d4)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <RefreshCw size={14} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#065f46', letterSpacing: 0.2 }}>
            01 · 同步态势总览
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 1fr 1fr 1fr 1fr 1fr 1fr',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { label: '同步任务', value: stats.total, Icon: Database, color: '#1e40af', bg: '#dbeafe', hint: `${stats.totalSizeKb} KB 总大小` },
            { label: '待同步', value: stats.pendingN, Icon: Clock, color: '#92400e', bg: '#fef3c7', hint: `${pendingSyncCount} 队列` },
            { label: '同步中', value: stats.syncingN, Icon: RefreshCw, color: '#1d4ed8', bg: '#dbeafe', hint: `${stats.avgSpeedKbps} KB/s` },
            { label: '已同步', value: stats.syncedN, Icon: CheckCircle2, color: '#047857', bg: '#d1fae5', hint: '平均 0.8s' },
            { label: '失败', value: stats.failedN, Icon: XCircle, color: '#b91c1c', bg: '#fee2e2', hint: '需重试' },
            { label: '冲突项', value: stats.conflicts, Icon: AlertTriangle, color: '#7c2d12', bg: '#ffedd5', hint: '待解决' },
            { label: '历史版本', value: stats.versions, Icon: History, color: '#7c3aed', bg: '#ede9fe', hint: `${stats.logs} 条日志` },
          ].map((k) => (
            <div
              key={k.label}
              style={{
                padding: '14px 13px',
                borderRadius: 14,
                background: `linear-gradient(180deg,${k.bg} 0%,#ffffff 70%)`,
                border: '1px solid rgba(15,23,42,0.05)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: k.color,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <k.Icon size={12.5} />
                {k.label}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: -0.5,
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {k.value}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{k.hint}</span>
                <ChevronRight size={11} color="#94a3b8" />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1.1fr 1fr',
            gap: 12,
            marginBottom: 4,
          }}
        >
          {/* 私密模式开关卡 */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 15,
              background: isPrivateMode
                ? 'linear-gradient(135deg,#ecfdf5,#f0fdfa)'
                : 'linear-gradient(135deg,#fff7ed,#fffbeb)',
              border: isPrivateMode
                ? '1px solid #6ee7b7'
                : '1px solid #fed7aa',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: isPrivateMode
                      ? 'linear-gradient(135deg,#059669,#0d9488)'
                      : 'linear-gradient(135deg,#f59e0b,#ea580c)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a' }}>
                    私密模式
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    当前状态：
                    <span
                      style={{
                        fontWeight: 800,
                        color: isPrivateMode ? '#047857' : '#c2410c',
                      }}
                    >
                      {isPrivateMode ? '已启用 · 本地隔离' : '已关闭 · 内容将被同步'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={togglePrivateMode}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: isPrivateMode
                    ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
                    : 'linear-gradient(135deg,#16a34a,#15803d)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isPrivateMode
                    ? '0 6px 16px rgba(220,38,38,0.3)'
                    : '0 6px 16px rgba(22,163,74,0.3)',
                }}
              >
                <Lock size={13} />
                {isPrivateMode ? '关闭私密模式' : '启用私密模式'}
              </button>
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11.5,
                  color: '#334155',
                  lineHeight: 1.55,
                }}
              >
                <ShieldCheck size={13} color={isPrivateMode ? '#059669' : '#94a3b8'} />
                标记为「私密」的笔记仅本地可见，不参与云同步 / 共享空间
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11.5,
                  color: '#334155',
                  lineHeight: 1.55,
                }}
              >
                <ShieldCheck size={13} color={isPrivateMode ? '#059669' : '#94a3b8'} />
                团队批注与反馈不写入私密笔记内容体，保证批注与正文解耦
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11.5,
                  color: '#334155',
                  lineHeight: 1.55,
                }}
              >
                <ShieldCheck size={13} color={isPrivateMode ? '#059669' : '#94a3b8'} />
                关闭私密模式时支持「手动选择条目」解锁，避免误上传
              </li>
            </ul>
          </div>

          {/* 同步策略 callout */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 15,
              background: 'linear-gradient(180deg,#eff6ff,#ffffff 70%)',
              border: '1px solid #bfdbfe',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <ArrowLeftRight size={14} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#1e3a8a' }}>
                同步策略与冲突处理
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                {
                  k: '本地优先 (Local Wins)',
                  d: '以当前设备版本覆盖云端',
                  color: '#ea580c',
                },
                {
                  k: '远程覆盖 (Remote Wins)',
                  d: '下载云端最新版本替换本地',
                  color: '#1d4ed8',
                },
                {
                  k: '智能合并 (Smart Merge)',
                  d: '基于 Yjs CRDT 自动合并结构化字段',
                  color: '#047857',
                },
                {
                  k: '手动解决 (Manual)',
                  d: '并排对比后人工选择版本',
                  color: '#7c3aed',
                },
              ].map((r) => (
                <div
                  key={r.k}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0f172a' }}>
                      {r.k}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#64748b' }}>{r.d}</div>
                  </div>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: r.color,
                      boxShadow: `0 0 0 3px ${r.color}22`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 技术选型 & 联动 callout */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 15,
              background: 'linear-gradient(180deg,#fdf4ff,#ffffff 70%)',
              border: '1px solid #f5d0fe',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg,#9333ea,#ec4899)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Database size={14} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#6b21a8' }}>
                技术选型补充
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                fontSize: 11.5,
                lineHeight: 1.65,
                color: '#581c87',
              }}
            >
              <div>
                <strong>存储层：</strong>IndexedDB (Dexie) 本地 + Supabase Postgres / S3 对象存储。
              </div>
              <div>
                <strong>同步引擎：</strong>Realtime Channel + 幂等版本向量 (Vector Clock)。
              </div>
              <div>
                <strong>冲突合并：</strong>Yjs CRDT 解决编辑器并发写入；
                元数据字段采用 <code>last-write-wins</code>。
              </div>
              <div>
                <strong>端到端加密：</strong>AES-256-GCM + 用户密钥派生 (PBKDF2 / Argon2)，
                私密笔记加密后再写入队列。
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 · Tab 切换 · 队列 / 冲突 / 版本 / 日志 */}
      <section>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '3px 12px 3px 4px',
            borderRadius: 999,
            background: 'linear-gradient(135deg,#ffedd5,#fce7f3)',
            border: '1px solid #fecaca',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: 'linear-gradient(135deg,#f97316,#ec4899)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ArrowUpDown size={14} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#9a3412', letterSpacing: 0.2 }}>
            02 · 同步队列 · 冲突 · 版本 · 日志
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 4,
            gap: 3,
            marginBottom: 14,
          }}
        >
          {[
            { id: 'queue', label: '同步队列', count: stats.total, Icon: UploadCloud },
            { id: 'conflict', label: '冲突处理', count: stats.conflicts, Icon: AlertTriangle },
            { id: 'version', label: '版本历史', count: stats.versions, Icon: History },
            { id: 'log', label: '同步日志', count: stats.logs, Icon: Activity },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                padding: '9px 17px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12,
                fontWeight: tab === t.id ? 800 : 600,
                color: tab === t.id ? '#1d4ed8' : '#475569',
                background: tab === t.id ? '#fff' : 'transparent',
                boxShadow: tab === t.id ? '0 1px 4px rgba(15,23,42,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <t.Icon size={13} />
              {t.label}
              <span
                style={{
                  padding: '1.5px 8px',
                  borderRadius: 999,
                  background: tab === t.id ? '#dbeafe' : '#e2e8f0',
                  color: tab === t.id ? '#1d4ed8' : '#64748b',
                  fontSize: 10.5,
                  fontWeight: 800,
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* A · 同步队列 */}
        {tab === 'queue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {syncQueue.length === 0 && (
              <div
                style={{
                  padding: '50px 20px',
                  textAlign: 'center',
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px dashed #e2e8f0',
                  color: '#94a3b8',
                  fontSize: 12.5,
                }}
              >
                🦉 同步队列为空，所有内容均保持最新～
              </div>
            )}
            {syncQueue.map((i) => {
              const sm = statusMeta[i.status];
              const tm = typeMeta[i.type] || typeMeta.note;
              return (
                <article
                  key={i.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr auto auto auto auto auto',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderRadius: 14,
                    background:
                      i.status === 'syncing'
                        ? 'linear-gradient(180deg,#eff6ff 0%,#ffffff 60%)'
                        : '#fff',
                    border: `1px solid ${
                      i.status === 'syncing' ? '#bfdbfe' : '#e2e8f0'
                    }`,
                    boxShadow:
                      i.status === 'syncing' ? '0 3px 12px rgba(59,130,246,0.15)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: tm.bg,
                      color: tm.color,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <tm.Icon size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {i.title}
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 10.5,
                        color: '#64748b',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        {i.direction === 'upload' ? (
                          <UploadCloud size={11} color="#0891b2" />
                        ) : (
                          <DownloadCloud size={11} color="#7c3aed" />
                        )}
                        {i.direction === 'upload' ? '本地上传' : '云端拉取'}
                      </span>
                      <span>{i.sizeKb} KB</span>
                      {i.status === 'synced' && i.speedKbps && (
                        <span>⚡ {i.speedKbps} KB/s</span>
                      )}
                      <span>{i.statusUpdatedAt}</span>
                    </div>
                    {i.status === 'syncing' && i.progress != null && (
                      <div
                        style={{
                          marginTop: 9,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            borderRadius: 999,
                            background: '#e2e8f0',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${i.progress}%`,
                              height: '100%',
                              background:
                                'linear-gradient(90deg,#3b82f6,#6366f1)',
                              borderRadius: 999,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: '#1d4ed8',
                            width: 36,
                            textAlign: 'right',
                          }}
                        >
                          {i.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 9,
                      background: tm.bg,
                      color: tm.color,
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    <tm.Icon size={10.5} /> {tm.label}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 9,
                      background: sm.bg,
                      color: sm.color,
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    <sm.Icon size={10.5} className={i.status === 'syncing' ? 'spin' : ''} />
                    {sm.label}
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 9,
                      background:
                        i.isEncrypted ? '#ecfdf5' : '#f8fafc',
                      border: `1px solid ${
                        i.isEncrypted ? '#a7f3d0' : '#e2e8f0'
                      }`,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: i.isEncrypted ? '#047857' : '#64748b',
                    }}
                  >
                    <Lock size={10.5} />
                    {i.isEncrypted ? 'E2E 加密' : '未加密'}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                      fontSize: 10.5,
                      color: '#64748b',
                      minWidth: 90,
                    }}
                  >
                    <div>
                      <User size={11} style={{ display: 'inline', verticalAlign: -1 }} />
                      <span style={{ marginLeft: 3 }}>{i.author}</span>
                    </div>
                    <div>{i.device}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {i.status === 'failed' && (
                      <button
                        style={{
                          padding: '7px 13px',
                          borderRadius: 9,
                          border: '1px solid #fecaca',
                          background: '#fff',
                          color: '#b91c1c',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <RotateCcw size={11} /> 重试
                      </button>
                    )}
                    {i.status !== 'synced' && (
                      <button
                        style={{
                          padding: '7px 13px',
                          borderRadius: 9,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#475569',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        详情
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* B · 冲突处理 */}
        {tab === 'conflict' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {syncConflicts.length === 0 && (
              <div
                style={{
                  padding: '50px 20px',
                  textAlign: 'center',
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px dashed #e2e8f0',
                  color: '#94a3b8',
                  fontSize: 12.5,
                }}
              >
                ✨ 当前没有冲突，完美～
              </div>
            )}
            {syncConflicts.map((c) => (
              <article
                key={c.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: 15,
                  background: 'linear-gradient(180deg,#fff7ed 0%,#ffffff 60%)',
                  border: '1px solid #fed7aa',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                      }}
                    >
                      <AlertTriangle size={19} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#9a3412', marginTop: 2 }}>
                        ⚠ 版本冲突 · 本地版本 v{c.localVersion} vs 远端 v{c.remoteVersion}
                        · 检测时间 {c.detectedAt}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 8,
                      background: c.recommendedStrategy
                        ? '#dbeafe'
                        : '#fef3c7',
                      color: c.recommendedStrategy ? '#1d4ed8' : '#92400e',
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    推荐：
                    {c.recommendedStrategy === 'local'
                      ? '本地优先'
                      : c.recommendedStrategy === 'remote'
                      ? '远程覆盖'
                      : c.recommendedStrategy === 'smart'
                      ? '智能合并'
                      : '手动解决'}
                  </span>
                </div>

                {/* diff 展示 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 46px 1fr',
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: '#fff',
                      border: '1px solid #fdba74',
                      borderTop: '4px solid #f97316',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#c2410c',
                        marginBottom: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>💻 本地版本 v{c.localVersion} · {c.localUpdatedAt}</span>
                      <span>{c.localAuthor}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: '#1e293b',
                        fontFamily:
                          'ui-monospace,SFMono-Regular,Menlo,monospace',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.localDiff}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        background:
                          'linear-gradient(135deg,#f97316,#ec4899)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 4px 14px rgba(236,72,153,0.3)',
                      }}
                    >
                      <ArrowLeftRight size={16} />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: '#fff',
                      border: '1px solid #93c5fd',
                      borderTop: '4px solid #3b82f6',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#1d4ed8',
                        marginBottom: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>☁️ 远端版本 v{c.remoteVersion} · {c.remoteUpdatedAt}</span>
                      <span>{c.remoteAuthor}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: '#1e293b',
                        fontFamily:
                          'ui-monospace,SFMono-Regular,Menlo,monospace',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.remoteDiff}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    paddingTop: 12,
                    borderTop: '1px dashed #fed7aa',
                  }}
                >
                  <button
                    style={{
                      padding: '8px 15px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: '#64748b',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    稍后处理
                  </button>
                  <button
                    style={{
                      padding: '8px 15px',
                      borderRadius: 10,
                      border: '1px solid #fdba74',
                      background: 'linear-gradient(135deg,#fff7ed,#fef3c7)',
                      color: '#c2410c',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    💻 保留本地
                  </button>
                  <button
                    style={{
                      padding: '8px 15px',
                      borderRadius: 10,
                      border: '1px solid #93c5fd',
                      background: 'linear-gradient(135deg,#eff6ff,#e0e7ff)',
                      color: '#1d4ed8',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ☁️ 采用远端
                  </button>
                  <button
                    style={{
                      padding: '8px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg,#10b981,#059669)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                    }}
                  >
                    🧠 智能合并 (推荐)
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* C · 版本历史 */}
        {tab === 'version' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {syncVersions.map((v, idx) => (
              <div
                key={v.version}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto auto',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 16px',
                  borderRadius: idx === 0 ? '14px 14px 0 0' : 0,
                  borderTop: idx === 0 ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                  borderLeft: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: idx === syncVersions.length - 1 ? '1px solid #e2e8f0' : 'none',
                  background: v.isCurrent
                    ? 'linear-gradient(180deg,#fef9c3 0%,#ffffff 60%)'
                    : '#fff',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#1d4ed8',
                      letterSpacing: -0.3,
                    }}
                  >
                    v{v.version}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    {v.sizeKb} KB
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {v.title}
                    {v.isCurrent && (
                      <span
                        style={{
                          padding: '1.5px 8px',
                          borderRadius: 999,
                          background:
                            'linear-gradient(135deg,#eab308,#f97316)',
                          color: '#fff',
                          fontSize: 9.5,
                          fontWeight: 800,
                        }}
                      >
                        当前版本
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: '#64748b',
                      lineHeight: 1.6,
                    }}
                  >
                    {v.changeSummary}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 10.5,
                    color: '#64748b',
                  }}
                >
                  <span>
                    <User size={11} style={{ display: 'inline', verticalAlign: -1 }} />{' '}
                    {v.author}
                  </span>
                  <span>{v.device}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      padding: '4px 9px',
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: '#475569',
                    }}
                  >
                    {v.createdAt}
                  </span>
                  {!v.isCurrent && (
                    <>
                      <button
                        style={{
                          padding: '7px 12px',
                          borderRadius: 9,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#475569',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        预览
                      </button>
                      <button
                        style={{
                          padding: '7px 13px',
                          borderRadius: 9,
                          border: 'none',
                          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
                        }}
                      >
                        <RotateCcw size={11} /> 回滚到此
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* D · 同步日志 */}
        {tab === 'log' && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: '#0f172a',
              border: '1px solid #1e293b',
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
              fontSize: 11.5,
              lineHeight: 1.85,
              color: '#94a3b8',
              maxHeight: 520,
              overflowY: 'auto',
            }}
          >
            {syncLogs.map((l) => {
              const colorMap: Record<string, string> = {
                info: '#60a5fa',
                success: '#34d399',
                warn: '#fbbf24',
                error: '#f87171',
              };
              const tagMap: Record<string, string> = {
                info: 'INFO ',
                success: 'OK   ',
                warn: 'WARN ',
                error: 'ERROR',
              };
              return (
                <div key={l.id} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#475569', minWidth: 74, flexShrink: 0 }}>
                    {l.timestamp}
                  </span>
                  <span
                    style={{
                      color: colorMap[l.level],
                      fontWeight: 800,
                      minWidth: 56,
                      flexShrink: 0,
                    }}
                  >
                    [{tagMap[l.level]}]
                  </span>
                  <span style={{ color: '#a78bfa', minWidth: 64, flexShrink: 0 }}>
                    {l.module}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      color: l.level === 'error' ? '#fca5a5' : '#cbd5e1',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {l.message}
                    {l.details && (
                      <span style={{ color: '#64748b', marginLeft: 8 }}>
                        · {l.details}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
