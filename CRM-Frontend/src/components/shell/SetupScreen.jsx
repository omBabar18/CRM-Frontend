import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const STEPS = ['Opening your desk', 'Syncing today’s gold rates', 'Loading the call queue']

export function SetupScreen({ name, onDone }) {
  const done = useRef(onDone)
  done.current = onDone
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = STEPS.map((_, index) => window.setTimeout(() => setStep(index), index * 700))
    const finish = window.setTimeout(() => done.current(), 2400)
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      window.clearTimeout(finish)
    }
  }, [])

  return (
    <div className="grid min-h-screen place-items-center bg-[#F6F5F2] px-6 text-slate-900">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-amber-200">DG</span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Setting things up for you</h1>
        <p className="mt-2 text-sm text-slate-500">Welcome back, {name}. Your Sangli desk is almost ready.</p>
        <div className="mt-8 space-y-2 text-left">
          {STEPS.map((label, index) => (
            <div key={label} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${index <= step ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${index < step ? 'bg-emerald-500' : index === step ? 'animate-pulse bg-amber-600' : 'bg-slate-300'}`} />
              {label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
