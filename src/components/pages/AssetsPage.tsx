import { useMemo, useState } from 'react';
import {
  FolderOpen,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Folder,
  Star,
  Tag,
  Search,
  Upload,
  CalendarDays,
  HardDrive,
} from 'lucide-react';
import { channels } from '../../data/mockData';
import type { ChannelPlatform } from '../../types';

type AssetType = 'image' | 'video' | 'audio' | 'doc';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  sizeKB: number;
  width?: number;
  height?: number;
  durationSec?: number;
  tags: string[];
  channel?: ChannelPlatform;
  favorite: boolean;
  createdAt: string;
  color: string;
  usedIn?: string;
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

const genAssets = (): Asset[] => {
  const types: AssetType[] = ['image', 'image', 'image', 'video', 'audio', 'doc', 'image', 'video'];
  const tagPool = ['封面', '内页', 'BGM', '片头', '片尾', '访谈', '空镜', '素材', '图表', '金句'];
  const namePool = [
    '年度封面-竖版',
    '开场片头-渐变',
    '商务背景-深色',
    '金句底图-暖调',
    '访谈录屏-第10期',
    'BGM-钢琴舒缓',
    '分镜表-情侣对谈',
    '数据图表-知识付费',
    '海报-线下沙龙',
    '转场动效-淡入',
    '口播底图-冷色',
    '思维导图-职业',
    '片尾鸣谢-横版',
    '音效-转场提示',
    '案例截图-竞品',
  ];
  const chIds: ChannelPlatform[] = [
    'bilibili',
    'xiaohongshu',
    'wechat-official',
    'douyin',
    'zhihu',
    'kuaishou',
    'wechat-video',
    'ximalaya',
    'xiaoyuzhou',
  ];
  const now = new Date('2026-07-24');
  return Array.from({ length: 24 }, (_, i) => {
    const t = types[i % types.length];
    const created = new Date(now.getTime() - Math.random() * 86400000 * 30);
    return {
      id: `a${i + 1}`,
      name: namePool[i % namePool.length] + (i >= namePool.length ? ` v${Math.floor(i / namePool.length) + 1}` : ''),
      type: t,
      sizeKB:
        t === 'video'
          ? 8000 + Math.floor(Math.random() * 120000)
          : t === 'audio'
            ? 3000 + Math.floor(Math.random() * 20000)
            : t === 'doc'
              ? 50 + Math.floor(Math.random() * 3000)
              : 200 + Math.floor(Math.random() * 8000),
      width: t === 'image' ? [1920, 1080, 1242, 2688][i % 4] : undefined,
      height: t === 'image' ? [1080, 1920, 1660, 1242][i % 4] : undefined,
      durationSec: t === 'video' ? 15 + Math.floor(Math.random() * 300) : t === 'audio' ? 60 + Math.floor(Math.random() * 480) : undefined,
      tags: Array.from(new Set([tagPool[i % tagPool.length], tagPool[(i + 3) % tagPool.length]])),
      channel: Math.random() > 0.35 ? chIds[i % chIds.length] : undefined,
      favorite: Math.random() > 0.75,
      createdAt: created.toISOString().slice(0, 10),
      color: COLORS[i % COLORS.length],
      usedIn: Math.random() > 0.5 ? `选题《${['职业与搞钱', '做自己', '关系与人际', '编辑部方法论'][i % 4]}》` : undefined,
    };
  });
};

const TOTAL_ASSETS = 256;

