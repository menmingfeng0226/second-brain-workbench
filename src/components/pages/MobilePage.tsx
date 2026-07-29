import { Search, PenLine, Upload, MessageCircle, Users, Home, FolderKanban, LayoutGrid, User, Calendar, Handshake, Lightbulb, Bell } from '@/components/icons';
import { projects, brandDeals, topics } from '../../data/mockData';

const BRAND_BLUE = '#1e40af';

export default function MobilePage() {
  const projectLatest = projects[0];
  const brandLatest = brandDeals.find((d) => d.status !== 'paid') || brandDeals[0];
  const topicLatest = topics.find((t) => t.status !== 'published') || topics[0];

  const todos = [
    {
      id: 'todo-1',
      source: '项目计划',
      icon: LayoutGrid,
      title: projectLatest.name,
      sub: `进度 ${projectLatest.progress}% · 截止 ${projectLatest.deadline}`,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      id: 'todo-2',
      source: '品牌合作',
      icon: Handshake,
      title: `${brandLatest.brand} · ${brandLatest.product}`,
      sub: `金额 ¥${brandLatest.value.toLocaleString()} · ${brandLatest.deadline}`,
      color: '#0ea5e9',
      bg: '#f0f9ff',
    },
    {
      id: 'todo-3',
      source: '选题库',
      icon: Lightbulb,
      title: topicLatest.title,
      sub: `${topicLatest.priority} · ${topicLatest.owner} · 截止 ${topicLatest.deadline}`,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
  ];

  const quickEntries = [
    { id: 'q1', label: '写脚本', icon: PenLine, color: '#1e40af', bg: '#eef2ff' },
    { id: 'q2', label: '上传素材', icon: Upload, color: '#10b981', bg: '#ecfdf5' },
    { id: 'q3', label: '查看评论', icon: MessageCircle, color: '#f59e0b', bg: '#fffbeb' },
    { id: 'q4', label: '团队消息', icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  const bottomNavs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'content', label: '内容', icon: FolderKanban },
    { id: 'workbench', label: '工作台', icon: LayoutGrid },
    { id: 'mine', label: '我的', icon: User },
  ];

  return (
    <div style={{ padding: '32px 16px', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: 380,
          background: '#111827',
          borderRadius: 48,
          padding: 14,
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            background: '#f5f6f8',
            borderRadius: 36,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: 760,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 28,
              background: '#111827',
              borderRadius: '0 0 18px 18px',
              zIndex: 10,
            }}
          />

          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #3b66e8 60%, #4a78f0 100%)`,
              padding: '48px 20px 22px',
              color: '#fff',
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
              <div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>早上好，晨枫</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                  晨枫暮叶工作台
                </div>
              </div>
              <Bell size={22} style={{ opacity: 0.9 }} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.22)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 12,
                padding: '9px 12px',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Search size={16} style={{ marginRight: 8, opacity: 0.9 }} />
              <input
                type="text"
                placeholder="搜索选题 / 脚本 / 卡片..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 0',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '14px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Calendar size={12} style={{ color: BRAND_BLUE }} />
                  本月发布
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: BRAND_BLUE,
                    lineHeight: 1,
                  }}
                >
                  18
                </div>
                <div style={{ fontSize: 10.5, color: '#10b981', marginTop: 6 }}>
                  ↑ 6.3% vs 上月
                </div>
              </div>

              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '14px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Users size={12} style={{ color: '#8b5cf6' }} />
                  新增粉丝
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#8b5cf6',
                    lineHeight: 1,
                  }}
                >
                  89K
                </div>
                <div style={{ fontSize: 10.5, color: '#ef4444', marginTop: 6 }}>
                  ↓ 3.1% vs 上月
                </div>
              </div>

              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '14px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Handshake size={12} style={{ color: '#f59e0b' }} />
                  营收
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#f59e0b',
                    lineHeight: 1,
                  }}
                >
                  128W
                </div>
                <div style={{ fontSize: 10.5, color: '#10b981', marginTop: 6 }}>
                  ↑ 18.5% vs 上月
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                marginBottom: 22,
              }}
            >
              {quickEntries.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      background: q.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: q.color,
                    }}
                  >
                    <q.icon size={22} />
                  </div>
                  <div style={{ fontSize: 11.5, color: '#374151', fontWeight: 500 }}>
                    {q.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>
                最近待办
              </div>
              <div style={{ fontSize: 12, color: BRAND_BLUE, fontWeight: 600 }}>
                全部
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todos.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    gap: 11,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: t.bg,
                      color: t.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <t.icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: t.color,
                        fontWeight: 600,
                        marginBottom: 3,
                      }}
                    >
                      {t.source}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1f2937',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {t.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        marginTop: 4,
                      }}
                    >
                      {t.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 24 }} />
          </div>

          <div
            style={{
              background: '#fff',
              borderTop: '1px solid #e8eaf0',
              padding: '10px 8px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
            }}
          >
            {bottomNavs.map((n, i) => {
              const isActive = i === 0;
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    color: isActive ? BRAND_BLUE : '#6b7280',
                    padding: '4px 0',
                  }}
                >
                  <n.icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {n.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
