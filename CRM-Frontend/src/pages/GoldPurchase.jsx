import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GOLD_TYPES, PAYMENT_MODES, PURITIES } from '../constants'
import { useCrm } from '../context'
import { fmtDate, inr, staffName } from '../utils'
import { Drawer, Field, PageHeader } from '../ui'

export function GoldPurchase() {
  const { db, visibleCustomers, addPurchase, rateFor } = useCrm()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(params.get('new') === '1')
  const [form, setForm] = useState({
    customerId: visibleCustomers[0]?.id || '',
    goldType: 'Jewellery',
    grossWeight: '',
    netWeight: '',
    purity: '22K (916)',
    rate: rateFor('22K (916)'),
    deduction: '',
    paymentMode: 'Cash',
  })
  const rows = db.purchases.filter((row) => visibleCustomers.some((customer) => customer.id === row.customerId))
  const gross = useMemo(() => Math.round(Number(form.netWeight || 0) * Number(form.rate || 0)), [form.netWeight, form.rate])
  const payable = Math.max(0, gross - Number(form.deduction || 0))

  return (
    <div>
      <PageHeader title="Gold purchase" subtitle="Cash for gold, with weight, purity, and payout on one screen." actions={<button className="btn btn-gold" onClick={() => setOpen(true)}>New purchase</button>} />
      <div className="table-wrap">
        <table className="responsive">
          <thead><tr><th>Txn</th><th>Customer</th><th>Type</th><th>Net</th><th>Purity</th><th>Payable</th><th>Mode</th><th>Date</th><th>Employee</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Txn">{row.id}</td>
                <td data-label="Customer">{db.customers.find((customer) => customer.id === row.customerId)?.name}</td>
                <td data-label="Type">{row.goldType}</td>
                <td data-label="Net">{row.netWeight}g</td>
                <td data-label="Purity">{row.purity}</td>
                <td data-label="Payable">{inr(row.finalPayable)}</td>
                <td data-label="Mode">{row.paymentMode}</td>
                <td data-label="Date">{fmtDate(row.date)}</td>
                <td data-label="Employee">{staffName(db.staff, row.staffId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Drawer open={open} title="Buy gold" onClose={() => { setOpen(false); setParams({}) }}>
        <form className="stack" onSubmit={(event) => { event.preventDefault(); addPurchase(form); setOpen(false) }}>
          <Field label="Customer">
            <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
              {visibleCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Gold type"><select value={form.goldType} onChange={(event) => setForm({ ...form, goldType: event.target.value })}>{GOLD_TYPES.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Purity"><select value={form.purity} onChange={(event) => setForm({ ...form, purity: event.target.value, rate: rateFor(event.target.value) })}>{PURITIES.map((item) => <option key={item.id}>{item.id}</option>)}</select></Field>
            <Field label="Gross weight"><input required type="number" step="0.01" value={form.grossWeight} onChange={(event) => setForm({ ...form, grossWeight: event.target.value })} /></Field>
            <Field label="Net weight"><input required type="number" step="0.01" value={form.netWeight} onChange={(event) => setForm({ ...form, netWeight: event.target.value })} /></Field>
            <Field label="Gold rate"><input type="number" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} /></Field>
            <Field label="Deduction"><input type="number" value={form.deduction} onChange={(event) => setForm({ ...form, deduction: event.target.value })} /></Field>
            <Field label="Payment mode"><select value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}>{PAYMENT_MODES.map((item) => <option key={item}>{item}</option>)}</select></Field>
          </div>
          <article className="card">
            <div className="kv"><span>Gross value</span><b>{inr(gross)}</b><span>Final payable</span><b>{inr(payable)}</b></div>
          </article>
          <button className="btn btn-gold" type="submit">Save purchase</button>
        </form>
      </Drawer>
    </div>
  )
}
