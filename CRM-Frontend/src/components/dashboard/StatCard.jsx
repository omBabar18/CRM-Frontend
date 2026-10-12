import { motion } from 'framer-motion'

export function StatCard({ label, value, hint, icon, trend, delay = 0 }) {
  const up = trend >= 0
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-200 ease-out hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200/80">{icon}</span>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${up ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' : 'bg-rose-50 text-rose-700 ring-rose-600/15'}`}>
          {up ? '+' : ''}{trend}%
        </span>
      </div>
      <p className="mt-4 truncate text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-tight tracking-tight text-slate-950 tabular-nums [overflow-wrap:anywhere]">{value}</p>
      <Spark />
      <p className="mt-2 truncate text-xs text-slate-400">{hint}</p>
    </motion.article>
  )
}

function Spark() {
  return (
    <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full text-amber-700/80" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="0,20 18,18 32,21 48,12 64,14 82,8 100,11 120,6" />
    </svg>
  )
}
