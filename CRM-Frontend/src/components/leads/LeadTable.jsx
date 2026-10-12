import { fmtDateTime, inr, staffName, telLink, waLink, followupBucket } from '../../utils'
import { RowActions } from '../enterprise/RowActions'
import { StatusBadge } from '../enterprise/StatusBadge'

const HEADS = ['Lead', 'Mobile', 'Source', 'Need', 'Amount', 'Owner', 'Status', 'Next action', '']

export function LeadTable({ rows, staff, onOpen }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {HEADS.map((head) => (
                <th key={head || 'actions'} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => {
              const bucket = followupBucket(lead)
              return (
                <tr key={lead.id} className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80" onClick={() => onOpen(lead)}>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                    <p className="text-xs tabular-nums text-slate-500">{lead.id} · {lead.location}</p>
                  </td>
                  <td className="px-3 py-2.5 text-sm tabular-nums text-slate-700">{lead.mobile}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{lead.source}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{lead.requirement}{lead.goldWeight ? ` · ${lead.goldWeight}g` : ''}</td>
                  <td className="px-3 py-2.5 text-sm tabular-nums text-slate-800">{inr(lead.expectedAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-slate-700">{staffName(staff, lead.assignedTo)}</td>
                  <td className="px-3 py-2.5"><StatusBadge tone={bucket === 'overdue' ? 'rose' : undefined}>{bucket === 'overdue' ? 'Overdue' : lead.status}</StatusBadge></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-slate-500">{fmtDateTime(lead.nextFollowUp)}</td>
                  <td className="px-2 py-2">
                    <RowActions
                      phoneHref={telLink(lead.mobile)}
                      whatsappHref={waLink(lead.mobile, `Namaste ${lead.name}, this is DG Gold Sangli.`)}
                      items={[{ label: 'Open lead', onClick: () => onOpen(lead) }]}
                    />
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-10 text-center text-sm text-slate-500">No leads match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
