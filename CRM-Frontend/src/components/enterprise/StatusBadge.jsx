const ROSE = new Set(['Overdue', 'Lost', 'Invalid', 'Not Interested', 'Rejected', 'Cancelled'])
const EMERALD = new Set(['New', 'Interested', 'Converted', 'Completed', 'Verified', 'Paid', 'Closed', 'Done', 'Active', 'Open'])
const AMBER = new Set(['Follow-up', 'Visit Scheduled', 'Visited', 'Pending', 'Payment Due', 'Requested', 'Contacted', 'High', 'Medium'])

export function StatusBadge({ children, tone }) {
  const text = String(children ?? '')
  const kind = tone || (ROSE.has(text) ? 'rose' : EMERALD.has(text) ? 'emerald' : AMBER.has(text) ? 'amber' : 'slate')
  const map = {
    rose: 'border-rose-200/60 bg-rose-50 text-rose-700',
    emerald: 'border-emerald-200/60 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200/60 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
  }
  return <span className={`inline-flex max-w-full items-center truncate rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${map[kind]}`}>{children}</span>
}
