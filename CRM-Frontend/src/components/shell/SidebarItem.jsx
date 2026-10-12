import { NavLink } from 'react-router-dom'

export function SidebarItem({ to, end, icon: Icon, label, collapsed, count }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
          isActive
            ? 'bg-white/8 text-white'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-500 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
          <Icon size={18} strokeWidth={1.75} className={isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-200'} />
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && count > 0 && (
            <span className="ml-auto rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-200 ring-1 ring-inset ring-rose-400/30">{count}</span>
          )}
        </>
      )}
    </NavLink>
  )
}
