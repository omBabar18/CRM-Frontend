import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES } from '../constants'
import { useCrm } from '../context'
import { fmtDate, waLink } from '../utils'
import { PageHeader } from '../ui'

const BUCKETS = [
  ['30', '30 days'],
  ['60', '60 days'],
  ['90', '90 days'],
  ['180', '180 days'],
]

export function Reactivation() {
  const { reactivation, db, user, addCampaign } = useCrm()
  const [bucket, setBucket] = useState('30')
  const [templateId, setTemplateId] = useState('follow-up')
  const navigate = useNavigate()
  const rows = reactivation.filter((row) => row.bucket === bucket)
  const template = TEMPLATES.find((item) => item.id === templateId)

  return (
    <div>
      <PageHeader title="Customer reactivation" subtitle="Customers with no gold sale or loan activity in the selected window." actions={
        <button className="btn btn-gold" onClick={() => addCampaign(bucket, templateId, rows.length)}>Create campaign ({rows.length})</button>
      } />
      <div className="tabs">
        {BUCKETS.map(([key, label]) => <button key={key} className={`tab ${bucket === key ? 'on' : ''}`} onClick={() => setBucket(key)}>{label} ({reactivation.filter((row) => row.bucket === key).length})</button>)}
      </div>
      <div className="grid-2">
        <div className="table-wrap">
          <table className="responsive">
            <thead><tr><th>Customer</th><th>Last activity</th><th>Silent</th><th></th></tr></thead>
            <tbody>
              {rows.map(({ customer, at, days }) => (
                <tr key={customer.id}>
                  <td data-label="Customer"><strong>{customer.name}</strong><div className="muted">{customer.mobile}</div></td>
                  <td data-label="Last activity">{fmtDate(at)}</td>
                  <td data-label="Silent">{days} days</td>
                  <td data-label="WhatsApp"><a className="btn btn-wa" href={waLink(customer.mobile, `Namaste ${customer.name}, ${user.name} from DG Gold. It has been a while — today’s 22K rate is ₹${db.rates.k22}/g.`)}>Message</a></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4}><div className="empty">No customers in this window.</div></td></tr>}
            </tbody>
          </table>
        </div>
        <article className="card stack">
          <h2>Campaign</h2>
          <label className="field">Template
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
              {TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <p>{template.body}</p>
          <h3>Recent campaigns</h3>
          {db.campaigns.length === 0 && <p className="muted">None yet.</p>}
          {db.campaigns.map((campaign) => <article key={campaign.id} className="queue-item"><strong>{campaign.bucket} day · {campaign.audience} customers</strong><div className="muted">{fmtDate(campaign.createdAt)}</div></article>)}
          <button className="btn btn-ghost" onClick={() => navigate('/whatsapp')}>Open WhatsApp desk</button>
        </article>
      </div>
    </div>
  )
}
