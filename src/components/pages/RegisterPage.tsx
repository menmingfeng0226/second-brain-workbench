import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPwd) {
      setError('两次输入的密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      await register(username.trim(), password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError((err as Error).message || '注册失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const pwdStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
  })();

  const strengthColors = ['#e2e8f0', '#f87171', '#fb923c', '#facc15', '#22c55e'];
  const strengthLabels = ['', '弱', '一般', '良好', '强'];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #f0f7ff 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ background: 'rgba(37, 99, 235, 0.16)' }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[560px] h-[560px] rounded-full blur-3xl"
          style={{ background: 'rgba(59, 130, 246, 0.12)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-blue-100"
              style={{
                background: '#ffffff',
                boxShadow:
                  '0 10px 30px -10px rgba(37, 99, 235, 0.45), 0 2px 6px rgba(37, 99, 235, 0.08)',
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
              创建账号
            </h1>
            <p
              className="text-sm"
              style={{ color: '#64748b' }}
            >
              开启自媒体内容经营之旅
            </p>
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="至少 2 个字符"
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
                  placeholder="至少 6 位，建议字母+数字"
                  autoComplete="new-password"
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
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{
                          background:
                            i < pwdStrength ? strengthColors[pwdStrength] : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-[11px]"
                    style={{ color: '#64748b' }}
                  >
                    密码强度：
                    <span className="font-semibold" style={{ color: '#1e40af' }}>
                      {strengthLabels[pwdStrength] || '输入中'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2"
                style={{ color: '#1e3a8a', letterSpacing: '0.01em' }}
              >
                确认密码
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="再次输入密码"
                autoComplete="new-password"
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

            <div
              className="flex items-start gap-2.5 p-3.5 rounded-xl"
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
              }}
            >
              <ShieldCheck
                className="flex-shrink-0 mt-0.5"
                style={{ width: 16, height: 16, color: '#2563eb' }}
              />
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: '#1e40af' }}
              >
                您的数据默认存储在本地浏览器，注册成功后可配置 WebDAV 进行云同步。所有私密内容支持端到端加密。
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !username || !password || !confirmPwd}
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
                  创建中...
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>创建账号并进入</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 text-center" style={{ borderTop: '1px solid #e0efff' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>
              已有账号？
              <Link
                to="/login"
                className="ml-1 font-bold transition-colors hover:underline underline-offset-4"
                style={{ color: '#2563eb' }}
              >
                返回登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
