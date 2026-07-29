import { Briefcase, TrendingUp, AlertTriangle, CheckCircle, User, Calendar, Flag, DollarSign, Target } from '@/components/icons';
import { projects, teamMembers } from '../../data/mockData';
import type { Project, ProjectStatus } from '../../types';

const BRAND_BLUE = '#1e40af';

const ownerAvatarMap: Record<string, { color: string; letter: string }> = {};
teamMembers.forEach((m) => {
  ownerAvatarMap[m.name] = { color: m.avatarColor, letter: m.name.charAt(0) };
});

function getOwnerInfo(name: string) {
  if (ownerAvatarMap[name]) return ownerAvatarMap[name];
  return { color: '#6b7280', letter: name.charAt(0) };
}

const columnConfig: { key: ProjectStatus | 'delayed'; title: string; icon: typeof Briefcase; color: string; bg: string; lightBg: string }[] = [
  { key: 'on-track', title: '进行中', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff', lightBg: '#dbeafe' },
  { key: 'at-risk', title: '有风险', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', lightBg: '#fde68a' },
  { key: 'delayed', title: '已延期', icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', lightBg: '#fecaca' },
  { key: 'done', title: '已完成', icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', lightBg: '#a7f3d0' },
];

export default function ProjectPage() {
  const total = projects.length;
  const onTrackCount = projects.filter((p) => p.status === 'on-track').length;
  const atRiskCount = projects.filter((p) => p.status === 'at-risk').length;
  const delayedCount = projects.filter((p) => p.status === 'delayed').length;
  const doneCount = projects.filter((p) => p.status === 'done').length;

  const kpis = [
    { id: 'k1', label: '在管项目数', value: total, icon: Briefcase, color: BRAND_BLUE, bg: '#eef2ff', sub: '本期新增 2' },
    { id: 'k2', label: '进行中', value: onTrackCount + delayedCount, icon: TrendingUp, color: '#2563eb', bg: '#eff6ff', sub: 'on-track + delayed' },
    { id: 'k3', label: '有风险', value: atRiskCount, icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', sub: '需要立刻关注' },
    { id: 'k4', label: '已完成数', value: doneCount, icon: CheckCircle, color: '#10b981', bg: '#ecfdf5', sub: '本季度累计' },
  ];

  const columns = columnConfig.map((col) => ({
    ...col,
    items: projects.filter((p) => {
      if (col.key === 'delayed') return p.status === 'delayed';
      return p.status === col.key;
    }),
  }));

  function renderProjectCard(p: Project) {
    const owner = getOwnerInfo(p.owner);
    const doneMilestones = p.milestones.filter((m) => m.done).length;
    const totalMilestones = p.milestones.length;
    return (
      <div
        key={p.id}
        className="content-card"
        style={{
          borderTop: 'none',
          padding: '14px 14px 13px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.4,
              flex: 1,
            }}
          >
            {p.name}
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: owner.color,
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            title={p.owner}
          >
            {owner.letter}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: '#6b7280',
          }}
        >
          <User size={13} style={{ color: '#9ca3af' }} />
          <span style={{ fontWeight: 500 }}>{p.owner}</span>
          <span style={{ color: '#d1d5db', margin: '0 4px' }}>·</span>
          <DollarSign size={13} style={{ color: '#9ca3af' }} />
          <span>{p.budget}</span>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11.5,
              marginBottom: 6,
            }}
          >
            <span style={{ color: '#6b7280', fontWeight: 500 }}>整体进度</span>
            <span style={{ color: BRAND_BLUE, fontWeight: 700 }}>{p.progress}%</span>
          </div>
          <div
            style={{
              height: 7,
              background: '#eef0f4',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${p.progress}%`,
                background: `linear-gradient(90deg, ${BRAND_BLUE}, #4a78f0)`,
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#6b7280',
            }}
          >
            <Flag size={13} style={{ color: '#9ca3af' }} />
            <span>里程碑</span>
            <span
              style={{
                fontWeight: 700,
                color: '#374151',
                marginLeft: 2,
              }}
            >
              {doneMilestones}/{totalMilestones}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#6b7280',
            }}
          >
            <Calendar size={13} style={{ color: '#9ca3af' }} />
            <span>{p.deadline.slice(5)}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            paddingTop: 2,
          }}
        >
          {p.tags.map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: 5,
                fontSize: 10.5,
                fontWeight: 600,
                background: '#f1f5f9',
                color: '#475569',
              }}
            >
              {t}
            </span>
          ))}
        </div>
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
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#1f2937',
                letterSpacing: '-0.2px',
              }}
            >
              项目计划看板
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Target size={14} style={{ color: BRAND_BLUE }} />
              共 {total} 个项目 · 本季度冲刺中
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
                fontSize: 30,
                fontWeight: 800,
                color: k.color,
                lineHeight: 1,
                letterSpacing: '-0.5px',
              }}
            >
              {k.value}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            <Briefcase size={18} style={{ color: BRAND_BLUE }} />
            项目看板
          </div>
          <div style={{ fontSize: 12.5, color: '#6b7280' }}>
            按状态分组 · 拖拽顺序可调
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            alignItems: 'start',
          }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: col.bg,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <col.icon size={15} style={{ color: col.color }} />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: col.color,
                    }}
                  >
                    {col.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: col.color,
                    background: col.lightBg,
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  {col.items.length}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 60,
                }}
              >
                {col.items.map((p) => renderProjectCard(p))}
                {col.items.length === 0 && (
                  <div
                    style={{
                      padding: '32px 12px',
                      textAlign: 'center',
                      fontSize: 12,
                      color: '#9ca3af',
                      background: '#fff',
                      border: '1px dashed #e5e7eb',
                      borderRadius: 12,
                    }}
                  >
                    暂无项目
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
