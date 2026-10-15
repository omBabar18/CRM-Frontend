import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useCrm } from '../context'
import { fmtDateTime, staffName, telLink, waLink } from '../utils'
import { FollowupCalendar } from '../components/calls/FollowupCalendar'
import { RowActions } from '../components/enterprise/RowActions'
import { SegmentedTabs } from '../components/enterprise/SegmentedTabs'
import { StatusBadge } from '../components/enterprise/StatusBadge'

const TABS = [
  ['today', 'Today'],
  ['overdue', 'Overdue'],
  ['tomorrow', 'Tomorrow'],
  ['week', 'This week'],
  ['none', 'No follow-up'],
]

export function Followups() {
  const { buckets, db, visibleLeads } = useCrm()
  const [tab, setTab] = useState('overdue')
  const [calendar, setCalendar] = useState(false)
  const navigate = useNavigate()
  const rows = buckets[tab] || []

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Follow-ups</h1>
          <p className="text-xs font-normal text-slate-500">Every open lead stays on a dated next action.</p>
        </div>
        <button
          type="button"
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition duration-200 ${calendar ? 'border-[#C9DCFF] bg-[#EAF2FF] text-[#1E4A9A]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          onClick={() => setCalendar((value) => !value)}
        >
          <CalendarDays size={15} /> {calendar ? 'Hide calendar' : 'Calendar view'}
        </button>
      </div>
      {calendar && <FollowupCalendar leads={visibleLeads} />}
      {buckets.overdue.length > 0 && tab !== 'overdue' && (
        <button type="button" className="flex w-full items-center justify-between rounded-lg border border-rose-200/70 bg-rose-50 px-3 py-2 text-left text-sm text-rose-800" onClick={() => setTab('overdue')}>
          <span>{buckets.overdue.length} overdue follow-ups are waiting.</span>
          <span className="text-xs font-medium">Show overdue</span>
        </button>
      )}
      <SegmentedTabs
        value={tab}
        onChange={setTab}
        items={TABS.map(([key, label]) => ({
          value: key,
          label,
          count: buckets[key].length,
          tone: key === 'overdue' ? 'rose' : 'slate',
        }))}
      />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {['Customer', 'Owner', 'Status', 'When', 'Last note', ''].map((head) => (
                  <th key={head || 'actions'} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                    <p className="text-xs tabular-nums text-slate-500">{lead.mobile} · {lead.location}</p>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{staffName(db.staff, lead.assignedTo)}</td>
                  <td className="px-3 py-2.5"><StatusBadge tone={tab === 'overdue' ? 'rose' : tab === 'today' ? 'amber' : 'slate'}>{lead.status}</StatusBadge></td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-slate-500">{fmtDateTime(lead.nextFollowUp)}</td>
                  <td className="max-w-[240px] px-3 py-2.5 text-xs text-slate-500"><span className="block truncate">{lead.notes || '—'}</span></td>
                  <td className="px-2 py-2">
                    <RowActions
                      phoneHref={telLink(lead.mobile)}
                      whatsappHref={waLink(lead.mobile, `Hello ${lead.name}, following up from DG Gold Sangli.`)}
                      items={[{ label: 'Log outcome', onClick: () => navigate(`/calls?lead=${lead.id}`) }]}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">Nothing in this bucket.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
