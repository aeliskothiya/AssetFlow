export function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className={`glass-panel rounded-3xl p-5 ${accent ? 'border-cyan-400/20 bg-cyan-400/10' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}
