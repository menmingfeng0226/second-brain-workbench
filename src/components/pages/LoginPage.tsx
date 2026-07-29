import { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, Sparkles } from '@/components/icons';
import { useAuthStore } from '@/store';
import { isDemoModeEnabled, toggleDemoMode, setDemoMode } from '@/lib/demo-mode';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.error);

  const [username, setUsername] = useState('晨枫暮叶');
  const [password, setPassword] = useState('123456');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoModeState] = useState<boolean>(false);

  useEffect(() => {
    setDemoModeState(isDemoModeEnabled());
    const url = new URL(window.location.href);
    if (url.searchParams.get('demo') === '1' && !isDemoModeEnabled()) {
      const next = setDemoMode(true) ?? true;
      setDemoModeState(next);
    }
    if (!isDemoModeEnabled()) {
      // 默认自动启用演示模式，无需用户操作
      setDemoMode(true);
      setDemoModeState(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      const redirect = params.get('redirect') ?? '/app';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError((err as Error).message || '登录失败，请检查账号密码');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 40%, #f5f9ff 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ background: 'rgba(59, 130, 246, 0.18)' }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: 'rgba(37, 99, 235, 0.12)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-blue-100"
              style={{
                background: '#ffffff',
                boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.45), 0 2px 6px rgba(59, 130, 246, 0.08)',
              }}
            >
              <span
                className="text-3xl font-extrabold tracking-wide"
                style={{ color: '#2563eb' }}
              >
                晨
              </span>
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: '#1e40af' }}
            >
              晨枫暮叶
            </h1>
            <p
              className="text-sm"
              style={{ color: '#64748b' }}
            >
              自媒体本地工作台
            </p>
          </div>
          <p
            className="text-[15px] font-medium"
            style={{ color: '#334155' }}
          >
            登录以管理您的内容创作与经营数据
          </p>
        </div>

        <div
          className="rounded-3xl border border-blue-100/70 p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow:
              '0 25px 60px -20px rgba(37, 99, 235, 0.35), 0 6px 18px -6px rgba(37, 99, 235, 0.12)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: '#1e3a8a', letterSpacing: '0.01em' }}
              >
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: '#f8fbff',
                  border: '1.5px solid #dbeafe',
                  color: '#1e3a8a',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 4px rgba(59, 130, 246, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = '#f8fbff';
                  e.currentTarget.style.borderColor = '#dbeafe';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: '#1e3a8a', letterSpacing: '0.01em' }}
              >
                密码
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（默认 123456）"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#f8fbff',
                    border: '1.5px solid #dbeafe',
                    color: '#1e3a8a',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 4px rgba(59, 130, 246, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#f8fbff';
                    e.currentTarget.style.borderColor = '#dbeafe';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#93c5fd' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#93c5fd')}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {(error || authError) && (
              <div
                className="p-3.5 rounded-xl text-sm"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                }}
              >
                {error || authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1d4ed8 100%)',
                color: '#ffffff',
                boxShadow:
                  '0 10px 24px -8px rgba(37, 99, 235, 0.6), 0 2px 6px rgba(37, 99, 235, 0.2)',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 14px 30px -8px rgba(37, 99, 235, 0.7), 0 4px 10px rgba(37, 99, 235, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 10px 24px -8px rgba(37, 99, 235, 0.6), 0 2px 6px rgba(37, 99, 235, 0.2)';
              }}
              onMouseDown={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.99)';
                }
              }}
              onMouseUp={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  登录中...
                </>
              ) : (
                <>
                  <span>进入工作台</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 text-center" style={{ borderTop: '1px solid #e0efff' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>
              还没有账号？
              <Link
                to="/register"
                className="ml-1 font-bold transition-colors hover:underline underline-offset-4"
                style={{ color: '#2563eb' }}
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              const next = toggleDemoMode();
              setDemoModeState(next);
              if (next) {
                setUsername('晨枫暮叶');
                setPassword('123456');
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all"
            style={{
              background: demoMode
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              color: demoMode ? '#ffffff' : '#0369a1',
              boxShadow: demoMode
                ? '0 10px 24px -10px rgba(245, 158, 11, 0.65), 0 2px 6px rgba(245, 158, 11, 0.22)'
                : '0 4px 14px -4px rgba(56, 189, 248, 0.25)',
              border: demoMode ? '1px solid rgba(251, 191, 36, 0.45)' : '1px solid #bae6fd',
            }}
          >
            <Sparkles className="w-4 h-4" />
            {demoMode ? '演示模式：已启用（纯前端 Mock 数据，无需后端）' : '一键启用演示模式（推荐，无需后端即可体验完整功能）'}
          </button>
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: '#94a3b8' }}>
          演示账号：
          <code
            className="ml-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px]"
            style={{ background: '#ffffff', border: '1px solid #dbeafe', color: '#1e40af' }}
          >
            晨枫暮叶 / 123456
          </code>
        </p>
      </div>
    </div>
  );
}
