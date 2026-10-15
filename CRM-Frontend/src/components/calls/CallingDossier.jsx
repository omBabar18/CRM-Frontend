import { MessageCircle, Phone } from 'lucide-react'
import { OUTCOMES } from '../../constants'
import { fmtDateTime, staffName, telLink, waLink } from '../../utils'
import { StatusBadge } from '../enterprise/StatusBadge'

export function CallingDossier({ lead, staff, outcome, notes, nextAt, onOutcome, onNotes, onNext, onSave, onBack }) {
  return (
    <div className="min-w-0 space-y-5 p-4 md:p-5">
      {onBack && (
        <button type="button" className="text-xs font-medium text-slate-500 hover:text-slate-800" onClick={onBack}>Back to queue</button>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{lead.name}</h2>
          <p className="mt-1 text-xs tabular-nums text-slate-500">{lead.mobile}{lead.alternate ? ` · Alt ${lead.alternate}` : ''} · {lead.location}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge>{lead.requirement}</StatusBadge>
            <StatusBadge tone={lead.priority === 'High' ? 'amber' : 'slate'}>{lead.priority}</StatusBadge>
            <StatusBadge tone="slate">{staffName(staff, lead.assignedTo)}</StatusBadge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={telLink(lead.mobile)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#C9DCFF] bg-[#EAF2FF] px-3 text-sm font-medium text-[#1E4A9A] transition hover:bg-[#D7E6FF]">
            <Phone size={15} /> Dial lead
          </a>
          <a href={waLink(lead.mobile, `Namaste ${lead.name}, this is DG Gold Sangli.`)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800">
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm md:grid-cols-4">
        <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last contact</dt><dd className="mt-1 text-xs tabular-nums text-slate-700">{fmtDateTime(lead.lastContact)}</dd></div>
        <div><dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last outcome</dt><dd className="mt-1 text-sm text-slate-800">{lead.lastOutcome || '—'}</dd></div>
        <div className="col-span-2"><dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Need</dt><dd className="mt-1 text-sm text-slate-800">{lead.requirement}</dd></div>
      </dl>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Call history</h3>
        <div className="mt-3 space-y-3 border-l border-slate-200 pl-4">
          {(lead.timeline || []).slice(0, 5).map((item) => (
            <article key={item.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-300 ring-2 ring-white" />
              <p className="text-sm font-medium text-slate-800">{item.outcome || 'Note'}</p>
              <p className="text-xs tabular-nums text-slate-500">{fmtDateTime(item.at)} · {staffName(staff, item.staffId)}</p>
              {item.text && <p className="mt-1 text-sm text-slate-600">{item.text}</p>}
            </article>
          ))}
          {!lead.timeline?.length && <p className="text-sm text-slate-500">{lead.notes || 'No conversation yet.'}</p>}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Log outcome</h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Call outcome">
          {OUTCOMES.map((item) => {
            const selected = outcome === item
            return (
              <button
                type="button"
                key={item}
                role="radio"
                aria-checked={selected}
                onClick={() => onOutcome(item)}
                className={`h-10 rounded-lg border px-2 text-sm transition duration-200 hover:-translate-y-0.5 ${selected ? 'border-amber-400 bg-amber-50 font-medium text-amber-950 ring-1 ring-amber-400' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                {item}
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-700">Notes</span>
          <textarea value={notes} onChange={(event) => onNotes(event.target.value)} className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-amber-500" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-700">Next follow-up</span>
          <input type="datetime-local" value={nextAt} onChange={(event) => onNext(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm tabular-nums outline-none focus:ring-1 focus:ring-amber-500" />
        </label>
      </div>
      <button type="button" onClick={onSave} className="h-9 rounded-lg border border-[#C9DCFF] bg-[#EAF2FF] px-4 text-sm font-medium text-[#1E4A9A] transition hover:-translate-y-0.5 hover:bg-[#D7E6FF]">Save outcome</button>
    </div>
  )
}
