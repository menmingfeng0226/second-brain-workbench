import { Construction, ArrowLeft, Sparkles } from 'lucide-react';

interface Props {
  name: string;
}

export default function PlaceholderPage({ name }: Props) {
  return (
    <div className="placeholder-page" style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 32,
          background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #ddd6fe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1e40af',
          marginBottom: 28,
          boxShadow: '0 12px 40px rgba(30, 64, 175, 0.18)',
          position: 'relative',
        }}
      >
        <Construction size={68} strokeWidth={1.6} />
        <div
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          }}
        >
          <Sparkles size={18} />
        </div>
      </div>

      <h2
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: '#1f2937',
          margin: '0 0 12px',
          letterSpacing: -0.3,
          lineHeight: 1.3,
        }}
      >
        模块建设中：<span style={{ color: '#1e40af' }}>{name}</span>
      </h2>

      <p
        style={{
          maxWidth: 520,
          fontSize: 15,
          color: '#6b7280',
          lineHeight: 1.8,
          margin: '0 0 40px',
        }}
      >
        我们正在为这个模块注入灵魂，精心打磨每一个细节。
        <br />
        敬请期待更强大、更丝滑的功能体验…
      </p>

      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 26px',
          fontSize: 14,
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(30, 64, 175, 0.3)',
          transition: 'all 0.2s ease',
        }}
      >
        <ArrowLeft size={17} />
        返回首页
      </button>

      <div
        style={{
          marginTop: 52,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(200px, 240px))',
          gap: 16,
          width: '100%',
          maxWidth: 820,
        }}
      >
        {[
          { dot: '#1e40af', label: '功能设计', desc: '已完成需求调研与功能框架设计' },
          { dot: '#7c3aed', label: '开发中', desc: '工程师正在紧锣密鼓地编码实现' },
          { dot: '#10b981', label: '即将上线', desc: '预计很快与您见面，耐心等待哦' },
        ].map((f, i) => (
          <div
            key={i}
            className="card"
            style={{
              background: '#fff',
              border: '1px solid #e8eaf0',
              borderRadius: 14,
              padding: 20,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: 4,
                background: f.dot,
                marginBottom: 14,
              }}
            />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              {f.label}
            </div>
            <div style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.7 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
