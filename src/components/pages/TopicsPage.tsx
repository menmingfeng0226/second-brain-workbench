import { FolderKanban, Calendar, User, Link2, Lightbulb, ClipboardList, Pencil, Camera, Scissors, Rocket, Archive } from '@/components/icons';
import { topics, topicCollections } from '../../data/mockData';
import type { TopicStatus, TopicPriority } from '../../types';

const statusColumns: { id: TopicStatus; label: string; icon: typeof Lightbulb; color: string; bg: string }[] = [
  { id: 'idea', label: '灵感', icon: Lightbulb, color: '#f59e0b', bg: '#fef3c7' },
  { id: 'planned', label: '已立项', icon: ClipboardList, color: '#8b5cf6', bg: '#ede9fe' },
  { id: 'scripting', label: '写脚本', icon: Pencil, color: '#6366f1', bg: '#e0e7ff' },
  { id: 'filming', label: '拍摄中', icon: Camera, color: '#0ea5e9', bg: '#e0f2fe' },
  { id: 'editing', label: '剪辑中', icon: Scissors, color: '#14b8a6', bg: '#ccfbf1' },
  { id: 'published', label: '已发布', icon: Rocket, color: '#22c55e', bg: '#dcfce7' },
  { id: 'archived', label: '已归档', icon: Archive, color: '#6b7280', bg: '#f3f4f6' },
];

const priorityStyle: Record<TopicPriority, { bg: string; color: string }> = {
  P0: { bg: '#fee2e2', color: '#dc2626' },
  P1: { bg: '#ffedd5', color: '#ea580c' },
  P2: { bg: '#f3f4f6', color: '#6b7280' },
};

export default function TopicsPage() {
  const getTopicsByStatus = (s: TopicStatus) => topics.filter((t) => t.status === s);

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>选题合集库</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>管理选题合集，追踪全流程进度</p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <FolderKanban size={16} style={{ color: '#1e40af' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>选题合集</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {topicCollections.map((col) => (
            <div key={col.id} className="card" style={{ padding: 18, borderRadius: 12, background: '#fff', border: '1px solid #e8eaf0', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${col.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: col.color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: col.color, background: `${col.color}14`, padding: '2px 8px', borderRadius: 999 }}>
                  {col.count} 题
                </span>
              </div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>{col.name}</h3>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{col.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ClipboardList size={16} style={{ color: '#1e40af' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>选题看板</span>
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>共 {topics.length} 题</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, alignItems: 'start' }}>
          {statusColumns.map((col) => {
            const list = getTopicsByStatus(col.id);
            return (
              <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: col.bg }}>
                  <col.icon size={15} style={{ color: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: col.color, background: '#fff', padding: '1px 7px', borderRadius: 999 }}>
                    {list.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
                  {list.map((t) => {
                    const ps = priorityStyle[t.priority];
                    return (
                      <div key={t.id} className="card" style={{ padding: 14, borderRadius: 10, background: '#fff', border: '1px solid #e8eaf0', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                          <span className="badge" style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: ps.bg, color: ps.color }}>
                            {t.priority}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', margin: '0 28px 6px 0', lineHeight: 1.5 }}>{t.title}</h4>
                        <p style={{ fontSize: 11.5, color: '#6b7280', margin: '0 0 10px', lineHeight: 1.55 }}>{t.hook}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 11, color: '#9ca3af' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <User size={11} />
                            <span>{t.owner}</span>
                          </div>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Calendar size={11} />
                            <span>{t.deadline.slice(5)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                          {t.tags.map((tag) => (
                            <span key={tag} className="tag" style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 5, background: '#f3f4f6', color: '#4b5563', fontWeight: 600 }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#1e40af', fontWeight: 600 }}>
                          <Link2 size={11} />
                          <span>{t.relatedCardIds.length} 张卡片</span>
                        </div>
                      </div>
                    );
                  })}
                  {list.length === 0 && (
                    <div style={{ padding: 30, textAlign: 'center', fontSize: 11.5, color: '#d1d5db', border: '1px dashed #e5e7eb', borderRadius: 10 }}>
                      暂无
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
