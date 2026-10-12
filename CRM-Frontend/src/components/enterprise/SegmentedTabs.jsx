export function SegmentedTabs({ value, onChange, items }) {
  return (
    <div className="inline-flex h-9 max-w-full items-center rounded-xl border border-slate-200/60 bg-slate-100/90 p-1 text-slate-500">
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border-0 px-3 text-xs font-medium transition-all ${active ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'bg-transparent text-slate-600 hover:bg-white/50 hover:text-slate-900'}`}
          >
            {item.label}
            {item.count != null && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${item.tone === 'rose' ? 'bg-rose-100 font-bold text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
