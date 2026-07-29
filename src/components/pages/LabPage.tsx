import { useMemo, useState } from 'react';
import {
  Play,
  ThumbsUp,
  Clock,
  TrendingUp,
  Flame,
  ExternalLink,
  Star,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from '@/components/icons';
import type { ChannelPlatform, VideoLab } from '../../types';
import { useWorkbench } from '../../context/WorkbenchContext';
import { useChannels, useVideoLabs } from '../../hooks/usePlatformData';

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'score90', label: '90 分以上' },
  { id: 'watchRate', label: '高完播' },
  { id: 'interact', label: '高互动' },
  { id: 'recent30', label: '近 30 天' },
];

const fmtNum = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1)}万` : new Intl.NumberFormat('zh-CN').format(n);

export default function LabPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');
  const [toast, setToast] = useState<{ type: 'idea' | 'fav'; title: string; action: string } | null>(null);
  const { toggleFavorite, isFavorite, createIdeaFromContent, navigate } = useWorkbench();
  const { videos: videoLabs, isSyncing, syncNow, lastUpdatedAt } = useVideoLabs();
  const { channels } = useChannels();

  const filtered = useMemo(() => {
    return videoLabs
      .filter((v) => {
        if (activeChannel !== 'all' && v.channel !== activeChannel) return false;
        if (activeTab === 'score90') return v.score >= 90;
        if (activeTab === 'watchRate') return v.watchRate >= 60;
        if (activeTab === 'interact') {
          const eng = ((v.likes + v.comments + v.shares) / Math.max(1, v.views)) * 100;
          return eng >= 4.5;
        }
        if (activeTab === 'recent30') {
          const d = new Date(v.date);
          const now = new Date();
          return (now.getTime() - d.getTime()) / 86400000 <= 30;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [activeChannel, activeTab, videoLabs]);

  const kpi = useMemo(() => {
    const totalViews = filtered.reduce((s, v) => s + v.views, 0);
    const highScoreCount = filtered.filter((v) => v.score >= 90).length;
    const avgWatchRate = filtered.length
      ? Math.round(filtered.reduce((s, v) => s + v.watchRate, 0) / filtered.length)
      : 0;
    const totalLikes = filtered.reduce((s, v) => s + v.likes, 0);
    const totalEng = filtered.reduce(
      (s, v) => s + v.likes + v.comments + v.shares + v.favorites,
      0,
    );
    const avgEng = totalViews ? ((totalEng / totalViews) * 100).toFixed(1) : '0.0';
    return { totalViews, highScoreCount, avgWatchRate, totalLikes, avgEng };
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

  const onToggleFav = (v: VideoLab) => {
    const key = `video:${v.id}` as const;
    toggleFavorite(key);
    showToast({
      type: 'fav',
      title: isFavorite(key) ? `已取消收藏《${v.title.slice(0, 14)}…》` : `已收藏《${v.title.slice(0, 14)}…》`,
      action: isFavorite(key) ? '撤销收藏' : '加入收藏夹',
    });
  };

  const onCreateIdea = (v: VideoLab) => {
    const r = createIdeaFromContent({
      kind: 'video',
      id: v.id,
      title: v.title,
      channel: v.channel,
      tags: v.tags,
      url: v.url,
      hook: `拆解${channelName(v.channel)}爆款视频「${v.title}」：${fmtNum(v.views)} 播放 / ${v.score} 分，把其中的钩子、结构、黄金 3 秒提炼成我们可复用的一条完整选题`,
    });
    showToast({
      type: 'idea',
      title: `已生成选题：${r.title.slice(0, 20)}${r.title.length > 20 ? '…' : ''}`,
      action: '前往选题灵感库',
    });
    setTimeout(() => navigate('ideas'), 650);
  };

  const onCardClick = (v: VideoLab) => {
    if ((window.event as MouseEvent | undefined)?.defaultPrevented) return;
    onOpen(v.url);
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
              background: 'linear-gradient(135deg,#ef4444,#f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Flame size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            按媒体渠道筛选（9 大渠道 · 点击任一卡片默认跳转原链接）
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8', marginRight: 8 }}>
            当前 {filtered.length} 条 · 共 {videoLabs.length} 条
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
          { icon: Play, label: '总播放量', value: fmtNum(kpi.totalViews), color: '#1e40af', bg: '#eef2ff' },
          { icon: ThumbsUp, label: '总点赞', value: fmtNum(kpi.totalLikes), color: '#dc2626', bg: '#fee2e2' },
          { icon: TrendingUp, label: '90+ 高分', value: String(kpi.highScoreCount), color: '#f59e0b', bg: '#fef3c7' },
          { icon: Clock, label: '平均完播', value: `${kpi.avgWatchRate}%`, color: '#16a34a', bg: '#dcfce7' },
          { icon: Sparkles, label: '平均互动率', value: `${kpi.avgEng}%`, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((k) => (
          <div
            key={k.label}
            className="kpi-card card"
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

      {/* 二级 Tab */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '2px solid #f0f2f5' }}>
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1e40af' : '#64748b',
                background: isActive ? 'rgba(30,64,175,0.06)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #1e40af' : '2px solid transparent',
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

      {/* 视频推荐卡片（2 列） */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((v) => {
          const engRate = (
            ((v.likes + v.comments + v.shares + v.favorites) / Math.max(1, v.views)) *
            100
          ).toFixed(1);
          const fav = isFavorite(`video:${v.id}`);
          return (
            <div
              key={v.id}
              onClick={() => onCardClick(v)}
              className="card"
              style={{
                padding: 18,
                borderRadius: 16,
                background: '#fff',
                border: '1px solid #e8eaf0',
                boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 14px 38px rgba(99,102,241,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 1px 3px rgba(15,23,42,0.05)';
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 18 }}>
                {/* 左侧封面 */}
                <div
                  style={{
                    borderRadius: 14,
                    background: v.cover,
                    position: 'relative',
                    aspectRatio: '4 / 3',
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
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.22)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                    }}
                  >
                    <Play size={20} fill="#fff" style={{ marginLeft: 3 }} />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      opacity: 0.92,
                      letterSpacing: '0.02em',
                    }}
                  >
                    视频封面
                  </div>
                  {/* 时长 + 完播 + 评分三标 */}
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
                      letterSpacing: '0.01em',
                    }}
                  >
                    {v.duration}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      padding: '3px 8px',
                      borderRadius: 7,
                      background:
                        v.score >= 95
                          ? 'linear-gradient(135deg,#16a34a,#10b981)'
                          : v.score >= 90
                            ? 'linear-gradient(135deg,#4f46e5,#6366f1)'
                            : 'linear-gradient(135deg,#f59e0b,#ef4444)',
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.01em',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                    }}
                  >
                    {v.score} 分 · 爆
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
                    完播 {v.watchRate}%
                  </div>
                </div>

                {/* 右侧信息区 */}
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
                        background: `${channelColor(v.channel)}14`,
                        color: channelColor(v.channel),
                        fontWeight: 700,
                        fontSize: 11.5,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: channelColor(v.channel) }} />
                      {channelName(v.channel)}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: 11.5,
                        fontWeight: 600,
                      }}
                    >
                      {v.zone}
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
                      {v.date.slice(5)}
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
                          background: `linear-gradient(135deg, ${channelColor(v.channel)}, #a78bfa)`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {v.author.slice(0, 1)}
                      </span>
                      {v.author}
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 15.5,
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: 0,
                      lineHeight: 1.55,
                      marginBottom: 14,
                      letterSpacing: '-0.005em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {v.title}
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
                      <Play size={14} />
                      播放量 {fmtNum(v.views)}
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
                        color: '#6d28d9',
                        fontSize: 13,
                        fontWeight: 700,
                        border: '1px solid #ddd6fe',
                      }}
                    >
                      <ThumbsUp size={14} />
                      点赞 {fmtNum(v.likes)}
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

                  {/* 话题标签 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                    {v.tags.map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11.5,
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: 600,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '14px 16px 2px',
                      margin: '0 -4px -4px',
                      borderRadius: '12px 12px 14px 14px',
                      background:
                        'linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(241,245,249,0.6) 100%)',
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
                          onOpen(v.url);
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
                          onToggleFav(v);
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
                            ? 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)'
                            : '#fff',
                          color: fav ? '#92400e' : '#6366f1',
                          border: fav
                            ? '1px solid #fbbf24'
                            : '1px solid #c7d2fe',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: fav
                            ? '0 4px 14px rgba(251,191,36,0.28)'
                            : '0 1px 2px rgba(99,102,241,0.06)',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                        }}
                      >
                        {fav ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Star size={14} />
                        )}
                        {fav ? '已收藏' : '收藏'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateIdea(v);
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
                            'linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%)',
                          color: '#fff',
                          border: 'none',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.transform = 'translateY(-1.5px)';
                          el.style.boxShadow = '0 8px 24px rgba(139,92,246,0.45)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.transform = 'none';
                          el.style.boxShadow = '0 4px 16px rgba(139,92,246,0.35)';
                        }}
                      >
                        <Lightbulb size={14} />
                        生成选题
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <Flame size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
          当前筛选条件下没有匹配的视频
        </div>
      )}
    </div>
  );
}
