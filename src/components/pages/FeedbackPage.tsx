import { useMemo, useState } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  Video,
  FolderKanban,
  BookMarked,
  History,
  Search,
  Filter,
  ChevronRight,
  AtSign,
  Clock,
  User,
  ThumbsUp,
  XCircle,
  Eye,
  Send,
} from '@/components/icons';
import { useWorkbench } from '../../context/WorkbenchContext';
import type { FeedbackStatus } from '../../types';

const statusMeta: Record<FeedbackStatus, { label: string; color: string; bg: string; Icon: typeof Circle }> = {
  pending: { label: '待处理', color: '#b45309', bg: '#fef3c7', Icon: AlertTriangle },
  resolved: { label: '已解决', color: '#047857', bg: '#d1fae5', Icon: CheckCircle2 },
  ignored: { label: '已忽略', color: '#64748b', bg: '#f1f5f9', Icon: XCircle },
};

const categoryMeta: Record<string, { label: string; Icon: typeof FileText; color: string; bg: string }> = {
  脚本: { label: '脚本', Icon: Video, color: '#7c3aed', bg: '#ede9fe' },
  笔记: { label: '笔记', Icon: FileText, color: '#2563eb', bg: '#dbeafe' },
  选题: { label: '选题', Icon: FolderKanban, color: '#ea580c', bg: '#ffedd5' },
  素材: { label: '素材', Icon: BookMarked, color: '#0891b2', bg: '#cffafe' },
  文献: { label: '文献', Icon: History, color: '#047857', bg: '#d1fae5' },
};

const statusTabs: { id: FeedbackStatus | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待处理' },
  { id: 'resolved', label: '已解决' },
  { id: 'ignored', label: '已忽略' },
];

const categoryOptions: { id: string; label: string }[] = [
  { id: 'all', label: '所有类型' },
  { id: '脚本', label: '脚本批注' },
  { id: '笔记', label: '笔记批注' },
  { id: '选题', label: '选题批注' },
  { id: '素材', label: '素材批注' },
  { id: '文献', label: '文献批注' },
];

