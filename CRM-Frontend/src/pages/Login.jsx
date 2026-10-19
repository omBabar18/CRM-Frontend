import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import { useCrm } from '../context'
import { Toasts } from '../ui'

function strength(password) {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const METER = ['bg-slate-200', 'bg-rose-400', 'bg-sky-300', 'bg-sky-500', 'bg-[#1E4A9A]']
const METER_LABEL = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong']

export function Login() {
  const crm = useCrm()
  const { login, loginWithOtp, signup, resetPassword, db, toast } = crm
  const [mode, setMode] = useState('login')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [params] = useSearchParams()
  const [otp, setOtp] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const score = password ? strength(password) : 0

  useEffect(() => {
    if (seconds <= 0) return undefined
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])

  useEffect(() => {
    const flag = params.get('verified')
    if (flag === '1') toast('Email verified. Sign in to continue.')
    if (flag === '0') toast('This verification link is invalid or has expired.', 'bad')
    // Run once for the link the inbox opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    const result = await work()
    setBusy(false)
    if (!result?.ok) toast(result?.message || 'Invalid credentials', 'bad')
    return result
  }

  const submit = async (event) => {
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
      const result = await finish(() => signup({ name, mobile, email, password }))
      if (result?.pending) {
        toast(result.message)
        setMode('login')
        setPassword('')
        setUseOtp(false)
      }
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

  const passwordVisible = (mode === 'login' && !useOtp) || mode === 'signup' || (mode === 'forgot' && seconds > 0)
  const title = mode === 'signup' ? 'Create your desk' : mode === 'forgot' ? 'Reset password' : 'Welcome back'
  const subtitle = mode === 'signup'
    ? 'We email a verification link. Open it, then sign in.'
    : mode === 'forgot'
      ? 'Enter the mobile on the account. We will send a one-time code.'
      : 'Sign in with the mobile number on your account.'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F5F2] px-4 py-10 text-slate-900">
      <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 text-xs font-semibold text-slate-950">DG</span>
              <div>
                <p className="text-sm font-medium text-slate-900">DG Gold</p>
                <p className="text-[11px] text-slate-400">Sangli desk</p>
              </div>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-0.5 text-xs font-normal text-slate-500">{subtitle}</p>

            {mode !== 'forgot' && (
              <div className="mt-4 inline-flex h-9 items-center rounded-xl border border-slate-200/60 bg-slate-100/90 p-1 text-slate-500">
                {[['login', 'Sign in'], ['signup', 'Create account']].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setMode(value); setUseOtp(false); setOtp('') }}
                    className={`h-7 rounded-lg border-0 px-3 text-xs transition ${mode === value ? 'bg-white font-medium text-slate-900 shadow-xs' : 'bg-transparent font-normal text-slate-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-slate-200/80 bg-white p-4">
              <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-3">
                  {mode === 'signup' && (
                    <>
                      <Field icon={User} label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
                      <Field icon={Mail} label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </>
                  )}
                  <Field icon={Phone} label="Mobile number" inputMode="numeric" maxLength={10} value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} required autoComplete="username" />
                  {((mode === 'login' && useOtp) || mode === 'forgot') && (
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Field icon={Lock} label="One-time code" inputMode="numeric" maxLength={4} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))} />
                      </div>
                      <button type="button" disabled={seconds > 0} onClick={sendOtp} className="h-10 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 disabled:opacity-50">
                        {seconds > 0 ? `${seconds}s` : 'Send code'}
                      </button>
                    </div>
                  )}
                  {passwordVisible && (
                    <div>
                      <Field
                        icon={Lock}
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required={mode !== 'forgot'}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        trailing={(
                          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent text-slate-400 hover:text-slate-700" onClick={() => setShowPassword((value) => !value)}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        )}
                      />
                      {(mode === 'signup' || mode === 'forgot') && (
                        <div className="mt-2">
                          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                            <span className={`block h-full ${METER[score]}`} style={{ width: `${password ? score * 25 : 8}%` }} />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">{METER_LABEL[score]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <button type="submit" disabled={busy} className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#C9DCFF] bg-[#EAF2FF] text-sm font-medium text-[#1E4A9A] transition duration-200 hover:-translate-y-0.5 hover:bg-[#D7E6FF] disabled:opacity-70">
                {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1E4A9A]/30 border-t-[#1E4A9A]" />}
                {mode === 'signup' ? 'Create account' : mode === 'forgot' ? (otp ? 'Save password' : 'Send code') : 'Continue'}
                {!busy && <ArrowRight size={15} />}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
              {mode === 'login' ? (
                <>
                  <button type="button" className="border-0 bg-transparent p-0 text-xs text-slate-500 hover:text-slate-800" onClick={() => setUseOtp((value) => !value)}>
                    {useOtp ? 'Use password' : 'Use a one-time code'}
                  </button>
                  <button type="button" className="border-0 bg-transparent p-0 text-xs font-medium text-[#1E4A9A]" onClick={() => { setMode('forgot'); setOtp(''); setSeconds(0); setUseOtp(false) }}>
                    Forgot password
                  </button>
                </>
              ) : (
                <button type="button" className="border-0 bg-transparent p-0 text-xs font-medium text-[#1E4A9A]" onClick={() => setMode('login')}>
                  Back to sign in
                </button>
              )}
            </div>
          </motion.div>
      </div>
      <Toasts items={crm.toasts} />
    </div>
  )
}

function Field({ icon: Icon, label, trailing, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span>
      <span className="relative block">
        <Icon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 text-sm font-normal text-slate-700 outline-none transition focus:border-[#4F83F1]/50 focus:ring-4 focus:ring-[#4F83F1]/10 ${trailing ? 'pr-11' : 'pr-3'}`}
        />
        {trailing && <span className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</span>}
      </span>
    </label>
  )
}
