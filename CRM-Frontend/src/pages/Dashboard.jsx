import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Calendar, ChevronDown, IndianRupee, MessageCircle, Phone, Plus, Scale, Users, Wallet } from 'lucide-react'
import { can } from '../constants'
import { useCrm } from '../context'
import { achievement, dashboardPulse, leadSourceStats } from '../metrics'
import { compactInr, fmtTime, inr, staffName } from '../utils'
import { Field, Modal } from '../ui'
import { GoldRateBadge } from '../components/dashboard/GoldRateBadge'
import { QuickActionButton } from '../components/dashboard/QuickActionButton'
import { StatCard } from '../components/dashboard/StatCard'
import { CustomerIcon, FacebookIcon, GoogleIcon, GooglePinIcon, InstagramIcon, OtherIcon, ReferralIcon, WalkInIcon, WhatsAppIcon } from '../components/dashboard/SourceIcons'

const DELTA = { k24: null, k22: null, k18: null }
const SOURCE_LOOK = {
  'Google Ads': { icon: GoogleIcon, box: 'bg-white', bar: 'bg-[#4285F4]' },
  Instagram: { icon: InstagramIcon, box: 'bg-white', bar: 'bg-[#d62976]' },
  Facebook: { icon: FacebookIcon, box: 'bg-white', bar: 'bg-[#1877F2]' },
  WhatsApp: { icon: WhatsAppIcon, box: 'bg-white', bar: 'bg-[#25D366]' },
  'Google Business Profile': { icon: GooglePinIcon, box: 'bg-white', bar: 'bg-[#EA4335]' },
  Referral: { icon: ReferralIcon, box: 'bg-white', bar: 'bg-amber-500' },
  'Walk-in': { icon: WalkInIcon, box: 'bg-white', bar: 'bg-orange-500' },
  'Existing Customer': { icon: CustomerIcon, box: 'bg-white', bar: 'bg-teal-600' },
  Other: { icon: OtherIcon, box: 'bg-white', bar: 'bg-slate-400' },
}

