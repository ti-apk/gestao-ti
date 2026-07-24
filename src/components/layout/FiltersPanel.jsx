const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
]

function FieldLabel({ children }) {
  return (
    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
      {children}
    </label>
  )
}

const selectClass =
  'w-full rounded-lg border border-border-light bg-surface-card px-3 py-2 text-sm ' +
  'text-gray-700 outline-none transition-colors focus:border-brand-blue ' +
  'dark:border-border-dark dark:bg-surface-dark-card dark:text-gray-200'

export function FiltersPanel({ filters, onChange, assignees = [], categories = [] }) {
  const update = (patch) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-col gap-3 px-3">
      <div>
        <FieldLabel>Período</FieldLabel>
        <select
          className={selectClass}
          value={filters.period}
          onChange={(e) => update({ period: e.target.value })}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filters.period === 'custom' && (
        <div className="flex flex-col gap-2">
          <div>
            <FieldLabel>De</FieldLabel>
            <input
              type="date"
              className={selectClass}
              value={filters.startDate}
              onChange={(e) => update({ startDate: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel>Até</FieldLabel>
            <input
              type="date"
              className={selectClass}
              value={filters.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </div>
        </div>
      )}

      <div>
        <FieldLabel>Responsável</FieldLabel>
        <select
          className={selectClass}
          value={filters.assignee}
          onChange={(e) => update({ assignee: e.target.value })}
        >
          <option value="all">Todos</option>
          {assignees.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>Categoria</FieldLabel>
        <select
          className={selectClass}
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="all">Todas</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export const DEFAULT_FILTERS = {
  period: 'all',
  startDate: '',
  endDate: '',
  assignee: 'all',
  category: 'all',
}
