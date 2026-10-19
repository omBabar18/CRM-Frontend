import { motion } from 'framer-motion'

export function IncomingFeature({ icon: Icon, title, detail, points }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-2 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#EAF2FF]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 h-44 w-44 rounded-full bg-slate-100"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative">
          <div className="relative mx-auto grid h-16 w-16 place-items-center">
            <motion.span
              className="absolute inset-0 rounded-2xl bg-[#EAF2FF]"
              animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-[#C9DCFF] bg-[#EAF2FF] text-[#1E4A9A]">
              <Icon size={26} strokeWidth={1.75} />
            </span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#1E4A9A]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F83F1] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1E4A9A]" />
            </span>
            Incoming feature
          </motion.p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm font-normal leading-6 text-slate-500">{detail}</p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {points.map((point, index) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.12, duration: 0.35 }}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-600"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F83F1]" />
                {point}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
