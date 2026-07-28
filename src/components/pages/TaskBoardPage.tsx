import { useMemo, useState } from 'react';
import {
  Kanban,
  ListTodo,
  Loader2,
  AlertOctagon,
  Eye,
  CheckCircle2,
  Flag,
  User,
  CalendarDays,
  GripVertical,
  Plus,
  ChevronRight,
  Link as LinkIcon,
  Zap,
} from 'lucide-react';
import { tasks, channels } from '../../data/mockData';
import type { TaskItem, TaskStatus, TaskPriority, ChannelPlatform } from '../../types';

const statusMeta: Record<TaskStatus, { label: string; color: string; bg: string; icon: any }> = {
  todo: { label: '待办', color: '#64748B', bg: '#f8fafc', icon: ListTodo },
  doing: { label: '进行中', color: '#6366f1', bg: '#eef2ff', icon: Loader2 },
  stuck: { label: '阻塞', color: '#ef4444', bg: '#fef2f2', icon: AlertOctagon },
  review: { label: '评审中', color: '#f59e0b', bg: '#fffbeb', icon: Eye },
  done: { label: '已完成', color: '#10b981', bg: '#dcfce7', icon: CheckCircle2 },
};

const priorityMeta: Record<TaskPriority, { color: string; bg: string; label: string }> = {
  P0: { color: '#ef4444', bg: '#fef2f2', label: 'P0 紧急' },
  P1: { color: '#f59e0b', bg: '#fffbeb', label: 'P1 重要' },
  P2: { color: '#64748B', bg: '#f8fafc', label: 'P2 普通' },
};

