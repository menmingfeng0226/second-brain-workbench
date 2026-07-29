import { Link } from 'react-router-dom';
import { Compass, Home, Search } from '@/components/icons';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <div className="text-[120px] leading-none font-black bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 blur-lg" />
        </div>

        <div className="space-y-3 mb-10">
          <h1 className="text-2xl font-bold text-slate-800">页面走丢了</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            您访问的页面不存在或已被移动。请检查 URL 或返回首页继续使用工作台。
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 hover:brightness-105 active:scale-[0.99] transition-all"
          >
            <Home className="w-4 h-4" />
            返回工作台
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <Compass className="w-4 h-4" />
            浏览功能
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-500 text-sm font-medium hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <Search className="w-4 h-4" />
            返回上一页
          </button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-3 max-w-md mx-auto">
          {[
            { name: '数据看板', icon: '📊', nav: 'dashboard' },
            { name: '爆款视频', icon: '🎬', nav: 'lab' },
            { name: '选题灵感', icon: '💡', nav: 'ideas' },
          ].map((item) => (
            <Link
              key={item.nav}
              to="/app"
              className="group p-4 rounded-2xl bg-white/70 backdrop-blur border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-xs font-medium text-slate-700">{item.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
