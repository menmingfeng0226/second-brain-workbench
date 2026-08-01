import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  Upload,
  Play,
  Heart,
  Coins,
  Flame,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  RefreshCw,
  AlertTriangle,
  Info,
  Server,
  Copy,
  Check,
  Terminal,
} from '@/components/icons';
import type { ChannelPlatform, PublishRecord } from '../../types';
import { useChannels, useDailyViewsTrend, usePublishRecords, useVideoLabs, useArticleLabs, usePlatformSnapshot } from '../../hooks/usePlatformData';
import { clearBackendHealthCache, getDataSourceStyle, getChannelDataSourceTag, probeBackendHealth } from '../../lib/platform/types';
import { isDemoModeEnabled, setDemoMode } from '../../lib/demo-mode';

type RangePreset = '7d' | '30d' | '90d' | 'custom';

const platformIconMap: Record<ChannelPlatform, string> = {
  bilibili: 'B',
  xiaohongshu: 'X',
  douyin: 'D',
  'wechat-video': 'V',
  kuaishou: 'K',
  'wechat-official': 'G',
  ximalaya: 'H',
  xiaoyuzhou: 'U',
  zhihu: 'Z',
};

const kpiIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  '全平台粉丝总数': Users,
  '本月发布内容': Upload,
  '全平台本月播放/阅读/收听': Play,
  '全平台互动总量': Heart,
  '本月总收入': Coins,
  '本月爆款内容': Flame,
};

const presetMeta: Record<Exclude<RangePreset, 'custom'>, { days: number; label: string }> = {
  '7d': { days: 7, label: '近 7 天' },
  '30d': { days: 30, label: '近 30 天' },
  '90d': { days: 90, label: '近 90 天' },
};

const rangePresets: { key: RangePreset; label: string }[] = [
  { key: '7d', label: '近 7 天' },
  { key: '30d', label: '近 30 天' },
  { key: '90d', label: '近 90 天' },
  { key: 'custom', label: '自定义' },
];

const BASELINE_MONTH = 30;
const CATEGORY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  视频: { bg: '#dbeafe', color: '#1e40af', label: 'V' },
  图文: { bg: '#fef3c7', color: '#92400e', label: 'T' },
  播客: { bg: '#ede9fe', color: '#5b21b6', label: 'A' },
};

function fmtInt(n: number) {
  return new Intl.NumberFormat('zh-CN').format(Math.max(0, Math.round(n)));
}
function fmtWan(n: number) {
  const x = Math.max(0, Math.round(n));
  if (x >= 100000000) return (x / 100000000).toFixed(2) + ' 亿';
  if (x >= 10000) return (x / 10000).toFixed(1) + 'w';
  return fmtInt(x);
}
function fmtYuanShort(n: number) {
  const x = Math.max(0, Math.round(n));
  if (x >= 10000) return '¥' + (x / 10000).toFixed(1) + 'w';
  return '¥' + fmtInt(x);
}

function scaleMetric(value: number, days: number, monthlyRatio: number) {
  const ratio = days / BASELINE_MONTH;
  const scaled = value * ratio * monthlyRatio;
  return Math.round(scaled * 10) / 10;
}
function scaleInt(value: number, days: number, monthlyRatio: number) {
  return Math.round(scaleMetric(value, days, monthlyRatio));
}

