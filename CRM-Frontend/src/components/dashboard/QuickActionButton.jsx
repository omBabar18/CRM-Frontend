export function QuickActionButton({ icon, label, onClick, tone = 'slate' }) {
  const tones = {
    slate: 'text-slate-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-800',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="group relative grid h-[72px] w-[76px] place-items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white text-[11px] font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <span className={tones[tone]}>{icon}</span>
      {label}
      <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white group-hover:block">{label}</span>
    </button>
  )
}
