import { useState } from 'react'
import { CalendarClock, Check, Plus, RotateCcw } from 'lucide-react'
import { TASK_TYPES } from '../constants'
import { useCrm } from '../context'
import { fmtDateTime, fromLocalInput, isoOffset, staffName, toLocalInput } from '../utils'
import { Select } from '../ui'
import { AccentButton, Dialog, GhostButton } from '../components/enterprise/Sheet'
import { SegmentedTabs } from '../components/enterprise/SegmentedTabs'
import { StatusBadge } from '../components/enterprise/StatusBadge'

const control = 'h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-normal text-slate-600 outline-none focus:ring-1 focus:ring-amber-500/40'

export function Tasks() {
  const { visibleTasks, db, addTask, setTaskStatus, updateTask, toast, user } = useCrm()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('Open')
  const [form, setForm] = useState({ type: 'Call task', title: '', staffId: user.id, due: toLocalInput(isoOffset(0, 17, 0)), notes: '' })
  const rows = visibleTasks.filter((task) => filter === 'All' || task.status === filter)

  const save = (event) => {
    event.preventDefault()
    addTask({ ...form, due: fromLocalInput(form.due) })
    setOpen(false)
    setForm({ type: 'Call task', title: '', staffId: user.id, due: toLocalInput(isoOffset(0, 17, 0)), notes: '' })
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Tasks</h1>
          <p className="text-xs font-normal text-slate-500">{rows.length} in this view · calls, visits, KYC, payments</p>
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#C9DCFF] bg-[#EAF2FF] px-3 text-sm font-medium text-[#1E4A9A] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#D7E6FF]" onClick={() => setOpen(true)}>
          <Plus size={15} /> New task
        </button>
      </div>
      <SegmentedTabs
        value={filter}
        onChange={setFilter}
        items={['Open', 'Done', 'All'].map((item) => ({
          value: item,
          label: item,
          count: item === 'All' ? visibleTasks.length : visibleTasks.filter((task) => task.status === item).length,
        }))}
      />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {['Task', 'Type', 'Owner', 'Due', 'Status', ''].map((head) => (
                  <th key={head || 'actions'} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <tr key={task.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium text-slate-800">{task.title}</p>
                    {task.notes && <p className="truncate text-xs text-slate-500">{task.notes}</p>}
                  </td>
                  <td className="px-3 py-2.5"><StatusBadge tone="slate">{task.type}</StatusBadge></td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{staffName(db.staff, task.staffId)}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-slate-500">{fmtDateTime(task.due)}</td>
                  <td className="px-3 py-2.5"><StatusBadge tone={task.status === 'Done' ? 'emerald' : 'amber'}>{task.status}</StatusBadge></td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      {task.status === 'Open' ? (
                        <>
                          <button type="button" title="Mark done" aria-label="Mark done" className="grid h-7 w-7 place-items-center rounded-md border border-[#C9DCFF] bg-[#EAF2FF] text-[#1E4A9A] transition hover:bg-[#D7E6FF]" onClick={() => { setTaskStatus(task.id, 'Done'); toast('Task marked done') }}>
                            <Check size={14} />
                          </button>
                          <button type="button" title="Snooze one day" aria-label="Snooze one day" className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" onClick={() => { updateTask(task.id, { due: isoOffset(1, 17, 0) }); toast('Task moved to tomorrow') }}>
                            <CalendarClock size={14} />
                          </button>
                        </>
                      ) : (
                        <button type="button" title="Reopen" aria-label="Reopen" className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" onClick={() => { setTaskStatus(task.id, 'Open'); toast('Task reopened') }}>
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">No tasks in this view.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={open}
        title="New task"
        onClose={() => setOpen(false)}
        footer={(
          <>
            <GhostButton onClick={() => setOpen(false)}>Cancel</GhostButton>
            <AccentButton type="submit" form="new-task">Save task</AccentButton>
          </>
        )}
      >
        <form id="new-task" className="ent-form grid gap-3" onSubmit={save}>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">Type</span>
            <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} options={TASK_TYPES.map((item) => ({ value: item, label: item }))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">Title</span>
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Call Vikram before 4 PM" className={control} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">Employee</span>
            <Select value={form.staffId} onChange={(event) => setForm({ ...form, staffId: event.target.value })} options={db.staff.filter((person) => person.active).map((person) => ({ value: person.id, label: person.name }))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-slate-500">Due</span>
            <input type="datetime-local" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} className={`${control} tabular-nums`} />
          </label>
        </form>
      </Dialog>
    </div>
  )
}
