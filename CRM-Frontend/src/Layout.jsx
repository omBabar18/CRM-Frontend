import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, Calendar, CheckSquare, Coins, Contact, Landmark, LayoutDashboard,
  LogOut, Menu, MessageCircle, PanelLeft, Phone, Plus, RotateCcw, Search, Share2,
  Shield, Star, Target, Users, Wallet, Zap,
} from 'lucide-react'
import { can } from './constants'
import { useCrm } from './context'
import { useIsMobile } from './hooks'
import { LeadForm } from './LeadForm'
import { followupBucket, initials } from './utils'
import { SidebarItem } from './components/shell/SidebarItem'
import { Toasts } from './ui'
import { AccentButton, GhostButton, Sheet } from './components/enterprise/Sheet'

const NAV = [
  { section: 'Workspace', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/calls', label: 'Calls', icon: Phone },
    { to: '/follow-ups', label: 'Follow-ups', icon: Calendar },
    { to: '/customers', label: 'Customers', icon: Contact },
  ]},
  { section: 'Gold Desk', items: [
    { to: '/gold-loan', label: 'Gold Loan', icon: Landmark },
    { to: '/gold-purchase', label: 'Gold Purchase', icon: Coins },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  ]},
  { section: 'Engagement', items: [
    { to: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { to: '/reviews', label: 'Reviews', icon: Star },
    { to: '/referrals', label: 'Referrals', icon: Share2 },
    { to: '/reactivation', label: 'Reactivation', icon: RotateCcw },
  ]},
  { section: 'Insights', items: [
    { to: '/reports', label: 'Reports', icon: BarChart3, perm: 'viewReports' },
    { to: '/targets', label: 'Targets', icon: Target },
    { to: '/automation', label: 'Automation', icon: Zap },
    { to: '/staff', label: 'Staff', icon: Shield, perm: 'manageStaff' },
  ]},
]