export function Dashboard() {
  const crm = useCrm()
  const { db, user, visibleLeads, visibleTasks, buckets } = crm
  const navigate = useNavigate()
  const pulse = dashboardPulse(db, visibleLeads)
  const sources = leadSourceStats(visibleLeads)
  const [rateOpen, setRateOpen] = useState(false)
  const [rates, setRates] = useState(db.rates)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const monthTarget = db.targets.monthly.revenue || 1
  const pct = Math.min(100, Math.round((pulse.month.revenue / monthTarget) * 100))
  const team = db.staff
    .filter((person) => ['Manager', 'Sales Executive', 'Calling Executive'].includes(person.role))
    .map((person) => {
      const score = achievement(db, 'monthly', person.id)
      return { ...person, value: score.goldSale + score.goldLoan, conversions: score.conversions, calls: score.calls }
    })
    .sort((a, b) => b.value - a.value)
  const max = Math.max(...team.map((row) => row.value), 1)
  const alertCount = pulse.overdue + pulse.overdueLoans
  const vsTarget = (done, goal) => Math.round(((done - goal) / (goal || 1)) * 100)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">Good day, {user.name.split(' ')[0]}.</h1>
          <p className="mt-0.5 flex items-center gap-2 text-xs font-normal text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Desk is live · {pulse.today.calls} calls logged today
          </p>
        </div>
        {can(user, 'setTargets') && (
          <button type="button" className="h-9 rounded-xl border border-[#C9DCFF] bg-[#EAF2FF] px-3 text-sm font-medium text-[#1E4A9A] transition duration-200 hover:-translate-y-0.5 hover:bg-[#D7E6FF]" onClick={() => setRateOpen(true)}>Update rate</button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <GoldRateBadge karat="24K" rate={db.rates.k24} delta={DELTA.k24} />
        <GoldRateBadge karat="22K" rate={db.rates.k22} delta={DELTA.k22} />
        <GoldRateBadge karat="18K" rate={db.rates.k18} delta={DELTA.k18} />
      </div>
      <p className="-mt-2 flex items-center gap-2 px-1 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Updated {fmtTime(db.rates.updatedAt)}
        </p>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <QuickActionButton icon={<Phone size={15} />} label="Call" hint="Open the queue" onClick={() => navigate('/calls')} />
        <QuickActionButton icon={<MessageCircle size={15} />} label="WhatsApp" hint="Send a template" tone="emerald" onClick={() => navigate('/whatsapp')} />
        <QuickActionButton icon={<Calendar size={15} />} label="Follow-up" hint="Due today" onClick={() => navigate('/follow-ups')} />
        <QuickActionButton icon={<Plus size={15} />} label="Add lead" hint="New enquiry" onClick={() => navigate('/leads')} />
        <QuickActionButton icon={<Scale size={15} />} label="New valuation" hint="Gold purchase" tone="amber" onClick={() => navigate('/gold-purchase?new=1')} />
      </div>

      {alertCount > 0 && (
        <motion.div layout className="overflow-hidden rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/80 to-white shadow-xs">
          <button type="button" className="flex w-full items-center gap-3 px-3 py-3 text-left" onClick={() => setAlertsOpen((value) => !value)}>
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-rose-600 shadow-sm">
              <span className="absolute inset-0 animate-ping rounded-lg bg-rose-200/50" />
              <AlertCircle size={16} className="relative" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-800">Needs attention</span>
              <span className="block text-[11px] text-slate-500">{pulse.overdue} follow-ups are late{pulse.overdueLoans > 0 ? ` · ${pulse.overdueLoans} loans past due` : ''}</span>
            </span>
            <span className="ml-auto rounded-md bg-white px-2 py-1 text-[11px] font-medium text-rose-700 shadow-sm">{alertCount}</span>
            <ChevronDown size={16} className={`text-slate-400 transition duration-200 ${alertsOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {alertsOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="grid gap-2 border-t border-rose-100 p-3 sm:grid-cols-2">
                  {buckets.overdue.map((lead) => (
                    <button key={lead.id} type="button" className="flex items-center justify-between rounded-lg border border-white bg-white/80 px-3 py-2 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md" onClick={() => navigate(`/calls?lead=${lead.id}`)}>
                      <span>
                        <span className="block text-[13px] font-medium text-slate-700">{lead.name}</span>
                        <span className="text-[11px] text-slate-400">{lead.requirement}</span>
                      </span>
                      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">Overdue</span>
                    </button>
                  ))}
                  {db.loans.filter((loan) => loan.status === 'Overdue').map((loan) => (
                    <button key={loan.id} type="button" className="flex items-center justify-between rounded-lg border border-white bg-white/80 px-3 py-2 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md" onClick={() => navigate('/gold-loan')}>
                      <span className="text-[13px] font-medium text-slate-700">{loan.id}</span>
                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">Loan</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 [&>*]:min-w-0">
        <StatCard delay={0} label="New leads" value={pulse.today.leads} hint="Created today" icon={<Users size={16} />} trend={vsTarget(pulse.today.leads, db.targets.daily.leads)} />
        <StatCard delay={0.04} label="Follow-ups due" value={pulse.pending} hint="Scheduled for today" icon={<Calendar size={16} />} trend={pulse.overdue ? -pulse.overdue : 4} />
        <StatCard delay={0.08} label="Revenue" value={inr(pulse.today.revenue)} hint="Margins and fees" icon={<IndianRupee size={16} />} trend={vsTarget(pulse.today.revenue, db.targets.daily.revenue)} />
        <StatCard delay={0.12} label="Gold purchase" value={compactInr(pulse.today.goldSale)} hint="Paid to customers" icon={<Wallet size={16} />} trend={vsTarget(pulse.today.goldSale, db.targets.daily.goldSale)} />
        <StatCard delay={0.16} label="Gold loan" value={compactInr(pulse.today.goldLoan)} hint="Disbursed today" icon={<Scale size={16} />} trend={vsTarget(pulse.today.goldLoan, db.targets.daily.goldLoan)} />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr] [&>*]:min-w-0">
        <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-950">Monthly target</h2>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/15">{pct}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-slate-800 to-amber-700" />
          </div>
          <div className="mt-5 space-y-3">
            {[
              ['Conversions', pulse.month.conversions, db.targets.monthly.conversions, false],
              ['Gold sale', pulse.month.goldSale, db.targets.monthly.goldSale, true],
              ['Gold loan', pulse.month.goldLoan, db.targets.monthly.goldLoan, true],
            ].map(([label, done, goal, money]) => {
              const width = Math.min(100, Math.round((done / (goal || 1)) * 100))
              return (
                <div key={label}>
                  <div className="mb-1 flex min-w-0 justify-between gap-3 text-xs text-slate-500"><span className="truncate">{label}</span><span className="shrink-0 tabular-nums">{money ? `${compactInr(done)} / ${compactInr(goal)}` : `${done} / ${goal}`}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-700/80" style={{ width: `${width}%` }} /></div>
                </div>
              )
            })}
          </div>
        </article>
        <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Lead sources</h2>
            <span className="text-[11px] tabular-nums text-slate-400">{sources.reduce((sum, row) => sum + row.value, 0)} leads</span>
          </div>
          <div className="mt-4 space-y-3">
            {sources.map((row) => {
              const total = sources.reduce((sum, item) => sum + item.value, 0) || 1
              const width = Math.round((row.value / total) * 100)
              const look = SOURCE_LOOK[row.name] || { icon: OtherIcon, box: 'bg-white', bar: 'bg-slate-400' }
              const Icon = look.icon
              return (
                <div key={row.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 text-slate-600">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${look.box}`}><Icon size={13} /></span>
                      <span className="truncate">{row.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-500">{row.value} · {width}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.45 }} className={`h-full rounded-full ${look.bar}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200/80 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-950">Staff</h2>
          <div className="mt-4 space-y-3">
            {team.map((person, index) => (
              <div key={person.id} className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <span className="text-xs text-slate-400">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{person.name}</p>
                  <p className="text-xs text-slate-400">{person.calls} calls · {person.conversions} conversions</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-800" style={{ width: `${(person.value / max) * 100}%` }} /></div>
                </div>
                <span className="text-xs font-medium text-slate-700">{compactInr(person.value)}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-950">Open tasks</h2>
          <div className="mt-4 space-y-2">
            {visibleTasks.filter((task) => task.status === 'Open').slice(0, 5).map((task) => (
              <button key={task.id} type="button" className="block w-full rounded-xl border border-slate-100 px-3 py-2 text-left transition hover:border-slate-200 hover:bg-slate-50" onClick={() => navigate('/tasks')}>
                <span className="text-sm font-medium text-slate-900">{task.title}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{task.type} · {staffName(db.staff, task.staffId)}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <Modal open={rateOpen} title="Today’s gold rate" onClose={() => setRateOpen(false)} footer={
        <button className="btn btn-gold" type="button" onClick={() => { crm.updateRates({ k24: Number(rates.k24), k22: Number(rates.k22), k18: Number(rates.k18) }); setRateOpen(false) }}>Save rate</button>
      }>
        <div className="form-grid">
          <Field label="24K rate / gram"><input type="number" value={rates.k24} onChange={(event) => setRates({ ...rates, k24: event.target.value })} /></Field>
          <Field label="22K rate / gram"><input type="number" value={rates.k22} onChange={(event) => setRates({ ...rates, k22: event.target.value })} /></Field>
          <Field label="18K rate / gram"><input type="number" value={rates.k18} onChange={(event) => setRates({ ...rates, k18: event.target.value })} /></Field>
        </div>
      </Modal>
    </div>
  )
}
