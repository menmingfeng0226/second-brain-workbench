import { Wallet, Handshake, CreditCard, Users, Building2, Calendar, Clock, ArrowRight, User, Mail, DollarSign, FileText } from 'lucide-react';
import { brandDeals } from '../../data/mockData';
import type { BrandDeal, BrandDealStatus } from '../../types';

const BRAND_BLUE = '#1e40af';

const funnelConfig: { key: BrandDealStatus; label: string; icon: typeof Building2; color: string; bg: string }[] = [
  { key: 'lead', label: '线索', icon: Building2, color: '#6b7280', bg: '#f3f4f6' },
  { key: 'negotiating', label: '商洽', icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'signed', label: '签约', icon: FileText, color: '#2563eb', bg: '#eff6ff' },
  { key: 'delivered', label: '交付', icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
  { key: 'paid', label: '回款', icon: CreditCard, color: '#10b981', bg: '#ecfdf5' },
];

function formatValue(v: number) {
  if (v >= 10000) return `¥ ${(v / 10000).toFixed(0)}W`;
  return `¥ ${v.toLocaleString()}`;
}

export default function BrandPage() {
  const quarterValue = brandDeals.reduce((s, d) => s + d.value, 0);
  const inProgress = brandDeals.filter((d) => d.status !== 'paid' && d.status !== 'lead').length;
  const pendingReceived = brandDeals
    .filter((d) => d.status === 'signed' || d.status === 'delivered')
    .reduce((s, d) => s + d.value, 0);
  const closedCustomers = brandDeals.filter((d) => d.status === 'paid' || d.status === 'delivered' || d.status === 'signed').length;

  const kpis = [
    {
      id: 'k1',
      label: '本季度合作金额',
      value: formatValue(quarterValue),
      sub: '覆盖 5 家品牌',
      icon: Wallet,
      color: BRAND_BLUE,
      bg: '#eef2ff',
      trend: '+22.6%',
      trendUp: true,
    },
    {
      id: 'k2',
      label: '进行中合作数',
      value: inProgress,
      sub: '商洽 + 签约 + 交付',
      icon: Handshake,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      trend: '+2 项',
      trendUp: true,
    },
    {
      id: 'k3',
      label: '待回款金额',
      value: formatValue(pendingReceived),
      sub: '签约+交付未回款',
      icon: CreditCard,
      color: '#f59e0b',
      bg: '#fffbeb',
      trend: '尽快催款',
      trendUp: null,
    },
    {
      id: 'k4',
      label: '已成交客户数',
      value: closedCustomers,
      sub: '签约及以上阶段',
      icon: Users,
      color: '#10b981',
      bg: '#ecfdf5',
      trend: '+12.5%',
      trendUp: true,
    },
  ];

  const funnelCols = funnelConfig.map((c) => ({
    ...c,
    items: brandDeals.filter((d) => d.status === c.key),
    totalValue: brandDeals.filter((d) => d.status === c.key).reduce((s, d) => s + d.value, 0),
  }));

  function renderDealCard(d: BrandDeal) {
    const cfg = funnelConfig.find((f) => f.key === d.status)!;
    return (
      <div
        key={d.id}
        className="card"
        style={{
          background: '#fff',
          border: `1px solid ${cfg.bg}`,
          borderRadius: 12,
          padding: '12px 12px 11px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
          borderLeft: `3px solid ${cfg.color}`,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#1f2937',
            lineHeight: 1.35,
          }}
        >
          {d.brand}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: '#6b7280',
            fontWeight: 500,
          }}
        >
          {d.product}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: BRAND_BLUE,
              fontSize: 13.5,
            }}
          >
            {formatValue(d.value)}
          </span>
          <span
            className="badge"
            style={{
              fontSize: 10.5,
              padding: '2px 7px',
              borderRadius: 5,
              fontWeight: 600,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            {d.platform}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10.5,
            color: '#6b7280',
            gap: 6,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <User size={11} style={{ color: '#9ca3af' }} />
            {d.owner}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Calendar size={11} style={{ color: '#9ca3af' }} />
            {d.deadline.slice(5)}
          </div>
        </div>

        {d.note && (
          <div
            style={{
              fontSize: 10.5,
              color: '#475569',
              background: '#f8fafc',
              padding: '6px 8px',
              borderRadius: 7,
              lineHeight: 1.5,
            }}
          >
            {d.note}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="page-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#1f2937',
                letterSpacing: '-0.2px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Handshake size={24} style={{ color: BRAND_BLUE }} />
              品牌合作中心
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginTop: 5,
              }}
            >
              商机漏斗 · 合同跟进 · 回款管理 · 全流程可视化
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}
      >
        {kpis.map((k) => (
          <div
            key={k.id}
            className="stat-card"
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '16px 16px 15px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
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
              <div
                style={{
                  fontSize: 12.5,
                  color: '#6b7280',
                  fontWeight: 500,
                }}
              >
                {k.label}
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: k.bg,
                  color: k.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <k.icon size={17} />
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: k.color,
                lineHeight: 1,
                letterSpacing: '-0.3px',
              }}
            >
              {k.value}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
              }}
            >
              <span style={{ color: '#9ca3af' }}>{k.sub}</span>
              {k.trendUp !== null && (
                <span
                  style={{
                    fontWeight: 700,
                    color: k.trendUp ? '#10b981' : '#ef4444',
                  }}
                >
                  {k.trendUp ? '↑' : '↓'} {k.trend}
                </span>
              )}
              {k.trendUp === null && (
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                  {k.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FileText size={18} style={{ color: BRAND_BLUE }} />
            商机漏斗
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12.5,
              color: '#6b7280',
            }}
          >
            <span>线索</span>
            <ArrowRight size={13} style={{ color: '#9ca3af' }} />
            <span>商洽</span>
            <ArrowRight size={13} style={{ color: '#9ca3af' }} />
            <span>签约</span>
            <ArrowRight size={13} style={{ color: '#9ca3af' }} />
            <span>交付</span>
            <ArrowRight size={13} style={{ color: '#9ca3af' }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>回款</span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            alignItems: 'start',
          }}
        >
          {funnelCols.map((col, idx) => (
            <div
              key={col.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minWidth: 0,
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '12px 12px 11px',
                  borderRadius: 12,
                  background: col.bg,
                  border: `1px solid ${col.bg}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <col.icon size={14} style={{ color: col.color }} />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: col.color,
                      }}
                    >
                      {col.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff',
                      background: col.color,
                      padding: '2px 8px',
                      borderRadius: 999,
                    }}
                  >
                    {col.items.length}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: col.color,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {formatValue(col.totalValue)}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                  minHeight: 50,
                }}
              >
                {col.items.map((d) => renderDealCard(d))}
                {col.items.length === 0 && (
                  <div
                    style={{
                      padding: '28px 10px',
                      textAlign: 'center',
                      fontSize: 11.5,
                      color: '#9ca3af',
                      background: '#fff',
                      border: '1px dashed #e5e7eb',
                      borderRadius: 10,
                    }}
                  >
                    暂无
                  </div>
                )}
              </div>

              {idx < funnelCols.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    right: -8,
                    top: 56,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    border: `1px solid ${col.bg}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: col.color,
                    zIndex: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <ArrowRight size={10} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="section-title">
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Mail size={18} style={{ color: BRAND_BLUE }} />
            品牌商询价表单
          </div>
        </div>

        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1.5px dashed #c7d2fe',
            borderRadius: 16,
            padding: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -30,
              top: -30,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(30,64,175,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ gridColumn: '1 / -1', marginBottom: 2 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: '#eef2ff',
                  color: BRAND_BLUE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#1f2937',
                  }}
                >
                  收到新的品牌合作询价
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#6b7280',
                  }}
                >
                  以下是品牌方填写的基础需求信息
                </div>
              </div>
            </div>
          </div>

          {[
            { label: '品牌名称', value: '某新能源汽车品牌', icon: Building2, color: '#2563eb' },
            { label: '联系人 / 职位', value: '李经理 · BD 负责人', icon: User, color: '#8b5cf6' },
            { label: '合作预算（含税）', value: '¥ 500,000 - 800,000', icon: DollarSign, color: '#f59e0b' },
            { label: '期望发布日期', value: '2026-09-15 前后', icon: Calendar, color: '#10b981' },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                background: '#fff',
                border: '1px solid var(--border-light)',
                borderRadius: 12,
                padding: '12px 13px',
                display: 'flex',
                gap: 11,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: f.color + '15',
                  color: f.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <f.icon size={15} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#9ca3af',
                    fontWeight: 500,
                    marginBottom: 3,
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  {f.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
