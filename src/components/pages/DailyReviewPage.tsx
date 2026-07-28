import { useMemo, useState } from 'react';
import {
  RotateCcw,
  Shuffle,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Lightbulb,
  BrainCircuit,
  CalendarCheck2,
  TrendingUp,
  BarChart3,
  Users,
  Hash,
  Quote,
  Star,
  User,
  Video,
  FileText,
  Target,
  PenLine,
} from 'lucide-react';
import { contentCards, channels, tasks, topics, ideas } from '../../data/mockData';
import type { ChannelPlatform, TaskPriority } from '../../types';

const cardTypeColor: Record<string, string> = {
  案例: '#6366f1',
  洞察: '#10b981',
};

export default function DailyReviewPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');
  const [idx, setIdx] = useState(0);
  const [seed, setSeed] = useState(0);

  const todayPool = useMemo(() => {
    // 基于 seed 伪随机抽取 12 张卡片
    const shuffled = [...contentCards].sort((a, b) => {
      const ha = (a.id.charCodeAt(1) + seed * 7) % 31;
      const hb = (b.id.charCodeAt(1) + seed * 7) % 31;
      return ha - hb;
    });
    return shuffled.slice(0, 12);
  }, [seed, contentCards]);

  const current = todayPool[idx % todayPool.length];

  const todayStats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const p0 = tasks.filter((t) => t.priority === 'P0' as TaskPriority && t.status !== 'done').length;
    const scripting = topics.filter((t) => t.status === 'scripting' || t.status === 'filming').length;
    const inReview = ideas.filter((i) => i.status === 'research' || i.status === 'approved').length;
    return { done, todo, p0, scripting, inReview, cardsSeen: idx + 1 };
  }, [tasks, topics, ideas, idx]);

  const persons = useMemo(() => {
    const map: Record<string, number> = {};
    todayPool.forEach((c) => {
      map[c.person] = (map[c.person] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [todayPool]);

  const scenes = useMemo(() => {
    const map: Record<string, number> = {};
    todayPool.forEach((c) => {
      map[c.scene] = (map[c.scene] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [todayPool]);

  const topicsStat = useMemo(() => {
    const map: Record<string, number> = {};
    todayPool.forEach((c) => (c.topics || []).forEach((t) => (map[t] = (map[t] || 0) + 1)));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [todayPool]);

  const shuffle = () => {
    setSeed(Math.floor(Math.random() * 100));
    setIdx(0);
  };

  const typeLabelBg = (type: string) =>
    type === '案例' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#10b981,#14b8a6)';

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 顶部媒体渠道分类（用于筛选"已关联渠道"的回顾） */}
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#10b981,#0ea5e9)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCcw size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            按媒体渠道筛选（9 大渠道 · 回顾渠道相关灵感卡片）
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            今日回顾池 · {todayPool.length} 张卡片
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {([
            { id: 'all' as const, name: '全部渠道', color: '#475569' },
            ...channels.map((c) => ({ id: c.id, name: c.name, color: c.color })),
          ]).map((p) => {
            const isActive = activeChannel === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveChannel(p.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 999,
                  border: isActive ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                  background: isActive ? `${p.color}12` : '#fff',
                  color: isActive ? p.color : '#475569',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* 左：卡片轮播 + 进度 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 今日进度条 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <CalendarCheck2 size={15} style={{ color: '#10b981' }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>今日回顾进度</span>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                {todayStats.cardsSeen} / {todayPool.length} ·{' '}
                {Math.round((todayStats.cardsSeen / todayPool.length) * 100)}%
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {todayPool.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    background: i <= idx ? 'linear-gradient(90deg,#10b981,#0ea5e9)' : '#e2e8f0',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* 主卡片 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              border: '1px solid #e8eaf0',
              padding: 22,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg,#6366f1,#ec4899,#f59e0b,#10b981)',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 8,
                  background: typeLabelBg(current.type),
                  color: '#fff',
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                <Quote size={11} />
                {current.type}卡片
              </div>
              {current.isHighValue && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg,#fde047,#f59e0b)',
                    color: '#78350f',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <Star size={11} fill="currentColor" />
                  高价值
                </div>
              )}
              {current.isPendingReview && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 8,
                    background: '#fef2f2',
                    color: '#ef4444',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <PenLine size={11} />
                  待整理
                </div>
              )}
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                <Clock size={12} />
                <span style={{ fontSize: 11, fontWeight: 500 }}>
                  #{idx + 1} / {todayPool.length}
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.45,
                marginBottom: 14,
                letterSpacing: '-0.01em',
              }}
            >
              {current.title}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                  color: '#4338ca',
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                <User size={11} />
                {current.person}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                  color: '#166534',
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                <Video size={11} />
                {current.scene}
              </div>
              {(current.topics || []).slice(0, 3).map((t) => (
                <div
                  key={t}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 10,
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: 11.5,
                    fontWeight: 500,
                  }}
                >
                  <Hash size={10} />
                  {t}
                </div>
              ))}
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background:
                  current.type === '案例'
                    ? 'linear-gradient(135deg,#eef2ff 0%,#f5f3ff 100%)'
                    : 'linear-gradient(135deg,#ecfdf5 0%,#f0fdfa 100%)',
                borderLeft: `4px solid ${cardTypeColor[current.type] || '#64748B'}`,
                marginBottom: 18,
                fontSize: 13.5,
                lineHeight: 1.85,
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
              }}
            >
              {current.content}
            </div>

            {/* 灵感触发区 */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
                border: '1px solid #fde68a',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Lightbulb size={13} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#92400e' }}>
                  💡 灵感触发：这张卡片可以用在？
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['做视频案例片段', '写金句海报文案', '脚本开场引入', '粉丝群互动话题', '文章论据素材'].map(
                  (x, i) => (
                    <div
                      key={x}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        background: i === 0 ? '#f59e0b' : '#fff',
                        color: i === 0 ? '#fff' : '#92400e',
                        border: i === 0 ? 'none' : '1px solid #fde68a',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {x}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                  opacity: idx === 0 ? 0.4 : 1,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={shuffle}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Shuffle size={14} />
                换一批卡片
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: '#fff',
                  color: '#f59e0b',
                  border: '1px solid #fde68a',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <BookmarkPlus size={14} />
                收藏到灵感库
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setIdx((i) => Math.min(todayPool.length - 1, i + 1))}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg,#10b981,#0ea5e9)',
                  color: '#fff',
                  border: 'none',
                  cursor: idx >= todayPool.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: idx >= todayPool.length - 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                下一张
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* 下方缩略卡片带 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BrainCircuit size={14} style={{ color: '#8b5cf6' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>
                今日回顾池 · {todayPool.length} 张
              </span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>间隔重复 · 激活长期记忆</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {todayPool.map((c, i) => {
                const active = i === idx;
                return (
                  <div
                    key={c.id}
                    onClick={() => setIdx(i)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: active ? `${cardTypeColor[c.type]}12` : '#f8fafc',
                      border: active ? `2px solid ${cardTypeColor[c.type]}` : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '1px 7px',
                        borderRadius: 5,
                        background: cardTypeColor[c.type],
                        color: '#fff',
                        fontSize: 9.5,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {c.type}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#0f172a',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {c.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右：统计 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 今日任务总览 */}
          <div
            style={{
              background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)',
              borderRadius: 16,
              padding: 18,
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={16} />
              <span style={{ fontWeight: 700, fontSize: 13 }}>2026-07-24 · 周四工作台</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { icon: Target, label: 'P0 紧急', value: String(todayStats.p0), sub: '立即处理' },
                { icon: BarChart3, label: '脚本/拍摄中', value: String(todayStats.scripting), sub: '本周要上线' },
                { icon: CheckMark, label: '已完成任务', value: String(todayStats.done), sub: '今日完成' },
                { icon: TrendingUp, label: '已看卡片', value: String(todayStats.cardsSeen), sub: `/ ${todayPool.length}` },
              ].map((k) => (
                <div
                  key={k.label}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <k.icon size={12} style={{ opacity: 0.85 }} />
                    <span style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 500 }}>{k.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{k.value}</div>
                  <div style={{ fontSize: 10, opacity: 0.75 }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 人物分布 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Users size={14} style={{ color: '#6366f1' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>本批人物分布</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {persons.map(([name, cnt], i) => {
                const max = persons[0][1];
                const color = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'][i];
                return (
                  <div key={name}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 11, color: color, fontWeight: 700 }}>{cnt} 张</span>
                    </div>
                    <div style={{ height: 7, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(cnt / max) * 100}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 场景分布 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FileText size={14} style={{ color: '#10b981' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>场景来源 Top</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {scenes.map(([name, cnt], i) => {
                const bg = ['#eef2ff', '#ecfdf5', '#fffbeb', '#fdf2f8', '#e0f2fe', '#fef3c7'][i % 6];
                const c = ['#4338ca', '#166534', '#92400e', '#9d174d', '#0369a1', '#92400e'][i % 6];
                return (
                  <div
                    key={name}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 10,
                      background: bg,
                      color: c,
                      fontSize: 11.5,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {name}
                    <span
                      style={{
                        padding: '1px 7px',
                        borderRadius: 999,
                        background: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {cnt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 话题标签 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Hash size={14} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>高频话题标签</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {topicsStat.map(([name, cnt], i) => {
                const sz = 11 + Math.min(4, cnt);
                const color = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6'][i];
                return (
                  <div
                    key={name}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 999,
                      background: `${color}12`,
                      color: color,
                      fontSize: sz,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    #{name}
                    <span
                      style={{
                        padding: '0 6px',
                        borderRadius: 999,
                        background: '#fff',
                        fontSize: 10,
                      }}
                    >
                      {cnt}
                    </span>
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

function CheckMark(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      style={props.style}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
