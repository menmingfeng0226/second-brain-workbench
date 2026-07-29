import { useMemo } from 'react';
import {
  ExternalLink,
  MessageCircle,
  Lock,
  RefreshCw,
  X,
  CheckCircle2,
  Circle,
  AlertTriangle,
  SkipForward,
  FileText,
  Video,
  FolderKanban,
  BookMarked,
  History,
  Timer,
} from '@/components/icons';
import { useWorkbench } from '../context/WorkbenchContext';
import type { FeedbackStatus, SyncQueueStatus } from '../types';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
  pageBadge?: string;
}

const statusMeta: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '待处理', color: '#b45309', bg: '#fef3c7' },
  resolved: { label: '已解决', color: '#047857', bg: '#d1fae5' },
  ignored: { label: '已忽略', color: '#64748b', bg: '#f1f5f9' },
};

const queueStatusMeta: Record<SyncQueueStatus, { label: string; color: string; bg: string; Icon: typeof Circle }> = {
  pending: { label: '等待同步', color: '#6366f1', bg: '#eef2ff', Icon: Timer },
  syncing: { label: '同步中', color: '#0ea5e9', bg: '#e0f2fe', Icon: RefreshCw },
  synced: { label: '已同步', color: '#10b981', bg: '#d1fae5', Icon: CheckCircle2 },
  done: { label: '已同步', color: '#10b981', bg: '#d1fae5', Icon: CheckCircle2 },
  failed: { label: '失败', color: '#dc2626', bg: '#fee2e2', Icon: AlertTriangle },
  conflict: { label: '冲突', color: '#ea580c', bg: '#ffedd5', Icon: AlertTriangle },
  skipped_private: { label: '私密跳过', color: '#64748b', bg: '#f1f5f9', Icon: SkipForward },
};

const categoryIcon: Record<string, typeof FileText> = {
  脚本: Video,
  笔记: FileText,
  选题: FolderKanban,
  素材: BookMarked,
  文献: History,
};

