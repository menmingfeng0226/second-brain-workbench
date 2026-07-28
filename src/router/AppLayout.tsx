import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SecondBrain from '@/components/SecondBrain';
import { WorkbenchProvider, useWorkbench } from '@/context/WorkbenchContext';
import {
  feedbacks as fbMock,
  syncQueue as sqMock,
  syncConflicts as scMock,
  syncVersions as svMock,
  syncLogs as slMock,
  navGroups,
} from '@/data/mockData';
import PlaceholderPage from '@/components/pages/PlaceholderPage';
import ViralArticlesPage from '@/components/pages/ViralArticlesPage';
import IdeasPage from '@/components/pages/IdeasPage';
import ScriptEditorPage from '@/components/pages/ScriptEditorPage';
import AIAssistPage from '@/components/pages/AIAssistPage';
import HotTrackPage from '@/components/pages/HotTrackPage';
import AssetsPage from '@/components/pages/AssetsPage';
import CompetitorsPage from '@/components/pages/CompetitorsPage';
import RevenuePage from '@/components/pages/RevenuePage';
import TaskBoardPage from '@/components/pages/TaskBoardPage';
import DailyReviewPage from '@/components/pages/DailyReviewPage';
import FeedbackPage from '@/components/pages/FeedbackPage';
import SyncPage from '@/components/pages/SyncPage';
import LabPage from '@/components/pages/LabPage';
import TopicsPage from '@/components/pages/TopicsPage';
import WritingPage from '@/components/pages/WritingPage';
import OfflinePage from '@/components/pages/OfflinePage';
import MobilePage from '@/components/pages/MobilePage';
import ProjectPage from '@/components/pages/ProjectPage';
import SkillsPage from '@/components/pages/SkillsPage';
import BrandPage from '@/components/pages/BrandPage';
import AdminPage from '@/components/pages/AdminPage';
import DashboardPage from '@/components/pages/DashboardPage';
import PublishCalendarPage from '@/components/pages/PublishCalendarPage';
import { useUiStore } from '@/store';
import '@/App.css';

const pageMetaMap: Record<string, { title: string; subtitle: string; badge?: string }> = {};
navGroups.forEach((g) => {
  g.items.forEach((item) => {
    switch (item.id) {
      case 'dashboard':
        pageMetaMap[item.id] = { title: '数据看板', subtitle: '9 大渠道经营数据 · 时间范围联动 · 趋势&结构可视化', badge: '9 渠道' };
        break;
      case 'calendar':
        pageMetaMap[item.id] = { title: '发布排期', subtitle: '月历视图排期 · 已发布/待发布/制作中 一眼掌握', badge: '2026 年 7 月' };
        break;
      case 'brand':
        pageMetaMap[item.id] = { title: '品牌合作', subtitle: '商业合作漏斗 · 线索 → 回款全流程数字化', badge: '5 个商机' };
        break;
      case 'project':
        pageMetaMap[item.id] = { title: '项目计划', subtitle: 'Q3 战略项目看板 · 里程碑追踪 · 预算与进度', badge: '4 个在管' };
        break;
      case 'ideas':
        pageMetaMap[item.id] = { title: '选题灵感库', subtitle: '灵感 → 调研 → 立项 → 排期的选题流水线', badge: '6 大来源' };
        break;
      case 'script':
        pageMetaMap[item.id] = { title: '脚本编辑器', subtitle: '三幕式结构 · 分镜大纲 · 卡片引用', badge: '4 份在写' };
        break;
      case 'ai':
        pageMetaMap[item.id] = { title: 'AI 辅助写作', subtitle: '标题生成 · 大纲扩展 · 文案润色', badge: 'AI Beta' };
        break;
      case 'writing':
        pageMetaMap[item.id] = { title: '写作室', subtitle: '脚本创作中心 · 引用第二大脑卡片', badge: '4 份在写' };
        break;
      case 'lab':
        pageMetaMap[item.id] = { title: '爆款视频', subtitle: '复盘历史表现 · 挖掘爆款因子 · 按渠道分类', badge: '9 渠道' };
        break;
      case 'articles':
        pageMetaMap[item.id] = { title: '爆款文章', subtitle: '长文/笔记 复盘 · 阅读率&完读率分析', badge: '9 渠道' };
        break;
      case 'topics':
        pageMetaMap[item.id] = { title: '选题合集库', subtitle: '灵感 → 立项 → 脚本 → 拍摄 → 剪辑 → 发布', badge: '6 大合集' };
        break;
      case 'hot-track':
        pageMetaMap[item.id] = { title: '热点追踪', subtitle: '多平台热榜聚合 · 热度趋势 · 关联选题生成', badge: '8 大源' };
        break;
      case 'assets':
        pageMetaMap[item.id] = { title: '素材管理', subtitle: '图片 / 视频 / 音频 素材库 · 标签分类 · 预览', badge: '256 个素材' };
        break;
      case 'competitors':
        pageMetaMap[item.id] = { title: '竞品监控', subtitle: '对标账号数据追踪 · 发布频率 · 内容策略对比', badge: '5 个账号' };
        break;
      case 'revenue':
        pageMetaMap[item.id] = { title: '收益统计', subtitle: '广告 / 商单 / 直播 / 知识付费 8 类收入汇总', badge: '8 类收入' };
        break;
      case 'taskboard':
        pageMetaMap[item.id] = { title: '任务看板', subtitle: '待办 / 进行中 / 阻塞 / 评审 / 完成 5 列流转', badge: '9 项在跑' };
        break;
      case 'daily':
        pageMetaMap[item.id] = { title: '每日回顾', subtitle: '随机展示卡片 · 间隔重复 · 灵感触发', badge: '今日 12 张' };
        break;
      case 'brain':
        pageMetaMap[item.id] = { title: '第二大脑', subtitle: '清洗源头统一登记 · 编辑去飞书七点半', badge: '259 张卡片' };
        break;
      case 'offline':
        pageMetaMap[item.id] = { title: '线下活动', subtitle: '沙龙 · 共创会 · 粉丝见面会 · 商务对接', badge: '6 场活动' };
        break;
      case 'mobile':
        pageMetaMap[item.id] = { title: '手机入口', subtitle: '随时随地管理工作台，iPhone 预览 + 跨设备同步', badge: '移动端' };
        break;
      case 'skills':
        pageMetaMap[item.id] = { title: 'Skills 管理', subtitle: 'AI 自动化技能库 · 一键触发 · 版本追踪', badge: '7 个技能' };
        break;
      case 'admin':
        pageMetaMap[item.id] = { title: '后台管理', subtitle: '经营数据看板 · 团队 KPI · 系统设置', badge: '6 人团队' };
        break;
      case 'feedback':
        pageMetaMap[item.id] = { title: '协作反馈与批注', subtitle: '行内批注 · @ 提及通知 · 状态流转 · 回复讨论', badge: '反馈 5 条' };
        break;
      case 'sync':
        pageMetaMap[item.id] = { title: '云同步控制台', subtitle: '同步队列 · 冲突处理 · 版本回溯 · 同步日志', badge: '3 待同步' };
        break;
      default:
        pageMetaMap[item.id] = { title: item.name, subtitle: '晨枫暮叶 · 自媒体本地工作台' };
    }
  });
});