export default function AssetsPage() {
  const assets = useMemo(genAssets, []);
  const [activeType, setActiveType] = useState<AssetType | 'all'>('all');
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform | 'all'>('all');
  const [kw, setKw] = useState('');

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (activeType !== 'all' && a.type !== activeType) return false;
      if (activeChannel !== 'all' && a.channel !== activeChannel) return false;
      if (kw && !a.name.toLowerCase().includes(kw.toLowerCase())) return false;
      return true;
    });
  }, [activeType, activeChannel, kw, assets]);

  const kpi = useMemo(() => {
    const byType = {
      image: assets.filter((a) => a.type === 'image').length,
      video: assets.filter((a) => a.type === 'video').length,
      audio: assets.filter((a) => a.type === 'audio').length,
      doc: assets.filter((a) => a.type === 'doc').length,
    };
    const totalKB = assets.reduce((s, a) => s + a.sizeKB, 0);
    const fav = assets.filter((a) => a.favorite).length;
    return {
      total: TOTAL_ASSETS,
      byType,
      totalKB,
      fav,
    };
  }, [assets]);

  const typeMeta: Record<AssetType | 'all', { label: string; icon: any; color: string }> = {
    all: { label: '全部素材', icon: Folder, color: '#475569' },
    image: { label: '图片', icon: ImageIcon, color: '#6366f1' },
    video: { label: '视频', icon: Video, color: '#ef4444' },
    audio: { label: '音频', icon: Music, color: '#10b981' },
    doc: { label: '文档', icon: FileText, color: '#f59e0b' },
  };

  const fmtSize = (kb: number) => {
    if (kb >= 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(2)} GB`;
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };
  const fmtDur = (s?: number) => {
    if (!s) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}'${sec.toString().padStart(2, '0')}"` : `${sec}s`;
  };

  const totalKBAll = kpi.totalKB * (TOTAL_ASSETS / assets.length);

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 顶部：媒体渠道 */}
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderOpen size={14} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
            按媒体渠道筛选（9 大渠道）
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            当前 {filtered.length} · 共 {kpi.total} 个素材
          </span>
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
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 999,
                  border: isActive ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                  background: isActive ? `${p.color}12` : '#fff',
                  color: isActive ? p.color : '#475569',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 类型 Tab + 搜索 */}
      <div
        style={{
          marginBottom: 20,
          padding: 12,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(Object.keys(typeMeta) as Array<AssetType | 'all'>).map((t) => {
            const tm = typeMeta[t];
            const isActive = activeType === t;
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 10,
                  background: isActive ? tm.color : '#fff',
                  color: isActive ? '#fff' : tm.color,
                  border: isActive ? 'none' : `1px solid ${tm.color}33`,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <tm.icon size={13} />
                {tm.label}
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: 999,
                    background: isActive ? 'rgba(255,255,255,0.2)' : `${tm.color}15`,
                    fontSize: 10.5,
                    fontWeight: 700,
                  }}
                >
                  {t === 'all' ? TOTAL_ASSETS : kpi.byType[t]}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            minWidth: 220,
          }}
        >
          <Search size={13} style={{ color: '#94a3b8' }} />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜索素材名称 / 标签..."
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              flex: 1,
              background: 'transparent',
              color: '#0f172a',
            }}
          />
        </div>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff',
            border: 'none',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Upload size={13} />
          上传素材
        </button>
      </div>

      {/* KPI 5卡 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginBottom: 22,
        }}
      >
        {[
          { icon: FolderOpen, label: '素材总数', value: String(kpi.total), sub: '本地资源库', color: '#6366f1', bg: '#eef2ff' },
          { icon: HardDrive, label: '占用空间', value: fmtSize(Math.round(totalKBAll)), sub: '已索引', color: '#0ea5e9', bg: '#e0f2fe' },
          { icon: ImageIcon, label: '图片素材', value: String(Math.round(kpi.byType.image * (TOTAL_ASSETS / assets.length))), sub: '封面/分镜/配图', color: '#10b981', bg: '#dcfce7' },
          { icon: Video, label: '视频素材', value: String(Math.round(kpi.byType.video * (TOTAL_ASSETS / assets.length))), sub: '片段/转场/空镜', color: '#ef4444', bg: '#fef2f2' },
          { icon: Star, label: '收藏精选', value: String(Math.round(kpi.fav * (TOTAL_ASSETS / assets.length))), sub: '高频复用', color: '#f59e0b', bg: '#fffbeb' },
        ].map((k) => (
          <div
            key={k.label}
            className="card"
            style={{ padding: '16px 18px', background: '#fff', borderRadius: 14, border: '1px solid #e8eaf0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
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
                <k.icon size={16} />
              </div>
              <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500 }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 2 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 素材网格 */}
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e8eaf0',
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Folder size={15} style={{ color: '#6366f1' }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>素材缩略图列表</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#94a3b8' }}>共 {filtered.length} 条结果</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {filtered.map((a) => {
            const tm = typeMeta[a.type];
            return (
              <div
                key={a.id}
                style={{
                  borderRadius: 12,
                  border: '1px solid #e8eaf0',
                  overflow: 'hidden',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    aspectRatio: a.type === 'image' && a.width && a.height ? `${a.width}/${a.height}` : '4/3',
                    background: `linear-gradient(135deg, ${a.color}, ${a.color}99)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    position: 'relative',
                  }}
                >
                  <tm.icon size={32} style={{ opacity: 0.9, marginBottom: 6 }} />
                  <div style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 500 }}>
                    {a.type === 'image' && a.width ? `${a.width}×${a.height}` : fmtDur(a.durationSec)}
                  </div>
                  {a.favorite && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.35)',
                        color: '#fde047',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <Star size={12} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#0f172a',
                      marginBottom: 8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: '2px 7px',
                          borderRadius: 6,
                          background: `${tm.color}12`,
                          color: tm.color,
                          fontSize: 10.5,
                          fontWeight: 500,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                    {a.channel && (
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: 6,
                          background: `${channels.find((c) => c.id === a.channel)?.color}15`,
                          color: channels.find((c) => c.id === a.channel)?.color,
                          fontSize: 10.5,
                          fontWeight: 600,
                        }}
                      >
                        {channels.find((c) => c.id === a.channel)?.name}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      borderTop: '1px dashed #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HardDrive size={11} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 500 }}>
                        {fmtSize(a.sizeKB)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarDays size={11} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 500 }}>
                        {a.createdAt.slice(5)}
                      </span>
                    </div>
                  </div>
                  {a.usedIn && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '6px 8px',
                        borderRadius: 8,
                        background: '#f8fafc',
                        fontSize: 10.5,
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Tag size={10} />
                      关联：{a.usedIn}
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
