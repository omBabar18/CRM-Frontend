import { useState } from 'react'
import { ROLES, can } from '../constants'
import { useCrm } from '../context'
import { Access, Badge, Field, Modal, PageHeader } from '../ui'

const FLAGS = [
  ['viewAllLeads', 'View all leads'],
  ['manageStaff', 'Manage staff'],
  ['setTargets', 'Set targets'],
  ['viewReports', 'View reports'],
  ['manageFinance', 'Finance records'],
]

export function Staff() {
  const { db, user, addStaff, updateStaff, removeStaff } = useCrm()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', password: 'gold123', role: 'Sales Executive' })
  const [removeId, setRemoveId] = useState(null)

  return (
    <Access allow={can(user, 'manageStaff')}>
      <PageHeader title="Staff" subtitle="Admin controls employees, lead access, and targets." actions={<button className="btn btn-gold" onClick={() => setOpen(true)}>Add employee</button>} />
      <div className="stack">
        {db.staff.map((person) => (
          <article key={person.id} className="card">
            <div className="section-title">
              <div><h3>{person.name}</h3><p className="sub">{person.mobile}</p></div>
              <Badge tone="dark">{person.role}</Badge>
            </div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Role">
                <select value={person.role} onChange={(event) => updateStaff(person.id, { role: event.target.value })}>
                  {ROLES.map((role) => <option key={role}>{role}</option>)}
                </select>
              </Field>
              <Field label="Password">
                <input type="text" defaultValue={person.password} onBlur={(event) => updateStaff(person.id, { password: event.target.value })} />
              </Field>
            </div>
            <div className="actions" style={{ marginTop: 10 }}>
              {FLAGS.map(([key, label]) => (
                <button key={key} className={`chip ${person.permissions[key] ? 'on' : ''}`} onClick={() => updateStaff(person.id, { permissions: { ...person.permissions, [key]: !person.permissions[key] } })}>{label}</button>
              ))}
              {person.id !== user.id && <button className="btn btn-danger" onClick={() => setRemoveId(person.id)}>Remove</button>}
            </div>
          </article>
        ))}
      </div>
      <Modal open={open} title="Add employee" onClose={() => setOpen(false)}>
        <form className="stack" onSubmit={(event) => { event.preventDefault(); addStaff(form); setOpen(false) }}>
          <Field label="Name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Mobile"><input required maxLength={10} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></Field>
          <Field label="Temporary password"><input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
          <Field label="Role"><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select></Field>
          <button className="btn btn-gold" type="submit">Save employee</button>
        </form>
      </Modal>
      <Modal open={Boolean(removeId)} title="Remove employee" onClose={() => setRemoveId(null)} footer={
        <button className="btn btn-danger" onClick={() => { removeStaff(removeId); setRemoveId(null) }}>Remove and reassign leads</button>
      }>
        <p>Open leads move to your name. Past transactions stay on record.</p>
      </Modal>
    </Access>
  )
}
