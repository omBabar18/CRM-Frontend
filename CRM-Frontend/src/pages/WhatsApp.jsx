import { useMemo, useState } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import { TEMPLATES } from '../constants'
import { useCrm } from '../context'
import { fillTemplate, inr, waLink } from '../utils'
import { PageHeader } from '../ui'

export function WhatsApp() {
  const { visibleLeads, visibleCustomers, db, user } = useCrm()
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [who, setWho] = useState(`lead:${visibleLeads[0]?.id || ''}`)
  const template = TEMPLATES.find((item) => item.id === templateId)
  const people = [
    ...visibleLeads.map((lead) => ({ key: `lead:${lead.id}`, name: lead.name, mobile: lead.mobile, requirement: lead.requirement, amount: inr(lead.expectedAmount), date: lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleString('en-IN') : 'today' })),
    ...visibleCustomers.map((customer) => ({ key: `customer:${customer.id}`, name: customer.name, mobile: customer.mobile, requirement: 'your gold transaction', amount: '', date: 'today' })),
  ]
  const person = people.find((item) => item.key === who) || people[0]
  const message = useMemo(() => fillTemplate(template.body, {
    name: person?.name || '',
    staff: user.name,
    requirement: person?.requirement || 'gold',
    rate: db.rates.k22,
    rate24: db.rates.k24,
    date: person?.date || '',
    amount: person?.amount || '',
    txn: 'DG Gold',
    link: db.settings.reviewLink,
  }), [template, person, user.name, db.rates, db.settings.reviewLink])

  return (
    <div>
      <PageHeader title="WhatsApp CRM" subtitle="Templates for the Sangli desk. Sending opens WhatsApp with the message ready." />
      <div className="grid-2">
        <div className="stack">
          {TEMPLATES.map((item) => (
            <button key={item.id} className={`queue-item ${item.id === templateId ? 'on' : ''}`} onClick={() => setTemplateId(item.id)}>
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
        <article className="card stack">
          <label className="field">Send to
            <select value={who} onChange={(event) => setWho(event.target.value)}>
              {people.map((item) => <option key={item.key} value={item.key}>{item.name} · {item.mobile}</option>)}
            </select>
          </label>
          <div className="phone">
            <div className="muted" style={{ marginBottom: 8 }}>DG Gold</div>
            <div className="bubble">{message}</div>
          </div>
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(message)}><Copy size={16} /> Copy</button>
            <a className="btn btn-wa" href={person ? waLink(person.mobile, message) : '#'} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Open WhatsApp</a>
          </div>
          <p className="muted">Review link is a sample until the Google Business profile link is saved in reviews.</p>
        </article>
      </div>
    </div>
  )
}
