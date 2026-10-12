import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

export function ChartFrame({ height = 240, children }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const measure = () => setWidth(node.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="chart-box" style={{ height }}>
      {width > 0 ? children({ width, height }) : null}
    </div>
  )
}

export function Logo({ compact = false }) {
  return (
    <div className="logo">
      <span className="logo-mark">DG</span>
      {!compact && (
        <span className="logo-text">
          <strong>DG Gold</strong>
          <em>Cash For Gold</em>
        </span>
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-head rise">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  )
}

export function Badge({ children, tone = 'gray' }) {
  const map = { gold: 'badge-gold', green: 'badge-green', red: 'badge-red', dark: 'badge-dark', soft: 'badge-soft' }
  return <span className={`badge ${map[tone] || ''}`}>{children}</span>
}

export function statusTone(status) {
  if (['Converted', 'Completed', 'Verified', 'Paid', 'Closed', 'Done'].includes(status)) return 'green'
  if (['Overdue', 'Lost', 'Invalid', 'Not Interested', 'Rejected', 'Cancelled'].includes(status)) return 'red'
  if (['High', 'Payment Due', 'Requested', 'Pending', 'Visit Scheduled'].includes(status)) return 'gold'
  if (['New', 'Active'].includes(status)) return 'dark'
  return 'soft'
}

export function Select({ value, onChange, options, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false)
  const [box, setBox] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const current = options.find((option) => option.value === value)
  const toggle = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) setBox({ top: rect.bottom + 6, left: rect.left, width: rect.width })
    setOpen((next) => !next)
  }
  return (
    <div className="menu-select" ref={ref}>
      <button type="button" className="menu-select-btn" aria-expanded={open} onClick={toggle}>
        <span>{current?.label || placeholder}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && box && (
        <div className="menu-select-list z-50 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-1 text-slate-800 shadow-xl shadow-slate-900/5 backdrop-blur-md" role="listbox" style={{ position: 'fixed', top: box.top, left: box.left, width: Math.max(box.width, 160), right: 'auto' }}>
          {options.map((option) => {
            const selected = option.value === value
            return (
              <button
                type="button"
                key={`${option.value}-${option.label}`}
                data-selected={selected}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-amber-50 data-[selected=true]:text-amber-800"
                onClick={() => {
                  onChange({ target: { value: option.value } })
                  setOpen(false)
                }}
              >
                <Check size={13} className={selected ? 'text-amber-700' : 'opacity-0'} />
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null
  return (
    <div className="modal-root">
      <button className="backdrop" aria-label="Close" onClick={onClose} />
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Drawer({ open, title, onClose, children, footer }) {
  if (!open) return null
  return (
    <div className="drawer-root">
      <button className="backdrop" aria-label="Close" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </div>
  )
}

export function Empty({ title, text }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export function Access({ allow, children }) {
  if (!allow) {
    return (
      <div className="card">
        <h2>Restricted module</h2>
        <p className="sub">Your role can work assigned records. Ask an admin if you need this report or setting.</p>
      </div>
    )
  }
  return children
}

export function Toasts({ items }) {
  return (
    <div className="toast-wrap">
      {items.map((item) => (
        <div key={item.id} className={`toast ${item.tone || 'ok'}`}>{item.message}</div>
      ))}
    </div>
  )
}
