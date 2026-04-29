import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export default function SidebarNav() {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        HR Management
      </p>

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group',
              isActive
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              item.placeholder ? 'opacity-60' : '',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={[
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600',
                ].join(' ')}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.placeholder && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">
                  Soon
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}