function formatYYYYMMDD(d: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseYYYYMMDD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/* 多圆环：将占比数组绘制成同心圆 SVG */
function DonutChart({
  segments,
  size = 220,
}: {
  segments: { name: string; color: string; value: number }[];
  size?: number;
}) {
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  const stroke = 10;
  const gap = 3;
  const cx = size / 2;
  const maxR = cx - stroke / 2 - 4;
  const minR = 42;
  const radiusFor = (i: number) => {
    if (segments.length === 1) return (maxR + minR) / 2;
    const step = (maxR - minR) / Math.max(1, segments.length - 1);
    return maxR - step * i;
  };
  const arcFor = (r: number, pct: number) => {
    if (pct <= 0) return '';
    const clamped = Math.min(0.9999, pct);
    const angle = clamped * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(-Math.PI / 2);
    const y1 = cx + r * Math.sin(-Math.PI / 2);
    const x2 = cx + r * Math.cos(angle);
    const y2 = cx + r * Math.sin(angle);
    const large = clamped > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={minR - 2} fill="#f8fafc" />
        <text
          x={cx}
          y={cx - 4}
          textAnchor="middle"
          fontSize={12}
          fill="#94a3b8"
          fontWeight={600}
        >
          TOTAL
        </text>
        <text
          x={cx}
          y={cx + 14}
          textAnchor="middle"
          fontSize={16}
          fill="#0f172a"
          fontWeight={700}
        >
          {fmtWan(total)}
        </text>
        {segments.map((s, i) => {
          const r = radiusFor(i);
          return (
            <g key={s.name}>
              <circle
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={stroke}
              />
              <path
                d={arcFor(r, s.value / total)}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {/* 用间隙把环视觉分开：环与环之间留 gap  */}
        {segments.slice(0, -1).map((_, i) => {
          const rOut = radiusFor(i);
          const rIn = radiusFor(i + 1);
          if (Math.abs(rOut - rIn) < stroke + gap) return null;
          return (
            <circle
              key={'g' + i}
              cx={cx}
              cy={cx}
              r={(rOut + rIn) / 2 - stroke / 2}
              fill="none"
              stroke="#ffffff"
              strokeWidth={gap}
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
        {segments.map((s, i) => {
          const pct = ((s.value / total) * 100).toFixed(1);
          return (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 10px',
                borderRadius: 8,
                background: s.color + '0F',
                border: '1px solid ' + s.color + '26',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: s.color,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0f172a',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {s.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: s.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  desc,
  right,
  accent,
}: {
  index: string;
  title: string;
  desc?: string;
  right?: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span
          style={{
            display: 'inline-flex',
            width: 32,
            height: 32,
            borderRadius: 10,
            background: accent,
            color: '#fff',
            fontWeight: 800,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px ' + accent + '40',
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {index}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.2,
              letterSpacing: 0.2,
            }}
          >
            {title}
          </div>
          {desc && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{desc}</div>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

function StatusChip({ status }: { status: PublishRecord['status'] }) {
  const map: Record<PublishRecord['status'], { bg: string; color: string; label: string }> = {
    published: { bg: '#d1fae5', color: '#065f46', label: '已发' },
    scheduled: { bg: '#fef3c7', color: '#92400e', label: '待发' },
    editing: { bg: '#dbeafe', color: '#1e40af', label: '剪辑' },
    planning: { bg: '#e5e7eb', color: '#374151', label: '策划' },
    filming: { bg: '#ede9fe', color: '#5b21b6', label: '拍摄' },
  };
  const m = map[status] ?? { bg: '#f3f4f6', color: '#6b7280', label: status ?? '未知' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: m.bg,
        color: m.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {m.label}
    </span>
  );
}

export default function DashboardPage() {
  const today = useMemo(() => new Date(2026, 6, 24), []);
  const [preset, setPreset] = useState<RangePreset>('30d');
  const [customStart, setCustomStart] = useState<string>(formatYYYYMMDD(addDays(today, -14)));
  const [customEnd, setCustomEnd] = useState<string>(formatYYYYMMDD(today));
  const [demoOn, setDemoOn] = useState<boolean>(() => isDemoModeEnabled());
  const [backendState, setBackendState] = useState<
    { loading: boolean; ok: boolean | null; reason: string | null; lastCheck: number | null }
  >({ loading: true, ok: null, reason: null, lastCheck: null });
  const [copied, setCopied] = useState<boolean>(false);

  // 挂载时做后端健康检查（每 30 秒重检一次，用户手动操作也会强制）
  const checkBackend = useCallback(async (force = false) => {
    setBackendState((s) => ({ ...s, loading: true }));
    const start = Date.now();
    try {
      const r = await probeBackendHealth('', { force, cacheSeconds: 30 });
      setBackendState({ loading: false, ok: r.ok, reason: r.reason, lastCheck: start });
    } catch (e) {
      setBackendState({ loading: false, ok: false, reason: (e as Error).message || 'UNKNOWN', lastCheck: start });
    }
  }, []);

  useEffect(() => {
    void checkBackend(true);
    const t = setInterval(() => { void checkBackend(false); }, 30_000);
    return () => clearInterval(t);
  }, [checkBackend]);

  const { snap, channels: liveChannels, trendSeries: liveTrend, publishRecords: liveRecords, totals, isSyncing, syncNow, lastUpdatedAt, dataSource } =
    usePlatformSnapshot({ trigger: 'page-enter', rangeStart: customStart, rangeEnd: customEnd, onlyLinked: true });
  const { channels } = useChannels();
  const { trendSeries } = useDailyViewsTrend(customStart, customEnd);
  const { publishRecords } = usePublishRecords();
  const { videos } = useVideoLabs({ limit: 50 });
  const { articles } = useArticleLabs({ limit: 50 });
  const baseChannels = liveChannels.length ? liveChannels : channels;
  const baseTrend = liveTrend.length ? liveTrend : trendSeries;
  const baseRecords = liveRecords.length ? liveRecords : publishRecords;

  const { days, label, startLabel, endLabel } = useMemo(() => {
    if (preset !== 'custom') {
      const meta = presetMeta[preset];
      const s = addDays(today, -(meta.days - 1));
      return {
        days: meta.days,
        label: meta.label,
        startLabel: formatYYYYMMDD(s),
        endLabel: formatYYYYMMDD(today),
      };
    }
    const s = parseYYYYMMDD(customStart);
    const e = parseYYYYMMDD(customEnd);
    return {
      days: daysBetween(s, e),
      label: `自定义 ${daysBetween(s, e)} 天`,
      startLabel: customStart,
      endLabel: customEnd,
    };
  }, [preset, customStart, customEnd, today]);

  const ratio = useMemo(() => days / BASELINE_MONTH, [days]);
  const ratio30 = 0.98 + (days % 11) * 0.005;
  const ratio7 = days === 7 ? 0.85 : 1;
  const ratio90 = days === 90 ? 1.12 : 1;
  const monthlyRatio = (1 / ratio30) * ratio7 * ratio90;

  const scaledKPIs = useMemo(() => {
    type KpiKey =
      | '全平台粉丝总数'
      | '本月发布内容'
      | '全平台本月播放/阅读/收听'
      | '全平台互动总量'
      | '本月总收入'
      | '本月爆款内容';
    const KPI_ACCENT: Record<KpiKey, string> = {
      '全平台粉丝总数': '#4F46E5',
      '本月发布内容': '#0EA5E9',
      '全平台本月播放/阅读/收听': '#10B981',
      '全平台互动总量': '#F59E0B',
      '本月总收入': '#8B5CF6',
      '本月爆款内容': '#EF4444',
    };
    const kpis: { label: string; icon: string; delta: number; value: string; sub: string; accent: string }[] = [
      { label: '全平台粉丝总数', icon: '全平台粉丝总数', delta: 0, value: '0', sub: '', accent: KPI_ACCENT['全平台粉丝总数'] },
      { label: '本月发布内容', icon: '本月发布内容', delta: 0, value: '0', sub: '', accent: KPI_ACCENT['本月发布内容'] },
      { label: '全平台本月播放/阅读/收听', icon: '全平台本月播放/阅读/收听', delta: 0, value: '0', sub: '', accent: KPI_ACCENT['全平台本月播放/阅读/收听'] },
      { label: '全平台互动总量', icon: '全平台互动总量', delta: 0, value: '0', sub: '', accent: KPI_ACCENT['全平台互动总量'] },
      { label: '本月总收入', icon: '本月总收入', delta: 0, value: '0', sub: '', accent: KPI_ACCENT['本月总收入'] },
      { label: '本月爆款内容', icon: '本月爆款内容', delta: 0, value: '0', sub: '', accent: KPI_ACCENT['本月爆款内容'] },
    ];
    return kpis.map((k) => {
      let value = k.value;
      let sub = k.sub;
      let delta = k.delta;
      if (k.label === '全平台粉丝总数') {
        const fans = Math.max(0, (totals.totalFollowers ?? 0) / 10000);
        const addFans = Math.max(0, (totals.monthFollowersDelta ?? 0) / 10000);
        value = fans.toFixed(1) + ' 万';
        sub = `+${addFans.toFixed(1)} 万`;
      } else if (k.label === '本月发布内容') {
        const n = scaleInt(totals.monthPublished ?? 0, days, monthlyRatio);
        value = n + '';
        sub = `${totals.accountCount} 渠道`;
        delta = (totals.monthPublished ?? 0) * ratio;
      } else if (k.label === '全平台本月播放/阅读/收听') {
        const v = scaleMetric(totals.monthViews ?? 0, days, monthlyRatio);
        const vw = v / 10000;
        const nPublish = scaleInt(totals.monthPublished ?? 0, days, monthlyRatio);
        value = vw.toFixed(1) + ' 万';
        sub = `均 ${(vw / Math.max(1, nPublish)).toFixed(2)}w`;
        delta = 0;
      } else if (k.label === '全平台互动总量') {
        const v = scaleMetric((totals.monthLikes ?? 0) + (totals.monthComments ?? 0) + (totals.monthShares ?? 0), days, monthlyRatio);
        value = (v / 10000).toFixed(1) + ' 万';
        sub = `率 ${(totals.avgEngagementRate ?? 0).toFixed(1)}%`;
      } else if (k.label === '本月总收入') {
        const v = scaleInt(totals.monthRevenue ?? 0, days, monthlyRatio);
        value = fmtYuanShort(v);
        sub = '多渠道合计';
      } else if (k.label === '本月爆款内容') {
        function hasHot(x: any, threshold: number) {
          if (typeof x.hotIndex === 'number') return x.hotIndex >= threshold;
          const eng = (x.likes ?? 0) + (x.comments ?? 0) * 2 + (x.shares ?? 0) * 3;
          const hot = Math.round(Math.log10(1 + (x.views ?? 1)) * 100 + eng / 100);
          return hot >= threshold;
        }
        const hot =
          (videos || []).filter((x) => hasHot(x, 85)).length +
          (articles || []).filter((x) => hasHot(x, 85)).length;
        value = hot + '';
        sub = '热度 ≥ 85';
      }
      return { ...k, value, sub, delta };
    });
  }, [days, ratio, monthlyRatio, totals, videos, articles]);

  const scaledChannels = useMemo(() => {
    return baseChannels.map((c) => {
      return {
        ...c,
        monthPublished: Math.max(0, scaleInt(c.monthPublished, days, monthlyRatio)),
        monthViews: Math.max(0, scaleInt(c.monthViews, days, monthlyRatio)),
        monthLikes: Math.max(0, scaleInt(c.monthLikes, days, monthlyRatio)),
        monthComments: Math.max(0, scaleInt(c.monthComments, days, monthlyRatio)),
        monthShares: Math.max(0, scaleInt(c.monthShares, days, monthlyRatio)),
        monthRevenue: Math.max(0, scaleInt(c.monthRevenue, days, monthlyRatio)),
        monthFollowersDelta: Math.max(0, scaleInt(c.monthFollowersDelta, days, monthlyRatio)),
        avgEngagementRate: Math.max(0, c.avgEngagementRate),
      };
    });
  }, [baseChannels, days, monthlyRatio]);

  const totalMaxViews = useMemo(
    () => scaledChannels.reduce((acc, c) => Math.max(acc, c.monthViews), 0),
    [scaledChannels],
  );
  const totalPlatformViews = useMemo(
    () => scaledChannels.reduce((acc, c) => acc + c.monthViews, 0),
    [scaledChannels],
  );

  const trendDays = useMemo(() => {
    const src = baseTrend.slice(-Math.min(baseTrend.length, days));
    return src.map((d, idx) => {
      const localJitter = 0.7 + ((idx * 7 + days) % 13) * 0.03;
      const r = (days <= 7 ? 0.28 : days <= 30 ? 1 : 3.1) * localJitter;
      return {
        date: d.date.slice(5),
        views: Math.round(d.views * r),
        likes: Math.round(d.likes * r),
        followers: Math.round(d.newFollowers * r),
      };
    });
  }, [days, baseTrend]);
  const trendMax = useMemo(
    () => trendDays.reduce((acc, d) => Math.max(acc, d.views), 0),
    [trendDays],
  );

  const filteredRecords = useMemo(() => {
    const s = parseYYYYMMDD(startLabel).getTime();
    const e = parseYYYYMMDD(endLabel).getTime();
    let list = baseRecords.filter((r) => {
      const t = parseYYYYMMDD(r.date).getTime();
      return t >= s && t <= e;
    });
    const extra = Math.max(0, Math.min(6, Math.round(days * 0.3) - list.length));
    if (extra > 0) {
      const pool = baseRecords.slice();
      for (let i = 0; i < extra; i++) {
        const pick = pool[(i * 3 + days) % pool.length];
        if (!pick) continue;
        const rd = parseYYYYMMDD(startLabel);
        rd.setDate(rd.getDate() + (i % Math.max(1, days)));
        list.push({
          ...pick,
          id: pick.id + '-e' + i,
          date: formatYYYYMMDD(rd),
          views: scaleInt(pick.views || 0, days, monthlyRatio),
          likes: scaleInt(pick.likes || 0, days, monthlyRatio),
          comments: scaleInt(pick.comments || 0, days, monthlyRatio),
        });
      }
    }
    list = list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    return list;
  }, [baseRecords, startLabel, endLabel, days, monthlyRatio]);

  const channelColorMap = useMemo(() => {
    const m: Record<string, { color: string; name: string; category: string }> = {};
    baseChannels.forEach((c) => {
      m[c.id] = { color: c.color, name: c.name, category: c.category };
    });
    return m;
  }, [baseChannels]);

  const donutSegments = useMemo(
    () =>
      [...scaledChannels]
        .sort((a, b) => b.monthViews - a.monthViews)
        .slice(0, 6)
        .map((c) => ({ name: c.name, color: c.color, value: c.monthViews })),
    [scaledChannels],
  );

  /* 状态分布 */
  const statusCounts = useMemo(() => {
    const all = filteredRecords.length > 0 ? filteredRecords : baseRecords.slice(0, 10);
    const c: Record<string, number> = { published: 0, scheduled: 0, editing: 0, planning: 0, filming: 0 };
    all.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    const total = all.length || 1;
    const meta: Record<string, { label: string; color: string }> = {
      published: { label: '已发布', color: '#10b981' },
      scheduled: { label: '待发布', color: '#f59e0b' },
      editing: { label: '剪辑中', color: '#0ea5e9' },
      planning: { label: '策划中', color: '#64748b' },
      filming: { label: '拍摄中', color: '#8b5cf6' },
    };
    return Object.entries(meta).map(([k, m]) => ({
      key: k,
      label: m.label,
      color: m.color,
      count: c[k] || 0,
      pct: ((c[k] || 0) / total) * 100,
    }));
  }, [filteredRecords, baseRecords]);

  const shiftCustom = (dir: -1 | 1) => {
    const span = Math.max(1, days - 1);
    let s = parseYYYYMMDD(customStart);
    let e = parseYYYYMMDD(customEnd);
    if (dir > 0) {
      s = addDays(s, span);
      e = addDays(e, span);
    } else {
      s = addDays(s, -span);
      e = addDays(e, -span);
    }
    setCustomStart(formatYYYYMMDD(s));
    setCustomEnd(formatYYYYMMDD(e));
  };

  return (
    <div
      className="page-scroll"
      style={{
        padding: '20px 24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
      }}
    >
      {/* ═══════════════════ 演示模式 BIG 红色警告条（开着就永远抓不到真实数据！） ═══════════════════ */}
      {demoOn && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #fff7ed 0%, #fee2e2 60%, #fecaca 100%)',
            border: '1px solid #fb923c',
            boxShadow: '0 10px 28px rgba(239,68,68,0.12)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#dc2626',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
              boxShadow: '0 6px 16px rgba(220,38,38,0.35)',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#991b1b', marginBottom: 6 }}>
              🚨 当前【演示模式】已启用 —— 你看到的所有数据都是本地假数据，和你绑定的 9 个平台真实账号 **完全无关**！
            </div>
            <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.7 }}>
              演示模式（workbench.demoMode.override=1 / URL ?demo=1 / github.io 纯静态托管兜底）
              会在前端拦截所有 <code style={{ background:'rgba(220,38,38,0.08)', padding:'1px 6px', borderRadius:4 }}>/api/platforms/*</code> 请求，
              永远不会发往真实 Hono 后端，所以即使你 9 个平台已经全部「已连接✅」，调度器也只能用演示模式返回 mock。
              点击右侧按钮：关闭演示模式，清理拦截逻辑，立即重抓你绑定的真实账号数据。
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button
              className="btn btn-primary"
              style={{
                background: '#b91c1c',
                border: '1px solid #991b1b',
                color: '#fff',
                padding: '11px 20px',
                fontWeight: 800,
                fontSize: 13.5,
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 20px rgba(185,28,28,0.3)',
              }}
              onClick={() => {
                // 写 override=0（最高优先级）：github.io 也不自动启用演示模式
                setDemoMode(false);
                setDemoOn(false);
                clearBackendHealthCache();
                // 关闭后立刻重抓一次全平台 + 立刻重检后端健康
                void checkBackend(true);
                void syncNow({ trigger: 'manual', onlyLinked: true });
              }}
            >
              🔓 关闭演示模式 · 立刻重抓真实数据
            </button>
            <div style={{ fontSize: 11, color: '#b91c1c', textAlign: 'right', fontWeight: 600 }}>
              点击后会刷新 React Query cache，约 10 秒显示你真实数据
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ 真实后端未启动警告（仅当 demoOn=false 时显示；优先级低于演示模式） ═══════════════════ */}
      {!demoOn && !backendState.loading && backendState.ok === false && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 55%, #e0e7ff 100%)',
            border: '1px solid #60a5fa',
            boxShadow: '0 10px 28px rgba(37,99,235,0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#2563eb',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
              boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
            }}
          >
            <Server size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1e3a8a', marginBottom: 6 }}>
              ⚠️ 真实 Hono 后端未就绪 —— 9 平台请求只能降级示例数据，所以你看板看到的数据和你账号不一致！
            </div>
            <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.8, marginBottom: 10 }}>
              健康检查结果：<b style={{ color: '#b91c1c', background: '#fff1f2', padding: '2px 7px', borderRadius: 5 }}>{backendState.reason}</b>
              <br />
              你现在访问的是纯前端（Vite :5173），但真实抓取必须由 Hono 后端处理（绕过 9 平台 CORS / WebCrypto 凭据解密）。
              <b>本地启动方式：</b>打开一个新的终端标签，<code style={{ background: 'rgba(59,130,246,0.12)', padding: '2px 7px', borderRadius: 5 }}>cd upzhu-workbench</code>，运行下面的「一键启动后端」命令。
            </div>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 12.5,
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
              }}
            >
              <Terminal size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <div style={{ flex: 1, wordBreak: 'break-all' }}>
                $ cd upzhu-workbench &amp;&amp; npm run dev:server
              </div>
              <button
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: copied ? '#16a34a' : '#2563eb',
                  border: `1px solid ${copied ? '#16a34a' : '#2563eb'}`,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  flexShrink: 0,
                }}
                onClick={async () => {
                  const cmd = 'cd "/Users/menmingfeng/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/work-mode-projects/6a61aba1530a25ea2d39aa22/upzhu-workbench" && npm run dev:server';
                  try {
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(cmd);
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  } catch { /* noop */ }
                }}
              >
                {copied ? (<><Check size={14} /> 已复制 ✓</>) : (<><Copy size={14} /> 一键复制命令</>)}
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: '#334155', marginTop: 8, lineHeight: 1.7 }}>
              · 命令执行后终端会显示：<code style={{ background:'#f1f5f9', padding:'1px 6px', borderRadius:4 }}>Hono backend running at http://localhost:5174</code>（约 3 秒启动完成）
              <br />
              · 启动完成后，回到看板点下面的 <b style={{ color: '#2563eb' }}>「我已启动后端·立刻重检健康 + 重抓 9 平台」</b>按钮，或者等 30 秒看板自动重检。
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button
              className="btn btn-primary"
              style={{
                background: '#2563eb',
                border: '1px solid #1d4ed8',
                color: '#fff',
                padding: '11px 20px',
                fontWeight: 800,
                fontSize: 13,
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
              }}
              onClick={() => {
                clearBackendHealthCache();
                void checkBackend(true);
                void syncNow({ trigger: 'manual', onlyLinked: true });
              }}
            >
              ▶ 我已启动后端·立刻重检 + 重抓
            </button>
            <div style={{ fontSize: 11, color: '#1d4ed8', textAlign: 'right', fontWeight: 600 }}>
              启动 dev:server 后点此按钮，3 秒内后端就绪 + 10 秒内 9 平台真实数据同步
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ 同步警告列表（非致命错误但要告诉你） ═══════════════════ */}
      {snap?.warnings?.length ? (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 14,
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#92400e' }}>
            <Info className="icon-sm" />
            同步警告 {snap.warnings.length} 条（部分平台抓取失败，已自动降级示例数据展示）
          </div>
          {snap.warnings.slice(0, 6).map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: '#78350f', paddingLeft: 24, lineHeight: 1.7 }}>
              · <b style={{ color: '#92400e' }}>{w.platform}</b>：{w.message}
            </div>
          ))}
        </div>
      ) : null}

      {/* ═══════════════════ 顶部：时间范围控制 ═══════════════════ */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 18,
          padding: '12px 18px',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#1e3a8a 0%, #3b82f6 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(59,130,246,0.35)',
              flexShrink: 0,
            }}
          >
            <CalendarRange size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {label} · {days} 天
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#94a3b8',
                marginTop: 2,
                fontFamily: 'ui-monospace, Menlo, monospace',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span>{startLabel.slice(2)} → {endLabel.slice(2)} · {totals.accountCount} 渠道</span>
              {lastUpdatedAt && <span>更新：{new Date(lastUpdatedAt).toLocaleString('zh-CN', { hour12: false })}</span>}
              {dataSource && (
                <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(dataSource).map(([p, s]) => {
                    const style = getDataSourceStyle(s);
                    return (
                      <span
                        key={p}
                        title={`${p} → ${style.label}`}
                        style={{
                          display: 'inline-block',
                          padding: '1px 7px',
                          marginRight: 2,
                          borderRadius: 6,
                          background: style.bg,
                          color: style.color,
                          border: style.border,
                          fontWeight: 700,
                          fontSize: 10.5,
                        }}
                      >
                        {p}:{style.real ? '真' : style.tier === 'demo' ? '演示' : style.tier === 'warn' ? '降' : '示'}
                      </span>
                    );
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => syncNow({ trigger: 'manual', rangeStart: startLabel, rangeEnd: endLabel, onlyLinked: true })}
            disabled={isSyncing || demoOn}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              background: demoOn ? '#94a3b8' : '#dc2626',
              border: demoOn ? '1px solid #94a3b8' : '1px solid #dc2626',
              color: '#fff',
              fontWeight: 800,
              boxShadow: demoOn ? 'none' : '0 8px 22px rgba(220,38,38,0.25)',
            }}
            title={demoOn ? '演示模式已启用，先关闭演示模式才能重抓真实数据' : '强制绕过 1 分钟 staleTime，重新跑 9 平台全部抓取'}
          >
            <RefreshCw className={`icon-sm ${isSyncing ? 'spin' : ''}`} />
            {isSyncing ? '同步中…（9 平台抓取约 8~12 秒）' : '🔄 强制重抓全平台真实数据'}
          </button>
          <div
            style={{
              display: 'inline-flex',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 4,
              gap: 2,
            }}
          >
            {rangePresets.map((p) => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 9,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: preset === p.key ? 800 : 500,
                  background: preset === p.key ? '#ffffff' : 'transparent',
                  color: preset === p.key ? '#1e3a8a' : '#64748b',
                  boxShadow:
                    preset === p.key ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                  transition: 'all 120ms',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                background: '#fff',
              }}
            >
              <button
                onClick={() => shiftCustom(-1)}
                title="上一周期"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                }}
              >
                <ChevronLeft size={13} />
              </button>
              <CalendarDays size={13} style={{ color: '#64748b' }} />
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 12,
                  color: '#334155',
                  outline: 'none',
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: 10 }}>—</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 12,
                  color: '#334155',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => shiftCustom(1)}
                title="下一周期"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                }}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ 板块 1 ：经营总览 ═══════════════════ */}
      <section>
        <SectionHeader
          index="01"
          accent="linear-gradient(135deg,#1e40af,#3b82f6)"
          title="经营总览"
          desc="全平台核心指标，实时跟随上方时间范围"
          right={
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { k: '视频', n: 5, c: '#dbeafe', t: '#1e40af' },
                { k: '图文', n: 3, c: '#fef3c7', t: '#92400e' },
                { k: '播客', n: 2, c: '#ede9fe', t: '#5b21b6' },
              ].map((x) => (
                <span
                  key={x.k}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: x.c,
                    color: x.t,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {x.k} {x.n}
                </span>
              ))}
            </div>
          }
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {scaledKPIs.map((k) => {
            const Icon = kpiIconMap[k.label] || Users;
            const delUp = k.delta >= 0;
            return (
              <div
                key={k.label}
                style={{
                  background: '#ffffff',
                  border: '1px solid #eef2f7',
                  borderRadius: 14,
                  padding: '14px 14px 12px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: -14,
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: k.accent + '15',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {k.label.length > 11 ? k.label.slice(0, 10) + '…' : k.label}
                  </span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      background: k.accent + '14',
                      color: k.accent,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} />
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: k.accent,
                    lineHeight: 1.15,
                    marginTop: 8,
                    letterSpacing: -0.3,
                  }}
                >
                  {k.value}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 6,
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: 11,
                      fontWeight: 700,
                      color: delUp ? '#059669' : '#dc2626',
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: delUp ? '#d1fae5' : '#fee2e2',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {delUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {delUp ? '+' : ''}
                    {k.delta.toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
                    {k.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════ 板块 2 ：9 大渠道矩阵 ═══════════════════ */}
      <section>
        <SectionHeader
          index="02"
          accent="linear-gradient(135deg,#7c3aed,#a855f7)"
          title="渠道矩阵"
          desc={`全平台播放/阅读/收听合计 ${fmtWan(totalPlatformViews)}`}
          right={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 999,
                fontSize: 11,
                color: '#475569',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg,#1e3a8a,#3b82f6)',
                }}
              />
              按播放量排序 · 条形占比
            </div>
          }
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {scaledChannels
            .sort((a, b) => b.monthViews - a.monthViews)
            .map((c, idx) => {
              const pct = totalMaxViews > 0 ? (c.monthViews / totalMaxViews) * 100 : 0;
              const share = totalPlatformViews > 0 ? (c.monthViews / totalPlatformViews) * 100 : 0;
              const catStyle = CATEGORY_STYLE[c.category];
              return (
                <div
                  key={c.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #eef2f7',
                    borderRadius: 16,
                    padding: '14px 14px 12px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* 顶部彩色装饰条 */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${c.color} 0%, ${c.color}4D 100%)`,
                    }}
                  />
                  {/* ═══════════════════ ✅ 新增：数据源 mini pill（tile 右上角） ═══════════════════ */}
                  {(() => {
                    const { source, hits } = getChannelDataSourceTag(c);
                    const s = getDataSourceStyle(source);
                    const realCount = hits?.real?.length ?? 0;
                    const totalCount = 6;
                    const tooltip = hits
                      ? `真实接口: ${hits.real.join(',') || '(无)'}  Mock接口: ${hits.mock.join(',') || '(无)'}  演示拦截: ${hits.demo.join(',') || '(无)'}`
                      : s.label;
                    return (
                      <div
                        title={tooltip}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '2px 7px',
                          borderRadius: 8,
                          background: s.bg,
                          color: s.color,
                          border: s.border || '1px solid transparent',
                          fontSize: 9.5,
                          fontWeight: 800,
                          lineHeight: 1.3,
                          zIndex: 2,
                          maxWidth: 'calc(100% - 20px)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span style={{ fontSize: 10 }}>
                          {s.real ? '✅' : source === 'demo-mock' ? '⚠️' : source === 'mock-fallback' ? '⚠️' : '💡'}
                        </span>
                        <span>
                          {s.real
                            ? `真·${realCount}/${totalCount}`
                            : source === 'demo-mock'
                            ? '演示拦截'
                            : source === 'mock-fallback'
                            ? '真实失败·降级'
                            : '静态示例'}
                        </span>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: c.color,
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 15,
                        boxShadow: '0 4px 12px ' + c.color + '55',
                        flexShrink: 0,
                      }}
                    >
                      {platformIconMap[c.id]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {c.name}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: catStyle.bg,
                            color: catStyle.color,
                            flexShrink: 0,
                          }}
                        >
                          {c.category}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: '#94a3b8',
                          marginTop: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <span>粉丝 {fmtWan(c.totalFollowers)}</span>
                        <span style={{ color: c.color, fontWeight: 700 }}>
                          TOP {idx + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 大数字 */}
                  <div
                    style={{
                      marginTop: 12,
                      display: 'grid',
                      gridTemplateColumns: '1.3fr 1fr',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 12px',
                        background: c.color + '11',
                        border: '1px solid ' + c.color + '26',
                        borderRadius: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: '#64748b',
                          fontWeight: 600,
                        }}
                      >
                        本周期流量
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: c.color,
                          lineHeight: 1.15,
                          marginTop: 2,
                          letterSpacing: -0.3,
                        }}
                      >
                        {fmtWan(c.monthViews)}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: '#94a3b8',
                          marginTop: 2,
                          fontWeight: 600,
                        }}
                      >
                        占全网 {share.toFixed(1)}% · 互动率 {c.avgEngagementRate.toFixed(1)}%
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          padding: '6px 9px',
                          background: '#f8fafc',
                          border: '1px solid #eef2f7',
                          borderRadius: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: '#94a3b8',
                            fontWeight: 700,
                          }}
                        >
                          发布
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: '#0f172a',
                            lineHeight: 1.1,
                          }}
                        >
                          {c.monthPublished}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '6px 9px',
                          background: '#f8fafc',
                          border: '1px solid #eef2f7',
                          borderRadius: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: '#94a3b8',
                            fontWeight: 700,
                          }}
                        >
                          涨粉
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: '#059669',
                            lineHeight: 1.1,
                          }}
                        >
                          +{fmtWan(c.monthFollowersDelta)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 底部：点赞 / 评论 / 收入三行迷你进度条 */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      marginTop: 10,
                    }}
                  >
                    {[
                      { label: '点赞', value: c.monthLikes, max: 500000, c: '#f59e0b' },
                      { label: '评论', value: c.monthComments, max: 60000, c: '#0ea5e9' },
                      { label: '收入', value: c.monthRevenue, max: 700000, c: '#10b981' },
                    ].map((x) => {
                      const w = Math.max(1, (x.value / (x.max > 0 ? x.max : 1)) * 100);
                      return (
                        <div
                          key={x.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#64748b',
                              width: 26,
                              flexShrink: 0,
                            }}
                          >
                            {x.label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              background: '#f1f5f9',
                              borderRadius: 999,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: Math.min(100, w) + '%',
                                height: '100%',
                                background: x.c,
                                borderRadius: 999,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: x.c,
                              width: 46,
                              textAlign: 'right',
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {x.label === '收入'
                              ? fmtYuanShort(x.value)
                              : fmtWan(x.value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 渠道流量对比粗条 */}
                  <div style={{ marginTop: 10 }}>
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
                          width: pct + '%',
                          height: '100%',
                          background: `linear-gradient(90deg, ${c.color}, ${c.color}99)`,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ═══════════════════ 板块 3 ：趋势 & 结构 ═══════════════════ */}
      <section>
        <SectionHeader
          index="03"
          accent="linear-gradient(135deg,#0ea5e9,#22d3ee)"
          title="趋势 & 结构"
          desc={`近 ${trendDays.length} 天节奏 + TOP 渠道贡献多圆环`}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.45fr 1fr',
            gap: 14,
          }}
        >
          {/* 左：柱图 */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f7',
              borderRadius: 16,
              padding: '16px 18px 14px',
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
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#1e3a8a' + '12',
                    color: '#1e3a8a',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: '#1e3a8a',
                    }}
                  />
                  播放量
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#f59e0b' + '18',
                    color: '#92400e',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: '#f59e0b',
                    }}
                  />
                  点赞
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#10b981' + '16',
                    color: '#065f46',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: '#10b981',
                    }}
                  />
                  涨粉
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                }}
              >
                峰值 {fmtWan(trendMax)}
              </div>
            </div>
            <div
              style={{
                height: 240,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
                padding: '4px 2px 0',
                borderBottom: '1px dashed #e2e8f0',
              }}
            >
              {trendDays.map((d) => {
                const h1 = trendMax > 0 ? (d.views / trendMax) * 92 : 0;
                const h2 = trendMax > 0 ? (d.likes / trendMax) * 46 : 0;
                const h3 = trendMax > 0 ? (d.followers / trendMax) * 32 : 0;
                return (
                  <div
                    key={d.date}
                    title={`${d.date}　播放：${fmtInt(d.views)}\n点赞：${fmtInt(d.likes)}\n涨粉：+${fmtInt(d.followers)}`}
                    style={{
                      flex: 1,
                      minWidth: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 12,
                        height: h1 + '%',
                        background: 'linear-gradient(180deg,#1e3a8a,#3b82f6)',
                        borderRadius: '3px 3px 0 0',
                        minHeight: 2,
                      }}
                    />
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 12,
                        height: Math.max(2, h2) + '%',
                        background: 'linear-gradient(180deg,#d97706,#fbbf24)',
                        borderRadius: 2,
                        minHeight: 2,
                      }}
                    />
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 12,
                        height: Math.max(2, h3) + '%',
                        background: 'linear-gradient(180deg,#059669,#34d399)',
                        borderRadius: 2,
                        minHeight: 2,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: '#94a3b8',
                marginTop: 6,
                padding: '0 2px',
                fontFamily: 'ui-monospace, Menlo, monospace',
              }}
            >
              <span>{trendDays[0]?.date}</span>
              <span>{trendDays[Math.floor(trendDays.length / 2)]?.date}</span>
              <span>{trendDays[trendDays.length - 1]?.date}</span>
            </div>
          </div>

          {/* 右：多圆环 TOP 渠道占比 */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f7',
              borderRadius: 16,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                TOP 渠道贡献结构
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#1e3a8a',
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: '#1e3a8a' + '10',
                }}
              >
                占 总 流量
              </span>
            </div>
            <DonutChart segments={donutSegments} size={240} />
          </div>
        </div>
      </section>

      {/* ═══════════════════ 板块 4 ：发布节奏 ═══════════════════ */}
      <section>
        <SectionHeader
          index="04"
          accent="linear-gradient(135deg,#10b981,#22c55e)"
          title="发布节奏"
          desc="按状态分布 + 最新明细（倒序）"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.85fr 1.55fr',
            gap: 14,
          }}
        >
          {/* 左：状态分布堆叠条 */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f7',
              borderRadius: 16,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              状态分布
            </div>
            {/* 堆叠 100% 条 */}
            <div
              style={{
                display: 'flex',
                height: 26,
                borderRadius: 999,
                overflow: 'hidden',
                background: '#f8fafc',
                border: '1px solid #eef2f7',
              }}
            >
              {statusCounts.map((s) => (
                <div
                  key={s.key}
                  title={`${s.label} ${s.count} · ${s.pct.toFixed(1)}%`}
                  style={{
                    width: s.pct + '%',
                    background: s.color,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    display: s.pct > 10 ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label} {s.count}
                </div>
              ))}
            </div>
            {/* 状态卡片列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {statusCounts.map((s) => (
                <div
                  key={s.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: s.color + '10',
                    border: '1px solid ' + s.color + '26',
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: s.color,
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {s.count}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      flex: 1.2,
                      height: 6,
                      borderRadius: 999,
                      background: '#ffffff',
                      overflow: 'hidden',
                      border: '1px solid ' + s.color + '1F',
                    }}
                  >
                    <div
                      style={{
                        width: s.pct + '%',
                        height: '100%',
                        background: s.color,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: s.color,
                      width: 40,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {s.pct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 右：明细表 */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #eef2f7',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #eef2f7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                最新发布{' '}
                <span style={{ fontWeight: 500, color: '#94a3b8' }}>
                  · {filteredRecords.length}
                </span>
              </div>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                倒序
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 16px',
                        color: '#64748b',
                        fontWeight: 700,
                        width: 86,
                      }}
                    >
                      日期
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        color: '#64748b',
                        fontWeight: 700,
                        width: 84,
                      }}
                    >
                      渠道
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        color: '#64748b',
                        fontWeight: 700,
                      }}
                    >
                      标题
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '10px 16px',
                        color: '#64748b',
                        fontWeight: 700,
                        width: 80,
                      }}
                    >
                      流量
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '10px 14px',
                        color: '#64748b',
                        fontWeight: 700,
                        width: 66,
                      }}
                    >
                      互动率
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '10px 16px 10px 4px',
                        color: '#64748b',
                        fontWeight: 700,
                        width: 60,
                      }}
                    >
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 28,
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: 12,
                        }}
                      >
                        当前范围暂无记录
                      </td>
                    </tr>
                  )}
                  {filteredRecords.map((r) => {
                    const meta = channelColorMap[r.platform];
                    const eng = r.views
                      ? (((r.likes || 0) + (r.comments || 0)) / r.views) * 100
                      : 0;
                    return (
                      <tr
                        key={r.id}
                        style={{
                          borderTop: '1px solid #f1f5f9',
                          transition: 'background 120ms',
                        }}
                      >
                        <td
                          style={{
                            padding: '10px 16px',
                            fontFamily: 'ui-monospace, Menlo, monospace',
                            color: '#64748b',
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {r.date.slice(5)}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 8px',
                              borderRadius: 999,
                              background: (meta?.color || '#64748b') + '14',
                              color: meta?.color || '#64748b',
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 999,
                                background: meta?.color || '#64748b',
                              }}
                            />
                            {meta?.name || r.platform}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '10px 12px',
                            fontWeight: 700,
                            color: '#0f172a',
                            maxWidth: 260,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {r.title}
                        </td>
                        <td
                          style={{
                            padding: '10px 16px',
                            textAlign: 'right',
                            fontWeight: 800,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fmtWan(r.views || 0)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontWeight: 800,
                            color: eng >= 10 ? '#059669' : '#475569',
                          }}
                        >
                          {eng.toFixed(1)}%
                        </td>
                        <td style={{ padding: '10px 16px 10px 4px', textAlign: 'right' }}>
                          <StatusChip status={r.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
