import { LayoutDashboard, ListChecks, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { FiltersPanel } from './FiltersPanel'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'tickets', label: 'Tickets', icon: ListChecks },
]

export function Sidebar({ filters, onFiltersChange, assignees, categories }) {
  const [active, setActive] = useState('dashboard')

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border-light bg-surface-card py-4 dark:border-border-dark dark:bg-surface-dark-card">
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-display text-sm font-semibold transition-colors
                ${
                  isActive
                    ? 'bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border-light dark:border-border-dark" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-3 font-display text-sm font-semibold text-gray-500 dark:text-gray-400">
          <SlidersHorizontal size={16} />
          Filtros
        </div>
        <FiltersPanel
          filters={filters}
          onChange={onFiltersChange}
          assignees={assignees}
          categories={categories}
        />
      </div>
    </aside>
  )
}
