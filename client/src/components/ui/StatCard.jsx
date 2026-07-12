export function StatCard({ label, value, hint, accent = false, intent = 'default' }) {
  let baseClass = 'glass-panel rounded-3xl p-5 transition-transform hover:scale-[1.02] duration-300';
  if (accent) {
    baseClass += ' border-cyan-400/20 bg-cyan-400/10';
  } else if (intent === 'danger') {
    baseClass += ' border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-600/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
  }

  return (
    <div className={baseClass}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className={`mt-3 text-3xl font-semibold ${intent === 'danger' ? 'text-red-400' : 'text-white'}`}>{value}</div>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}
