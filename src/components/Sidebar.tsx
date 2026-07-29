import {
  Smartphone,
  Layout,
  Zap,
  Handshake,
  Settings,
  Flame,
  FolderKanban,
  PenLine,
  Diamond,
  Users,
  MessageSquare,
  MessageCircle,
  Lock,
  RefreshCw,
  BarChart3,
  CalendarDays,
  Lightbulb,
  FileText,
  Sparkles,
  BookOpen,
  Activity,
  FolderOpen,
  Target,
  Coins,
  Kanban,
  RotateCcw,
} from '@/components/icons';
import { navGroups } from '../data/mockData';
import { useWorkbench } from '../context/WorkbenchContext';

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  smartphone: Smartphone,
  layout: Layout,
  zap: Zap,
  handshake: Handshake,
  settings: Settings,
  flame: Flame,
  'folder-kanban': FolderKanban,
  'pen-line': PenLine,
  diamond: Diamond,
  users: Users,
  'bar-chart-3': BarChart3,
  'calendar-days': CalendarDays,
  lightbulb: Lightbulb,
  'file-text': FileText,
  sparkles: Sparkles,
  'book-open': BookOpen,
  activity: Activity,
  'folder-image': FolderOpen,
  target: Target,
  coins: Coins,
  kanban: Kanban,
  'rotate-ccw': RotateCcw,
  'message-circle': MessageCircle,
  'refresh-cw': RefreshCw,
  'message-square': MessageSquare,
  lock: Lock,
};

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function Sidebar({ activeId, onNavigate }: SidebarProps) {
  const {
    unreadFeedbackCount,
    pendingSyncCount,
    isPrivateMode,
    openTopbarDrawer,
    togglePrivateMode,
  } = useWorkbench();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-avatar">晨</div>
        <div className="user-info">
          <div className="user-name">晨枫暮叶</div>
          <div className="user-label">本地版</div>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="action-btn" onClick={() => openTopbarDrawer('feedback')}>
          <MessageSquare size={14} />
          <span>反馈</span>
          {unreadFeedbackCount > 0 ? (
            <span className="action-count">{unreadFeedbackCount}</span>
          ) : null}
        </button>
        <button
          className={`action-btn ${isPrivateMode ? 'action-active' : ''}`}
          onClick={togglePrivateMode}
        >
          <Lock size={14} />
          <span>私密</span>
        </button>
        <button className="action-btn" onClick={() => openTopbarDrawer('sync')}>
          <RefreshCw size={14} />
          <span>同步</span>
          {pendingSyncCount > 0 ? (
            <span className="action-count">{pendingSyncCount}</span>
          ) : null}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item, idx) => {
              const IconComp = iconMap[item.icon] || Diamond;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className="nav-index">{idx + 1}</span>
                  <IconComp size={18} className="nav-icon" />
                  <span className="nav-name">{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sync-info">
          <div className="sync-title">同步</div>
          <div className="sync-detail">暂无记录</div>
        </div>
      </div>
    </aside>
  );
}
