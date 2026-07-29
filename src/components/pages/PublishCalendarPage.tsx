import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Pencil,
  Camera,
  Sparkles,
  CheckCircle2,
  Eye,
  Heart,
} from '@/components/icons';
import { channels, publishCalendarItems } from '../../data/mockData';
import type { ChannelPlatform, PublishCalendarItem, PublishStatus } from '../../types';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const platformDot: Record<ChannelPlatform, string> = {
  bilibili: '#00A1D6',
  xiaohongshu: '#FF2442',
  douyin: '#000000',
  'wechat-video': '#07C160',
  kuaishou: '#FF4906',
  'wechat-official': '#1AAD19',
  ximalaya: '#F37119',
  xiaoyuzhou: '#4F46E5',
  zhihu: '#0084FF',
};

const statusMeta: Record<
  PublishStatus,
  { label: string; color: string; Icon: React.FC<{ size?: number; color?: string }> }
> = {
  published: { label: '已发布', color: '#10b981', Icon: CheckCircle2 },
  scheduled: { label: '待发布', color: '#f59e0b', Icon: PlayCircle },
  editing: { label: '剪辑中', color: '#0ea5e9', Icon: Pencil },
  filming: { label: '拍摄中', color: '#8b5cf6', Icon: Camera },
  planning: { label: '策划中', color: '#64748b', Icon: Sparkles },
};

function fmtWan(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  return new Intl.NumberFormat('zh-CN').format(n);
}

export default function PublishCalendarPage() {
  const [year] = useState(2026);
  const [month, setMonth] = useState(7);

  const firstDow = useMemo(() => {
    const d = new Date(year, month - 1, 1);
    const w = d.getDay();
    return (w + 6) % 7;
  }, [year, month]);
  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month],
  );

  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmtDateKey = (d: number) => `${year}-${pad(month)}-${pad(d)}`;

  const itemsByDay = useMemo(() => {
    const map: Record<string, PublishCalendarItem[]> = {};
    publishCalendarItems.forEach((it) => {
      map[it.date] = map[it.date] || [];
      map[it.date].push(it);
    });
    return map;
  }, []);

  const stats = useMemo(() => {
    let scheduled = 0;
    let inProgress = 0;
    let published = 0;
    publishCalendarItems.forEach((i) => {
      if (i.status === 'published') published++;
      else if (i.status === 'scheduled') scheduled++;
      else inProgress++;
    });
    return { scheduled, inProgress, published, total: publishCalendarItems.length };
  }, []);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d;

  const prevMonth = () => {
    if (month === 1) setMonth(12);
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) setMonth(1);
    else setMonth((m) => m + 1);
  };

  return (
    <div className="page">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: '本月排期总数', value: `${stats.total} 条`, color: '#1e40af' },
          { label: '已发布', value: `${stats.published} 条`, color: '#10b981' },
          { label: '待发布（排定）', value: `${stats.scheduled} 条`, color: '#f59e0b' },
          { label: '制作中（拍+剪+策）', value: `${stats.inProgress} 条`, color: '#7c3aed' },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{
              padding: '18px 20px',
              borderRadius: 14,
              borderLeft: `4px solid ${s.color}`,
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={prevMonth}
              style={{
                width: 32,
                height: 32,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                background: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              {year} 年 {month} 月 · 发布日历
            </h3>
            <button
              onClick={nextMonth}
              style={{
                width: 32,
                height: 32,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                background: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(statusMeta).map(([k, s]) => {
              const Ic = s.Icon;
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: `${s.color}12`,
                    color: s.color,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Ic size={12} /> {s.label}
                </span>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0,1fr))',
            gap: 8,
            marginBottom: 8,
          }}
        >
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              style={{
                padding: '8px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 8,
              }}
            >
              周{w}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0,1fr))',
            gap: 8,
            gridAutoRows: '128px',
          }}
        >
          {cells.map((d, i) => {
            const disabled = d === null;
            const items = d ? itemsByDay[fmtDateKey(d)] || [] : [];
            const t = isToday(d ?? -1);
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  padding: 8,
                  borderRadius: 10,
                  border: `1px solid ${t ? '#1e40af' : '#e2e8f0'}`,
                  background: disabled ? '#f8fafc' : t ? '#eff6ff' : '#fff',
                  minHeight: 128,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  overflow: 'hidden',
                }}
              >
                {!disabled && (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: t ? '#fff' : d === daysInMonth ? '#64748b' : '#0f172a',
                          background: t ? '#1e40af' : 'transparent',
                        }}
                      >
                        {d}
                      </span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {items.slice(0, 4).map((it) =>
                          it.platforms.map((p) => (
                            <span
                              key={`${it.id}-${p}`}
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 999,
                                background: platformDot[p],
                                display: 'inline-block',
                              }}
                            />
                          )),
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
                      {items.slice(0, 2).map((it) => {
                        const sm = statusMeta[it.status];
                        const SI = sm.Icon;
                        return (
                          <div
                            key={it.id}
                            style={{
                              padding: '5px 7px',
                              borderRadius: 7,
                              background: `${sm.color}12`,
                              border: `1px solid ${sm.color}33`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              minWidth: 0,
                            }}
                            title={it.title}
                          >
                            <SI size={10} color={sm.color} />
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: sm.color,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {it.title}
                            </span>
                          </div>
                        );
                      })}
                      {items.length > 2 && (
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>
                          + {items.length - 2} 更多
                        </span>
                      )}
                    </div>

                    {items.length > 0 && items[0].status === 'published' && items[0].views !== undefined && (
                      <div
                        style={{
                          marginTop: 'auto',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 10,
                          color: '#64748b',
                          paddingTop: 4,
                          borderTop: '1px dashed #e2e8f0',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <Eye size={10} /> {fmtWan(items[0].views!)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <Heart size={10} color="#ef4444" /> {fmtWan(items[0].likes ?? 0)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px dashed #e2e8f0',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b', marginRight: 12, alignSelf: 'center' }}>
            各平台颜色说明：
          </div>
          {channels.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 999,
                background: `${c.color}12`,
                color: c.color,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: c.color,
                  borderRadius: 999,
                  display: 'inline-block',
                }}
              />
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
