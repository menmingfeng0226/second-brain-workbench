import { useMemo, useState } from 'react';
import {
  Target,
  Users,
  TrendingUp,
  Eye,
  AlertTriangle,
  Play,
  CalendarDays,
  BarChart2,
} from '@/components/icons';
import { competitors, channels } from '../../data/mockData';
import type { ChannelPlatform } from '../../types';

const fmt = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}w` : new Intl.NumberFormat('zh-CN').format(n);

export default function CompetitorsPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');

  const list = useMemo(() => {
    return competitors.filter(
      (c) => activeChannel === 'all' || c.channel === activeChannel,
    );
  }, [activeChannel]);

  const chName = (id: ChannelPlatform) =>
    channels.find((c) => c.id === id)?.name || id;
  const chColor = (id: ChannelPlatform) =>
    channels.find((c) => c.id === id)?.color || '#64748B';

  const kpi = useMemo(() => {
    return {
      count: competitors.length,
      monthViews: competitors.reduce((s, c) => s + c.monthViews, 0),
      totalFollowers: competitors.reduce((s, c) => s + c.followers, 0),
      alert: competitors.filter((c) => c.alert).length,
    };
  }, []);

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 9 渠道 */}
      <div
        style={{
          marginBottom: 20,
          padding: 12,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#ef4444,#6366f1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            竞品渠道分布
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            监控中 {kpi.count} 个账号
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
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: p.color,
                  }}
                />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI 4 卡 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          {
            icon: Users,
            label: '监控账号',
            value: String(kpi.count),
            color: '#1e40af',
            bg: '#eef2ff',
          },
          {
            icon: Eye,
            label: '竞品月曝光',
            value: fmt(kpi.monthViews),
            color: '#7c3aed',
            bg: '#f5f3ff',
          },
          {
            icon: BarChart2,
            label: '总粉丝量',
            value: fmt(kpi.totalFollowers),
            color: '#16a34a',
            bg: '#dcfce7',
          },
          {
            icon: AlertTriangle,
            label: '异动预警',
            value: String(kpi.alert),
            color: '#ef4444',
            bg: '#fee2e2',
          },
        ].map((k) => (
          <div
            key={k.label}
            className="card"
            style={{
              padding: '18px 20px',
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e8eaf0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: k.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: k.color,
                }}
              >
                <k.icon size={20} />
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* 竞品卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 16,
        }}
      >
        {list.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{
              padding: '18px 20px',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e8eaf0',
              borderLeft: `5px solid ${chColor(c.channel)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {c.alert && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg,#fee2e2,#fecaca)',
                  color: '#dc2626',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <AlertTriangle size={12} />
                {c.alert}
              </div>
            )}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: c.avatarColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {c.name.slice(0, 1)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{c.tagline}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '2px 9px',
                      borderRadius: 999,
                      background: `${chColor(c.channel)}14`,
                      color: chColor(c.channel),
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {chName(c.channel)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color:
                        c.deltaFollowers >= 8
                          ? '#16a34a'
                          : c.deltaFollowers >= 5
                            ? '#f59e0b'
                            : '#64748b',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <TrendingUp size={11} />
                    月涨粉 {c.deltaFollowers}%
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                padding: '12px 12px 14px',
                borderRadius: 12,
                background: '#f8fafc',
                marginBottom: 14,
              }}
            >
              {[
                { label: '粉丝', val: fmt(c.followers) },
                { label: '月播放', val: fmt(c.monthViews) },
                { label: '月更', val: `${c.monthPublished} 条` },
                { label: '互动', val: `${c.avgEngagement}%` },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: '#fff',
                    padding: '8px 6px',
                    borderRadius: 9,
                    textAlign: 'center',
                    border: '1px solid #eef2f7',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    {s.val}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background:
                  'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
                border: '1px solid #e0f2fe',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0369a1',
                  marginBottom: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Play size={11} fill="#0369a1" />
                最新发布
                <span style={{ flex: 1 }} />
                <CalendarDays size={11} style={{ opacity: 0.6 }} />
                {c.latestDate.slice(5)}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.45,
                  marginBottom: 8,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {c.latestTitle}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Eye size={12} style={{ color: '#0369a1' }} />
                播放 {fmt(c.latestViews)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
