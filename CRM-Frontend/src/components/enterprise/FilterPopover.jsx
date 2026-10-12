import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

export function FilterPopover({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find((option) => option.value === value)
  const summary = current?.label || 'All'

  useEffect(() => {
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      >
        <span className="text-slate-500">{label}</span>
        <span>{summary}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-9 z-50 max-h-64 min-w-[140px] overflow-auto rounded-xl border border-slate-200/80 bg-white/95 p-1 text-slate-800 shadow-xl shadow-slate-900/5 backdrop-blur-md"
          >
            {options.map((option) => {
              const selected = option.value === value
              return (
                <button
                  type="button"
                  key={`${option.value}-${option.label}`}
                  data-selected={selected}
                  className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-amber-50 data-[selected=true]:text-amber-800"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check size={13} className={selected ? 'text-amber-700' : 'opacity-0'} />
                  {option.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
