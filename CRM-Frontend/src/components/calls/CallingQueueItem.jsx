import { followupBucket } from '../../utils'
import { StatusBadge } from '../enterprise/StatusBadge'

export function CallingQueueItem({ lead, active, onSelect }) {
  const bucket = followupBucket(lead)
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-slate-200/80 px-3 py-3 text-left transition-colors ${active ? 'border-l-[3px] border-l-amber-500 bg-white shadow-xs' : 'border-l-[3px] border-l-transparent hover:bg-white'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-slate-800">{lead.name}</p>
        <StatusBadge tone={bucket === 'overdue' ? 'rose' : undefined}>{bucket === 'overdue' ? 'Overdue' : lead.status}</StatusBadge>
      </div>
      <p className="mt-1 text-xs tabular-nums text-slate-500">{lead.mobile}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{lead.requirement}</p>
    </button>
  )
}