function AppInnerLayout() {
  const navigate = useNavigate();
  const params = useParams();
  const activeNav = useUiStore((s) => s.activeNav);
  const setActiveNav = useUiStore((s) => s.setActiveNav);
  const { setNav } = useWorkbench();
  void params;

  const handleNavigate = useCallback(
    (target: string) => {
      if (target === activeNav) return;
      setActiveNav(target);
      setNav(target);
    },
    [setActiveNav, setNav, activeNav],
  );

  const meta = pageMetaMap[activeNav];

  const renderMainContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardPage />;
      case 'calendar':
        return <PublishCalendarPage />;
      case 'brain':
        return <SecondBrain />;
      case 'lab':
        return <LabPage />;
      case 'articles':
        return <ViralArticlesPage />;
      case 'topics':
        return <TopicsPage />;
      case 'writing':
        return <WritingPage />;
      case 'offline':
        return <OfflinePage />;
      case 'mobile':
        return <MobilePage />;
      case 'project':
        return <ProjectPage />;
      case 'skills':
        return <SkillsPage />;
      case 'brand':
        return <BrandPage />;
      case 'admin':
        return <AdminPage />;
      case 'ideas':
        return <IdeasPage />;
      case 'script':
        return <ScriptEditorPage />;
      case 'ai':
        return <AIAssistPage />;
      case 'hot-track':
        return <HotTrackPage />;
      case 'assets':
        return <AssetsPage />;
      case 'competitors':
        return <CompetitorsPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'taskboard':
        return <TaskBoardPage />;
      case 'daily':
        return <DailyReviewPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'sync':
        return <SyncPage />;
      default:
        return <PlaceholderPage name={meta?.title || '模块建设中'} />;
    }
  };

  void navigate;

  return (
    <div className="app-root">
      <Sidebar activeId={activeNav} onNavigate={handleNavigate} />
      <div className="app-main">
        <Header
          pageTitle={meta?.title || '工作台'}
          pageSubtitle={meta?.subtitle}
          pageBadge={meta?.badge}
        />
        <main className="app-content">{renderMainContent()}</main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <WorkbenchProvider
      initialFeedbacks={fbMock}
      initialSyncQueue={sqMock}
      initialSyncConflicts={scMock}
      initialSyncVersions={svMock}
      initialSyncLogs={slMock}
    >
      <AppInnerLayout />
    </WorkbenchProvider>
  );
}
