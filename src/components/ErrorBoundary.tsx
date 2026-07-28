import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { eventBus } from '@/lib/eventBus';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  info: ErrorInfo | null = null;

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.info = info;
    console.error('[ErrorBoundary] Caught error:', error, info);
    eventBus.emit('toast:show', {
      type: 'error',
      title: '页面异常',
      description: error.message || '发生了未知错误',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.info = null;
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  handleCopyDetails = async () => {
    const err = this.state.error;
    const info = this.info;
    const text = [
      `Error: ${err?.name ?? 'Unknown'}: ${err?.message ?? ''}`,
      '',
      'Stack:',
      err?.stack ?? '',
      '',
      'Component Stack:',
      info?.componentStack ?? '',
      '',
      'URL:',
      window.location.href,
      '',
      'UA:',
      navigator.userAgent,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制错误详情到剪贴板，请粘贴给开发者排查。');
    } catch {
      prompt('请手动复制下面的错误详情：', text);
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const err = this.state.error;

    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-red-100 shadow-xl shadow-red-500/5 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">页面运行异常</h2>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            当前模块出现了运行时错误，您可以尝试刷新页面或返回首页。
          </p>

          {err && (
            <div className="mb-5 p-4 bg-red-50 rounded-xl border border-red-100 text-left space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-red-700">
                  {err.name || 'Error'}
                  {err.message ? `: ${err.message}` : ''}
                </div>
                <button
                  type="button"
                  onClick={this.handleCopyDetails}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                >
                  复制错误详情
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-red-700/90 max-h-56 overflow-auto rounded-lg bg-white/70 p-3 border border-red-100">
                {err.stack || err.message || '无堆栈信息'}
                {((this.info?.componentStack ?? '').length > 0) ? (
                  <>
                    {'\n\n--- Component Stack ---\n'}
                    {this.info?.componentStack ?? ''}
                  </>
                ) : null}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-center flex-wrap gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              组件重置
            </button>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              刷新页面
            </button>
            <button
              onClick={this.handleHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              首页
            </button>
          </div>
        </div>
      </div>
    );
  }
}
