export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-white/8 text-slate-200 border-white/10',
    success: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/20',
    danger: 'bg-rose-400/15 text-rose-200 border-rose-400/20',
    warning: 'bg-amber-400/15 text-amber-200 border-amber-400/20',
    info: 'bg-cyan-400/15 text-cyan-200 border-cyan-400/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
