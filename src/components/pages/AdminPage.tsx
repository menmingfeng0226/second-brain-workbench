import {
  Wallet,
  Video,
  UserPlus,
  Users,
  Target,
  Settings,
  Shield,
  Database,
  Globe2,
  Key,
  ArrowUp,
  ArrowDown,
  Sliders,
  Calendar,
  CheckSquare,
  BarChart3,
} from 'lucide-react';
import { backendMetrics, teamMembers } from '../../data/mockData';

const BRAND_BLUE = '#1e40af';

const metricIconMap: Record<string, typeof Wallet> = {
  wallet: Wallet,
  video: Video,
  'user-plus': UserPlus,
  handshake: Wallet,
  users: Users,
  target: Target,
};

const quickSettings = [
  { id: 's1', label: '系统参数', desc: '全局配置、通知设置、默认参数', icon: Sliders, color: '#2563eb', bg: '#eff6ff' },
  { id: 's2', label: '权限管理', desc: '角色、成员权限、访问控制', icon: Shield, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 's3', label: '数据备份', desc: '自动备份、快照恢复、导出', icon: Database, color: '#10b981', bg: '#ecfdf5' },
  { id: 's4', label: '自定义域名', desc: '绑定域名、SSL 证书、CDN', icon: Globe2, color: '#f59e0b', bg: '#fffbeb' },
  { id: 's5', label: 'API 密钥管理', desc: '生成、吊销、限制调用来源', icon: Key, color: '#ef4444', bg: '#fef2f2' },
];

export default function AdminPage() {
  return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 26 }}>
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
              <Settings size={24} style={{ color: BRAND_BLUE }} />
              后台管理中心
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginTop: 5,
              }}
            >
              运营指标概览 · 团队绩效 · 系统配置入口
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
        }}
      >
        {backendMetrics.map((m) => {
          const Icon = metricIconMap[m.icon] || Target;
          const deltaUp = m.trend === 'up' || m.delta >= 0;
          return (
            <div
              key={m.label}
              className="stat-card"
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '16px 16px 15px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 11,
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
                    gap: 9,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: deltaUp ? '#ecfdf5' : '#fef2f2',
                      color: deltaUp ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#374151',
                      fontWeight: 600,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: '3px 9px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: deltaUp ? '#d1fae5' : '#fee2e2',
                    color: deltaUp ? '#059669' : '#dc2626',
                  }}
                >
                  {deltaUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {Math.abs(m.delta)}%
                  <span style={{ fontWeight: 500, marginLeft: 2 }}>vs 上月</span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#1f2937',
                  lineHeight: 1,
                  letterSpacing: '-0.4px',
                }}
              >
                {m.value}
              </div>
            </div>
          );
        })}
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
            <Users size={18} style={{ color: BRAND_BLUE }} />
            团队成员看板
          </div>
          <div style={{ fontSize: 12.5, color: '#6b7280' }}>
            共 {teamMembers.length} 名成员 · 平均 KPI {Math.round(teamMembers.reduce((s, m) => s + m.kpi, 0) / teamMembers.length)}%
          </div>
        </div>

        <div
          className="card"
          style={{
            background: '#fff',
            border: '1px solid var(--border-light)',
            borderRadius: 14,
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1.6fr 2fr 1fr 1fr 1.1fr',
              gap: 12,
              padding: '12px 18px',
              background: '#f8fafc',
              borderBottom: '1px solid var(--border-light)',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            <div>成员</div>
            <div>角色</div>
            <div>工作量</div>
            <div style={{ textAlign: 'center' }}>任务数</div>
            <div style={{ textAlign: 'center' }}>KPI 达成</div>
            <div style={{ textAlign: 'right' }}>加入日</div>
          </div>

          <div>
            {teamMembers.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.6fr 2fr 1fr 1fr 1.1fr',
                  gap: 12,
                  padding: '14px 18px',
                  alignItems: 'center',
                  borderBottom: idx === teamMembers.length - 1 ? 'none' : '1px solid var(--border-light)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: m.avatarColor,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 2px 8px ${m.avatarColor}30`,
                    }}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#1f2937',
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        marginTop: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <BarChart3 size={10.5} />
                      ID · {m.id.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    className="tag"
                    style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: 7,
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {m.role}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 11.5,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 500 }}>当前负载</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: m.workload > 90 ? '#ef4444' : m.workload > 80 ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {m.workload}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: '#eef0f4',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${m.workload}%`,
                        background: `linear-gradient(90deg, ${
                          m.workload > 90 ? '#ef4444' : m.workload > 80 ? '#f59e0b' : '#10b981'
                        }, ${m.workload > 90 ? '#f87171' : m.workload > 80 ? '#fbbf24' : '#34d399'})`,
                        borderRadius: 999,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <CheckSquare size={14} style={{ color: BRAND_BLUE }} />
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#1f2937',
                    }}
                  >
                    {m.tasksDone}
                  </span>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 800,
                      background: m.kpi >= 100 ? '#d1fae5' : m.kpi >= 90 ? '#dbeafe' : '#fef3c7',
                      color: m.kpi >= 100 ? '#059669' : m.kpi >= 90 ? '#2563eb' : '#d97706',
                    }}
                  >
                    {m.kpi}%
                  </span>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4,
                    fontSize: 12,
                    color: '#6b7280',
                    fontWeight: 500,
                  }}
                >
                  <Calendar size={12} style={{ color: '#9ca3af' }} />
                  {m.joinedAt}
                </div>
              </div>
            ))}
          </div>
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
            <Sliders size={18} style={{ color: BRAND_BLUE }} />
            快捷设置
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
          }}
        >
          {quickSettings.map((s, idx) => (
            <div
              key={s.id}
              className="card"
              style={{
                background: '#fff',
                border: '1px solid var(--border-light)',
                borderRadius: 14,
                padding: '16px 16px 15px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'default',
                transition: 'all 0.2s ease',
                gridColumn: idx === quickSettings.length - 1 ? '1 / -1' : undefined,
                maxWidth: idx === quickSettings.length - 1 ? 'calc(50% - 7px)' : undefined,
                margin: idx === quickSettings.length - 1 ? '0 auto 0 0' : undefined,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: s.bg,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 2px 10px ${s.bg}`,
                }}
              >
                <s.icon size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: 3,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#6b7280',
                    lineHeight: 1.5,
                  }}
                >
                  {s.desc}
                </div>
              </div>
              <div
                style={{
                  color: '#9ca3af',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
