import { useState } from 'react';
import { FileText, Clock, User, Type, Timer, Edit3, BookOpen, GripVertical } from '@/components/icons';
import { scripts, contentCards } from '../../data/mockData';
import type { ScriptStatus } from '../../types';

const fmt = (n: number) => new Intl.NumberFormat('zh-CN').format(n);

const tabs: { id: ScriptStatus | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'draft', label: '草稿' },
  { id: 'reviewing', label: '审核' },
  { id: 'approved', label: '已过' },
  { id: 'published', label: '已发布' },
];

const statusBadge: Record<ScriptStatus, { label: string; bg: string; color: string }> = {
  draft: { label: '草稿', bg: '#f3f4f6', color: '#6b7280' },
  reviewing: { label: '审核中', bg: '#fef3c7', color: '#d97706' },
  approved: { label: '已通过', bg: '#dcfce7', color: '#16a34a' },
  published: { label: '已发布', bg: '#dbeafe', color: '#2563eb' },
};

export default function WritingPage() {
  const [activeTab, setActiveTab] = useState<ScriptStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState(scripts[0].id);

  const filtered = scripts.filter((s) => activeTab === 'all' || s.status === activeTab);
  const current = scripts.find((s) => s.id === selectedId) || scripts[0];

  const durMin = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>写作室</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>脚本撰写、审核与版本管理</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FileText size={16} style={{ color: '#1e40af' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>脚本列表</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '2px solid #f0f2f5' }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '8px 14px',
                  fontSize: 12.5,
                  fontWeight: activeTab === t.id ? 700 : 500,
                  color: activeTab === t.id ? '#1e40af' : '#6b7280',
                  background: activeTab === t.id ? 'rgba(30, 64, 175, 0.06)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid #1e40af' : '2px solid transparent',
                  marginBottom: -2,
                  cursor: 'pointer',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((s) => {
              const sb = statusBadge[s.status];
              const isActive = s.id === selectedId;
              return (
                <div
                  key={s.id}
                  className="card"
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: isActive ? '#eef2ff' : '#fff',
                    border: isActive ? '1.5px solid #1e40af' : '1px solid #e8eaf0',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 4px 16px rgba(30, 64, 175, 0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.5, flex: 1 }}>{s.title}</h3>
                    <span className="badge" style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: sb.bg, color: sb.color, flexShrink: 0 }}>
                      {sb.label}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#6b7280' }}>
                      <Type size={12} style={{ color: '#9ca3af' }} />
                      <span>{fmt(s.wordCount)} 字</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#6b7280' }}>
                      <Timer size={12} style={{ color: '#9ca3af' }} />
                      <span>{durMin(s.duration)} 分</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      <span>{s.updatedAt}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Edit3 size={11} />
                      <span>{s.editor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <BookOpen size={16} style={{ color: '#1e40af' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>脚本编辑器</span>
          </div>
          <div className="card" style={{ padding: 24, borderRadius: 12, background: '#fff', border: '1px solid #e8eaf0', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: '1px dashed #e8eaf0' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: '0 0 10px', lineHeight: 1.4 }}>{current.title}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12.5, color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={13} />
                    <span>编辑：{current.editor}</span>
                  </div>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Type size={13} />
                    <span>{fmt(current.wordCount)} 字</span>
                  </div>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Timer size={13} />
                    <span>时长 {durMin(current.duration)}</span>
                  </div>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} />
                    <span>更新于 {current.updatedAt}</span>
                  </div>
                </div>
              </div>
              <span className="badge" style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: statusBadge[current.status].bg, color: statusBadge[current.status].color }}>
                {statusBadge[current.status].label}
              </span>
            </div>

            {[
              { key: 'opening' as const, label: '开头', icon: '🎯', color: '#dc2626' },
              { key: 'body' as const, label: '正文', icon: '📝', color: '#1e40af' },
              { key: 'closing' as const, label: '结尾', icon: '🎬', color: '#16a34a' },
            ].map((sec) => (
              <div key={sec.key} style={{ marginBottom: sec.key === 'closing' ? 0 : 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 15 }}>{sec.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: sec.color }}>{sec.label}</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${sec.color}20, transparent)` }} />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: 10, background: '#f9fafb', fontSize: 13.5, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                  {current[sec.key]}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <GripVertical size={16} style={{ color: '#1e40af' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>引用卡片</span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>（可拖拽引用）</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {contentCards.slice(0, 5).map((c) => {
                const isCase = c.type === '案例';
                return (
                  <div
                    key={c.id}
                    className="card"
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: '#fff',
                      border: `1.5px ${isCase ? 'solid #fb923c22' : 'solid #8b5cf622'}`,
                      borderTop: `3px solid ${isCase ? '#c96420' : '#6d4aff'}`,
                      cursor: 'grab',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#1e40af', letterSpacing: 0.5 }}>{c.id.toUpperCase()}</span>
                      <span
                        className="badge"
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: 5,
                          background: isCase ? '#fff4eb' : '#f1edff',
                          color: isCase ? '#c96420' : '#6d4aff',
                        }}
                      >
                        {c.type}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', margin: '0 0 8px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.title}
                    </h4>
                    <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={10.5} />
                      <span>{c.person}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
