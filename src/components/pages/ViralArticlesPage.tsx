import { useMemo, useState } from 'react';
import {
  Eye,
  Heart,
  BookmarkPlus,
  Clock,
  TrendingUp,
  FileText,
  Sparkles,
  Award,
  ExternalLink,
  Star,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { ChannelPlatform, ArticleLab } from '../../types';
import { useWorkbench } from '../../context/WorkbenchContext';
import { useChannels, useArticleLabs } from '../../hooks/usePlatformData';

const fmtNum = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}万` : new Intl.NumberFormat('zh-CN').format(n);
const pct = (n: number) => `${n}%`;

const articleTabs = [
  { id: 'all', label: '全部' },
  { id: 'score90', label: '90 分以上' },
  { id: 'hot', label: '高传播' },
  { id: 'deep', label: '高完读' },
  { id: 'recent30', label: '近 30 天' },
];

const categoryList: Array<ArticleLab['category']> = [
  '干货',
  '科普',
  '情感',
  '职场',
  '生活方式',
  '商业评论',
  '故事',
];

export default function ViralArticlesPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState<ArticleLab['category'] | 'all'>('all');
  const [toast, setToast] = useState<{ type: 'idea' | 'fav'; title: string; action: string } | null>(null);
  const { toggleFavorite, isFavorite, createIdeaFromContent, navigate } = useWorkbench();
  const { articles: articleLabs, isSyncing, syncNow, lastUpdatedAt } = useArticleLabs();
  const { channels } = useChannels();

  const filtered = useMemo(() => {
    return articleLabs
      .filter((a) => {
        if (activeChannel !== 'all' && a.channel !== activeChannel) return false;
        if (activeCategory !== 'all' && a.category !== activeCategory) return false;
        if (activeTab === 'score90') return a.score >= 90;
        if (activeTab === 'hot') return a.shares + a.comments >= 10000;
        if (activeTab === 'deep') return a.readRate >= 75;
        if (activeTab === 'recent30') {
          const d = new Date(a.date);
          const now = new Date();
          return (now.getTime() - d.getTime()) / 86400000 <= 30;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [activeChannel, activeCategory, activeTab, articleLabs]);

  const kpi = useMemo(() => {
    const totalViews = filtered.reduce((s, a) => s + a.views, 0);
    const totalCollects = filtered.reduce((s, a) => s + a.collects, 0);
    const highScoreCount = filtered.filter((a) => a.score >= 90).length;
    const avgRead = filtered.length
      ? Math.round(filtered.reduce((s, a) => s + a.avgReadSeconds, 0) / filtered.length)
      : 0;
    const totalEng = filtered.reduce((s, a) => s + a.likes + a.comments + a.shares + a.collects, 0);
    const avgEng = totalViews ? ((totalEng / totalViews) * 100).toFixed(1) : '0.0';
    return { totalViews, totalCollects, highScoreCount, avgRead, avgEng };
  }, [filtered]);

  const channelColor = (id: ChannelPlatform) =>
    channels.find((c) => c.id === id)?.color || '#64748B';
  const channelName = (id: ChannelPlatform) =>
    channels.find((c) => c.id === id)?.name || id;

  const showToast = (t: NonNullable<typeof toast>) => {
    setToast(t);
    setTimeout(() => setToast(null), 2600);
  };

  const onOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const onToggleFav = (a: ArticleLab) => {
    const key = `article:${a.id}` as const;
    toggleFavorite(key);
    showToast({
      type: 'fav',
      title: isFavorite(key) ? `已取消收藏《${a.title.slice(0, 14)}…》` : `已收藏《${a.title.slice(0, 14)}…》`,
      action: isFavorite(key) ? '撤销收藏' : '加入收藏夹',
    });
  };

  const onCreateIdea = (a: ArticleLab) => {
    const r = createIdeaFromContent({
      kind: 'article',
      id: a.id,
      title: a.title,
      channel: a.channel,
      tags: a.tags,
      url: a.url,
      hook: `拆解${channelName(a.channel)}爆文「${a.title}」：${fmtNum(a.views)} 阅读 / ${a.score} 分 / ${a.readRate}% 完读率，还原它的标题钩子、开篇金句、论证结构`,
    });
    showToast({
      type: 'idea',
      title: `已生成选题：${r.title.slice(0, 20)}${r.title.length > 20 ? '…' : ''}`,
      action: '前往选题灵感库',
    });
    setTimeout(() => navigate('ideas'), 650);
  };

  return (
    <div className="page" style={{ paddingTop: 20, position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '12px 18px 12px 14px',
            borderRadius: 14,
            background:
              toast.type === 'idea'
                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                : 'linear-gradient(135deg,#f59e0b,#ef4444)',
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 12px 40px rgba(99,102,241,0.28)',
            cursor: toast.type === 'idea' ? 'pointer' : 'default',
            maxWidth: 460,
          }}
          onClick={() => {
            if (toast.type === 'idea') navigate('ideas');
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {toast.type === 'idea' ? <Sparkles size={14} /> : <Star size={14} fill="currentColor" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.4 }}>{toast.title}</div>
            <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>{toast.action}</div>
          </div>
          {toast.type === 'idea' && <ChevronRight size={16} />}
        </div>
      )}

      {/* 9 渠道分类 Tab */}
      <div
        style={{
          marginBottom: 22,
          padding: 12,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
            padding: '0 4px',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Sparkles size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            按媒体渠道筛选（9 大渠道 · 点击任一卡片默认跳转原链接）
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8', marginRight: 8 }}>
            当前 {filtered.length} 条 · 共 {articleLabs.length} 条
            {lastUpdatedAt ? ` · ${new Date(lastUpdatedAt).toLocaleTimeString('zh-CN', { hour12: false })}更新` : ''}
          </span>
          <button
            onClick={() => syncNow({ trigger: 'manual', platforms: activeChannel === 'all' ? undefined : [activeChannel] })}
            disabled={isSyncing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#1e3a8a',
              fontSize: 12,
              fontWeight: 600,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? '同步中' : '拉取最新'}
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {([
            { id: 'all' as const, name: '全部渠道', color: '#475569' },
            ...channels.map((c) => ({ id: c.id, name: c.name, color: c.color })),
          ]).map((p) => {
            const isActive = activeChannel === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveChannel(p.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 14px',
                  borderRadius: 999,
                  border: isActive ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                  background: isActive ? `${p.color}12` : '#fff',
                  color: isActive ? p.color : '#475569',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI 5 卡 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginBottom: 22,
        }}
      >
        {[
          { icon: Eye, label: '累计阅读', value: fmtNum(kpi.totalViews), color: '#1e40af', bg: '#eef2ff' },
          { icon: BookmarkPlus, label: '累计收藏', value: fmtNum(kpi.totalCollects), color: '#16a34a', bg: '#dcfce7' },
          { icon: Award, label: '90+ 爆文数', value: String(kpi.highScoreCount), color: '#f59e0b', bg: '#fef3c7' },
          { icon: Clock, label: '平均阅读时长', value: `${kpi.avgRead} s`, color: '#7c3aed', bg: '#f5f3ff' },
          { icon: Sparkles, label: '平均互动率', value: `${kpi.avgEng}%`, color: '#ec4899', bg: '#fdf2f8' },
        ].map((k) => (
          <div
            key={k.label}
            className="card"
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: '#fff',
              border: '1px solid #e8eaf0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: k.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: k.color,
                }}
              >
                <k.icon size={16} />
              </div>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* 二级 Tab + 分类 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 18,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f0f2f5' }}>
          {articleTabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 18px',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#7c3aed' : '#64748b',
                  background: isActive ? 'rgba(124,58,237,0.06)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                  marginBottom: -2,
                  cursor: 'pointer',
                  borderRadius: '7px 7px 0 0',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {([{ id: 'all' as const, label: '全类型' }, ...categoryList.map((c) => ({ id: c, label: c }))]).map(
            (c) => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    padding: '5px 13px',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#7c3aed' : '#64748b',
                    background: isActive ? '#f5f3ff' : '#f8fafc',
                    border: `1px solid ${isActive ? '#c4b5fd' : '#e2e8f0'}`,
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* 文章卡片（2 列） */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((a) => {
          const engRate = (
            ((a.likes + a.comments + a.shares + a.collects) / Math.max(1, a.views)) *
            100
          ).toFixed(1);
          const fav = isFavorite(`article:${a.id}`);
          return (
            <article
              key={a.id}
              onClick={() => onOpen(a.url)}
              className="card"
              style={{
                background: '#fff',
                border: '1px solid #e8eaf0',
                borderRadius: 16,
                padding: 18,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 14px 38px rgba(236,72,153,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 1px 3px rgba(15,23,42,0.05)';
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 18 }}>
                {/* 封面图 */}
                <div
                  style={{
                    borderRadius: 14,
                    background: a.coverImg,
                    position: 'relative',
                    aspectRatio: '3 / 4',
                    overflow: 'hidden',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.16)',
                    }}
                  >
                    <FileText size={20} strokeWidth={2.2} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.92 }}>
                    长文封面
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      bottom: 10,
                      padding: '3px 8px',
                      borderRadius: 7,
                      background: 'rgba(0,0,0,0.55)',
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    {fmtNum(a.words)} 字
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      padding: '3px 8px',
                      borderRadius: 7,
                      background:
                        a.score >= 95
                          ? 'linear-gradient(135deg,#16a34a,#10b981)'
                          : a.score >= 90
                            ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                            : 'linear-gradient(135deg,#f59e0b,#ef4444)',
                      fontSize: 10.5,
                      fontWeight: 800,
                      boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                    }}
                  >
                    {a.score} 分 · 爆
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      right: 10,
                      bottom: 10,
                      padding: '3px 8px',
                      borderRadius: 7,
                      background: 'rgba(0,0,0,0.55)',
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    完读 {a.readRate}%
                  </div>
                </div>

                {/* 右侧内容 */}
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: `${channelColor(a.channel)}14`,
                        color: channelColor(a.channel),
                        fontWeight: 700,
                        fontSize: 11.5,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: channelColor(a.channel) }} />
                      {channelName(a.channel)}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: '#f5f3ff',
                        color: '#6d28d9',
                        fontWeight: 600,
                        fontSize: 11.5,
                      }}
                    >
                      {a.zone}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: '#f1f5f9',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: 11.5,
                      }}
                    >
                      {a.category}
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: '#94a3b8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Clock size={12} />
                      {a.date.slice(5)}
                    </span>
                    <div style={{ flex: 1 }} />
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11.5,
                        color: '#64748b',
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${channelColor(a.channel)}, #ec4899)`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {a.author.slice(0, 1)}
                      </span>
                      {a.author}
                    </div>
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15.5,
                      fontWeight: 800,
                      lineHeight: 1.55,
                      color: '#0f172a',
                      marginBottom: 14,
                      letterSpacing: '-0.005em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {a.title}
                  </h3>

                  {/* 3 枚数据胶囊 */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                        color: '#3730a3',
                        fontSize: 13,
                        fontWeight: 700,
                        border: '1px solid #c7d2fe',
                      }}
                    >
                      <Eye size={14} />
                      阅读 {fmtNum(a.views)}
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
                        color: '#9d174d',
                        fontSize: 13,
                        fontWeight: 700,
                        border: '1px solid #f9a8d4',
                      }}
                    >
                      <Heart size={14} />
                      点赞 {fmtNum(a.likes)}
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
                        color: '#b45309',
                        fontSize: 13,
                        fontWeight: 700,
                        border: '1px solid #fde68a',
                      }}
                    >
                      <Sparkles size={14} />
                      互动率 {engRate}%
                    </div>
                  </div>

                  {/* 完读率进度条 */}
                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11.5,
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ color: '#64748b' }}>
                        <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                        完读率
                      </span>
                      <span style={{ color: '#7c3aed', fontWeight: 700 }}>{pct(a.readRate)}</span>
                    </div>
                    <div
                      className="progress-bar"
                      style={{ height: 7, borderRadius: 999, background: '#f0f2f5', overflow: 'hidden' }}
                    >
                      <div
                        className="progress-fill"
                        style={{
                          height: '100%',
                          width: `${a.readRate}%`,
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${a.cover}, #4f46e5)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 话题标签 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                    {a.tags.map((t: string) => (
                      <span
                        key={t}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 600,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* 三操作按钮 */}
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '14px 16px 2px',
                      margin: '0 -4px -4px',
                      borderRadius: '12px 12px 14px 14px',
                      background:
                        'linear-gradient(180deg, rgba(253,242,248,0) 0%, rgba(253,242,248,0.5) 100%)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(a.url);
                        }}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 12px',
                          borderRadius: 11,
                          background: '#fff',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.background = '#f1f5f9';
                          el.style.borderColor = '#cbd5e1';
                          el.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.background = '#fff';
                          el.style.borderColor = '#e2e8f0';
                          el.style.transform = 'none';
                        }}
                      >
                        <ExternalLink size={14} />
                        打开链接
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFav(a);
                        }}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 12px',
                          borderRadius: 11,
                          background: fav
                            ? 'linear-gradient(135deg,#dcfce7 0%,#86efac 100%)'
                            : '#fff',
                          color: fav ? '#166534' : '#16a34a',
                          border: fav ? '1px solid #22c55e' : '1px solid #86efac',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: fav
                            ? '0 4px 14px rgba(34,197,94,0.28)'
                            : '0 1px 2px rgba(22,163,74,0.06)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                        }}
                      >
                        {fav ? <CheckCircle2 size={14} /> : <Star size={14} />}
                        {fav ? '已收藏' : '收藏'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateIdea(a);
                        }}
                        style={{
                          flex: 1.15,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 12px',
                          borderRadius: 11,
                          background:
                            'linear-gradient(135deg,#ec4899 0%,#a855f7 100%)',
                          color: '#fff',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: '0 4px 16px rgba(236,72,153,0.35)',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.transform = 'translateY(-1.5px)';
                          el.style.boxShadow = '0 8px 24px rgba(236,72,153,0.45)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.transform = 'none';
                          el.style.boxShadow = '0 4px 16px rgba(236,72,153,0.35)';
                        }}
                      >
                        <Lightbulb size={14} />
                        生成选题
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 14,
            background: '#fff',
            border: '1px dashed #e2e8f0',
            borderRadius: 14,
            marginTop: 8,
          }}
        >
          <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          当前筛选条件下没有匹配的爆文
        </div>
      )}
    </div>
  );
}