export default function Header({ pageTitle, pageSubtitle, pageBadge }: HeaderProps) {
  const {
    closeTopbarDrawer,
    topbarDrawer,
    feedbacks,
    syncQueue,
    syncConflicts,
    resolveFeedback,
    ignoreFeedback,
    markFeedbackRead,
    navigate,
    unreadFeedbackCount,
    isPrivateMode,
    togglePrivateMode,
  } = useWorkbench();

  const pendingFeedbacks = useMemo(
    () =>
      feedbacks
        .filter((f) => !f.parentId && f.status === 'pending')
        .sort((a, b) => Number(b.isUnread) - Number(a.isUnread)),
    [feedbacks],
  );

  const queueActive = useMemo(
    () =>
      syncQueue.filter(
        (s: any) => s.status !== 'done' && s.status !== 'synced',
      ),
    [syncQueue],
  );

  const categoryChip = (c: string) => {
    const Icon = categoryIcon[c] || FileText;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 6,
          background: '#f1f5f9',
          color: '#475569',
          fontSize: 10.5,
          fontWeight: 600,
        }}
      >
        <Icon size={10.5} />
        {c}
      </span>
    );
  };

  return (
    <>
      <header className="top-header">
        <div className="header-left" style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h1 className="header-title">
              {pageTitle}
              {pageBadge && <span className="header-badge">{pageBadge}</span>}
            </h1>
            {pageSubtitle && (
              <p className="header-subtitle">
                {pageSubtitle}
                {pageTitle === '第二大脑' && (
                  <>
                    清洗源头统一登记在
                    <span className="header-link">知识库整理（5 个源）</span>
                    —— 复核 / 编辑去
                    <span className="header-link">飞书七点半</span>
                    <ExternalLink size={12} className="header-link-icon" />
                    ，网页是只读镜像
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </header>

      {topbarDrawer && (
        <>
          <div
            onClick={closeTopbarDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15,23,42,0.32)',
              backdropFilter: 'blur(2px)',
              zIndex: 9998,
              animation: 'fadeIn 0.18s ease',
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(520px, 92vw)',
              background: '#fff',
              borderLeft: '1px solid #e2e8f0',
              boxShadow: '-16px 0 48px rgba(15,23,42,0.12)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.24s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background:
                  topbarDrawer === 'feedback'
                    ? 'linear-gradient(135deg,#eff6ff 0%,#ffffff 60%)'
                    : 'linear-gradient(135deg,#ecfeff 0%,#ffffff 60%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background:
                      topbarDrawer === 'feedback'
                        ? 'linear-gradient(135deg,#3b82f6,#2563eb)'
                        : 'linear-gradient(135deg,#06b6d4,#0891b2)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow:
                      topbarDrawer === 'feedback'
                        ? '0 4px 14px rgba(59,130,246,0.35)'
                        : '0 4px 14px rgba(6,182,212,0.35)',
                  }}
                >
                  {topbarDrawer === 'feedback' ? <MessageCircle size={19} /> : <RefreshCw size={19} />}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: -0.2 }}>
                    {topbarDrawer === 'feedback' ? '协作反馈中心' : '云同步控制台'}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    {topbarDrawer === 'feedback'
                      ? `共 ${feedbacks.length} 条批注 · ${unreadFeedbackCount} 条未读待处理`
                      : `队列 ${queueActive.length} 条待处理 · 冲突 ${syncConflicts.length} · 私密跳过 ${syncQueue.filter((s) => s.isPrivate).length}`}
                  </div>
                </div>
              </div>
              <button
                onClick={closeTopbarDrawer}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 18px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {topbarDrawer === 'feedback' ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 8,
                    }}
                  >
                    {(['pending', 'resolved', 'ignored'] as FeedbackStatus[]).map((st) => {
                      const n = feedbacks.filter((f) => !f.parentId && f.status === st).length;
                      const m = statusMeta[st];
                      return (
                        <div
                          key={st}
                          style={{
                            padding: '10px 11px',
                            borderRadius: 11,
                            background: m.bg,
                            border: '1px solid rgba(15,23,42,0.04)',
                          }}
                        >
                          <div style={{ fontSize: 10.5, color: m.color, fontWeight: 700 }}>{m.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                            {n}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 11,
                      background:
                        'linear-gradient(135deg,rgba(219,234,254,0.4),rgba(254,215,170,0.3))',
                      border: '1px solid rgba(251,191,36,0.3)',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      fontSize: 11.5,
                      color: '#78350f',
                      lineHeight: 1.55,
                    }}
                  >
                    <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <strong>协作流程：</strong>选中笔记文字 → 批注 + @ 成员 → 被@者收到
                      角标提醒 → 回复 / 解决 / 忽略 → 角标计数自动递减。
                    </div>
                  </div>

                  {pendingFeedbacks.length === 0 && (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: 12.5,
                      }}
                    >
                      🎉 没有待处理的协作反馈，一切都井井有条！
                    </div>
                  )}

                  {pendingFeedbacks.map((f) => (
                    <article
                      key={f.id}
                      onClick={() => markFeedbackRead(f.id)}
                      style={{
                        padding: 14,
                        borderRadius: 13,
                        border: `1px solid ${f.isUnread ? '#dbeafe' : '#e2e8f0'}`,
                        background: f.isUnread
                          ? 'linear-gradient(180deg,#eff6ff 0%,#ffffff 60%)'
                          : '#fff',
                        boxShadow: f.isUnread ? '0 2px 10px rgba(37,99,235,0.08)' : 'none',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {f.isUnread && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: '#ef4444',
                            boxShadow: '0 0 0 3px #fee2e2',
                          }}
                        />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            background: f.authorColor,
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 11.5,
                            fontWeight: 800,
                            letterSpacing: -0.5,
                          }}
                        >
                          {f.author.slice(0, 1)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                            {f.author}
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                padding: '1.5px 7px',
                                borderRadius: 5,
                                background: statusMeta[f.status].bg,
                                color: statusMeta[f.status].color,
                                fontWeight: 700,
                              }}
                            >
                              {statusMeta[f.status].label}
                            </span>
                          </div>
                          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{f.createdAt}</div>
                        </div>
                        {categoryChip(f.noteCategory)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#1e40af',
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <FileText size={12} />
                        {f.noteTitle}
                      </div>
                      {f.selectedSnippet && (
                        <blockquote
                          style={{
                            margin: '0 0 9px',
                            padding: '7px 10px',
                            borderLeft: '3px solid #cbd5e1',
                            background: '#f8fafc',
                            borderRadius: 8,
                            fontSize: 11,
                            color: '#64748b',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            lineHeight: 1.55,
                          }}
                        >
                          “{f.selectedSnippet}”
                          {f.selectionStart != null && (
                            <span style={{ color: '#94a3b8', fontSize: 10 }}>
                              {'  '}· 选段 {f.selectionStart}-{f.selectionEnd}
                            </span>
                          )}
                        </blockquote>
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          color: '#334155',
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {f.content}
                      </p>
                      {f.replies && f.replies.length > 0 && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: '#f8fafc',
                            borderLeft: '3px solid #6366f1',
                          }}
                        >
                          {f.replies.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 7,
                                  background: r.authorColor,
                                  color: '#fff',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {r.author.slice(0, 1)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>
                                  {r.author}
                                  <span style={{ marginLeft: 6, color: '#94a3b8', fontWeight: 500 }}>
                                    {r.createdAt}
                                  </span>
                                </div>
                                <p
                                  style={{
                                    margin: '3px 0 0',
                                    fontSize: 11.5,
                                    color: '#475569',
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {r.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 8,
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: '1px dashed #e2e8f0',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            ignoreFeedback(f.id);
                          }}
                          style={{
                            padding: '7px 13px',
                            borderRadius: 9,
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: '#64748b',
                            cursor: 'pointer',
                          }}
                        >
                          忽略
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveFeedback(f.id);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '7px 14px',
                            borderRadius: 9,
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: '#fff',
                            border: 'none',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(16,185,129,0.35)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          标记已解决
                        </button>
                      </div>
                    </article>
                  ))}

                  <button
                    onClick={() => {
                      closeTopbarDrawer();
                      navigate('feedback');
                    }}
                    style={{
                      marginTop: 'auto',
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: '1px solid #dbeafe',
                      background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                      color: '#1d4ed8',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    进入完整的反馈与批注模块 <span>→</span>
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        k: 'pending',
                        label: '队列中',
                        Icon: Timer,
                        c: '#6366f1',
                        bg: '#eef2ff',
                        n: syncQueue.filter((s) => s.status === 'pending').length,
                      },
                      {
                        k: 'syncing',
                        label: '进行中',
                        Icon: RefreshCw,
                        c: '#0ea5e9',
                        bg: '#e0f2fe',
                        n: syncQueue.filter((s) => s.status === 'syncing').length,
                      },
                      {
                        k: 'conflict',
                        label: '冲突',
                        Icon: AlertTriangle,
                        c: '#ea580c',
                        bg: '#ffedd5',
                        n: syncConflicts.length,
                      },
                      {
                        k: 'done',
                        label: '已完成',
                        Icon: CheckCircle2,
                        c: '#10b981',
                        bg: '#d1fae5',
                        n: syncQueue.filter((s: any) => s.status === 'done' || s.status === 'synced').length,
                      },
                    ].map((it) => (
                      <div
                        key={it.k}
                        style={{
                          padding: '10px 11px',
                          borderRadius: 11,
                          background: it.bg,
                          border: '1px solid rgba(15,23,42,0.04)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10.5,
                            color: it.c,
                            fontWeight: 700,
                          }}
                        >
                          <it.Icon size={11} />
                          {it.label}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#0f172a',
                            marginTop: 3,
                          }}
                        >
                          {it.n}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 11,
                      background: isPrivateMode
                        ? 'linear-gradient(135deg,rgba(238,242,255,0.6),rgba(254,226,226,0.25))'
                        : 'linear-gradient(135deg,rgba(254,243,199,0.5),rgba(255,237,213,0.4))',
                      border: `1px solid ${isPrivateMode ? '#c7d2fe' : '#fed7aa'}`,
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      fontSize: 11.5,
                      color: isPrivateMode ? '#3730a3' : '#92400e',
                      lineHeight: 1.55,
                    }}
                  >
                    <Lock size={14} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      {isPrivateMode ? (
                        <>
                          <strong>私密模式已开启：</strong>
                          被标记为私密的笔记不会进入同步队列，也不会出现在团队共享空间。
                        </>
                      ) : (
                        <>
                          <strong>私密模式已关闭：</strong>
                          所有内容均可同步，建议在处理合同 / 敏感数据时重新开启。
                        </>
                      )}
                    </div>
                    <button
                      onClick={togglePrivateMode}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 7,
                        background: isPrivateMode ? '#4f46e5' : '#f59e0b',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {isPrivateMode ? '关闭' : '开启'}
                    </button>
                  </div>

                  {syncConflicts.length > 0 && (
                    <section>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: '#ea580c',
                          margin: '2px 4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <AlertTriangle size={13} /> 需要人工解决的冲突 · {syncConflicts.length}
                      </div>
                      {syncConflicts.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: 13,
                            borderRadius: 12,
                            border: '1px solid #fed7aa',
                            background: 'linear-gradient(180deg,#fff7ed,#ffffff 60%)',
                          }}
                        >
                          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#7c2d12', marginBottom: 6 }}>
                            {c.noteTitle}
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 8,
                              fontSize: 10.5,
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                padding: '8px 9px',
                                borderRadius: 8,
                                background: '#eff6ff',
                                color: '#1e40af',
                                lineHeight: 1.5,
                              }}
                            >
                              <div style={{ fontWeight: 800 }}>🖥️ 本机 iMac · {c.localAuthor}</div>
                              <div>v{c.localVersion} · {c.localModifiedAt}</div>
                            </div>
                            <div
                              style={{
                                padding: '8px 9px',
                                borderRadius: 8,
                                background: '#fef3c7',
                                color: '#92400e',
                                lineHeight: 1.5,
                              }}
                            >
                              <div style={{ fontWeight: 800 }}>💻 远程 · {c.remoteAuthor}</div>
                              <div>v{c.remoteVersion} · {c.remoteModifiedAt}</div>
                            </div>
                          </div>
                          <pre
                            style={{
                              margin: 0,
                              padding: '8px 10px',
                              background: '#fffbeb',
                              border: '1px dashed #fcd34d',
                              borderRadius: 8,
                              fontSize: 10.5,
                              color: '#78350f',
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.55,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}
                          >
                            {c.diffPreview}
                          </pre>
                          <div
                            style={{
                              display: 'flex',
                              gap: 6,
                              marginTop: 10,
                            }}
                          >
                            <button
                              style={{
                                flex: 1,
                                padding: '7px 10px',
                                borderRadius: 8,
                                fontSize: 10.5,
                                fontWeight: 700,
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                cursor: 'pointer',
                              }}
                            >
                              保留本地
                            </button>
                            <button
                              style={{
                                flex: 1,
                                padding: '7px 10px',
                                borderRadius: 8,
                                fontSize: 10.5,
                                fontWeight: 700,
                                border: '1px solid #fde68a',
                                background: '#fef3c7',
                                color: '#92400e',
                                cursor: 'pointer',
                              }}
                            >
                              用远程覆盖
                            </button>
                            <button
                              style={{
                                flex: 1,
                                padding: '7px 10px',
                                borderRadius: 8,
                                fontSize: 10.5,
                                fontWeight: 700,
                                border: 'none',
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                color: '#fff',
                                cursor: 'pointer',
                              }}
                            >
                              智能合并
                            </button>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  <section>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: '2px 4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <RefreshCw size={13} /> 同步队列 · {queueActive.length} 条待处理
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {queueActive.map((q) => {
                        const isConflict = syncConflicts.some((sc) => sc.noteId === q.noteId);
                        const meta = queueStatusMeta[q.status];
                        const Icon = meta.Icon;
                        return (
                          <div
                            key={q.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 11,
                              border: `1px solid ${isConflict || q.status === 'failed' ? meta.bg : '#e2e8f0'}`,
                              background: q.status === 'syncing' ? 'linear-gradient(90deg,#e0f2fe,#ffffff)' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 9,
                                background: meta.bg,
                                color: meta.color,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon
                                size={15}
                                className={q.status === 'syncing' ? 'spin' : ''}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  color: '#0f172a',
                                }}
                              >
                                {q.isPrivate && <Lock size={11} color="#64748b" />}
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {q.noteTitle}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  marginTop: 2,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 7px',
                                    borderRadius: 5,
                                    background: meta.bg,
                                    color: meta.color,
                                    fontWeight: 700,
                                  }}
                                >
                                  {meta.label}
                                </span>
                                {categoryChip(q.noteCategory)}
                                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                  {q.action === 'create' ? '新建' : q.action === 'update' ? '修改' : '删除'} ·{' '}
                                  {q.sizeKb >= 1000
                                    ? `${(q.sizeKb / 1024).toFixed(1)} MB`
                                    : `${q.sizeKb.toFixed(0)} KB`}
                                </span>
                                {q.retryCount > 0 && (
                                  <span style={{ fontSize: 10, color: '#dc2626' }}>
                                    重试 {q.retryCount} 次
                                  </span>
                                )}
                              </div>
                              {q.error && (
                                <div
                                  style={{
                                    marginTop: 4,
                                    fontSize: 10.5,
                                    color:
                                      q.isPrivate ? '#64748b' : '#b91c1c',
                                    background:
                                      q.isPrivate ? '#f8fafc' : '#fef2f2',
                                    padding: '5px 8px',
                                    borderRadius: 6,
                                    lineHeight: 1.5,
                                  }}
                                >
                                  ⚠ {q.error}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <button
                    onClick={() => {
                      closeTopbarDrawer();
                      navigate('sync');
                    }}
                    style={{
                      marginTop: 'auto',
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: '1px solid #cffafe',
                      background: 'linear-gradient(135deg,#ecfeff,#cffafe)',
                      color: '#155e75',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    进入完整的云同步控制台（版本历史 + 日志） <span>→</span>
                  </button>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
