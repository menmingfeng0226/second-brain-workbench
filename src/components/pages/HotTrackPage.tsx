import { useMemo, useState } from 'react';
import {
  Activity,
  Flame,
  TrendingUp,
  Zap,
  Link as LinkIcon,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { hotItems, channels } from '../../data/mockData';
import type { ChannelPlatform } from '../../types';

const fmt = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}w` : new Intl.NumberFormat('zh-CN').format(n);

type SourceFilter = ChannelPlatform | '综合热搜' | 'all';

const srcCat = (s: string): '视频' | '图文' | '播客' | '综合' => {
  const ch = channels.find((c) => c.id === s);
  return ch ? ch.category : '综合';
};

export default function HotTrackPage() {
  const [activeSource, setActiveSource] = useState<SourceFilter>('all');

  const list = useMemo(() => {
    return hotItems
      .filter((h) => activeSource === 'all' || h.source === activeSource)
      .sort((a, b) => b.heat - a.heat);
  }, [activeSource]);

  const kpi = useMemo(() => {
    return {
      total: hotItems.length,
      hot: hotItems.filter((h) => h.trend === 'hot').length,
      new: hotItems.filter((h) => h.trend === 'new').length,
      ideas: hotItems.reduce((s, h) => s + (h.relatedIdeas || 0), 0),
    };
  }, []);

  const trendBadge = (t: 'hot' | 'up' | 'new') => {
    const map = {
      hot: { label: '爆', color: '#ef4444', bg: '#fef2f2' },
      up: { label: '升', color: '#f59e0b', bg: '#fffbeb' },
      new: { label: '新', color: '#6366f1', bg: '#eef2ff' },
    } as const;
    return map[t];
  };

  const srcColor = (s: string) => {
    if (s === '综合热搜') return '#475569';
    return channels.find((c) => c.id === s)?.color || '#64748B';
  };
  const srcName = (s: string) => {
    if (s === '综合热搜') return '综合热搜';
    return channels.find((c) => c.id === s)?.name || s;
  };

  const sourceOptions: Array<{ id: SourceFilter; name: string; color: string }> = [
    { id: 'all', name: '全部来源', color: '#475569' },
    { id: '综合热搜', name: '综合热搜', color: '#475569' },
    ...channels.map((c) => ({ id: c.id as SourceFilter, name: c.name, color: c.color })),
  ];

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 9 渠道 + 综合 */}
      <div
        style={{
          marginBottom: 22,
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
              background: 'linear-gradient(135deg,#ef4444,#f59e0b)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            按媒体渠道筛选（含综合热搜）
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            当前 {list.length} 条 · 共 {kpi.total} 条
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sourceOptions.map((p) => {
            const isActive = activeSource === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveSource(p.id)}
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

      {/* KPI 4卡 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 22,
        }}
      >
        {[
          { icon: Flame, label: '监测热点', value: String(kpi.total), color: '#ef4444', bg: '#fef2f2' },
          { icon: Zap, label: '爆款词条', value: String(kpi.hot), color: '#f59e0b', bg: '#fffbeb' },
          { icon: Sparkles, label: '新晋热搜', value: String(kpi.new), color: '#6366f1', bg: '#eef2ff' },
          { icon: Lightbulb, label: '衍生选题', value: String(kpi.ideas), color: '#16a34a', bg: '#dcfce7' },
        ].map((k) => (
          <div
            key={k.label}
            className="card"
            style={{ padding: '18px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e8eaf0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: k.bg,
                  color: k.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <k.icon size={18} />
              </div>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* 左：热点列表 */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <TrendingUp size={15} style={{ color: '#ef4444' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>实时热度榜</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>按热度倒序</span>
          </div>
          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {list.map((h, idx) => {
              const tb = trendBadge(h.trend);
              const cat = srcCat(h.source as string);
              return (
                <div
                  key={h.id}
                  style={{
                    padding: '12px 18px',
                    borderBottom: idx < list.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: idx < 3 ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : '#f1f5f9',
                      color: idx < 3 ? '#fff' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {h.rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: 6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: `${srcColor(h.source as string)}12`,
                          color: srcColor(h.source as string),
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: srcColor(h.source as string),
                          }}
                        />
                        {srcName(h.source as string)}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        {cat}
                      </span>
                      {h.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#f8fafc',
                            color: '#64748B',
                            fontSize: 11,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 10px',
                      borderRadius: 8,
                      background: tb.bg,
                      color: tb.color,
                      fontWeight: 700,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    {tb.label}
                  </div>
                  <div style={{ textAlign: 'right', width: 90, flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>
                      {fmt(h.heat)}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{h.heatDesc}</div>
                  </div>
                  {h.relatedIdeas ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 8,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Lightbulb size={12} />
                      {h.relatedIdeas} 选题
                    </div>
                  ) : null}
                  <button
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      flexShrink: 0,
                    }}
                  >
                    <LinkIcon size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右：来源分布 + 分类分布 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf0', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <ArrowUpRight size={15} style={{ color: '#6366f1' }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>热度来源构成</span>
            </div>
            {(() => {
              const bySrc: Record<string, number> = {};
              hotItems.forEach((h) => {
                bySrc[h.source] = (bySrc[h.source] || 0) + h.heat;
              });
              const arr = Object.entries(bySrc)
                .map(([s, v]) => ({ s, v, color: srcColor(s), name: srcName(s) }))
                .sort((a, b) => b.v - a.v);
              const max = arr[0]?.v || 1;
              const total = arr.reduce((s, x) => s + x.v, 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {arr.map((a) => (
                    <div key={a.s}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: a.color,
                            }}
                          />
                          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{a.name}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 700 }}>
                          {Math.round((a.v / total) * 100)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: '#f1f5f9',
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${(a.v / max) * 100}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${a.color}, ${a.color}cc)`,
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eaf0', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Flame size={15} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>趋势词条分布</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(['hot', 'up', 'new'] as const).map((t) => {
                const tb = trendBadge(t);
                const cnt = hotItems.filter((h) => h.trend === t).length;
                return (
                  <div
                    key={t}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: `${tb.color}0D`,
                      border: `1px solid ${tb.color}22`,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: tb.bg,
                        color: tb.color,
                        fontWeight: 800,
                        marginBottom: 8,
                      }}
                    >
                      {tb.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: tb.color, marginBottom: 2 }}>
                      {cnt}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      {t === 'hot' ? '爆款' : t === 'up' ? '上升' : '新晋'}
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
