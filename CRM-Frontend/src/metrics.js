import { inRange, rangeFor, followupBucket, isActiveLead, outstanding, lastTransactionAt, daysSince, reactivationBucket } from './utils'

export function achievement(db, period, staffId) {
  const { start, end } = rangeFor(period)
  const within = (iso) => inRange(iso, start, end)
  const mine = (id) => !staffId || id === staffId
  const purchases = db.purchases.filter((row) => within(row.date) && mine(row.staffId))
  const loans = db.loans.filter((row) => within(row.startDate) && mine(row.staffId))
  return {
    leads: db.leads.filter((row) => within(row.createdAt) && mine(row.assignedTo)).length,
    calls: db.activities.filter((row) => row.type === 'call' && within(row.at) && mine(row.staffId)).length,
    followups: db.activities.filter((row) => row.type === 'followup' && within(row.at) && mine(row.staffId)).length,
    visits: db.activities.filter((row) => row.type === 'visit' && within(row.at) && mine(row.staffId)).length,
    conversions: db.leads.filter((row) => row.status === 'Converted' && within(row.convertedAt) && mine(row.assignedTo)).length,
    goldSale: purchases.reduce((sum, row) => sum + Number(row.finalPayable || 0), 0),
    goldLoan: loans.reduce((sum, row) => sum + Number(row.loanAmount || 0), 0),
    revenue:
      purchases.reduce((sum, row) => sum + Number(row.deduction || 0), 0) +
      loans.reduce((sum, row) => sum + Number(row.processingFee || 0), 0),
    reviews: db.reviews.filter((row) => row.status === 'Completed' && within(row.completedAt) && mine(row.staffId)).length,
    referrals: db.referrals.filter((row) => within(row.date) && mine(row.staffId)).length,
  }
}

export function leadSourceStats(leads) {
  const map = new Map()
  leads.forEach((lead) => map.set(lead.source, (map.get(lead.source) || 0) + 1))
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

export function queueLeads(leads) {
  const rank = { overdue: 0, today: 1, none: 2, tomorrow: 3, week: 4, later: 5 }
  const priority = { High: 0, Medium: 1, Low: 2 }
  return leads
    .filter(isActiveLead)
    .slice()
    .sort((a, b) => {
      const bucket = (rank[followupBucket(a)] ?? 9) - (rank[followupBucket(b)] ?? 9)
      if (bucket) return bucket
      return (priority[a.priority] ?? 9) - (priority[b.priority] ?? 9)
    })
}

export function loanWithBalance(loan) {
  return { ...loan, outstanding: outstanding(loan) }
}

export function customerActivity(customer, db) {
  const at = lastTransactionAt(customer, db)
  const days = daysSince(at)
  return { at, days, bucket: reactivationBucket(days) }
}

export function dashboardPulse(db, leads) {
  const today = achievement(db, 'daily')
  const month = achievement(db, 'monthly')
  const overdue = leads.filter((lead) => followupBucket(lead) === 'overdue').length
  const pending = leads.filter((lead) => followupBucket(lead) === 'today').length
  const visitsToday = leads.filter((lead) => lead.status === 'Visit Scheduled' && followupBucket(lead) === 'today').length
  const overdueLoans = db.loans.filter((loan) => loan.status === 'Overdue' || (loan.status !== 'Closed' && outstanding(loan) > 0 && loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status !== 'Renewed')).length
  return { today, month, overdue, pending, visitsToday, overdueLoans }
}