export default function FeedbackPage() {
  const {
    feedbacks,
    resolveFeedback,
    ignoreFeedback,
    markFeedbackRead,
    unreadFeedbackCount,
  } = useWorkbench();

  const [tab, setTab] = useState<FeedbackStatus | 'all'>('all');
  const [category, setCategory] = useState<string>('all');
  const [kw, setKw] = useState('');

  const allFlat = useMemo(() => {
    const arr = feedbacks.filter((f) => !f.parentId);
    const total = arr.length;
    const pendingN = arr.filter((f) => f.status === 'pending').length;
    const resolvedN = arr.filter((f) => f.status === 'resolved').length;
    const ignoredN = arr.filter((f) => f.status === 'ignored').length;
    const withReply = arr.filter((f) => f.replies && f.replies.length > 0).length;
    const mentions = arr.reduce((s, f) => s + (f.mentions ? f.mentions.length : 0), 0);
    return { list: arr, total, pendingN, resolvedN, ignoredN, withReply, mentions };
  }, [feedbacks]);

  const list = useMemo(() => {
    return allFlat.list
      .filter((f) => (tab === 'all' ? true : f.status === tab))
      .filter((f) => (category === 'all' ? true : f.noteCategory === category))
      .filter((f) => {
        if (!kw.trim()) return true;
        const q = kw.toLowerCase();
        return (
          f.content.toLowerCase().includes(q) ||
          f.noteTitle.toLowerCase().includes(q) ||
          f.author.toLowerCase().includes(q) ||
          (f.selectedSnippet && f.selectedSnippet.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.isUnread !== b.isUnread) return Number(b.isUnread) - Number(a.isUnread);
        if (a.status !== b.status) {
          const rank: Record<string, number> = { pending: 0, ignored: 1, resolved: 2 };
          return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
        }
        return 0;
      });
  }, [allFlat.list, tab, category, kw]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Section 01 · KPI & 三角关系 callout */}
      <section>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '3px 12px 3px 4px',
            borderRadius: 999,
            background: 'linear-gradient(135deg,#dbeafe,#f5f3ff)',
            border: '1px solid #c7d2fe',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <MessageCircle size={14} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#3730a3', letterSpacing: 0.2 }}>
            01 · 协作反馈概览
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { label: '批注总数', value: allFlat.total, color: '#1e40af', bg: '#dbeafe', Icon: MessageCircle },
            { label: '待处理', value: allFlat.pendingN, color: '#92400e', bg: '#fef3c7', Icon: AlertTriangle, accent: unreadFeedbackCount },
            { label: '已解决', value: allFlat.resolvedN, color: '#065f46', bg: '#d1fae5', Icon: CheckCircle2 },
            { label: '已忽略', value: allFlat.ignoredN, color: '#475569', bg: '#f1f5f9', Icon: XCircle },
            { label: '有回复', value: allFlat.withReply, color: '#7c3aed', bg: '#ede9fe', Icon: MessageCircle },
            { label: '@ 提及', value: allFlat.mentions, color: '#be185d', bg: '#fce7f3', Icon: AtSign },
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
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: -0.5,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                }}
              >
                {k.value}
                {k.accent != null && k.accent > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 999,
                      background: '#ef4444',
                      color: '#fff',
                    }}
                  >
                    {k.accent} 未读
                  </span>
                )}
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 4,
                  borderRadius: 999,
                  background: k.bg,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (k.value / Math.max(1, allFlat.total)) * 100)}%`,
                    height: '100%',
                    background: k.color,
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            gap: 12,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              padding: '13px 14px',
              borderRadius: 13,
              background: 'linear-gradient(135deg,#eff6ff,#ede9fe 60%,#faf5ff)',
              border: '1px solid #ddd6fe',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 11.5,
              lineHeight: 1.6,
              color: '#4338ca',
            }}
          >
            <AlertTriangle size={15} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#3730a3' }}>协作-隐私-同步三角：</strong>
              反馈解决多人批注讨论 → 私密控制哪些内容可见 / 可同步 → 同步负责多端一致性。
              当前私密模式<strong>已开启</strong>，敏感笔记不出现在共享空间，也不进同步队列。
            </div>
          </div>
          <div
            style={{
              padding: '13px 14px',
              borderRadius: 13,
              background: 'linear-gradient(180deg,#fffbeb,#fff 60%)',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 11.5,
              lineHeight: 1.6,
              color: '#92400e',
            }}
          >
            <Clock size={15} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#78350f' }}>交互流程：</strong>
              选中文字 → 写批注 + @成员 → 被@者角标+1 → 回复讨论 → 标记解决 / 忽略 → 角标自动递减。
            </div>
          </div>
          <div
            style={{
              padding: '13px 14px',
              borderRadius: 13,
              background: 'linear-gradient(180deg,#ecfdf5,#fff 60%)',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 11.5,
              lineHeight: 1.6,
              color: '#065f46',
            }}
          >
            <User size={15} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#064e3b' }}>团队角色：</strong>
              4 人协作 · 晨枫(Owner) · Zoey(编辑) · 方言(校对) · 表哥(后期)，
              每个批注可@具体负责人。
            </div>
          </div>
        </div>
      </section>

      {/* Section 02 · 筛选栏 + 列表 */}
      <section>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '3px 12px 3px 4px',
            borderRadius: 999,
            background: 'linear-gradient(135deg,#fef3c7,#ffedd5)',
            border: '1px solid #fed7aa',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: 'linear-gradient(135deg,#f59e0b,#ea580c)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Filter size={14} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#9a3412', letterSpacing: 0.2 }}>
            02 · 批注筛选与列表
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            padding: '12px 14px',
            borderRadius: 14,
            background: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 11,
              padding: 3,
              gap: 2,
            }}
          >
            {statusTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: tab === t.id ? 800 : 600,
                  color: tab === t.id ? '#1d4ed8' : '#475569',
                  background: tab === t.id ? '#fff' : 'transparent',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(15,23,42,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '8px 11px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#0f172a',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 11px',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid #e2e8f0',
                width: 220,
              }}
            >
              <Search size={14} color="#94a3b8" />
              <input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="搜索批注 / 笔记 / 作者…"
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  fontSize: 12,
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
            </div>
          </div>
        </div>

        {/* 行内批注 Demo 区 */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: 15,
            background: 'linear-gradient(180deg,#f8fafc 0%,#fff 60%)',
            border: '1px solid #e2e8f0',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 7,
                  background: '#ede9fe',
                  color: '#6d28d9',
                  fontSize: 10.5,
                  fontWeight: 800,
                }}
              >
                行内批注示意
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: -0.1,
                }}
              >
                AI 第二大脑视频脚本第一版 · 开头段落
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: '#64748b' }}>
              <Eye size={12} /> 脚本编辑器预览
            </div>
          </div>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: '#fff',
              border: '1px solid #e2e8f0',
              fontFamily:
                '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB",sans-serif',
              fontSize: 13.5,
              lineHeight: 1.78,
              color: '#0f172a',
              position: 'relative',
            }}
          >
            <span style={{ color: '#64748b', fontSize: 11, fontWeight: 800, marginRight: 10 }}>
              【开场 00:00-00:15】
            </span>
            “大家好，今天想跟大家分享我做第二大脑的一些思考，
            <span
              style={{
                background: 'linear-gradient(180deg,transparent 58%,#fef08a 58%)',
                borderBottom: '2px dashed #eab308',
                paddingBottom: 1,
                cursor: 'pointer',
              }}
              title="批注 fb1 · 来自 Zoey"
            >
              大概花了三个月的时间，踩了很多坑…
            </span>
            我发现很多人把工具当成了目标本身，而不是反过来…”
            <span
              title="未读批注 · 1"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginLeft: 10,
                padding: '3px 9px',
                borderRadius: 999,
                background: 'linear-gradient(135deg,#fee2e2,#fef9c3)',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 10.5,
                fontWeight: 800,
                verticalAlign: 'middle',
              }}
            >
              <MessageCircle size={11} /> 1 条未读批注
            </span>
          </div>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 14px',
              borderRadius: 11,
              background: '#fef9c3',
              borderLeft: '4px solid #eab308',
              fontSize: 11.5,
              color: '#713f12',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                background: '#EC4899',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 10.5,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              Z
            </div>
            <div style={{ flex: 1, lineHeight: 1.55 }}>
              <strong>Zoey</strong> <span style={{ color: '#854d0e', fontSize: 10.5 }}>· 批注位置 Ln 3, Col 14-54</span>
              <br />
              开篇的 hook 钩子有点弱，建议第 10-15 秒直接抛出「三个月涨粉 10 万」的数据，而不是慢慢铺垫背景。
            </div>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #eab308',
                background: '#fff',
                color: '#854d0e',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Send size={11} /> 回复
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.length === 0 && (
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
              🍃 没有符合条件的批注，换个筛选条件试试～
            </div>
          )}
          {list.map((f) => {
            const sm = statusMeta[f.status];
            const cm = categoryMeta[f.noteCategory] || categoryMeta.笔记;
            return (
              <article
                key={f.id}
                onClick={() => markFeedbackRead(f.id)}
                style={{
                  padding: '18px 20px',
                  borderRadius: 15,
                  border: `1px solid ${f.isUnread ? '#dbeafe' : '#e2e8f0'}`,
                  background: f.isUnread
                    ? 'linear-gradient(180deg,#eff6ff 0%,#ffffff 60%)'
                    : '#fff',
                  boxShadow: f.isUnread ? '0 3px 14px rgba(37,99,235,0.1)' : '0 1px 2px rgba(15,23,42,0.03)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {f.isUnread && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 18,
                      right: 20,
                      width: 9,
                      height: 9,
                      borderRadius: 999,
                      background: '#ef4444',
                      boxShadow: '0 0 0 3px #fee2e2',
                    }}
                  />
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: f.authorColor,
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 14,
                      fontWeight: 900,
                      flexShrink: 0,
                      letterSpacing: -0.5,
                      boxShadow: `0 4px 14px ${f.authorColor}33`,
                    }}
                  >
                    {f.author.slice(0, 1)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {f.author}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2.5px 9px',
                            borderRadius: 7,
                            background: sm.bg,
                            color: sm.color,
                            fontSize: 10.5,
                            fontWeight: 800,
                          }}
                        >
                          <sm.Icon size={10.5} />
                          {sm.label}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2.5px 9px',
                            borderRadius: 7,
                            background: cm.bg,
                            color: cm.color,
                            fontSize: 10.5,
                            fontWeight: 800,
                          }}
                        >
                          <cm.Icon size={10.5} />
                          {cm.label}
                        </span>
                        {f.timestampSec != null && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2.5px 9px',
                              borderRadius: 7,
                              background: '#ffedd5',
                              color: '#9a3412',
                              fontSize: 10.5,
                              fontWeight: 700,
                            }}
                          >
                            <Clock size={10.5} /> 时间戳 {Math.floor(f.timestampSec / 60)}:
                            {(f.timestampSec % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {f.createdAt}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        marginBottom: 10,
                      }}
                    >
                      <ChevronRight size={13} />
                      {f.noteTitle}
                    </div>
                    {f.selectedSnippet && (
                      <blockquote
                        style={{
                          margin: '0 0 10px',
                          padding: '9px 12px',
                          borderLeft: '3px solid #cbd5e1',
                          background: '#f8fafc',
                          borderRadius: 9,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: 11.5,
                          color: '#64748b',
                          lineHeight: 1.6,
                        }}
                      >
                        “{f.selectedSnippet}”
                        {f.selectionStart != null && (
                          <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 6 }}>
                            · 选段 {f.selectionStart}-{f.selectionEnd}
                          </span>
                        )}
                      </blockquote>
                    )}
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: '#1e293b',
                        lineHeight: 1.72,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {f.content}
                    </p>
                    {f.mentions && f.mentions.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                        {f.mentions.map((m) => (
                          <span
                            key={m}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              padding: '3px 9px',
                              borderRadius: 999,
                              background: '#fce7f3',
                              color: '#be185d',
                              fontSize: 10.5,
                              fontWeight: 800,
                            }}
                          >
                            <AtSign size={10.5} /> {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {f.replies && f.replies.length > 0 && (
                  <div
                    style={{
                      marginLeft: 54,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background:
                        'linear-gradient(180deg,#f8fafc 0%,#ffffff 60%)',
                      borderLeft: '3px solid #6366f1',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#6366f1',
                        letterSpacing: 0.2,
                        marginBottom: 2,
                      }}
                    >
                      💬 回复讨论 · {f.replies.length} 条
                    </div>
                    {f.replies.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9,
                            background: r.authorColor,
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 11,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {r.author.slice(0, 1)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>
                            {r.author}
                            <span style={{ color: '#94a3b8', marginLeft: 6, fontWeight: 500 }}>
                              {r.createdAt}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: '3px 0 0',
                              fontSize: 12,
                              color: '#334155',
                              lineHeight: 1.65,
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
                    justifyContent: 'space-between',
                    gap: 10,
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px dashed #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#64748b' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <ThumbsUp size={12} /> 点赞
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Send size={12} /> 回复批注
                    </span>
                    {f.resolvedBy && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 9px',
                          borderRadius: 7,
                          background: '#d1fae5',
                          color: '#047857',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={11} /> {f.resolvedBy} 已解决 · {f.resolvedAt}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {f.status !== 'ignored' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          ignoreFeedback(f.id);
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 10,
                          border: '1px solid #e2e8f0',
                          background: '#fff',
                          color: '#64748b',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        忽略
                      </button>
                    )}
                    {f.status !== 'resolved' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveFeedback(f.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '7px 15px',
                          borderRadius: 10,
                          border: 'none',
                          background: 'linear-gradient(135deg,#10b981,#059669)',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                        }}
                      >
                        <CheckCircle2 size={13} /> 标记已解决
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
