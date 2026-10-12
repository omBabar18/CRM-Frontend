import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, MoreHorizontal, Phone } from 'lucide-react'

export function RowActions({ phoneHref, whatsappHref, items = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      <a href={phoneHref} aria-label="Call" className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
        <Phone size={14} />
      </a>
      <a href={whatsappHref} aria-label="WhatsApp" className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200/80 text-emerald-600 transition hover:bg-emerald-50">
        <MessageCircle size={14} />
      </a>
      <div className="relative" ref={ref}>
        <button type="button" aria-label="More" className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => setOpen((value) => !value)}>
          <MoreHorizontal size={14} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-8 z-50 min-w-[140px] overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-1 text-slate-800 shadow-xl shadow-slate-900/5 backdrop-blur-md"
            >
              {items.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-lg border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => {
                    setOpen(false)
                    item.onClick()
                  }}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
