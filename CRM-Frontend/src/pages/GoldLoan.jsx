import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LOAN_STATUSES, PAYMENT_MODES, PURITIES } from '../constants'
import { useCrm } from '../context'
import { fmtDate, fromLocalInput, inr, isoOffset, outstanding, staffName, toLocalInput } from '../utils'
import { Badge, Drawer, Field, PageHeader, statusTone } from '../ui'

export function GoldLoan() {
  const crm = useCrm()
  const { db, visibleCustomers, addLoan, addLoanPayment, setLoanStatus, rateFor } = crm
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(params.get('new') === '1')
  const [active, setActive] = useState(null)
  const [pay, setPay] = useState({ amount: '', mode: 'UPI', note: '' })
  const [form, setForm] = useState(() => blank(visibleCustomers[0]?.id, rateFor('22K (916)')))
  const loans = db.loans.filter((loan) => visibleCustomers.some((customer) => customer.id === loan.customerId))
  const selected = loans.find((loan) => loan.id === active)
  const factor = crm.purityFactor(form.purity)
  const market = Math.round(Number(form.weight || 0) * Number(form.rate || 0) * factor)
  const suggested = Math.round(market * 0.75)

  const save = (event) => {
    event.preventDefault()
    addLoan({ ...form, startDate: fromLocalInput(form.startDate), dueDate: fromLocalInput(form.dueDate) })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader title="Gold loans" subtitle="Valuation, disbursement, dues, and collections." actions={<button className="btn btn-gold" onClick={() => setOpen(true)}>New gold loan</button>} />
      <div className="table-wrap">
        <table className="responsive">
          <thead><tr><th>Loan</th><th>Customer</th><th>Weight</th><th>Amount</th><th>Outstanding</th><th>Due</th><th>Status</th><th>Employee</th></tr></thead>
          <tbody>
            {loans.map((loan) => {
              const customer = db.customers.find((row) => row.id === loan.customerId)
              return (
                <tr key={loan.id} className={`click ${loan.status === 'Overdue' ? 'hot' : ''}`} onClick={() => setActive(loan.id)}>
                  <td data-label="Loan">{loan.id}</td>
                  <td data-label="Customer">{customer?.name}</td>
                  <td data-label="Weight">{loan.weight}g · {loan.purity}</td>
                  <td data-label="Amount">{inr(loan.loanAmount)}</td>
                  <td data-label="Outstanding">{inr(outstanding(loan))}</td>
                  <td data-label="Due">{fmtDate(loan.dueDate)}</td>
                  <td data-label="Status"><Badge tone={statusTone(loan.status)}>{loan.status}</Badge></td>
                  <td data-label="Employee">{staffName(db.staff, loan.staffId)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Drawer open={open} title="New gold loan" onClose={() => { setOpen(false); setParams({}) }} footer={<button className="btn btn-gold" form="loan-form" type="submit">Create loan</button>}>
        <form id="loan-form" className="stack" onSubmit={save}>
          <Field label="Customer">
            <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
              {visibleCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </Field>
          <div className="form-grid">
            <Field label="Gold weight (g)"><input type="number" step="0.1" required value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} /></Field>
            <Field label="Purity">
              <select value={form.purity} onChange={(event) => setForm({ ...form, purity: event.target.value, rate: rateFor(event.target.value) })}>
                {PURITIES.map((item) => <option key={item.id}>{item.id}</option>)}
              </select>
            </Field>
            <Field label="Valuation rate"><input type="number" value={form.rate} onChange={(event) => setForm({ ...form, rate: event.target.value })} /></Field>
            <Field label="Interest %"><input type="number" step="0.1" value={form.interestRate} onChange={(event) => setForm({ ...form, interestRate: event.target.value })} /></Field>
            <Field label="Processing fee"><input type="number" value={form.processingFee} onChange={(event) => setForm({ ...form, processingFee: event.target.value })} /></Field>
            <Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{LOAN_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field>
            <Field label="Start"><input type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></Field>
            <Field label="Due"><input type="datetime-local" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></Field>
          </div>
          <article className="card">
            <div className="muted">Market value {inr(market)}</div>
            <strong>Suggested 75% LTV {inr(suggested)}</strong>
            <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setForm({ ...form, loanAmount: suggested })}>Use suggested amount</button>
          </article>
          <Field label="Loan amount"><input type="number" required value={form.loanAmount} onChange={(event) => setForm({ ...form, loanAmount: event.target.value })} /></Field>
        </form>
      </Drawer>
      <Drawer open={Boolean(selected)} title={selected?.id || ''} onClose={() => setActive(null)}>
        {selected && (
          <div className="stack">
            <div className="kv">
              <span>Customer</span><b>{db.customers.find((row) => row.id === selected.customerId)?.name}</b>
              <span>Rate</span><b>₹{selected.rate}/g</b>
              <span>Interest</span><b>{selected.interestRate}%</b>
              <span>Fee</span><b>{inr(selected.processingFee)}</b>
              <span>Outstanding</span><b>{inr(outstanding(selected))}</b>
            </div>
            <Field label="Loan status">
              <select value={selected.status} onChange={(event) => setLoanStatus(selected.id, event.target.value)}>{LOAN_STATUSES.map((item) => <option key={item}>{item}</option>)}</select>
            </Field>
            <h3>Payment history</h3>
            {(selected.payments || []).map((payment) => <article key={payment.id} className="card">{fmtDate(payment.date)} · {inr(payment.amount)} · {payment.mode}<div className="muted">{payment.note}</div></article>)}
            <form className="stack" onSubmit={(event) => { event.preventDefault(); addLoanPayment(selected.id, pay); setPay({ amount: '', mode: 'UPI', note: '' }) }}>
              <Field label="Amount"><input required type="number" value={pay.amount} onChange={(event) => setPay({ ...pay, amount: event.target.value })} /></Field>
              <Field label="Mode"><select value={pay.mode} onChange={(event) => setPay({ ...pay, mode: event.target.value })}>{PAYMENT_MODES.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Note"><input value={pay.note} onChange={(event) => setPay({ ...pay, note: event.target.value })} /></Field>
              <button className="btn btn-gold" type="submit">Record payment</button>
            </form>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function blank(customerId, rate) {
  return {
    customerId: customerId || '',
    weight: '',
    purity: '22K (916)',
    rate,
    loanAmount: '',
    interestRate: 12,
    processingFee: '',
    startDate: toLocalInput(isoOffset(0, 11, 0)),
    dueDate: toLocalInput(isoOffset(90, 11, 0)),
    status: 'Active',
  }
}
