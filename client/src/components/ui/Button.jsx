export function Button({ variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
    secondary: 'bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10',
    danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
