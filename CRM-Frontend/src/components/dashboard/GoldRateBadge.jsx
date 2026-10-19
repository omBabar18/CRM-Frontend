export function GoldRateBadge({ karat, rate, delta }) {
  const up = delta != null && delta >= 0
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <p className="text-xs font-medium text-slate-500">{karat}</p>
        <p className="mt-0.5 text-sm font-semibold tracking-tight text-slate-950">
          ₹{Number(rate).toLocaleString('en-IN')}
          <span className="ml-0.5 text-xs font-normal text-slate-400">/g</span>
        </p>
      </div>
      {delta == null ? null : (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${up ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' : 'bg-rose-50 text-rose-700 ring-rose-600/15'}`}>
          {up ? '+' : ''}{delta.toFixed(2)}%
        </span>
      )}
    </div>
  )
}
