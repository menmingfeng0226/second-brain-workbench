import { useMemo } from 'react';
import {
  Coins,
  TrendingUp,
  Receipt,
  Wallet,
  BarChart3,
  PieChart,
  CalendarDays,
} from 'lucide-react';
import { revenueItems, channels } from '../../data/mockData';
import type { RevenueCategory } from '../../types';

const fmt = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}w` : new Intl.NumberFormat('zh-CN').format(n);

const order: RevenueCategory[] = [
  '商单合作',
  '广告分成',
  '知识付费',
  '电商带货',
  '直播打赏',
  '粉丝会员',
  '周边产品',
  '其他',
];

const catColorMap: Record<RevenueCategory, string> = {
  商单合作: '#6366f1',
  广告分成: '#0ea5e9',
  知识付费: '#16a34a',
  电商带货: '#f59e0b',
  直播打赏: '#ec4899',
  粉丝会员: '#8b5cf6',
  周边产品: '#14b8a6',
  其他: '#94a3b8',
};

export default function RevenuePage() {
  const totals = useMemo(() => {
    const total = revenueItems.reduce((s, r) => s + r.amount, 0);
    const perCat = order.map((c) => ({
      cat: c,
      value: revenueItems.filter((r) => r.category === c).reduce((s, r) => s + r.amount, 0),
      color: catColorMap[c],
    }));
    const perCh = channels
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        color: ch.color,
        value: revenueItems.filter((r) => r.channel === ch.id).reduce((s, r) => s + r.amount, 0),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
    return { total, perCat, perCh };
  }, []);

  const maxCat = Math.max(...totals.perCat.map((p) => p.value), 1);
  const maxCh = Math.max(...totals.perCh.map((p) => p.value), 1);

  return (
    <div className="page" style={{ paddingTop: 20 }}>
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
            icon: Wallet,
            label: '累计总营收',
            value: `¥ ${fmt(totals.total)}`,
            delta: '+ 18.5%',
            color: '#16a34a',
            bg: '#dcfce7',
          },
          {
            icon: Coins,
            label: 'Top 品类占比',
            value: `${Math.round((totals.perCat[0].value / totals.total) * 100)}%`,
            delta: totals.perCat[0].cat,
            color: '#6366f1',
            bg: '#eef2ff',
          },
          {
            icon: Receipt,
            label: '交易笔数',
            value: String(revenueItems.length),
            delta: '已入账',
            color: '#0ea5e9',
            bg: '#e0f2fe',
          },
          {
            icon: TrendingUp,
            label: '客单均价',
            value: `¥ ${Math.round(totals.total / revenueItems.length)}`,
            delta: '较上月 +9%',
            color: '#f59e0b',
            bg: '#fef3c7',
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
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
              {k.value}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: k.color,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <TrendingUp size={12} />
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* 8 类收入堆叠柱 */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e8eaf0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: '#eef2ff',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={16} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  收入品类结构（8 类）
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>按收入类别金额分布</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {totals.perCat.map((p) => (
              <div key={p.cat}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11.5,
                    marginBottom: 5,
                    color: '#475569',
                  }}
                >
                  <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: p.color,
                      }}
                    />
                    {p.cat}
                  </span>
                  <span style={{ fontWeight: 800, color: p.color }}>
                    ¥ {fmt(p.value)}
                    <span style={{ color: '#94a3b8', fontWeight: 500, marginLeft: 6 }}>
                      {Math.round((p.value / totals.total) * 100)}%
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: '#f1f5f9',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(p.value / maxCat) * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${p.color}, #4f46e5)`,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 渠道饼图 */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e8eaf0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PieChart size={16} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  渠道收入分布
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>各渠道贡献占比</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'center' }}>
            <Pie channels={totals.perCh} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {totals.perCh.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: p.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: p.color,
                      }}
                    />
                    {p.name}
                  </span>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: '#f1f5f9',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(p.value / maxCh) * 100}%`,
                        background: p.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    ¥ {fmt(p.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 明细表 */}
      <div
        className="card"
        style={{
          padding: '14px 18px 18px',
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e8eaf0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 2px 14px',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            收入明细 · {revenueItems.length} 笔
          </div>
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            <Receipt size={12} style={{ display: 'inline', marginRight: 4 }} />
            最近 30 天入账
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 90px 110px 1fr auto auto',
            gap: 12,
            padding: '10px 14px',
            background: '#f8fafc',
            borderRadius: 10,
            marginBottom: 8,
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
          }}
        >
          <span><CalendarDays size={11} style={{ display: 'inline', marginRight: 4 }} />日期</span>
          <span>渠道</span>
          <span>类别</span>
          <span>备注</span>
          <span style={{ textAlign: 'right' }}>金额</span>
          <span style={{ width: 60 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {revenueItems.map((r) => {
            const col = catColorMap[r.category];
            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 90px 110px 1fr auto auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '11px 14px',
                  borderRadius: 10,
                  background: '#fff',
                  border: '1px solid #eef2f7',
                }}
              >
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  {r.date.slice(5)}
                </span>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: `${channels.find((c) => c.id === r.channel)?.color || '#ccc'}18`,
                    color: channels.find((c) => c.id === r.channel)?.color || '#475569',
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {channels.find((c) => c.id === r.channel)?.name || r.channel}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11.5,
                    color: col,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: col,
                    }}
                  />
                  {r.category}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {r.note || '—'}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#0f172a',
                    textAlign: 'right',
                  }}
                >
                  ¥ {fmt(r.amount)}
                </span>
                <button
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    borderRadius: 8,
                    background: '#f1f5f9',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#475569',
                    fontWeight: 600,
                  }}
                >
                  查看
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Pie({ channels }: { channels: { name: string; color: string; value: number }[] }) {
  const total = channels.reduce((s, c) => s + c.value, 0) || 1;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const R = 70;
  const r = 42;
  let acc = 0;
  const paths: { d: string; color: string; pct: string }[] = [];
  channels.forEach((c) => {
    const frac = c.value / total;
    const start = acc;
    const end = acc + frac;
    acc = end;
    const path = annulus(cx, cy, r, R, start, end);
    if (path) paths.push({ d: path, color: c.color, pct: `${Math.round(frac * 100)}%` });
  });
  const top = channels[0];
  return (
    <div style={{ position: 'relative' }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={R} fill="#f8fafc" />
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.92} />
        ))}
        <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#eef2f7" strokeWidth={2} />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
          Top 渠道
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: top?.color || '#0f172a',
            marginBottom: 2,
          }}
        >
          {top?.name}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
          {paths[0]?.pct || '0%'}
        </div>
      </div>
    </div>
  );
}

function annulus(
  cx: number,
  cy: number,
  r: number,
  R: number,
  start01: number,
  end01: number,
): string {
  if (end01 - start01 >= 1) {
    const outer = circle(cx, cy, R);
    const inner = circle(cx, cy, r);
    return outer + ' ' + inner;
  }
  const a0 = start01 * Math.PI * 2 - Math.PI / 2;
  const a1 = end01 * Math.PI * 2 - Math.PI / 2;
  const x0 = cx + R * Math.cos(a0);
  const y0 = cy + R * Math.sin(a0);
  const x1 = cx + R * Math.cos(a1);
  const y1 = cy + R * Math.sin(a1);
  const xi1 = cx + r * Math.cos(a1);
  const yi1 = cy + r * Math.sin(a1);
  const xi0 = cx + r * Math.cos(a0);
  const yi0 = cy + r * Math.sin(a0);
  const large = end01 - start01 > 0.5 ? 1 : 0;
  return [
    'M',
    x0,
    y0,
    'A',
    R,
    R,
    0,
    large,
    1,
    x1,
    y1,
    'L',
    xi1,
    yi1,
    'A',
    r,
    r,
    0,
    large,
    0,
    xi0,
    yi0,
    'Z',
  ].join(' ');
}

function circle(cx: number, cy: number, radius: number): string {
  return [
    'M',
    cx,
    cy - radius,
    'A',
    radius,
    radius,
    0,
    1,
    1,
    cx,
    cy + radius,
    'A',
    radius,
    radius,
    0,
    1,
    1,
    cx,
    cy - radius,
    'Z',
  ].join(' ');
}
