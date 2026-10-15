import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, Phone, Plus } from 'lucide-react'
import { OUTCOMES, REQUIREMENTS } from '../constants'
import { useCrm } from '../context'
import { fmtDateTime, fromLocalInput, isoOffset, staffName, startOfDay, toLocalInput } from '../utils'
import { FollowupCalendar } from '../components/calls/FollowupCalendar'
import { SegmentedTabs } from '../components/enterprise/SegmentedTabs'
import { StatusBadge } from '../components/enterprise/StatusBadge'
import { Select } from '../ui'

const control = 'h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-normal text-slate-600 outline-none focus:ring-1 focus:ring-amber-500/40'

const PERIODS = [
  ['today', 'Today'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['quarter', 'Quarter'],
  ['half', '6 months'],
  ['year', 'Year'],
]

function inPeriod(iso, period) {
  if (!iso) return false
  const due = startOfDay(iso)
  const today = startOfDay(new Date())
  if (period === 'today') return due.getTime() === today.getTime()
  if (period === 'week') {
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return due >= monday && due <= sunday
  }
  if (period === 'month') return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear()
  if (period === 'quarter') return Math.floor(due.getMonth() / 3) === Math.floor(today.getMonth() / 3) && due.getFullYear() === today.getFullYear()
  if (period === 'half') return (due.getMonth() < 6) === (today.getMonth() < 6) && due.getFullYear() === today.getFullYear()
  return due.getFullYear() === today.getFullYear()
}

export function Calls() {
  const { queue, visibleLeads, db, logCall, updateLead } = useCrm()
  const [params, setParams] = useSearchParams()
  const [activeId, setActiveId] = useState(params.get('lead') || '')
  const [picking, setPicking] = useState(false)
  const [tab, setTab] = useState('history')
  const [period, setPeriod] = useState('today')
  const [calendar, setCalendar] = useState(false)
  const [outcome, setOutcome] = useState('Interested')
  const [need, setNeed] = useState('')
  const [communication, setCommunication] = useState('')
  const [notes, setNotes] = useState('')
  const [nextAt, setNextAt] = useState(toLocalInput(isoOffset(1, 11, 0)))

  const lead = queue.find((row) => row.id === activeId) || visibleLeads.find((row) => row.id === activeId)

  useEffect(() => {
    const id = params.get('lead')
    if (id) setActiveId(id)
  }, [params])

  useEffect(() => {
    if (!lead) return
    setOutcome(lead.lastOutcome && OUTCOMES.includes(lead.lastOutcome) ? lead.lastOutcome : 'Interested')
    setNeed(lead.requirement || '')
    setCommunication('')
    setNotes(lead.notes || '')
    setNextAt(toLocalInput(lead.nextFollowUp || isoOffset(1, 11, 0)))
  }, [lead?.id])

  const followups = useMemo(
    () => visibleLeads
      .filter((row) => row.nextFollowUp && inPeriod(row.nextFollowUp, period))
      .sort((a, b) => new Date(a.nextFollowUp) - new Date(b.nextFollowUp)),
    [visibleLeads, period],
  )

  const select = (row, nextTab = 'history') => {
    setPicking(false)
    setActiveId(row.id)
    setParams({ lead: row.id })
    setTab(nextTab)
  }

  const back = () => {
    setActiveId('')
    setPicking(false)
    setParams({})
  }

  const save = (event) => {
    event.preventDefault()
    if (!lead) return
    if (need && need !== lead.requirement) {
      const updated = updateLead(lead.id, { requirement: need, notes, nextFollowUp: fromLocalInput(nextAt) })
      if (!updated) return
    }
    const ok = logCall({ leadId: lead.id, outcome, notes: communication || notes, nextFollowUp: fromLocalInput(nextAt) })
    if (ok) setCommunication('')
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Calls</h1>
          <p className="text-xs font-normal text-slate-500">{queue.length} open calls · select a row to open that call.</p>
        </div>
        {!lead && !picking && (
          <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#C9DCFF] bg-[#EAF2FF] px-3 text-sm font-medium text-[#1E4A9A] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#D7E6FF]" onClick={() => { setPicking(true); setTab('communication') }}>
            <Plus size={15} /> Add call
          </button>
        )}
      </div>

      {!lead && picking && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-200 bg-white p-3">
          <button type="button" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800" onClick={back}><ArrowLeft size={14} /> Back to calls</button>
          <p className="mb-2 text-sm font-medium text-slate-800">Choose a lead for this call</p>
          <div className="max-h-80 space-y-1 overflow-auto">
            {visibleLeads.map((row) => (
              <button key={row.id} type="button" className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition hover:bg-amber-50" onClick={() => select(row, 'communication')}>
                <span>
                  <span className="block text-[13px] font-medium text-slate-700">{row.name}</span>
                  <span className="text-[11px] tabular-nums text-slate-400">{row.mobile} · {row.requirement}</span>
                </span>
                <Phone size={14} className="text-amber-700" />
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {!lead && !picking && (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {['Customer', 'Mobile', 'Need', 'Last outcome', 'Last contact', 'Next follow-up', 'Owner'].map((head) => (
                  <th key={head} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((row) => (
                <tr key={row.id} onClick={() => select(row)} className={`cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80 ${row.id === lead?.id ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-3 py-2">
                    <p className="text-[13px] font-medium text-slate-700">{row.name}</p>
                    <p className="text-[11px] tabular-nums text-slate-400">{row.id}</p>
                  </td>
                  <td className="px-3 py-2 text-[13px] tabular-nums text-slate-600">{row.mobile}</td>
                  <td className="px-3 py-2 text-[13px] text-slate-600">{row.requirement}</td>
                  <td className="px-3 py-2"><StatusBadge>{row.lastOutcome || row.status}</StatusBadge></td>
                  <td className="whitespace-nowrap px-3 py-2 text-[12px] tabular-nums text-slate-500">{fmtDateTime(row.lastContact)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[12px] tabular-nums text-slate-500">{fmtDateTime(row.nextFollowUp)}</td>
                  <td className="px-3 py-2 text-[13px] text-slate-600">{staffName(db.staff, row.assignedTo)}</td>
                </tr>
              ))}
              {queue.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-slate-500">No calls in your queue.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {lead && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
            <div className="min-w-0">
              <button type="button" className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-amber-700" onClick={back}><ArrowLeft size={14} /> All calls</button>
              <p className="text-sm font-medium text-slate-800">{lead.name}</p>
              <p className="text-[11px] tabular-nums text-slate-400">{lead.mobile} · {lead.location} · {lead.id}</p>
            </div>
          </div>
          <div className="px-3 py-2.5">
            <SegmentedTabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'history', label: 'Call history' },
                { value: 'communication', label: 'Communication' },
                { value: 'followups', label: 'Follow-ups', count: followups.length, tone: period === 'today' && followups.length ? 'rose' : 'slate' },
              ]}
            />
          </div>

          {tab === 'history' && (
            <div className="space-y-3 px-3 pb-4">
              {(lead.timeline || []).map((item) => (
                <article key={item.id} className="border-l border-slate-200 pl-3">
                  <p className="text-[13px] font-medium text-slate-700">{item.outcome || 'Note'}</p>
                  <p className="text-[11px] tabular-nums text-slate-400">{fmtDateTime(item.at)} · {staffName(db.staff, item.staffId)}</p>
                  {item.text && <p className="mt-1 text-[13px] font-normal text-slate-500">{item.text}</p>}
                </article>
              ))}
              {!lead.timeline?.length && <p className="pb-2 text-xs text-slate-500">No calls logged yet.</p>}
            </div>
          )}

          {tab === 'communication' && (
            <form className="ent-form grid gap-3 px-3 pb-4 sm:grid-cols-2" onSubmit={save}>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-500">Outcome</span>
                <Select value={outcome} onChange={(event) => setOutcome(event.target.value)} options={OUTCOMES.map((item) => ({ value: item, label: item }))} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-500">Need</span>
                <Select value={need} onChange={(event) => setNeed(event.target.value)} options={REQUIREMENTS.map((item) => ({ value: item, label: item }))} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[11px] font-medium text-slate-500">Communication</span>
                <textarea value={communication} onChange={(event) => setCommunication(event.target.value)} placeholder="What was discussed" className="min-h-16 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] font-normal text-slate-600 outline-none focus:ring-1 focus:ring-amber-500/40" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-500">Follow-up</span>
                <input type="datetime-local" value={nextAt} onChange={(event) => setNextAt(event.target.value)} className={`${control} tabular-nums`} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-slate-500">Notes</span>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-16 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] font-normal text-slate-600 outline-none focus:ring-1 focus:ring-amber-500/40" />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="h-8 rounded-lg border border-[#C9DCFF] bg-[#EAF2FF] px-3 text-xs font-medium text-[#1E4A9A] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#D7E6FF]">Save communication</button>
              </div>
            </form>
          )}

          {tab === 'followups' && (
            <div className="space-y-3 px-3 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedTabs value={period} onChange={setPeriod} items={PERIODS.map(([value, label]) => ({ value, label }))} />
                <button type="button" className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition ${calendar ? 'border-[#C9DCFF] bg-[#EAF2FF] text-[#1E4A9A]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`} onClick={() => setCalendar((value) => !value)}>
                  <CalendarDays size={14} /> See in calendar
                </button>
              </div>
              {calendar ? (
                <FollowupCalendar leads={visibleLeads} />
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        {['Customer', 'Need', 'When', 'Owner'].map((head) => (
                          <th key={head} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {followups.map((row) => (
                        <tr key={row.id} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50" onClick={() => select(row)}>
                          <td className="px-3 py-2 text-[13px] font-medium text-slate-700">{row.name}</td>
                          <td className="px-3 py-2 text-[13px] text-slate-500">{row.requirement}</td>
                          <td className="px-3 py-2 text-[12px] tabular-nums text-slate-500">{fmtDateTime(row.nextFollowUp)}</td>
                          <td className="px-3 py-2 text-[13px] text-slate-500">{staffName(db.staff, row.assignedTo)}</td>
                        </tr>
                      ))}
                      {followups.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-500">No follow-ups in this range.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.section>
      )}
    </div>
  )
}
