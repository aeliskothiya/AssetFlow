export function Modal({ open, title, subtitle = 'System action', children, onClose, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-full flex flex-col rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex-none p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-400">{subtitle}</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-none rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
        
        {footer && (
          <div className="flex-none border-t border-white/10 p-6 pt-4 flex justify-end gap-3 bg-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
