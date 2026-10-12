import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useCrm } from '../context'
import { Toasts } from '../ui'

const ROLES = [
  ['Admin', '9876543210'],
  ['Manager', '9876500002'],
  ['Sales', '9876500003'],
  ['Calling', '9876500004'],
  ['Accounts', '9876500005'],
]

function strength(password) {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const METER = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-600']
const METER_LABEL = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong']

export function Login() {
  const crm = useCrm()
  const { login, loginWithOtp, signup, resetPassword, db, toast } = crm
  const [mode, setMode] = useState('login')
  const [mobile, setMobile] = useState('9876543210')
  const [password, setPassword] = useState('gold123')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [busy, setBusy] = useState(false)
  const score = password ? strength(password) : 0

  useEffect(() => {
    if (seconds <= 0) return undefined
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])

  const sendOtp = () => {
    if (!/^\d{10}$/.test(mobile) || !db.staff.some((person) => person.mobile === mobile)) {
      toast('No account uses this mobile number.', 'bad')
      return
    }
    setSeconds(30)
    toast('OTP sent. Use 1234 for this demo.')
  }

  const finish = async (work) => {
    setBusy(true)
    await new Promise((resolve) => window.setTimeout(resolve, 450))
    const result = work()
    setBusy(false)
    if (!result?.ok) toast(result?.message || 'Invalid credentials', 'bad')
    return result
  }

  const submit = (event) => {
    event.preventDefault()
    if (mode === 'login' && useOtp) {
      if (otp !== '1234') {
        toast('Invalid credentials', 'bad')
        return
      }
      finish(() => loginWithOtp(mobile))
      return
    }
    if (mode === 'login') {
      finish(() => login(mobile, password))
      return
    }
    if (mode === 'signup') {
      finish(() => signup({ name, mobile, password }))
      return
    }
    if (!otp) {
      sendOtp()
      return
    }
    if (otp !== '1234') {
      toast('Invalid credentials', 'bad')
      return
    }
    const result = resetPassword(mobile, password)
    if (!result.ok) toast(result.message, 'bad')
    else {
      toast('Password updated')
      setMode('login')
      setOtp('')
      setSeconds(0)
    }
  }

  const showPassword = (mode === 'login' && !useOtp) || mode === 'signup' || (mode === 'forgot' && seconds > 0)

  return (
    <div className="flex min-h-screen bg-[#F7F6F3] text-slate-900">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative hidden w-[55%] overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,53,15,0.45),transparent_55%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 text-sm font-semibold text-slate-950">DG</span>
              <div>
                <p className="bg-gradient-to-r from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-lg font-semibold tracking-tight text-transparent">DG Gold</p>
                <p className="text-xs text-slate-400">Cash For Gold · Sangli</p>
              </div>
            </div>
            <h2 className="mt-16 max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">A quieter desk for a high-volume gold business.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Leads, valuations, loans, and payouts in one ledger. Built for the Sangli counter, calm enough for the closing hour.</p>
          </div>
          <div className="grid max-w-md gap-3">
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400">Live 24K ticker</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold tracking-tight text-white">₹7,240<span className="text-sm font-normal text-slate-400">/g</span></p>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/20">+0.45%</span>
              </div>
            </motion.div>
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-xs font-medium text-slate-400">Recent disbursement</p>
              <p className="mt-2 text-lg font-semibold text-amber-200">+₹2,98,040</p>
              <p className="mt-1 text-xs text-slate-500">Gold purchase · Vishrambag desk</p>
            </motion.div>
            <p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={14} /> Bank-grade 256-bit encryption · Live valuation pipeline</p>
          </div>
        </div>
      </motion.section>
      <section className="flex w-full items-center justify-center px-5 py-10 lg:w-[45%]">
        <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} onSubmit={submit} className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-xs font-semibold text-amber-200">DG</span>
            <div>
              <p className="font-semibold">DG Gold</p>
              <p className="text-xs text-slate-500">Cash For Gold · Sangli</p>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{mode === 'signup' ? 'Create access' : mode === 'forgot' ? 'Reset password' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm text-slate-500">{mode === 'login' ? 'Sign in to the Sangli desk. Demo password is gold123.' : 'This workspace is still a frontend demo.'}</p>
          {mode === 'login' && (
            <div className="mt-6 flex flex-wrap gap-2">
              {ROLES.map(([label, number]) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => { setMobile(number); setPassword('gold123') }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${mobile === number ? 'bg-slate-950 text-white ring-slate-950' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 space-y-3">
            {mode === 'signup' && <FloatField label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />}
            <FloatField label="Mobile number" inputMode="numeric" maxLength={10} value={mobile} onChange={(event) => setMobile(event.target.value)} required />
            {mode === 'login' && (
                <button type="button" className="border-0 bg-transparent p-0 text-sm font-medium text-amber-800" onClick={() => setUseOtp((value) => !value)}>
                {useOtp ? 'Use password instead' : 'Login with OTP'}
              </button>
            )}
            {((mode === 'login' && useOtp) || mode === 'forgot') && (
              <div className="flex items-end gap-3">
                <div className="flex-1"><FloatField label="OTP" inputMode="numeric" maxLength={4} value={otp} onChange={(event) => setOtp(event.target.value)} /></div>
                <button type="button" disabled={seconds > 0} onClick={sendOtp} className="h-12 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 disabled:opacity-50">
                  {seconds > 0 ? `${seconds}s` : 'Send'}
                </button>
              </div>
            )}
            {showPassword && (
              <div>
                <FloatField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={mode !== 'forgot'} />
                {(mode === 'signup' || mode === 'forgot') && (
                  <div className="mt-2">
                    <div className="h-1 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full ${METER[score]}`} style={{ width: `${password ? score * 25 : 8}%` }} /></div>
                    <p className="mt-1 text-xs text-slate-400">{METER_LABEL[score]}</p>
                  </div>
                )}
              </div>
            )}
            <button type="submit" disabled={busy} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-sm ring-1 ring-amber-700/40 transition duration-200 hover:bg-slate-900 disabled:opacity-70">
              {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {mode === 'signup' ? 'Create account' : mode === 'forgot' ? (otp ? 'Save password' : 'Send OTP') : 'Continue'}
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                <button type="button" className="border-0 bg-transparent p-0 font-medium text-slate-900" onClick={() => setMode('signup')}>Create an account</button>
                <span> · </span>
                <button type="button" className="border-0 bg-transparent p-0 font-medium text-slate-900" onClick={() => { setMode('forgot'); setOtp(''); setSeconds(0) }}>Forgot password</button>
              </>
            ) : (
              <button type="button" className="border-0 bg-transparent p-0 font-medium text-slate-900" onClick={() => setMode('login')}>Back to login</button>
            )}
          </p>
        </motion.form>
      </section>
      <Toasts items={crm.toasts} />
    </div>
  )
}

function FloatField({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-slate-500">{label}</span>
      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-300 focus:border-amber-600/40 focus:ring-4 focus:ring-amber-500/10"
      />
    </label>
  )
}
