import { Loader2 } from 'lucide-react';

type Variant = 'full' | 'content' | 'card' | 'inline';

interface Props {
  variant?: Variant;
  label?: string;
  rows?: number;
}

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-200 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-100 rounded" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <CardSkeleton rows={2} />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

function FullSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">晨</span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 animate-ping opacity-20" />
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm font-medium">晨枫暮叶 · 工作台正在加载中</span>
        </div>
      </div>
    </div>
  );
}

function InlineSkeleton({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-xs">{label ?? '加载中...'}</span>
    </div>
  );
}

export default function PageSkeleton({ variant = 'content', label, rows }: Props) {
  switch (variant) {
    case 'full':
      return <FullSkeleton />;
    case 'content':
      return <ContentSkeleton />;
    case 'card':
      return <CardSkeleton rows={rows} />;
    case 'inline':
      return <InlineSkeleton label={label} />;
  }
}
