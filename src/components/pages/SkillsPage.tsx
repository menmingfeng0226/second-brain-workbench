import { Plus, Zap, PenTool, Database, TrendingUp, Settings, User, Clock, BarChart3, Sparkles } from '@/components/icons';
import { skills } from '../../data/mockData';
import type { Skill } from '../../types';

const BRAND_BLUE = '#1e40af';

const categoryColorMap: Record<string, { color: string; bg: string; icon: typeof Zap }> = {
  '内容创作': { color: '#8b5cf6', bg: '#f5f3ff', icon: PenTool },
  '数据采集': { color: '#0ea5e9', bg: '#f0f9ff', icon: Database },
  '商业化': { color: '#f59e0b', bg: '#fffbeb', icon: TrendingUp },
  '运营工具': { color: '#10b981', bg: '#ecfdf5', icon: Settings },
};

const tabs = [
  { id: 'all', label: '全部', category: null as string | null },
  { id: 'content', label: '内容创作', category: '内容创作' },
  { id: 'data', label: '数据采集', category: '数据采集' },
  { id: 'biz', label: '商业化', category: '商业化' },
  { id: 'ops', label: '运营工具', category: '运营工具' },
];

const statusConfig: Record<Skill['status'], { label: string; color: string; bg: string }> = {
  active: { label: '已启用', color: '#10b981', bg: '#d1fae5' },
  draft: { label: '草稿', color: '#f59e0b', bg: '#fef3c7' },
  disabled: { label: '已停用', color: '#9ca3af', bg: '#f3f4f6' },
};

export default function SkillsPage() {
  const activeTabId = 'all';
  const activeTab = tabs.find((t) => t.id === activeTabId)!;
  const filtered = activeTab.category ? skills.filter((s) => s.category === activeTab.category) : skills;

  function renderSkillCard(s: Skill) {
    const cat = categoryColorMap[s.category] || {
      color: '#6b7280',
      bg: '#f3f4f6',
      icon: Zap,
    };
    const st = statusConfig[s.status];
    return (
      <div
        key={s.id}
        className="card"
        style={{
          background: '#fff',
          border: '1px solid var(--border-light)',
          borderRadius: 14,
          padding: 16,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 70,
            height: 70,
            background: cat.bg,
            borderRadius: '0 0 0 100%',
            opacity: 0.9,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 10,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: cat.bg,
              color: cat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 10px ${cat.bg}`,
            }}
          >
            <cat.icon size={20} />
          </div>
          <span
            className="badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 9px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: st.bg,
              color: st.color,
            }}
          >
            {st.label}
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginBottom: 3,
            }}
          >
            <div
              style={{
                fontSize: 15.5,
                fontWeight: 700,
                color: '#1f2937',
                letterSpacing: '-0.1px',
              }}
            >
              {s.name}
            </div>
            <span
              className="tag"
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: '#6b7280',
                background: '#f1f5f9',
                padding: '1px 6px',
                borderRadius: 5,
              }}
            >
              {s.version}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              color: '#6b7280',
            }}
          >
            <User size={12} style={{ color: '#9ca3af' }} />
            <span style={{ fontWeight: 500 }}>{s.author}</span>
            <span style={{ color: '#d1d5db', margin: '0 3px' }}>·</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px 7px',
                borderRadius: 5,
                fontSize: 10.5,
                fontWeight: 600,
                background: cat.bg,
                color: cat.color,
              }}
            >
              {s.category}
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: '#4b5563',
            lineHeight: 1.65,
            minHeight: 40,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {s.description}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTop: '1px solid var(--border-light)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: '#374151',
            }}
          >
            <BarChart3 size={13} style={{ color: BRAND_BLUE }} />
            <span style={{ fontWeight: 600, color: BRAND_BLUE }}>{s.usage}</span>
            <span style={{ color: '#6b7280' }}>次使用</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: '#9ca3af',
            }}
          >
            <Clock size={12} />
            {s.updatedAt.slice(5)}
          </div>
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
              <Sparkles size={24} style={{ color: BRAND_BLUE }} />
              Skills 管理中心
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                marginTop: 5,
              }}
            >
              共 {skills.length} 个自定义 Skill · 总调用次数 {skills.reduce((sum, s) => sum + s.usage, 0)} 次
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingBottom: 2,
          borderBottom: '2px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', gap: 2, marginBottom: -2 }}>
          {tabs.map((t) => {
            const isActive = t.id === activeTabId;
            const count = t.category ? skills.filter((s) => s.category === t.category).length : skills.length;
            return (
              <div
                key={t.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 6,
                  padding: '10px 18px 11px',
                  fontSize: 13.5,
                  color: isActive ? BRAND_BLUE : '#6b7280',
                  fontWeight: isActive ? 700 : 500,
                  borderBottom: `2px solid ${isActive ? BRAND_BLUE : 'transparent'}`,
                  marginBottom: -2,
                  borderRadius: '7px 7px 0 0',
                  background: isActive ? 'rgba(30,64,175,0.06)' : 'transparent',
                  cursor: 'default',
                }}
              >
                <span>{t.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 8px',
                    borderRadius: 999,
                    background: isActive ? BRAND_BLUE : '#eef0f4',
                    color: isActive ? '#fff' : '#6b7280',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 15px',
            borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND_BLUE}, #3b66e8)`,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'default',
            boxShadow: `0 4px 14px rgba(30,64,175,0.28)`,
          }}
        >
          <Plus size={16} />
          新建 Skill
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          alignContent: 'start',
        }}
      >
        {filtered.map((s) => renderSkillCard(s))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: '#9ca3af',
              background: '#fff',
              borderRadius: 12,
              border: '1px dashed #e5e7eb',
              fontSize: 14,
            }}
          >
            <Zap size={36} />
            <p>该分类下暂无 Skill</p>
          </div>
        )}
      </div>
    </div>
  );
}
