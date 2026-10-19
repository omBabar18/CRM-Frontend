import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { startOfDay } from '../../utils'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function keyOf(date) {
  const d = startOfDay(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function FollowupCalendar({ leads, selected, onSelect }) {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const byDay = useMemo(() => {
    const map = {}
    leads.forEach((lead) => {
      if (!lead.nextFollowUp) return
      const key = keyOf(lead.nextFollowUp)
      map[key] = map[key] || []
      map[key].push(lead)
    })
    return map
  }, [leads])

  const first = new Date(cursor.year, cursor.month, 1)
  const pad = (first.getDay() + 6) % 7
  const days = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells = [...Array(pad).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)]
  const label = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const todayKey = keyOf(now)
  const monthCount = Object.entries(byDay).reduce((sum, [key, rows]) => (
    key.startsWith(`${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`) ? sum + rows.length : sum
  ), 0)

  const shift = (delta) => {
    const next = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: next.getFullYear(), month: next.getMonth() })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-400">{monthCount} follow-ups this month · click a date to open that day</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous month" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => shift(-1)}><ChevronLeft size={15} /></button>
          <button type="button" className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })}>Today</button>
          <button type="button" aria-label="Next month" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => shift(1)}><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
        {WEEKDAYS.map((day) => <p key={day} className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">{day}</p>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (!day) return <div key={`e-${index}`} className="min-h-[92px] border-b border-r border-slate-100 bg-slate-50/40" />
          const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const rows = byDay[key] || []
          const active = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect?.(active ? null : key)}
              className={`flex min-h-[92px] flex-col items-start gap-1 border-0 border-b border-r border-slate-100 p-2 text-left transition ${active ? 'bg-[#EAF2FF]' : 'bg-white hover:bg-slate-50'}`}
            >
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] tabular-nums ${key === todayKey ? 'bg-[#1E4A9A] text-white' : 'text-slate-600'}`}>{day}</span>
              {rows.length > 0 && (
                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#1E4A9A] ring-1 ring-[#C9DCFF]">{rows.length} follow-up{rows.length === 1 ? '' : 's'}</span>
              )}
              <span className="w-full space-y-0.5">
                {rows.slice(0, 2).map((lead) => (
                  <span key={lead.id} className="block truncate text-[10px] text-slate-500">{lead.name}</span>
                ))}
                {rows.length > 2 && <span className="block text-[10px] text-slate-400">+{rows.length - 2} more</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function followupDayKey(iso) {
  if (!iso) return ''
  return keyOf(iso)
}
