export function QuickActionButton({ icon, label, hint, onClick, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[148px] flex-1 items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-left shadow-xs transition hover:border-slate-300 hover:bg-slate-50/80"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-slate-700">{label}</span>
        <span className="block truncate text-[11px] font-normal text-slate-400">{hint}</span>
      </span>
    </button>
  )
}
