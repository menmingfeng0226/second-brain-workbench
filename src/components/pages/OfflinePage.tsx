import { useState } from 'react';
import { CalendarDays, Users, Wallet, MapPin, User, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { eventItems } from '../../data/mockData';

const fmt = (n: number) => new Intl.NumberFormat('zh-CN').format(n);

const tabs = [
  { id: 'upcoming', label: '即将开始' },
  { id: 'register', label: '报名中' },
  { id: 'done', label: '已完成' },
];

const typeStyle: Record<string, { color: string; bg: string }> = {
  共创会: { color: '#7c3aed', bg: '#ede9fe' },
  培训课: { color: '#0ea5e9', bg: '#e0f2fe' },
  粉丝见面会: { color: '#ec4899', bg: '#fce7f3' },
  商务活动: { color: '#f59e0b', bg: '#fef3c7' },
  线下沙龙: { color: '#10b981', bg: '#d1fae5' },
};

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  筹备中: { label: '筹备中', color: '#8b5cf6', bg: '#ede9fe' },
  报名中: { label: '报名中', color: '#2563eb', bg: '#dbeafe' },
  已截止: { label: '报名截止', color: '#f59e0b', bg: '#fef3c7' },
  已完成: { label: '已完成', color: '#6b7280', bg: '#f3f4f6' },
};

export default function OfflinePage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const today = new Date('2026-07-24');
  const yearEvents = eventItems.filter((e) => new Date(e.date).getFullYear() === today.getFullYear());
  const totalEvents = yearEvents.length;
  const totalAttendees = eventItems.reduce((s, e) => s + e.registered, 0);
  const totalRevenue = eventItems.reduce((s, e) => {
    if (e.fee.startsWith('¥')) {
      return s + e.registered * 299;
    }
    return s;
  }, 0);

  const filtered = eventItems.filter((e) => {
    const d = new Date(e.date);
    if (activeTab === 'done') return e.status === '已完成';
    if (activeTab === 'register') return e.status === '报名中';
    return (e.status === '筹备中' || e.status === '报名中' || e.status === '已截止') && d >= today;
  });

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>线下活动</h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>粉丝见面会、共创会、培训课等线下活动管理</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <div className="kpi-card card" style={{ padding: '18px 20px', borderRadius: 12, background: '#fff', border: '1px solid #e8eaf0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af' }}>
              <CalendarDays size={20} />
            </div>
            <span style={{ fontSize: 13, color: '#6b7280' }}>本年活动数</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{totalEvents} 场</div>
        </div>
        <div className="kpi-card card" style={{ padding: '18px 20px', borderRadius: 12, background: '#fff', border: '1px solid #e8eaf0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: 13, color: '#6b7280' }}>累计参与人次</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{fmt(totalAttendees)}</div>
        </div>
        <div className="kpi-card card" style={{ padding: '18px 20px', borderRadius: 12, background: '#fff', border: '1px solid #e8eaf0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Wallet size={20} />
            </div>
            <span style={{ fontSize: 13, color: '#6b7280' }}>活动收入（参考）</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>¥ {fmt(totalRevenue)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '2px solid #f0f2f5' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px',
              fontSize: 13.5,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? '#1e40af' : '#6b7280',
              background: activeTab === t.id ? 'rgba(30, 64, 175, 0.06)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #1e40af' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              borderRadius: '7px 7px 0 0',
            }}
          >
            {t.label}
            <span style={{ marginLeft: 6, fontSize: 11.5, fontWeight: 700, color: activeTab === t.id ? '#1e40af' : '#9ca3af', background: activeTab === t.id ? 'rgba(30, 64, 175, 0.1)' : '#f3f4f6', padding: '1px 7px', borderRadius: 999 }}>
              {filtered.length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map((e) => {
          const ts = typeStyle[e.type] || { color: '#6b7280', bg: '#f3f4f6' };
          const sb = statusBadge[e.status] || statusBadge['筹备中'];
          const capacityPct = Math.round((e.registered / e.capacity) * 100);
          const isFull = e.registered >= e.capacity;
          return (
            <div key={e.id} className="card" style={{ padding: 20, borderRadius: 12, background: '#fff', border: '1px solid #e8eaf0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, alignItems: 'start' }}>
                <div style={{ width: 110, flexShrink: 0 }}>
                  <div
                    className="badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '5px 12px',
                      borderRadius: 8,
                      background: ts.bg,
                      color: ts.color,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    {e.type}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>容量进度</div>
                  <div className="progress-bar" style={{ height: 8, borderRadius: 999, background: '#f0f2f5', overflow: 'hidden', marginBottom: 6 }}>
                    <div
                      className="progress-fill"
                      style={{
                        height: '100%',
                        width: `${capacityPct}%`,
                        borderRadius: 999,
                        background: isFull ? 'linear-gradient(90deg, #f97316, #dc2626)' : 'linear-gradient(90deg, #3b82f6, #1e40af)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isFull ? '#dc2626' : '#1e40af' }}>
                    {e.registered} / {e.capacity} 人
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.4 }}>{e.title}</h3>
                    <span className="badge" style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 7, background: sb.bg, color: sb.color }}>
                      {sb.label}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', fontSize: 13, color: '#4b5563', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarDays size={14} style={{ color: '#1e40af' }} />
                      <span>{e.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} style={{ color: '#1e40af' }} />
                      <span>{e.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} style={{ color: '#1e40af' }} />
                      <span>{e.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} style={{ color: '#1e40af' }} />
                      <span>主持：{e.host}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>
                      {e.fee}
                    </div>
                    {isFull && e.status === '报名中' && (
                      <span style={{ fontSize: 11.5, color: '#f97316', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={12} />
                        已满员
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  <button
                    style={{
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 9,
                      border: '1.5px solid #1e40af',
                      background: '#fff',
                      color: '#1e40af',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      transition: 'all 0.15s',
                    }}
                  >
                    查看详情
                    <ChevronRight size={14} />
                  </button>
                  <button
                    disabled={isFull || e.status === '已截止' || e.status === '已完成'}
                    style={{
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 9,
                      border: 'none',
                      background: isFull || e.status === '已截止' || e.status === '已完成' ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      color: isFull || e.status === '已截止' || e.status === '已完成' ? '#9ca3af' : '#fff',
                      cursor: isFull || e.status === '已截止' || e.status === '已完成' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      boxShadow: isFull || e.status === '已截止' || e.status === '已完成' ? 'none' : '0 4px 12px rgba(30, 64, 175, 0.25)',
                    }}
                  >
                    {isFull ? '已满员' : e.status === '已截止' ? '已截止' : e.status === '已完成' ? '已结束' : '一键报名'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', fontSize: 13, color: '#9ca3af', background: '#fff', borderRadius: 12, border: '1px dashed #e5e7eb' }}>
            暂无活动
          </div>
        )}
      </div>
    </div>
  );
}