export default function TaskBoardPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');
  const [activePriority, setActivePriority] = useState<TaskPriority | 'all'>('all');

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (activeChannel !== 'all' && t.channel !== activeChannel) return false;
      if (activePriority !== 'all' && t.priority !== activePriority) return false;
      return true;
    });
  }, [activeChannel, activePriority, tasks]);

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, TaskItem[]> = { todo: [], doing: [], stuck: [], review: [], done: [] };
    filtered.forEach((t) => map[t.status].push(t));
    return map;
  }, [filtered]);

  const kpi = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const doing = tasks.filter((t) => t.status === 'doing').length;
    const stuck = tasks.filter((t) => t.status === 'stuck').length;
    const p0 = tasks.filter((t) => t.priority === 'P0' && t.status !== 'done').length;
    return { total, done, doing, stuck, p0, progress: Math.round((done / total) * 100) };
  }, [tasks]);

  const order: TaskStatus[] = ['todo', 'doing', 'stuck', 'review', 'done'];

  const chColor = (id?: ChannelPlatform) =>
    id ? channels.find((c) => c.id === id)?.color || '#64748B' : '#64748B';
  const chName = (id?: ChannelPlatform) =>
    id ? channels.find((c) => c.id === id)?.name || id : '通用';

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 9 渠道筛选 */}
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
              background: 'linear-gradient(135deg,#6366f1,#0ea5e9)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Kanban size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            按关联媒体渠道筛选（9 大渠道）
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            当前 {filtered.length} 项 · 共 {kpi.total} 项
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

      {/* 优先级 + KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8eaf0',
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Flag size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>优先级筛选</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {([
              { id: 'all' as const, name: '全部', color: '#475569' },
              ...(Object.keys(priorityMeta) as TaskPriority[]).map((p) => ({
                id: p,
                name: priorityMeta[p].label,
                color: priorityMeta[p].color,
              })),
            ]).map((p) => {
              const isActive = activePriority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePriority(p.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 9,
                    border: isActive ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                    background: isActive ? `${p.color}10` : '#fff',
                    color: isActive ? p.color : '#475569',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  <Zap size={11} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8eaf0',
            padding: '16px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
          }}
        >
          {[
            { icon: Kanban, label: '总任务', value: String(kpi.total), color: '#475569', sub: '本周新增 6' },
            { icon: Loader2, label: '进行中', value: String(kpi.doing), color: '#6366f1', sub: '5 人在执行' },
            { icon: AlertOctagon, label: '阻塞项', value: String(kpi.stuck), color: '#ef4444', sub: '需介入处理' },
            { icon: Zap, label: 'P0 待处理', value: String(kpi.p0), color: '#f59e0b', sub: '今日截止 3' },
            {
              icon: CheckCircle2,
              label: '整体进度',
              value: `${kpi.progress}%`,
              color: '#10b981',
              sub: `已完成 ${kpi.done} 项`,
            },
          ].map((k) => (
            <div key={k.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    background: `${k.color}15`,
                    color: k.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <k.icon size={12} />
                </div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{k.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, letterSpacing: '-0.02em' }}>
                {k.value}
              </div>
              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 看板 5 列 */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Kanban size={15} style={{ color: '#6366f1' }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>5 列任务看板</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>拖拽列内卡片可调整顺序</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${order.length}, 1fr)`,
            gap: 14,
          }}
        >
          {order.map((s) => {
            const sm = statusMeta[s];
            const list = byStatus[s];
            return (
              <div
                key={s}
                style={{
                  background: sm.bg,
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 520,
                  border: `1px solid ${sm.color}22`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: `1px dashed ${sm.color}33`,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: sm.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <sm.icon size={13} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: sm.color }}>{sm.label}</div>
                    <div style={{ fontSize: 10.5, color: '#64748B' }}>{list.length} 项</div>
                  </div>
                  <button
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      border: `1px solid ${sm.color}33`,
                      background: '#fff',
                      color: sm.color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {list.map((t) => {
                    const pm = priorityMeta[t.priority];
                    return (
                      <div
                        key={t.id}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          cursor: 'grab',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          <GripVertical size={13} style={{ color: '#cbd5e1', marginTop: 2 }} />
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: '#0f172a',
                              lineHeight: 1.5,
                              flex: 1,
                            }}
                          >
                            {t.title}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: pm.bg,
                              color: pm.color,
                              fontSize: 10.5,
                              fontWeight: 700,
                            }}
                          >
                            <Flag size={9} />
                            {t.priority}
                          </span>
                          {t.channel && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: `${chColor(t.channel)}12`,
                                color: chColor(t.channel),
                                fontSize: 10.5,
                                fontWeight: 600,
                              }}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: '50%',
                                  background: chColor(t.channel),
                                }}
                              />
                              {chName(t.channel)}
                            </span>
                          )}
                          {t.tags.slice(0, 2).map((tg) => (
                            <span
                              key={tg}
                              style={{
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: '#f8fafc',
                                color: '#64748B',
                                fontSize: 10.5,
                              }}
                            >
                              #{tg}
                            </span>
                          ))}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 8,
                            borderTop: '1px dashed #f1f5f9',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={10.5} style={{ color: '#94a3b8' }} />
                            <span style={{ fontSize: 10.5, color: '#475569', fontWeight: 500 }}>
                              {t.owner}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarDays size={10.5} style={{ color: '#94a3b8' }} />
                            <span style={{ fontSize: 10.5, color: '#475569', fontWeight: 500 }}>
                              {t.deadline.slice(5)}
                            </span>
                          </div>
                        </div>
                        {t.related && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: '6px 8px',
                              borderRadius: 8,
                              background: '#f8fafc',
                              fontSize: 10.5,
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <LinkIcon size={10} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.related}
                            </span>
                            <ChevronRight size={10} style={{ color: '#94a3b8' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {list.length === 0 && (
                    <div
                      style={{
                        padding: 24,
                        borderRadius: 10,
                        border: `2px dashed ${sm.color}33`,
                        color: sm.color,
                        opacity: 0.55,
                        fontSize: 11,
                        textAlign: 'center',
                        fontWeight: 500,
                      }}
                    >
                      暂无任务，点击 + 添加
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
