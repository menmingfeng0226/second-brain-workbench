import { useMemo, useState } from 'react';
import {
  Lightbulb,
  Flame,
  Filter,
  User,
  CalendarDays,
  Link2,
  ChevronRight,
  Sparkles,
} from '@/components/icons';
import { ideas, channels } from '../../data/mockData';
import type { IdeaPriority, IdeaStatus, ChannelPlatform, IdeaItem } from '../../types';
import { useWorkbench } from '../../context/WorkbenchContext';

const statusFlow: { id: IdeaStatus; label: string; color: string }[] = [
  { id: 'idea', label: '灵感池', color: '#94a3b8' },
  { id: 'research', label: '调研中', color: '#6366f1' },
  { id: 'approved', label: '已立项', color: '#16a34a' },
  { id: 'scripting', label: '写脚本', color: '#7c3aed' },
  { id: 'filming', label: '拍摄中', color: '#f59e0b' },
  { id: 'published', label: '已发布', color: '#0ea5e9' },
  { id: 'archived', label: '已归档', color: '#e2e8f0' },
];

const sourceList = [
  '灵感闪念',
  '热点衍生',
  '爆款拆解',
  '粉丝提问',
  '采访素材',
  '竞品参考',
] as const;

export default function IdeasPage() {
  const [activeStatus, setActiveStatus] = useState<IdeaStatus | 'all'>('all');
  const [activeSource, setActiveSource] = useState<(typeof sourceList)[number] | 'all'>('all');
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');
  const [activePriority, setActivePriority] = useState<IdeaPriority | 'all'>('all');
  const { extraIdeas, generatedCount } = useWorkbench();

  const allIdeas = useMemo<IdeaItem[]>(() => {
    const merged = [...extraIdeas, ...ideas];
    const seen = new Set<string>();
    return merged.filter((i) => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });
  }, [extraIdeas, ideas]);

  const filtered = useMemo(() => {
    return allIdeas.filter((i) => {
      if (activeStatus !== 'all' && i.status !== activeStatus) return false;
      if (activeSource !== 'all' && i.source !== activeSource) return false;
      if (activePriority !== 'all' && i.priority !== activePriority) return false;
      if (activeChannel !== 'all' && !i.channels.includes(activeChannel)) return false;
      return true;
    });
  }, [allIdeas, activeStatus, activeSource, activeChannel, activePriority]);

  const kpi = useMemo(() => {
    const counts = statusFlow.reduce(
      (acc, s) => ({ ...acc, [s.id]: allIdeas.filter((i) => i.status === s.id).length }),
      {} as Record<string, number>,
    );
    return {
      total: allIdeas.length,
      p0: allIdeas.filter((i) => i.priority === 'P0').length,
      avgHeat: Math.round(allIdeas.reduce((s, i) => s + i.heat, 0) / allIdeas.length),
      pipeline: counts as Record<IdeaStatus, number>,
    };
  }, [allIdeas]);

  const channelColor = (id: ChannelPlatform) =>
    channels.find((c) => c.id === id)?.color || '#64748B';
  const channelName = (id: ChannelPlatform) =>
    channels.find((c) => c.id === id)?.name || id;
  const statusColor = (s: IdeaStatus) =>
    statusFlow.find((f) => f.id === s)?.color || '#94a3b8';
  const statusLabel = (s: IdeaStatus) =>
    statusFlow.find((f) => f.id === s)?.label || s;

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 7 状态流水条 */}
      <div
        className="card"
        style={{
          padding: '16px 18px',
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
          marginBottom: 18,
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
                width: 30,
                height: 30,
                borderRadius: 9,
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                选题流水线 · 共 {kpi.total} 个选题
                {generatedCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 9px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg,#faf5ff,#ede9fe)',
                      color: '#6d28d9',
                      fontSize: 10.5,
                      fontWeight: 700,
                      border: '1px solid #ddd6fe',
                    }}
                  >
                    <Sparkles size={11} />
                    新生成 {generatedCount} 条
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                从灵感闪念 → 调研 → 立项 → 发布的全链路追踪 · 支持爆款拆解一键生成选题
              </div>
            </div>
          </div>
          <button
            style={{
              padding: '7px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            + 新选题
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${statusFlow.length}, 1fr)`,
            gap: 8,
          }}
        >
          {statusFlow.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setActiveStatus(activeStatus === s.id ? 'all' : s.id)}
              style={{
                padding: '10px 8px',
                borderRadius: 10,
                background:
                  activeStatus === s.id ? `${s.color}18` : '#f8fafc',
                border: `1px solid ${activeStatus === s.id ? s.color : '#eef2f7'}`,
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>
                STEP 0{idx + 1}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {kpi.pipeline[s.id] || 0}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155' }}>
                {s.label}
              </div>
              {idx < statusFlow.length - 1 && (
                <ChevronRight
                  size={14}
                  style={{
                    position: 'absolute',
                    right: -10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#cbd5e1',
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPI 卡 + 筛选区 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr) 1.4fr',
          gap: 16,
          marginBottom: 18,
        }}
      >
        {[
          {
            icon: Lightbulb,
            label: '在选题库',
            value: String(kpi.total),
            color: '#f59e0b',
            bg: '#fef3c7',
          },
          {
            icon: Flame,
            label: 'P0 紧急',
            value: String(kpi.p0),
            color: '#ef4444',
            bg: '#fee2e2',
          },
          {
            icon: Filter,
            label: '平均热度值',
            value: `${kpi.avgHeat}`,
            color: '#7c3aed',
            bg: '#f5f3ff',
          },
        ].map((k) => (
          <div
            key={k.label}
            className="card"
            style={{
              padding: '16px 18px',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: k.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: k.color,
                flexShrink: 0,
              }}
            >
              <k.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {k.value}
              </div>
            </div>
          </div>
        ))}
        <div
          className="card"
          style={{
            padding: '12px 14px',
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e8eaf0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignContent: 'center',
          }}
        >
          {sourceList.map((s) => {
            const active = activeSource === s;
            return (
              <button
                key={s}
                onClick={() => setActiveSource(active ? 'all' : s)}
                style={{
                  padding: '4px 11px',
                  fontSize: 11.5,
                  fontWeight: active ? 700 : 500,
                  borderRadius: 999,
                  border: `1px solid ${active ? '#7c3aed' : '#e2e8f0'}`,
                  background: active ? '#f5f3ff' : '#fff',
                  color: active ? '#7c3aed' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            );
          })}
          <div style={{ width: 1, alignSelf: 'stretch', background: '#e2e8f0', margin: '0 2px' }} />
          {(['P0', 'P1', 'P2'] as IdeaPriority[]).map((p) => {
            const active = activePriority === p;
            return (
              <button
                key={p}
                onClick={() => setActivePriority(active ? 'all' : p)}
                style={{
                  padding: '4px 11px',
                  fontSize: 11.5,
                  fontWeight: active ? 700 : 500,
                  borderRadius: 999,
                  border: `1px solid ${
                    active
                      ? p === 'P0'
                        ? '#ef4444'
                        : p === 'P1'
                          ? '#f59e0b'
                          : '#16a34a'
                      : '#e2e8f0'
                  }`,
                  background: active
                    ? p === 'P0'
                      ? '#fee2e2'
                      : p === 'P1'
                        ? '#fef3c7'
                        : '#dcfce7'
                    : '#fff',
                  color: active
                    ? p === 'P0'
                      ? '#dc2626'
                      : p === 'P1'
                        ? '#d97706'
                        : '#15803d'
                    : '#475569',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            );
          })}
          <div style={{ width: 1, alignSelf: 'stretch', background: '#e2e8f0', margin: '0 2px' }} />
          {channels.slice(0, 6).map((c) => {
            const active = activeChannel === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChannel(active ? 'all' : c.id)}
                title={c.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  border: `2px solid ${active ? c.color : 'transparent'}`,
                  background: c.color,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  lineHeight: '20px',
                  textAlign: 'center',
                }}
              >
                {c.name[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 选题卡片流 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 14,
        }}
      >
        {filtered.map((i) => (
          <div
            key={i.id}
            className="card"
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: '#fff',
              border: '1px solid #e8eaf0',
              borderTop: `4px solid ${statusColor(i.status)}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                gap: 8,
              }}
            >
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: `${statusColor(i.status)}16`,
                  color: statusColor(i.status),
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {statusLabel(i.status)}
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background:
                    i.priority === 'P0'
                      ? '#fee2e2'
                      : i.priority === 'P1'
                        ? '#fef3c7'
                        : '#dcfce7',
                  color:
                    i.priority === 'P0'
                      ? '#dc2626'
                      : i.priority === 'P1'
                        ? '#d97706'
                        : '#15803d',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {i.priority}
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                来源 · {i.source}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#f59e0b',
                  lineHeight: 1,
                }}
              >
                {i.heat}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>热度</span>
              <h3
                style={{
                  flex: 1,
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.45,
                }}
              >
                {i.title}
              </h3>
            </div>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 12,
                color: '#64748b',
                lineHeight: 1.7,
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: 10,
                borderLeft: '3px solid #7c3aed',
              }}
            >
              💡 {i.hook}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: '#eef2ff',
                    color: '#1e40af',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={12} />
                </div>
                <span style={{ fontSize: 11.5, color: '#334155', fontWeight: 600 }}>
                  {i.owner}
                </span>
                <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                  · <CalendarDays size={11} style={{ display: 'inline', margin: '0 3px' }} />
                  {i.deadline.slice(5)}
                </span>
                {typeof i.usedCards === 'number' && i.usedCards > 0 && (
                  <span
                    style={{
                      fontSize: 11.5,
                      color: '#64748b',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Link2 size={11} />
                    {i.usedCards} 卡
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {i.channels.map((ch) => (
                  <span
                    key={ch}
                    title={channelName(ch)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: channelColor(ch),
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      textAlign: 'center',
                      lineHeight: '20px',
                    }}
                  >
                    {channelName(ch)[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
