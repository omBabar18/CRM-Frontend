import { can } from '../constants'
import { useCrm } from '../context'
import { PageHeader } from '../ui'

export function Automation() {
  const { db, user, toggleAutomation } = useCrm()
  const allowed = can(user, 'setTargets') || user.role === 'Admin'
  return (
    <div>
      <PageHeader title="Smart automat" subtitle="Rules the desk will run once the backend is connected. Switches are saved in this workspace." />
      <div className="stack">
        {db.automations.map((rule) => (
          <article key={rule.id} className="card section-title">
            <div>
              <h3>{rule.name}</h3>
              <p className="sub">{rule.detail}</p>
            </div>
            <button className={`chip ${rule.enabled ? 'on' : ''}`} disabled={!allowed} onClick={() => toggleAutomation(rule.id)}>{rule.enabled ? 'On' : 'Off'}</button>
          </article>
        ))}
      </div>
    </div>
  )
}
