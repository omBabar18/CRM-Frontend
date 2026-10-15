import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { startOfDay } from '../../utils'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function keyOf(date) {
  const d = startOfDay(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function FollowupCalendar({ leads }) {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const counts = useMemo(() => {
    const map = {}
    leads.forEach((lead) => {
      if (!lead.nextFollowUp) return
      const key = keyOf(lead.nextFollowUp)
      map[key] = (map[key] || 0) + 1
    })
    return map
  }, [leads])

  const first = new Date(cursor.year, cursor.month, 1)
  const pad = (first.getDay() + 6) % 7
  const days = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells = [...Array(pad).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)]
  const label = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const todayKey = keyOf(now)

  const shift = (delta) => {
    const next = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: next.getFullYear(), month: next.getMonth() })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Previous month" className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => shift(-1)}><ChevronLeft size={14} /></button>
        <p className="text-xs font-medium text-slate-700">{label}</p>
        <button type="button" aria-label="Next month" className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => shift(1)}><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => <p key={day} className="py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{day}</p>)}
        {cells.map((day, index) => {
          if (!day) return <span key={`e-${index}`} />
          const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const count = counts[key] || 0
          return (
            <div key={key} className={`flex h-12 flex-col items-center justify-center rounded-lg text-[11px] ${key === todayKey ? 'bg-[#EAF2FF] text-[#1E4A9A]' : 'text-slate-600'}`}>
              <span className="tabular-nums">{day}</span>
              {count > 0 && <span className="mt-0.5 rounded-md bg-white px-1 text-[10px] font-medium text-[#1E4A9A] shadow-sm ring-1 ring-[#C9DCFF]">{count}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
