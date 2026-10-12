import { useState } from 'react'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { can } from '../constants'
import { useCrm } from '../context'
import { achievement, leadSourceStats } from '../metrics'
import { downloadCsv, followupBucket, fmtDate, inr, outstanding, staffName } from '../utils'
import { Access, ChartFrame, PageHeader } from '../ui'

const REPORTS = ['Lead source', 'Conversion', 'Staff performance', 'Daily sales', 'Gold purchase', 'Gold loan', 'Follow-up', 'Revenue', 'Google review', 'Referral']

export function Reports() {
  const crm = useCrm()
  const { db, user, visibleLeads } = crm
  const [name, setName] = useState(REPORTS[0])
  const built = build(name, db, visibleLeads)
  return (
    <Access allow={can(user, 'viewReports')}>
      <PageHeader title="Reports" subtitle="Desk reports for Sangli. Export the table you are viewing." actions={<button className="btn btn-dark" onClick={() => downloadCsv(`${name}.csv`, [built.columns, ...built.rows])}>Export CSV</button>} />
      <div className="tabs">{REPORTS.map((item) => <button key={item} className={`tab ${name === item ? 'on' : ''}`} onClick={() => setName(item)}>{item}</button>)}</div>
      <div className="grid-2">
        <div className="table-wrap">
          <table className="responsive">
            <thead><tr>{built.columns.map((col) => <th key={col}>{col}</th>)}</tr></thead>
            <tbody>
              {built.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} data-label={built.columns[cellIndex]}>{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <article className="card">
          <h2>{name}</h2>
          <ChartFrame>
            {({ width, height }) => (
              <BarChart width={width} height={height} data={built.chart}>
                <XAxis dataKey="name" hide={built.chart.length > 8} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2F6FED" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ChartFrame>
        </article>
      </div>
    </Access>
  )
}

function build(name, db, leads) {
  if (name === 'Lead source') {
    const stats = leadSourceStats(leads)
    return { columns: ['Source', 'Leads'], rows: stats.map((row) => [row.name, row.value]), chart: stats.map((row) => ({ name: row.name, value: row.value })) }
  }
  if (name === 'Conversion') {
    const converted = leads.filter((lead) => lead.status === 'Converted').length
    const rows = [['Leads', leads.length], ['Converted', converted], ['Rate', `${leads.length ? Math.round((converted / leads.length) * 100) : 0}%`]]
    return { columns: ['Metric', 'Value'], rows, chart: rows.slice(0, 2).map((row) => ({ name: row[0], value: Number(row[1]) })) }
  }
  if (name === 'Staff performance') {
    const rows = db.staff.map((person) => {
      const score = achievement(db, 'monthly', person.id)
      return [person.name, person.role, score.calls, score.conversions, inr(score.goldSale), inr(score.goldLoan)]
    })
    return { columns: ['Employee', 'Role', 'Calls', 'Conversions', 'Gold sale', 'Gold loan'], rows, chart: db.staff.map((person) => ({ name: person.name.split(' ')[0], value: achievement(db, 'monthly', person.id).calls })) }
  }
  if (name === 'Daily sales' || name === 'Gold purchase') {
    const rows = db.purchases.map((row) => [row.id, db.customers.find((customer) => customer.id === row.customerId)?.name, fmtDate(row.date), inr(row.finalPayable), staffName(db.staff, row.staffId)])
    return { columns: ['Txn', 'Customer', 'Date', 'Payable', 'Employee'], rows, chart: db.purchases.slice(0, 8).map((row) => ({ name: row.id.slice(-3), value: row.finalPayable })) }
  }
  if (name === 'Gold loan') {
    const rows = db.loans.map((row) => [row.id, db.customers.find((customer) => customer.id === row.customerId)?.name, inr(row.loanAmount), inr(outstanding(row)), row.status])
    return { columns: ['Loan', 'Customer', 'Amount', 'Outstanding', 'Status'], rows, chart: db.loans.map((row) => ({ name: row.id.slice(-3), value: outstanding(row) })) }
  }
  if (name === 'Follow-up') {
    const rows = leads.filter((lead) => followupBucket(lead)).map((lead) => [lead.name, followupBucket(lead), fmtDate(lead.nextFollowUp), staffName(db.staff, lead.assignedTo)])
    const chartMap = {}
    rows.forEach((row) => { chartMap[row[1]] = (chartMap[row[1]] || 0) + 1 })
    return { columns: ['Lead', 'Bucket', 'Date', 'Owner'], rows, chart: Object.entries(chartMap).map(([key, value]) => ({ name: key, value })) }
  }
  if (name === 'Revenue') {
    const month = achievement(db, 'monthly')
    const rows = [['Gold sale payouts', inr(month.goldSale)], ['Gold loans disbursed', inr(month.goldLoan)], ['Margins and fees', inr(month.revenue)]]
    return { columns: ['Line', 'This month'], rows, chart: [{ name: 'Sale', value: month.goldSale }, { name: 'Loan', value: month.goldLoan }, { name: 'Revenue', value: month.revenue }] }
  }
  if (name === 'Google review') {
    const rows = db.reviews.map((row) => [db.customers.find((customer) => customer.id === row.customerId)?.name, row.status, staffName(db.staff, row.staffId)])
    return { columns: ['Customer', 'Status', 'Employee'], rows, chart: ['Pending', 'Requested', 'Completed'].map((status) => ({ name: status, value: db.reviews.filter((row) => row.status === status).length })) }
  }
  const rows = db.referrals.map((row) => [db.customers.find((customer) => customer.id === row.referrerId)?.name, row.referredName, row.converted ? 'Yes' : 'No', inr(row.reward), row.rewardStatus])
  return { columns: ['Referrer', 'Referred', 'Converted', 'Reward', 'Status'], rows, chart: [{ name: 'Converted', value: db.referrals.filter((row) => row.converted).length }, { name: 'Open', value: db.referrals.filter((row) => !row.converted).length }] }
}
