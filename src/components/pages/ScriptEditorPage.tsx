import { useState } from 'react';
import {
  FileText,
  ListVideo,
  Users,
  Sparkles,
  Save,
  Clock,
  BookMarked,
  AlignLeft,
  Hash,
} from '@/components/icons';
import { scripts } from '../../data/mockData';

const tabs = [
  { id: 'opening', label: '开头黄金 3 秒', num: '01', color: '#ef4444' },
  { id: 'body', label: '正文三段论', num: '02', color: '#7c3aed' },
  { id: 'closing', label: '结尾 CTA', num: '03', color: '#16a34a' },
];

export default function ScriptEditorPage() {
  const [activeId, setActiveId] = useState(scripts[0]?.id || '');
  const [activePart, setActivePart] = useState('opening');
  const current = scripts.find((s) => s.id === activeId) || scripts[0];

  const partContent =
    current && activePart === 'opening'
      ? current.opening
      : activePart === 'body'
        ? current.body
        : current?.closing || '';

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        {/* 左侧脚本列表 */}
        <div
          className="card"
          style={{
            padding: 16,
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8eaf0',
            height: 'calc(100vh - 180px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              paddingBottom: 12,
              borderBottom: '1px dashed #e8eaf0',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                脚本库 · {scripts.length} 份
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>三幕式结构 · 卡片引用</div>
            </div>
            <button
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
            >
              +
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
            {scripts.map((s) => {
              const isActive = activeId === s.id;
              const statusMap = {
                draft: { label: '草稿', color: '#94a3b8', bg: '#f1f5f9' },
                reviewing: { label: '评审中', color: '#f59e0b', bg: '#fef3c7' },
                approved: { label: '已通过', color: '#16a34a', bg: '#dcfce7' },
                published: { label: '已发布', color: '#1e40af', bg: '#eef2ff' },
              } as const;
              const st = statusMap[s.status];
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  style={{
                    padding: '12px 12px',
                    borderRadius: 10,
                    background: isActive ? '#f5f3ff' : 'transparent',
                    border: `1px solid ${isActive ? '#8b5cf6' : 'transparent'}`,
                    marginBottom: 6,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: st.bg,
                        color: st.color,
                        fontWeight: 700,
                      }}
                    >
                      {st.label}
                    </span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                      {s.updatedAt.slice(5)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isActive ? '#4f46e5' : '#0f172a',
                      marginBottom: 6,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 10.5,
                      color: '#94a3b8',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <ListVideo size={11} /> {s.duration}min
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <AlignLeft size={11} /> {s.wordCount}字
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Users size={11} /> {s.editor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧编辑区 */}
        <div className="card" style={{ padding: 0, borderRadius: 14, background: '#fff', border: '1px solid #e8eaf0', overflow: 'hidden' }}>
          {current && (
            <>
              <div
                style={{
                  padding: '16px 22px',
                  borderBottom: '1px solid #eef2f7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>
                    当前脚本 · {s_tags(current)}
                  </div>
                  <input
                    defaultValue={current.title}
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: '#0f172a',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }} />
                <button
                  style={{
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 9,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Sparkles size={13} />
                  AI 扩写
                </button>
                <button
                  style={{
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 9,
                    border: 'none',
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Save size={13} />
                  保存
                </button>
              </div>

              {/* 三幕 Tab */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1,
                  background: '#eef2f7',
                }}
              >
                {tabs.map((t) => {
                  const isActive = activePart === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActivePart(t.id)}
                      style={{
                        padding: '14px 18px',
                        background: isActive ? '#fff' : '#f8fafc',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          background: isActive ? t.color : '#e2e8f0',
                          color: isActive ? '#fff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {t.num}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? t.color : '#475569',
                            lineHeight: 1.1,
                          }}
                        >
                          {t.label}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>
                          {t.id === 'opening'
                            ? '钩子 · 冲突 · 期待感'
                            : t.id === 'body'
                              ? '3 段论据 + 金句'
                              : '总结 · CTA · 下期预告'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  padding: '22px 28px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 280px',
                  gap: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#94a3b8',
                      marginBottom: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <BookMarked size={13} />
                    正文内容（Markdown 支持）
                  </div>
                  <textarea
                    defaultValue={partContent}
                    style={{
                      width: '100%',
                      minHeight: 380,
                      padding: '16px 18px',
                      fontSize: 13.5,
                      lineHeight: 1.8,
                      color: '#0f172a',
                      background: '#fafbfd',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      outline: 'none',
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: 16,
                    background: '#f8fafc',
                    borderRadius: 12,
                    border: '1px solid #eef2f7',
                    alignSelf: 'start',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Clock size={13} />
                    脚本元信息
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { label: '预估时长', value: `${current.duration} min`, color: '#6366f1' },
                      { label: '字数', value: `${current.wordCount}`, color: '#0ea5e9' },
                      { label: '更新于', value: current.updatedAt.slice(5), color: '#16a34a' },
                      { label: '责任编辑', value: current.editor, color: '#f59e0b' },
                    ].map((m) => (
                      <div
                        key={m.label}
                        style={{
                          padding: '8px 10px',
                          background: '#fff',
                          borderRadius: 9,
                          border: '1px solid #eef2f7',
                        }}
                      >
                        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: m.color,
                          }}
                        >
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Hash size={12} />
                    标签
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {current.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: '3px 10px',
                          background: '#eef2ff',
                          color: '#1e40af',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function s_tags(s: { tags: string[] }) {
  return s.tags.slice(0, 3).map((t) => `#${t}`).join('  ');
}
