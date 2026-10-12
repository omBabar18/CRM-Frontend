import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageCircle, Phone, Plus, Star } from 'lucide-react'
import { KYC_STATUSES, LOCATIONS } from '../constants'
import { useCrm } from '../context'
import { customerActivity } from '../metrics'
import { fmtDate, fmtDateTime, inr, maskId, outstanding, staffName, telLink, waLink } from '../utils'
import { Badge, Field, Modal, PageHeader, statusTone } from '../ui'

export function Customers() {
  const { id } = useParams()
  if (id) return <Profile id={id} />
  return <List />
}

function List() {
  const { visibleCustomers, addCustomer, db } = useCrm()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', mobile: '', location: 'Sangli' })
  const navigate = useNavigate()
  const rows = visibleCustomers.filter((customer) => `${customer.name} ${customer.mobile} ${customer.location}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <PageHeader title="Customers" subtitle="Profiles, KYC, purchases, loans, and repeat business." actions={<button className="btn btn-gold" onClick={() => setOpen(true)}><Plus size={16} /> Quick customer</button>} />
      <div className="filters"><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search customer" /></div>
      <div className="table-wrap">
        <table className="responsive">
          <thead><tr><th>Customer</th><th>Location</th><th>KYC</th><th>Owner</th><th>Since</th></tr></thead>
          <tbody>
            {rows.map((customer) => (
              <tr key={customer.id} className="click" onClick={() => navigate(`/customers/${customer.id}`)}>
                <td data-label="Customer"><strong>{customer.name}</strong><div className="muted">{customer.id} · {customer.mobile}</div></td>
                <td data-label="Location">{customer.location}</td>
                <td data-label="KYC"><Badge tone={statusTone(customer.kyc.status)}>{customer.kyc.status}</Badge></td>
                <td data-label="Owner">{staffName(db.staff, customer.assignedTo)}</td>
                <td data-label="Since">{fmtDate(customer.since)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} title="Add customer" onClose={() => setOpen(false)}>
        <form className="stack" onSubmit={(event) => { event.preventDefault(); const id = addCustomer(form); setOpen(false); navigate(`/customers/${id}`) }}>
          <Field label="Name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Mobile"><input required maxLength={10} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></Field>
          <Field label="Location"><select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}>{LOCATIONS.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <button className="btn btn-gold" type="submit">Save customer</button>
        </form>
      </Modal>
    </div>
  )
}

function Profile({ id }) {
  const crm = useCrm()
  const { db, user, updateCustomer, addNote, requestReview } = crm
  const navigate = useNavigate()
  const customer = db.customers.find((row) => row.id === id)
  const [tab, setTab] = useState('Overview')
  const [note, setNote] = useState('')
  if (!customer) return <PageHeader title="Customer not found" />
  const sensitive = ['Admin', 'Manager', 'Accountant'].includes(user.role)
  const purchases = db.purchases.filter((row) => row.customerId === id)
  const loans = db.loans.filter((row) => row.customerId === id)
  const reviews = db.reviews.filter((row) => row.customerId === id)
  const referrals = db.referrals.filter((row) => row.referrerId === id)
  const activity = customerActivity(customer, db)
  const payments = loans.flatMap((loan) => (loan.payments || []).map((payment) => ({ ...payment, loanId: loan.id })))

  return (
    <div>
      <PageHeader title={customer.name} subtitle={`${customer.id} · ${customer.location} · silent ${activity.days} days`} actions={
        <>
          <a className="btn btn-dark" href={telLink(customer.mobile)}><Phone size={16} /> Call</a>
          <a className="btn btn-wa" href={waLink(customer.mobile, `Namaste ${customer.name}, this is DG Gold Sangli.`)}><MessageCircle size={16} /> WhatsApp</a>
          <button className="btn btn-gold" onClick={() => { requestReview(id); navigate('/whatsapp') }}><Star size={16} /> Request review</button>
        </>
      } />
      <button className="link" onClick={() => navigate('/customers')}>All customers</button>
      <div className="tabs" style={{ marginTop: 12 }}>
        {['Overview', 'KYC', 'Purchases', 'Loans', 'Payments', 'Reviews', 'Referrals', 'Notes'].map((item) => (
          <button key={item} className={`tab ${tab === item ? 'on' : ''}`} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === 'Overview' && (
        <div className="grid-2">
          <article className="card kv">
            <span>Mobile</span><b>{customer.mobile}</b>
            <span>Address</span><b>{customer.address}</b>
            <span>Owner</span><b>{staffName(db.staff, customer.assignedTo)}</b>
            <span>Customer since</span><b>{fmtDate(customer.since)}</b>
            <span>Purchases</span><b>{purchases.length} · {inr(purchases.reduce((sum, row) => sum + row.finalPayable, 0))}</b>
            <span>Loans</span><b>{loans.length}</b>
          </article>
          <article className="card">
            <h2>Quick actions</h2>
            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={() => navigate('/gold-purchase')}>New purchase</button>
              <button className="btn btn-ghost" onClick={() => navigate('/gold-loan')}>New gold loan</button>
              <button className="btn btn-ghost" onClick={() => navigate('/referrals')}>Add referral</button>
            </div>
          </article>
        </div>
      )}
      {tab === 'KYC' && (
        <article className="card stack">
          <p className="muted">Aadhaar and PAN stay masked for sales and calling roles.</p>
          <div className="form-grid">
            <Field label="KYC status">
              <select disabled={!sensitive} value={customer.kyc.status} onChange={(event) => updateCustomer(id, { kyc: { ...customer.kyc, status: event.target.value } })}>
                {KYC_STATUSES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Aadhaar"><input value={sensitive ? customer.kyc.aadhaar : maskId(customer.kyc.aadhaar)} disabled={!sensitive} onChange={(event) => updateCustomer(id, { kyc: { ...customer.kyc, aadhaar: event.target.value } })} /></Field>
            <Field label="PAN"><input value={sensitive ? customer.kyc.pan : maskId(customer.kyc.pan)} disabled={!sensitive} onChange={(event) => updateCustomer(id, { kyc: { ...customer.kyc, pan: event.target.value } })} /></Field>
          </div>
          <Badge tone={statusTone(customer.kyc.status)}>{customer.kyc.status}</Badge>
        </article>
      )}
      {tab === 'Purchases' && <MoneyTable rows={purchases} cols={['id', 'date', 'purity', 'netWeight', 'finalPayable']} labels={['Txn', 'Date', 'Purity', 'Net g', 'Payable']} />}
      {tab === 'Loans' && (
        <div className="table-wrap">
          <table className="responsive">
            <thead><tr><th>Loan</th><th>Amount</th><th>Outstanding</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}><td data-label="Loan">{loan.id}</td><td data-label="Amount">{inr(loan.loanAmount)}</td><td data-label="Outstanding">{inr(outstanding(loan))}</td><td data-label="Due">{fmtDate(loan.dueDate)}</td><td data-label="Status"><Badge tone={statusTone(loan.status)}>{loan.status}</Badge></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'Payments' && <MoneyTable rows={payments} cols={['loanId', 'date', 'mode', 'amount', 'note']} labels={['Loan', 'Date', 'Mode', 'Amount', 'Note']} />}
      {tab === 'Reviews' && (
        <div className="stack">{reviews.map((review) => <article key={review.id} className="card section-title"><div><strong>{review.status}</strong><div className="muted">{staffName(db.staff, review.staffId)}</div></div><Badge tone={statusTone(review.status)}>{review.status}</Badge></article>)}</div>
      )}
      {tab === 'Referrals' && (
        <div className="stack">{referrals.map((row) => <article key={row.id} className="card"><strong>{row.referredName}</strong><div className="muted">{row.referredMobile} · reward {inr(row.reward)} · {row.rewardStatus}</div></article>)}{referrals.length === 0 && <p className="muted">No referrals yet.</p>}</div>
      )}
      {tab === 'Notes' && (
        <div className="stack">
          <form className="card stack" onSubmit={(event) => { event.preventDefault(); addNote(id, note); setNote('') }}>
            <Field label="Staff note"><textarea value={note} onChange={(event) => setNote(event.target.value)} /></Field>
            <button className="btn btn-gold" type="submit">Add note</button>
          </form>
          {customer.notes.map((item) => (
            <article key={item.id} className="card"><strong>{staffName(db.staff, item.staffId)}</strong><div className="muted">{fmtDateTime(item.at)}</div><p>{item.text}</p></article>
          ))}
        </div>
      )}
    </div>
  )
}

function MoneyTable({ rows, cols, labels }) {
  return (
    <div className="table-wrap">
      <table className="responsive">
        <thead><tr>{labels.map((label) => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || `${row.loanId}-${row.date}`}>
              {cols.map((col, index) => <td key={col} data-label={labels[index]}>{col.toLowerCase().includes('date') ? fmtDate(row[col]) : col.toLowerCase().includes('amount') || col.toLowerCase().includes('payable') ? inr(row[col]) : row[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
