import { useEffect, useState } from 'react'
import { LOCATIONS, PRIORITIES, REQUIREMENTS, SOURCES, LEAD_STATUSES } from './constants'
import { useCrm } from './context'
import { toLocalInput, fromLocalInput, isoOffset } from './utils'
import { Select } from './ui'

const blank = () => ({
  name: '',
  mobile: '',
  alternate: '',
  location: 'Sangli',
  source: 'Google Ads',
  requirement: 'Sell Gold',
  expectedAmount: '',
  goldWeight: '',
  assignedTo: '',
  status: 'New',
  priority: 'Medium',
  nextFollowUp: toLocalInput(isoOffset(1, 11, 0)),
  notes: '',
})

const control = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1 focus:ring-amber-500'

export function LeadForm({ initial, onDone, formId = 'lead-form', hideSubmit = false }) {
  const { db, addLead, updateLead, toast } = useCrm()
  const [form, setForm] = useState(blank)
  const [mobileError, setMobileError] = useState('')
  useEffect(() => {
    setMobileError('')
    if (!initial) {
      setForm(blank())
      return
    }
    setForm({
      ...initial,
      expectedAmount: initial.expectedAmount || '',
      goldWeight: initial.goldWeight || '',
      nextFollowUp: toLocalInput(initial.nextFollowUp),
    })
  }, [initial])

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const save = (event) => {
    event.preventDefault()
    if (!/^\d{10}$/.test(form.mobile)) {
      setMobileError('Enter a 10-digit mobile number.')
      toast('Enter a 10-digit mobile number.', 'bad')
      return
    }
    setMobileError('')
    const payload = { ...form, nextFollowUp: fromLocalInput(form.nextFollowUp) }
    const result = initial ? updateLead(initial.id, payload) : addLead(payload)
    if (result === true || result?.ok) onDone?.()
  }

  return (
    <form id={formId} onSubmit={save} className="ent-form grid gap-3 sm:grid-cols-2">
      <Field label="Customer name"><input required value={form.name} onChange={set('name')} className={control} /></Field>
      <Field label="Mobile number" error={mobileError}>
        <input required inputMode="numeric" maxLength={10} value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" className={`${control} tabular-nums ${mobileError ? 'border-rose-300 ring-1 ring-rose-200' : ''}`} />
      </Field>
      <Field label="Alternate number"><input value={form.alternate || ''} onChange={set('alternate')} maxLength={10} className={`${control} tabular-nums`} /></Field>
      <Field label="Location"><Select value={form.location} onChange={set('location')} options={LOCATIONS.map((item) => ({ value: item, label: item }))} /></Field>
      <Field label="Lead source"><Select value={form.source} onChange={set('source')} options={SOURCES.map((item) => ({ value: item, label: item }))} /></Field>
      <Field label="Requirement"><Select value={form.requirement} onChange={set('requirement')} options={REQUIREMENTS.map((item) => ({ value: item, label: item }))} /></Field>
      <Field label="Expected amount"><input type="number" min="0" value={form.expectedAmount} onChange={set('expectedAmount')} className={`${control} tabular-nums`} /></Field>
      <Field label="Gold weight (grams)"><input type="number" min="0" step="0.1" value={form.goldWeight} onChange={set('goldWeight')} className={`${control} tabular-nums`} /></Field>
      <Field label="Assigned employee">
        <Select value={form.assignedTo} onChange={set('assignedTo')} placeholder="Auto assign" options={[{ value: '', label: 'Auto assign' }, ...db.staff.filter((person) => person.active).map((person) => ({ value: person.id, label: person.name }))]} />
      </Field>
      <Field label="Lead status"><Select value={form.status} onChange={set('status')} options={LEAD_STATUSES.map((item) => ({ value: item, label: item }))} /></Field>
      <Field label="Priority"><Select value={form.priority} onChange={set('priority')} options={PRIORITIES.map((item) => ({ value: item, label: item }))} /></Field>
      <Field label="Next follow-up" hint="Required for every open lead">
        <input type="datetime-local" value={form.nextFollowUp || ''} onChange={set('nextFollowUp')} className={`${control} tabular-nums`} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Notes"><textarea value={form.notes || ''} onChange={set('notes')} className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500" /></Field>
      </div>
      {!hideSubmit && <div className="sm:col-span-2"><button className="h-9 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white" type="submit">{initial ? 'Save lead' : 'Add lead'}</button></div>}
    </form>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}
