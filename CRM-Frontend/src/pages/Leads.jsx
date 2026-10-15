import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { LEAD_STATUSES, PIPELINE, PRIORITIES, SOURCES } from '../constants'
import { useCrm } from '../context'
import { LeadForm } from '../LeadForm'
import { inr } from '../utils'
import { AccentButton, GhostButton, Sheet } from '../components/enterprise/Sheet'
import { FilterPopover } from '../components/enterprise/FilterPopover'
import { SegmentedTabs } from '../components/enterprise/SegmentedTabs'
import { StatusBadge } from '../components/enterprise/StatusBadge'
import { LeadTable } from '../components/leads/LeadTable'

export function Leads() {
  const { visibleLeads, db, user, updateLead } = useCrm()
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState('board')
  const [dragId, setDragId] = useState('')
  const [overColumn, setOverColumn] = useState('')
  const [q, setQ] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [owner, setOwner] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()
  const openId = params.get('open')
  const openLead = visibleLeads.find((lead) => lead.id === openId)

  const rows = useMemo(() => visibleLeads.filter((lead) => {
    const blob = `${lead.name} ${lead.mobile} ${lead.id} ${lead.location}`.toLowerCase()
    if (q && !blob.includes(q.toLowerCase())) return false
    if (source && lead.source !== source) return false
    if (status && lead.status !== status) return false
    if (priority && lead.priority !== priority) return false
    if (owner && lead.assignedTo !== owner) return false
    return true
  }), [visibleLeads, q, source, status, priority, owner])

  const openRecord = (lead) => setParams({ open: lead.id })

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Leads</h1>
          <p className="text-xs font-normal text-slate-500">{rows.length} records · {user.role}</p>
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#C9DCFF] bg-[#EAF2FF] px-3 text-sm font-medium text-[#1E4A9A] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#D7E6FF]" onClick={() => setCreateOpen(true)}>
          <Plus size={15} /> New lead
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search name, mobile, ID" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:ring-1 focus:ring-amber-500" />
        </label>
        <FilterPopover label="Source" value={source} onChange={setSource} options={[{ value: '', label: 'All' }, ...SOURCES.map((item) => ({ value: item, label: item }))]} />
        <FilterPopover label="Status" value={status} onChange={setStatus} options={[{ value: '', label: 'All' }, ...LEAD_STATUSES.map((item) => ({ value: item, label: item }))]} />
        <FilterPopover label="Priority" value={priority} onChange={setPriority} options={[{ value: '', label: 'All' }, ...PRIORITIES.map((item) => ({ value: item, label: item }))]} />
        <FilterPopover label="Owner" value={owner} onChange={setOwner} options={[{ value: '', label: 'All' }, ...db.staff.map((person) => ({ value: person.id, label: person.name }))]} />
        <SegmentedTabs value={view} onChange={setView} items={[{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }]} />
      </div>

      {view === 'list' ? (
        <LeadTable rows={rows} staff={db.staff} onOpen={openRecord} />
      ) : (
        <>
        <p className="text-[11px] text-slate-400">Drag a card into another column to change its status.</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE.map((column) => {
            const cards = rows.filter((lead) => lead.status === column)
            return (
              <div
                key={column}
                onDragOver={(event) => { event.preventDefault(); setOverColumn(column) }}
                onDragLeave={() => setOverColumn((value) => (value === column ? '' : value))}
                onDrop={(event) => {
                  event.preventDefault()
                  const id = event.dataTransfer.getData('text/plain') || dragId
                  setOverColumn('')
                  setDragId('')
                  if (!id) return
                  const moving = visibleLeads.find((lead) => lead.id === id)
                  if (!moving || moving.status === column) return
                  updateLead(id, { status: column })
                }}
                className={`w-64 shrink-0 rounded-xl border p-2 transition ${overColumn === column ? 'border-amber-300 bg-amber-50/70' : 'border-slate-200 bg-slate-50/70'}`}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{column}</p>
                  <span className="text-xs tabular-nums text-slate-500">{cards.length}</span>
                </div>
                <div className="min-h-16 space-y-2">
                  {cards.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      draggable
                      onDragStart={(event) => { event.dataTransfer.setData('text/plain', lead.id); event.dataTransfer.effectAllowed = 'move'; setDragId(lead.id) }}
                      onDragEnd={() => { setDragId(''); setOverColumn('') }}
                      className={`block w-full cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${dragId === lead.id ? 'opacity-40' : ''}`}
                      onClick={() => openRecord(lead)}
                    >
                      <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                      <p className="mt-1 text-xs tabular-nums text-slate-500">{lead.source} · {inr(lead.expectedAmount)}</p>
                      <div className="mt-2"><StatusBadge tone={lead.priority === 'High' ? 'amber' : 'slate'}>{lead.priority}</StatusBadge></div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        </>
      )}

      <Sheet
        open={Boolean(openLead)}
        title={openLead?.name || 'Lead'}
        subtitle={openLead ? `${openLead.id} · ${openLead.mobile}` : ''}
        onClose={() => setParams({})}
        footer={openLead && (
          <>
            <GhostButton onClick={() => navigate(`/calls?lead=${openLead.id}`)}>Open dialer</GhostButton>
            <GhostButton onClick={() => setParams({})}>Cancel</GhostButton>
            <AccentButton type="submit" form="edit-lead">Save lead</AccentButton>
          </>
        )}
      >
        {openLead && <LeadForm formId="edit-lead" hideSubmit initial={openLead} onDone={() => setParams({})} />}
      </Sheet>

      <Sheet
        open={createOpen}
        title="New lead"
        subtitle="Every open lead needs a next follow-up."
        onClose={() => setCreateOpen(false)}
        footer={(
          <>
            <GhostButton onClick={() => setCreateOpen(false)}>Cancel</GhostButton>
            <AccentButton type="submit" form="new-lead">Save lead</AccentButton>
          </>
        )}
      >
        {createOpen && <LeadForm formId="new-lead" hideSubmit onDone={() => setCreateOpen(false)} />}
      </Sheet>
    </div>
  )
}
