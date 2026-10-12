import { useState } from 'react'
import { useCrm } from '../context'
import { fmtDate, inr } from '../utils'
import { Badge, Field, Modal, PageHeader, statusTone } from '../ui'

export function Referrals() {
  const { db, visibleCustomers, addReferral, updateReferral } = useCrm()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ referrerId: visibleCustomers[0]?.id || '', referredName: '', referredMobile: '', reward: 500 })
  const rows = db.referrals.filter((row) => visibleCustomers.some((customer) => customer.id === row.referrerId))

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Track who sent the customer, and whether the reward is paid." actions={<button className="btn btn-gold" onClick={() => setOpen(true)}>Add referral</button>} />
      <div className="table-wrap">
        <table className="responsive">
          <thead><tr><th>Referrer</th><th>Referred</th><th>Date</th><th>Conversion</th><th>Reward</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Referrer">{db.customers.find((customer) => customer.id === row.referrerId)?.name}</td>
                <td data-label="Referred">{row.referredName}<div className="muted">{row.referredMobile}</div></td>
                <td data-label="Date">{fmtDate(row.date)}</td>
                <td data-label="Conversion">{row.converted ? 'Converted' : 'Open'}</td>
                <td data-label="Reward">{inr(row.reward)}</td>
                <td data-label="Status"><Badge tone={statusTone(row.rewardStatus)}>{row.rewardStatus}</Badge></td>
                <td data-label="Actions">
                  <div className="actions">
                    {!row.converted && <button className="btn btn-ghost" onClick={() => updateReferral(row.id, { converted: true })}>Mark converted</button>}
                    {row.rewardStatus === 'Pending' && <button className="btn btn-dark" onClick={() => updateReferral(row.id, { rewardStatus: 'Paid' })}>Pay reward</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} title="New referral" onClose={() => setOpen(false)}>
        <form className="stack" onSubmit={(event) => { event.preventDefault(); addReferral(form); setOpen(false) }}>
          <Field label="Referrer"><select value={form.referrerId} onChange={(event) => setForm({ ...form, referrerId: event.target.value })}>{visibleCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
          <Field label="Referred customer"><input required value={form.referredName} onChange={(event) => setForm({ ...form, referredName: event.target.value })} /></Field>
          <Field label="Mobile"><input required maxLength={10} value={form.referredMobile} onChange={(event) => setForm({ ...form, referredMobile: event.target.value })} /></Field>
          <Field label="Reward"><input type="number" value={form.reward} onChange={(event) => setForm({ ...form, reward: event.target.value })} /></Field>
          <button className="btn btn-gold" type="submit">Save referral</button>
        </form>
      </Modal>
    </div>
  )
}
