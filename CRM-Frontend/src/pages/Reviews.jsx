import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { achievement } from '../metrics'
import { useCrm } from '../context'
import { fmtDate, staffName } from '../utils'
import { Badge, ChartFrame, PageHeader, statusTone } from '../ui'

export function Reviews() {
  const { db, requestReview, completeReview, user } = useCrm()
  const navigate = useNavigate()
  const month = achievement(db, 'monthly')
  const today = achievement(db, 'daily')
  const counts = {
    Requested: db.reviews.filter((row) => row.status === 'Requested').length,
    Completed: db.reviews.filter((row) => row.status === 'Completed').length,
    Pending: db.reviews.filter((row) => row.status === 'Pending').length,
  }
  const byStaff = db.staff.map((person) => ({
    name: person.name.split(' ')[0],
    reviews: db.reviews.filter((row) => row.staffId === person.id && row.status === 'Completed').length,
  })).filter((row) => row.reviews)

  return (
    <div>
      <PageHeader title="Google reviews" subtitle={`Daily target ${db.targets.daily.reviews} · monthly target ${db.targets.monthly.reviews}`} />
      <section className="stats">
        <article className="stat"><div className="stat-top">Requested</div><b>{counts.Requested}</b></article>
        <article className="stat"><div className="stat-top">Completed</div><b>{counts.Completed}</b></article>
        <article className="stat hot"><div className="stat-top">Pending</div><b>{counts.Pending}</b></article>
        <article className="stat"><div className="stat-top">Today</div><b>{today.reviews}/{db.targets.daily.reviews}</b></article>
        <article className="stat"><div className="stat-top">This month</div><b>{month.reviews}/{db.targets.monthly.reviews}</b></article>
      </section>
      <div className="grid-2">
        <div className="table-wrap">
          <table className="responsive">
            <thead><tr><th>Customer</th><th>Employee</th><th>Status</th><th>Requested</th><th></th></tr></thead>
            <tbody>
              {db.reviews.map((review) => {
                const customer = db.customers.find((row) => row.id === review.customerId)
                return (
                  <tr key={review.id}>
                    <td data-label="Customer">{customer?.name}</td>
                    <td data-label="Employee">{staffName(db.staff, review.staffId)}</td>
                    <td data-label="Status"><Badge tone={statusTone(review.status)}>{review.status}</Badge></td>
                    <td data-label="Requested">{fmtDate(review.requestedAt)}</td>
                    <td data-label="Action">
                      <div className="actions">
                        {review.status !== 'Completed' && <button className="btn btn-gold" onClick={() => { requestReview(review.customerId); navigate(`/whatsapp`) }}>Request</button>}
                        {review.status === 'Requested' && <button className="btn btn-dark" onClick={() => completeReview(review.id)}>Mark completed</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <article className="card">
          <h2>Employee-wise reviews</h2>
          <p className="sub">Signed in as {user.name}</p>
          <ChartFrame>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={byStaff}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="reviews" fill="#00A699" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ChartFrame>
          <p className="muted">Replace the sample Google link from WhatsApp templates when the Business Profile is ready.</p>
        </article>
      </div>
    </div>
  )
}
