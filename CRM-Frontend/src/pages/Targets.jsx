import { useState } from 'react'
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { METRICS, can } from '../constants'
import { useCrm } from '../context'
import { achievement } from '../metrics'
import { compactInr, inRange, rangeFor } from '../utils'
import { ChartFrame, PageHeader } from '../ui'

const DESK = [
  ['followups', 'Follow-ups'],
  ['purchases', 'Purchases'],
  ['customers', 'Customers'],
  ['calls', 'Calls'],
]

const PERIODS = [
  ['daily', 'Day'],
  ['weekly', 'Week'],
  ['monthly', 'Month'],
]

export function Targets() {
  const { db, user, updateTargets } = useCrm()
  const [period, setPeriod] = useState('daily')
  const [draft, setDraft] = useState(db.targets)
  const editable = can(user, 'setTargets')
  const actual = achievement(db, period, editable ? null : user.id)
  const goals = draft[period]

  const setDesk = (key, slot, value) => {
    setDraft({
      ...draft,
      [key]: { ...(draft[key] || {}), [slot]: Number(value) },
    })
  }

  const save = () => updateTargets(draft)

  const people = db.staff.filter((person) => person.role !== 'Accountant')
  const chart = people.map((person) => {
    const score = achievement(db, period, person.id)
    const { start, end } = rangeFor(period)
    return {
      name: person.name.split(' ')[0],
      Calls: score.calls,
      'Follow-ups': score.followups,
      Purchases: db.purchases.filter((row) => inRange(row.date, start, end) && row.staffId === person.id).length,
      Customers: db.customers.filter((row) => inRange(row.since, start, end) && row.assignedTo === person.id).length,
    }
  })

  return (
    <div>
      <PageHeader title="Targets" subtitle={editable ? 'Set day, week, and month targets for the desk.' : 'Your achievement against the desk target.'} actions={editable && <button className="btn btn-gold" onClick={save}>Save targets</button>} />
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
            </article>
          )
        })}
      </div>

      {editable && (
        <article className="card" style={{ marginTop: 14 }}>
          <h2>Set desk targets</h2>
          <p className="sub">Follow-ups, purchases, customers, and calls for the day, the week, and the month.</p>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  {PERIODS.map(([, label]) => <th key={label}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {DESK.map(([slot, label]) => (
                  <tr key={slot}>
                    <td>{label}</td>
                    {PERIODS.map(([key]) => (
                      <td key={key}>
                        <input
                          className="inline-input"
                          type="number"
                          min="0"
                          value={draft[key]?.[slot] ?? 0}
                          onChange={(event) => setDesk(key, slot, event.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      <article className="card" style={{ marginTop: 14 }}>
        <h2>What each employee has done</h2>
        <p className="sub">Calls, follow-ups, purchases, and new customers for this {period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}.</p>
        <ChartFrame>
          {({ width, height }) => (
            <BarChart width={width} height={height} data={chart}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
              <Bar dataKey="Calls" fill="#7BA7F7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Follow-ups" fill="#4F83F1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Purchases" fill="#1E4A9A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Customers" fill="#94A3B8" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ChartFrame>
      </article>
    </div>
  )
}
