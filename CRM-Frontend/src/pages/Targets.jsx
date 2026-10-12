import { useState } from 'react'
import { METRICS, can } from '../constants'
import { useCrm } from '../context'
import { achievement } from '../metrics'
import { compactInr } from '../utils'
import { PageHeader } from '../ui'

export function Targets() {
  const { db, user, updateTargets } = useCrm()
  const [period, setPeriod] = useState('daily')
  const [draft, setDraft] = useState(db.targets)
  const editable = can(user, 'setTargets')
  const actual = achievement(db, period, editable ? null : user.id)
  const goals = draft[period]

  const save = () => updateTargets(draft)

  return (
    <div>
      <PageHeader title="Targets" subtitle={editable ? 'Set the desk targets. The leaderboard uses the same numbers.' : 'Your achievement against the desk target.'} actions={editable && <button className="btn btn-gold" onClick={save}>Save targets</button>} />
      <div className="tabs">
        {['daily', 'weekly', 'monthly'].map((item) => <button key={item} className={`tab ${period === item ? 'on' : ''}`} onClick={() => setPeriod(item)}>{item}</button>)}
      </div>
      <div className="stats">
        {METRICS.map(([key, label, money]) => {
          const goal = Number(goals[key] || 0)
          const done = actual[key] || 0
          const width = Math.min(100, goal ? Math.round((done / goal) * 100) : 0)
          return (
            <article key={key} className="stat">
              <div className="stat-top">{label}</div>
              <b>{money ? compactInr(done) : done}</b>
              <small>of {money ? compactInr(goal) : goal}</small>
              <div className="meter" style={{ marginTop: 8 }}><span style={{ width: `${width}%` }} /></div>
              {editable && (
                <input className="inline-input" style={{ marginTop: 8 }} type="number" value={goals[key]} onChange={(event) => setDraft({ ...draft, [period]: { ...goals, [key]: Number(event.target.value) } })} />
              )}
            </article>
          )
        })}
      </div>
      <article className="card" style={{ marginTop: 14 }}>
        <h2>Leaderboard</h2>
        <div className="leader" style={{ marginTop: 12 }}>
          {db.staff.filter((person) => person.role !== 'Accountant').map((person) => {
            const score = achievement(db, period, person.id)
            return (
              <div key={person.id} className="section-title">
                <div><strong>{person.name}</strong><div className="muted">{person.role} · {score.calls} calls · {score.conversions} conversions</div></div>
                <b>{compactInr(score.goldSale + score.goldLoan)}</b>
              </div>
            )
          })}
        </div>
      </article>
    </div>
  )
}
