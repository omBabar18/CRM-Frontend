import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { NO_NEXT_ACTION, OUTCOME_STATUS, PURITIES, permissionsFor, seesAllLeads } from './constants'
import { createSeed } from './seed'
import { customerActivity, queueLeads } from './metrics'
import { followupBucket, fromLocalInput, nextCode, uid } from './utils'

const KEY = 'dggold-crm-v1'
const SESSION = 'dggold-session'
const API = 'http://localhost:5005'
const CrmContext = createContext(null)

function loadDb() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.version !== 3 || !Array.isArray(parsed.leads)) return null
    return parsed
  } catch {
    return null
  }
}

export function CrmProvider({ children }) {
  const [db, setDb] = useState(() => loadDb() || createSeed())
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION) || 'null')
    } catch {
      return null
    }
  })
  const [toasts, setToasts] = useState([])
  const [preparing, setPreparing] = useState(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(db))
  }, [db])

  useEffect(() => {
    if (session) localStorage.setItem(SESSION, JSON.stringify(session))
    else localStorage.removeItem(SESSION)
  }, [session])

  const toast = (message, tone = 'ok') => {
    const id = uid('toast')
    setToasts((list) => [...list, { id, message, tone }])
    window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3200)
  }

  const user = db.staff.find((person) => person.id === session?.staffId && person.active) || null

  const update = (recipe) => {
    setDb((prev) => {
      const next = structuredClone(prev)
      recipe(next)
      return next
    })
  }

  const visibleLeads = useMemo(() => {
    if (!user) return []
    if (seesAllLeads(user)) return db.leads
    return db.leads.filter((lead) => lead.assignedTo === user.id)
  }, [db.leads, user])

  const visibleCustomers = useMemo(() => {
    if (!user) return []
    if (seesAllLeads(user) || user.role === 'Accountant') return db.customers
    return db.customers.filter((customer) => customer.assignedTo === user.id)
  }, [db.customers, user])

  const visibleTasks = useMemo(() => {
    if (!user) return []
    if (seesAllLeads(user) || user.role === 'Accountant') return db.tasks
    return db.tasks.filter((task) => task.staffId === user.id)
  }, [db.tasks, user])

  const api = useMemo(() => {
    const adoptStaff = (person, password) => {
      const existing = db.staff.find((item) => item.mobile === person.mobile)
      const staffId = existing?.id || person.id
      update((draft) => {
        const row = draft.staff.find((item) => item.mobile === person.mobile)
        if (row) {
          row.emailVerified = true
          row.password = password
          row.active = true
          return
        }
        draft.staff.push({
          id: person.id,
          name: person.name,
          mobile: person.mobile,
          email: person.email || '',
          password,
          role: person.role || 'Sales Executive',
          active: true,
          emailVerified: true,
          permissions: person.permissions || permissionsFor(person.role || 'Sales Executive'),
        })
      })
      setSession({ staffId })
      setPreparing(true)
    }

    const login = async (mobile, password) => {
      const person = db.staff.find((row) => row.mobile === mobile && row.password === password && row.active)
      if (person && person.emailVerified !== false) {
        setSession({ staffId: person.id })
        setPreparing(true)
        return { ok: true }
      }
      try {
        const response = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, password }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) return { ok: false, message: data.message || 'Invalid credentials' }
        adoptStaff(data.user, password)
        return { ok: true }
      } catch {
        if (person?.emailVerified === false) {
          return { ok: false, message: 'Open the verification link in your email, then sign in.' }
        }
        return { ok: false, message: 'The desk API is not running, so this sign-in could not be checked.' }
      }
    }

    const loginWithOtp = (mobile) => {
      const person = db.staff.find((row) => row.mobile === mobile && row.active)
      if (!person) return { ok: false, message: 'No account uses this mobile number.' }
      setSession({ staffId: person.id })
      setPreparing(true)
      return { ok: true }
    }

    const logout = () => setSession(null)

    const signup = async ({ name, mobile, email, password }) => {
      if (!/^\d{10}$/.test(mobile)) return { ok: false, message: 'Enter a 10-digit mobile number.' }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return { ok: false, message: 'Enter a valid email address.' }
      try {
        const response = await fetch(`${API}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, mobile, email, password }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) return { ok: false, message: data.message || 'Could not create the account.' }
        update((draft) => {
          if (draft.staff.some((row) => row.mobile === mobile)) return
          draft.staff.push({
            id: uid('s'),
            name,
            mobile,
            email,
            password,
            role: 'Sales Executive',
            active: true,
            emailVerified: false,
            permissions: permissionsFor('Sales Executive'),
          })
        })
        return { ok: true, pending: true, message: data.message || 'Check your email and open the verification link.' }
      } catch {
        return { ok: false, message: 'Could not reach the API. Start the backend and try again.' }
      }
    }

    const resetPassword = (mobile, password) => {
      const person = db.staff.find((row) => row.mobile === mobile)
      if (!person) return { ok: false, message: 'No account uses this mobile number.' }
      update((draft) => {
        const row = draft.staff.find((item) => item.mobile === mobile)
        row.password = password
      })
      return { ok: true }
    }

    const resetDemo = () => {
      const fresh = createSeed()
      setDb(fresh)
      setSession(null)
      localStorage.removeItem(KEY)
    }

    const assignOwner = (draft) => {
      const pool = draft.staff.filter((person) => person.active && ['Sales Executive', 'Calling Executive'].includes(person.role))
      if (!pool.length) return draft.staff.find((person) => person.role === 'Admin')?.id || ''
      const load = Object.fromEntries(pool.map((person) => [person.id, 0]))
      draft.leads.forEach((lead) => {
        if (load[lead.assignedTo] != null && !['Converted', 'Lost', 'Invalid', 'Not Interested'].includes(lead.status)) {
          load[lead.assignedTo] += 1
        }
      })
      return pool.sort((a, b) => load[a.id] - load[b.id])[0].id
    }

    const addLead = (input) => {
      const active = !['Converted', 'Not Interested', 'Lost', 'Invalid'].includes(input.status || 'New')
      if (active && !input.nextFollowUp) {
        toast('Every active lead needs a next follow-up.', 'bad')
        return { ok: false }
      }
      update((draft) => {
        const auto = draft.automations.find((rule) => rule.id === 'assign')?.enabled
        const assignedTo = input.assignedTo || (auto ? assignOwner(draft) : user?.id)
        draft.leads.unshift({
          id: nextCode('DG-L-', draft.leads),
          name: input.name,
          mobile: input.mobile,
          alternate: input.alternate || '',
          location: input.location,
          source: input.source,
          requirement: input.requirement,
          expectedAmount: Number(input.expectedAmount || 0),
          goldWeight: Number(input.goldWeight || 0),
          assignedTo,
          status: input.status || 'New',
          priority: input.priority || 'Medium',
          createdAt: new Date().toISOString(),
          lastContact: null,
          nextFollowUp: input.nextFollowUp,
          notes: input.notes || '',
          lastOutcome: '',
          customerId: null,
          convertedAt: null,
          timeline: [],
        })
      })
      toast('Lead added')
      return { ok: true }
    }

    const updateLead = (id, patch) => {
      const lead = db.leads.find((row) => row.id === id)
      const next = { ...lead, ...patch }
      if (!['Converted', 'Not Interested', 'Lost', 'Invalid'].includes(next.status) && !next.nextFollowUp) {
        toast('Set the next follow-up before leaving this lead open.', 'bad')
        return false
      }
      update((draft) => {
        const row = draft.leads.find((item) => item.id === id)
        if (!row) return
        Object.assign(row, patch)
        if (patch.status === 'Converted' && !row.convertedAt) row.convertedAt = new Date().toISOString()
      })
      toast('Lead updated')
      return true
    }

    const logCall = ({ leadId, outcome, notes, nextFollowUp }) => {
      if (!NO_NEXT_ACTION.includes(outcome) && !nextFollowUp) {
        toast('Choose the next follow-up. Every active lead needs a next action.', 'bad')
        return false
      }
      update((draft) => {
        const lead = draft.leads.find((row) => row.id === leadId)
        if (!lead) return
        const now = new Date().toISOString()
        if (lead.nextFollowUp) {
          draft.activities.unshift({ id: uid('fu'), type: 'followup', staffId: user.id, leadId, at: now, outcome })
        }
        draft.activities.unshift({ id: uid('call'), type: 'call', staffId: user.id, leadId, at: now, outcome })
        if (outcome === 'Visit Fixed') {
          draft.activities.unshift({ id: uid('visit'), type: 'visit', staffId: user.id, leadId, at: nextFollowUp || now, outcome })
        }
        lead.lastContact = now
        lead.lastOutcome = outcome
        lead.notes = notes || lead.notes
        lead.nextFollowUp = NO_NEXT_ACTION.includes(outcome) ? null : nextFollowUp
        lead.status = OUTCOME_STATUS[outcome] || lead.status
        lead.timeline.unshift({ id: uid('tl'), at: now, type: 'call', text: notes || outcome, outcome, staffId: user.id })
        if (outcome === 'Converted') {
          lead.convertedAt = now
          let customer = draft.customers.find((row) => row.mobile === lead.mobile)
          if (!customer) {
            customer = {
              id: nextCode('DG-C-', draft.customers),
              name: lead.name,
              mobile: lead.mobile,
              alternate: lead.alternate,
              location: lead.location,
              address: `${lead.location}, Sangli, Maharashtra`,
              email: '',
              assignedTo: lead.assignedTo,
              since: now,
              kyc: { status: 'Pending', aadhaar: '', pan: '' },
              notes: [],
            }
            draft.customers.unshift(customer)
          }
          lead.customerId = customer.id
          draft.activities.unshift({ id: uid('cv'), type: 'conversion', staffId: user.id, leadId, at: now, outcome })
        }
      })
      toast(outcome === 'Converted' ? 'Lead converted. Open a gold sale or loan next.' : 'Call logged')
      return true
    }

    const addCustomer = (input) => {
      const id = nextCode('DG-C-', db.customers)
      update((draft) => {
        draft.customers.unshift({
          id,
          name: input.name,
          mobile: input.mobile,
          alternate: input.alternate || '',
          location: input.location,
          address: input.address || `${input.location}, Sangli, Maharashtra`,
          email: input.email || '',
          assignedTo: input.assignedTo || user.id,
          since: new Date().toISOString(),
          kyc: { status: 'Pending', aadhaar: '', pan: '' },
          notes: [],
        })
      })
      toast('Customer added')
      return id
    }

    const updateCustomer = (id, patch) => {
      update((draft) => {
        const customer = draft.customers.find((row) => row.id === id)
        if (customer) Object.assign(customer, patch)
      })
    }

    const addNote = (customerId, text) => {
      if (!text.trim()) return
      update((draft) => {
        const customer = draft.customers.find((row) => row.id === customerId)
        customer.notes.unshift({ id: uid('note'), text: text.trim(), staffId: user.id, at: new Date().toISOString() })
      })
    }

    const addPurchase = (input) => {
      update((draft) => {
        const grossValue = Math.round(Number(input.netWeight) * Number(input.rate))
        const finalPayable = Math.max(0, grossValue - Number(input.deduction || 0))
        draft.purchases.unshift({
          id: nextCode('DG-GP-', draft.purchases),
          customerId: input.customerId,
          staffId: user.id,
          date: input.date || new Date().toISOString(),
          goldType: input.goldType,
          grossWeight: Number(input.grossWeight),
          netWeight: Number(input.netWeight),
          purity: input.purity,
          rate: Number(input.rate),
          deduction: Number(input.deduction || 0),
          paymentMode: input.paymentMode,
          grossValue,
          finalPayable,
          leadId: input.leadId || null,
        })
        const reviewOn = draft.automations.find((rule) => rule.id === 'review')?.enabled
        if (reviewOn) {
          draft.reviews.unshift({
            id: uid('rv'),
            customerId: input.customerId,
            staffId: user.id,
            status: 'Pending',
            requestedAt: null,
            completedAt: null,
          })
        }
      })
      toast('Gold purchase saved')
    }

    const addLoan = (input) => {
      update((draft) => {
        draft.loans.unshift({
          id: nextCode('DG-LN-', draft.loans),
          customerId: input.customerId,
          staffId: user.id,
          weight: Number(input.weight),
          purity: input.purity,
          rate: Number(input.rate),
          loanAmount: Number(input.loanAmount),
          interestRate: Number(input.interestRate),
          processingFee: Number(input.processingFee || 0),
          startDate: input.startDate,
          dueDate: input.dueDate,
          status: input.status || 'Active',
          payments: [],
        })
        if (draft.automations.find((rule) => rule.id === 'review')?.enabled) {
          draft.reviews.unshift({
            id: uid('rv'),
            customerId: input.customerId,
            staffId: user.id,
            status: 'Pending',
            requestedAt: null,
            completedAt: null,
          })
        }
      })
      toast('Gold loan created')
    }

    const addLoanPayment = (loanId, payment) => {
      update((draft) => {
        const loan = draft.loans.find((row) => row.id === loanId)
        loan.payments.unshift({ id: uid('pay'), date: new Date().toISOString(), amount: Number(payment.amount), mode: payment.mode, note: payment.note || '' })
        const paid = loan.payments.reduce((sum, row) => sum + Number(row.amount), 0)
        if (paid >= Number(loan.loanAmount)) loan.status = 'Closed'
      })
      toast('Payment recorded')
    }

    const setLoanStatus = (loanId, status) => {
      update((draft) => {
        const loan = draft.loans.find((row) => row.id === loanId)
        loan.status = status
      })
    }

    const addTask = (input) => {
      update((draft) => {
        draft.tasks.unshift({
          id: uid('task'),
          type: input.type,
          title: input.title,
          leadId: input.leadId || null,
          customerId: input.customerId || null,
          staffId: input.staffId || user.id,
          due: input.due,
          status: 'Open',
          notes: input.notes || '',
        })
      })
      toast('Task created')
    }

    const setTaskStatus = (id, status) => {
      update((draft) => {
        const task = draft.tasks.find((row) => row.id === id)
        if (task) task.status = status
      })
    }

    const updateTask = (id, patch) => {
      update((draft) => {
        const task = draft.tasks.find((row) => row.id === id)
        if (task) Object.assign(task, patch)
      })
    }

    const requestReview = (customerId) => {
      update((draft) => {
        let review = draft.reviews.find((row) => row.customerId === customerId && row.status !== 'Completed')
        if (!review) {
          review = { id: uid('rv'), customerId, staffId: user.id, status: 'Requested', requestedAt: new Date().toISOString(), completedAt: null }
          draft.reviews.unshift(review)
        } else {
          review.status = 'Requested'
          review.requestedAt = new Date().toISOString()
          review.staffId = user.id
        }
      })
      toast('Review marked as requested')
    }

    const completeReview = (id) => {
      update((draft) => {
        const review = draft.reviews.find((row) => row.id === id)
        review.status = 'Completed'
        review.completedAt = new Date().toISOString()
      })
      toast('Review marked complete')
    }

    const addReferral = (input) => {
      update((draft) => {
        draft.referrals.unshift({
          id: uid('rf'),
          referrerId: input.referrerId,
          referredName: input.referredName,
          referredMobile: input.referredMobile,
          date: new Date().toISOString(),
          converted: false,
          reward: Number(input.reward || 500),
          rewardStatus: 'Pending',
          staffId: user.id,
        })
      })
      toast('Referral added')
    }

    const updateReferral = (id, patch) => {
      update((draft) => {
        const row = draft.referrals.find((item) => item.id === id)
        Object.assign(row, patch)
      })
    }

    const addStaff = (input) => {
      if (db.staff.some((row) => row.mobile === input.mobile)) {
        toast('Mobile already exists', 'bad')
        return
      }
      update((draft) => {
        draft.staff.push({
          id: uid('s'),
          name: input.name,
          mobile: input.mobile,
          password: input.password || 'gold123',
          role: input.role,
          active: true,
          permissions: { ...permissionsFor(input.role), ...(input.permissions || {}) },
        })
      })
      toast('Employee added')
    }

    const updateStaff = (id, patch) => {
      update((draft) => {
        const person = draft.staff.find((row) => row.id === id)
        const nextRole = patch.role || person.role
        Object.assign(person, patch)
        if (patch.role) person.permissions = { ...permissionsFor(nextRole), ...(patch.permissions || {}) }
        if (patch.permissions && !patch.role) person.permissions = patch.permissions
      })
    }

    const removeStaff = (id) => {
      if (id === user.id) {
        toast('You cannot remove your own account', 'bad')
        return
      }
      update((draft) => {
        draft.staff = draft.staff.filter((row) => row.id !== id)
        draft.leads.forEach((lead) => {
          if (lead.assignedTo === id) lead.assignedTo = user.id
        })
      })
      toast('Employee removed. Open leads moved to you.')
    }

    const updateTargets = (targets) => {
      update((draft) => {
        draft.targets = targets
      })
      toast('Targets saved')
    }

    const updateRates = (rates) => {
      update((draft) => {
        draft.rates = { ...draft.rates, ...rates, updatedAt: new Date().toISOString() }
      })
      toast('Gold rate updated')
    }

    const toggleAutomation = (id) => {
      update((draft) => {
        const rule = draft.automations.find((item) => item.id === id)
        rule.enabled = !rule.enabled
      })
    }

    const addCampaign = (bucket, templateId, audience) => {
      update((draft) => {
        draft.campaigns.unshift({
          id: uid('camp'),
          bucket,
          templateId,
          audience,
          createdAt: new Date().toISOString(),
          staffId: user.id,
        })
      })
      toast('Reactivation campaign created')
    }

    return {
      login,
      loginWithOtp,
      logout,
      signup,
      resetPassword,
      resetDemo,
      addLead,
      updateLead,
      logCall,
      addCustomer,
      updateCustomer,
      addNote,
      addPurchase,
      addLoan,
      addLoanPayment,
      setLoanStatus,
      addTask,
      setTaskStatus,
      updateTask,
      requestReview,
      completeReview,
      addReferral,
      updateReferral,
      addStaff,
      updateStaff,
      removeStaff,
      updateTargets,
      updateRates,
      toggleAutomation,
      addCampaign,
    }
  }, [db, user])

  const value = {
    db,
    user,
    toasts,
    toast,
    preparing,
    finishSetup: () => setPreparing(false),
    visibleLeads,
    visibleCustomers,
    visibleTasks,
    queue: queueLeads(visibleLeads),
    buckets: {
      today: visibleLeads.filter((lead) => followupBucket(lead) === 'today'),
      overdue: visibleLeads.filter((lead) => followupBucket(lead) === 'overdue'),
      tomorrow: visibleLeads.filter((lead) => followupBucket(lead) === 'tomorrow'),
      week: visibleLeads.filter((lead) => followupBucket(lead) === 'week'),
      none: visibleLeads.filter((lead) => followupBucket(lead) === 'none'),
    },
    reactivation: visibleCustomers
      .map((customer) => ({ customer, ...customerActivity(customer, db) }))
      .filter((row) => row.bucket),
    ...api,
    fromLocalInput,
    purityFactor: (id) => PURITIES.find((row) => row.id === id)?.factor || 1,
    rateFor: (purityId) => {
      const match = PURITIES.find((row) => row.id === purityId)
      return match ? db.rates[match.rateKey] : db.rates.k22
    },
  }

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider')
  return ctx
}
