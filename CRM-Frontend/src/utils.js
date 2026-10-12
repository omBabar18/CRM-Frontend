import { TERMINAL } from './constants'

export const inr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)

export function compactInr(n) {
  const v = Number(n) || 0
  if (Math.abs(v) >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`
  if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (Math.abs(v) >= 1000) return `₹${Math.round(v / 1000)}k`
  return `₹${Math.round(v)}`
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  return `${fmtDate(iso)}, ${fmtTime(iso)}`
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isoOffset(dayOffset, hours = 10, minutes = 0) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function isActiveLead(lead) {
  return lead && !TERMINAL.includes(lead.status)
}

export function followupBucket(lead, now = new Date()) {
  if (!isActiveLead(lead)) return null
  if (!lead.nextFollowUp) return 'none'
  const due = startOfDay(lead.nextFollowUp)
  const today = startOfDay(now)
  const diff = Math.round((due - today) / 86400000)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff <= 7) return 'week'
  return 'later'
}

export function rangeFor(period, now = new Date()) {
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = startOfDay(now)
  if (period === 'weekly') {
    const day = start.getDay()
    const mondayShift = day === 0 ? 6 : day - 1
    start.setDate(start.getDate() - mondayShift)
  } else if (period === 'monthly') {
    start.setDate(1)
  }
  return { start, end }
}

export function inRange(iso, start, end) {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return t >= start.getTime() && t <= end.getTime()
}

export function telLink(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '').slice(-10)
  return `tel:+91${digits}`
}

export function waLink(mobile, text) {
  const digits = String(mobile || '').replace(/\D/g, '')
  const num = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${num}?text=${encodeURIComponent(text || '')}`
}

export function fillTemplate(body, vars) {
  return String(body || '').replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] == null ? '' : String(vars[key])))
}

export function maskId(value) {
  const raw = String(value || '')
  if (raw.length < 4) return '••••'
  return `•••• ${raw.slice(-4)}`
}

export function initials(name) {
  return String(name || '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function nextCode(prefix, rows) {
  const nums = rows.map((row) => Number(String(row.id).replace(/\D/g, ''))).filter((n) => !Number.isNaN(n))
  const n = (nums.length ? Math.max(...nums) : 1000) + 1
  return `${prefix}${n}`
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function outstanding(loan) {
  const paid = (loan.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  return Math.max(0, Number(loan.loanAmount || 0) - paid)
}

export function staffName(staff, id) {
  return staff.find((person) => person.id === id)?.name || 'Unassigned'
}

export function customerName(customers, id) {
  return customers.find((customer) => customer.id === id)?.name || '—'
}

export function lastTransactionAt(customer, db) {
  const times = []
  db.purchases.filter((row) => row.customerId === customer.id).forEach((row) => times.push(row.date))
  db.loans.filter((row) => row.customerId === customer.id).forEach((row) => {
    times.push(row.startDate)
    ;(row.payments || []).forEach((payment) => times.push(payment.date))
  })
  if (!times.length) return customer.since || null
  return times.sort((a, b) => new Date(b) - new Date(a))[0]
}

export function daysSince(iso, now = new Date()) {
  if (!iso) return 9999
  return Math.floor((startOfDay(now) - startOfDay(iso)) / 86400000)
}

export function reactivationBucket(days) {
  if (days >= 180) return '180'
  if (days >= 90) return '90'
  if (days >= 60) return '60'
  if (days >= 30) return '30'
  return null
}