export function Layout() {
  const crm = useCrm()
  const { user, logout, buckets, visibleLeads, visibleCustomers, db } = crm
  const [openNav, setOpenNav] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')
  const [panel, setPanel] = useState(null)
  const [leadOpen, setLeadOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const mobile = useIsMobile()

  useEffect(() => { setOpenNav(false); setPanel(null) }, [location.pathname])

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!mobile) return undefined
    let startX = 0
    let startY = 0
    const onStart = (event) => {
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
    }
    const onEnd = (event) => {
      const dx = event.changedTouches[0].clientX - startX
      const dy = event.changedTouches[0].clientY - startY
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy)) return
      if (dx > 0 && startX < 48) setOpenNav(true)
      if (dx < 0) setOpenNav(false)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [mobile])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return { leads: [], customers: [] }
    return {
      leads: visibleLeads.filter((lead) => `${lead.name} ${lead.mobile} ${lead.id}`.toLowerCase().includes(q)).slice(0, 5),
      customers: visibleCustomers.filter((customer) => `${customer.name} ${customer.mobile}`.toLowerCase().includes(q)).slice(0, 5),
    }
  }, [query, visibleLeads, visibleCustomers])

  const notices = [
    ...buckets.overdue.slice(0, 4).map((lead) => ({ id: lead.id, title: `${lead.name} is overdue`, text: 'Follow-up date has passed', to: `/calls?lead=${lead.id}` })),
    ...buckets.today.slice(0, 3).map((lead) => ({ id: `t-${lead.id}`, title: `Follow up ${lead.name}`, text: 'Due today', to: `/calls?lead=${lead.id}` })),
    ...db.loans.filter((loan) => loan.status === 'Overdue').slice(0, 2).map((loan) => ({ id: loan.id, title: `${loan.id} is overdue`, text: 'Gold loan payment', to: '/gold-loan' })),
  ]

  const slim = collapsed && !mobile

  return (
    <div className={`min-h-screen bg-[#F6F5F2] text-slate-900 ${slim ? 'lg:grid lg:grid-cols-[76px_minmax(0,1fr)]' : 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)]'}`}>
      {openNav && mobile && <button className="fixed inset-0 z-30 bg-slate-950/40" aria-label="Close menu" onClick={() => setOpenNav(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] flex-col bg-slate-950 text-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:w-auto lg:translate-x-0 ${openNav ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-4 py-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 text-xs font-semibold text-slate-950">DG</span>
          {!slim && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">DG Gold</p>
              <p className="truncate text-[11px] text-slate-400">Sangli desk</p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {NAV.map((group) => {
            const items = group.items.filter((item) => !item.perm || can(user, item.perm))
            if (!items.length) return null
            return (
              <div key={group.section}>
                {!slim && <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{group.section}</p>}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <SidebarItem
                      key={item.to}
                      {...item}
                      collapsed={slim}
                      count={item.to === '/follow-ups' ? buckets.overdue.length : 0}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-[#F6F5F2]/90 px-4 backdrop-blur md:px-6">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Menu" onClick={() => (mobile ? setOpenNav(true) : setCollapsed((value) => !value))}>
            {mobile ? <Menu size={16} /> : <PanelLeft size={16} />}
          </button>
          <div className="relative min-w-0 flex-1 max-w-xl">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leads or customers"
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-16 text-sm outline-none transition focus:border-amber-700/40 focus:ring-4 focus:ring-amber-700/10"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:block">⌘K</kbd>
            {query.trim().length > 1 && (
              <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {results.leads.map((lead) => (
                  <button key={lead.id} type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { navigate(`/leads?open=${lead.id}`); setQuery('') }}>
                    <span className="font-medium">{lead.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{lead.id} · {lead.mobile} · {followupBucket(lead) || lead.status}</span>
                  </button>
                ))}
                {results.customers.map((customer) => (
                  <button key={customer.id} type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { navigate(`/customers/${customer.id}`); setQuery('') }}>
                    <span className="font-medium">{customer.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">Customer · {customer.mobile}</span>
                  </button>
                ))}
                {!results.leads.length && !results.customers.length && <p className="px-3 py-3 text-sm text-slate-400">No matches in your records.</p>}
              </div>
            )}
          </div>
          <button type="button" className="hidden h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-medium text-white sm:inline-flex" onClick={() => setLeadOpen(true)}>
            <Plus size={15} /> New lead
          </button>
          <button type="button" title="Open dialer" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700" onClick={() => navigate('/calls')}>
            <Phone size={16} />
          </button>
          <div className="relative">
            <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-left">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-[11px] font-semibold text-amber-200">{initials(user.name)}</span>
              <span className="hidden min-w-0 md:block">
                <span className="block max-w-[120px] truncate text-xs font-medium text-slate-900">{user.name}</span>
                <span className="block truncate text-[10px] text-slate-400">{user.role}</span>
              </span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                <p className="px-3 py-2 text-xs text-slate-400">{user.role}</p>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setProfileOpen(false); navigate('/targets') }}><Wallet size={15} /> Targets</button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { logout(); navigate('/login') }}><LogOut size={15} /> Log out</button>
                <button type="button" className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50" onClick={crm.resetDemo}>Reset demo data</button>
              </div>
            )}
          </div>
          <div className="relative">
            <button type="button" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700" onClick={() => setPanel(panel === 'bell' ? null : 'bell')}>
              <Bell size={16} />
              {notices.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />}
            </button>
            {panel === 'bell' && (
              <div className="absolute right-0 top-12 z-30 w-72 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {notices.length === 0 && <p className="px-3 py-3 text-sm text-slate-400">You are clear for now.</p>}
                {notices.map((item) => (
                  <button key={item.id} type="button" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50" onClick={() => navigate(item.to)}>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-slate-400">{item.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="px-4 py-5 pb-28 md:px-6 lg:pb-8"><Outlet /></div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <button type="button" className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium text-slate-600" onClick={() => navigate('/calls')}><Phone size={16} />Call</button>
        <button type="button" className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium text-emerald-700" onClick={() => navigate('/whatsapp')}><MessageCircle size={16} />WhatsApp</button>
        <button type="button" className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium text-slate-600" onClick={() => navigate('/follow-ups')}><Calendar size={16} />Follow-up</button>
        <button type="button" className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium text-slate-600" onClick={() => setLeadOpen(true)}><Plus size={16} />Lead</button>
      </nav>
      <Sheet
        open={leadOpen}
        title="New lead"
        subtitle="Every open lead needs a next follow-up."
        onClose={() => setLeadOpen(false)}
        footer={(
          <>
            <GhostButton onClick={() => setLeadOpen(false)}>Cancel</GhostButton>
            <AccentButton type="submit" form="nav-new-lead">Save lead</AccentButton>
          </>
        )}
      >
        {leadOpen && <LeadForm formId="nav-new-lead" hideSubmit onDone={() => setLeadOpen(false)} />}
      </Sheet>
      <Toasts items={crm.toasts} />
    </div>
  )
}
