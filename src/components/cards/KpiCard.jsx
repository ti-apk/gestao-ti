const COLOR_MAP = {
  blue: 'text-brand-blue',
  green: 'text-brand-green',
  amber: 'text-brand-amber',
  orange: 'text-brand-orange',
  red: 'text-brand-red',
  gray: 'text-gray-700 dark:text-gray-200',
}

export function KpiCard({ icon: Icon, label, value, sublabel, color = 'blue' }) {
  return (
    <div className="panel flex flex-1 flex-col gap-1.5 p-3 lg:gap-2 lg:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-display text-[11px] font-semibold text-gray-600 dark:text-gray-300 lg:text-xs">
          {label}
        </span>
        <Icon size={15} className={`shrink-0 ${COLOR_MAP[color]}`} />
      </div>

      <div>
        <p className={`font-display text-2xl font-bold leading-tight lg:text-[32px] ${COLOR_MAP[color]}`}>{value}</p>
        <p className="mt-1 truncate text-[10px] text-gray-500 dark:text-gray-400 lg:text-[11px]">{sublabel}</p>
      </div>
    </div>
  )
}
