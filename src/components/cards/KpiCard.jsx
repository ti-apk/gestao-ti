const COLOR_MAP = {
  blue: 'text-brand-blue',
  green: 'text-brand-green',
  amber: 'text-brand-amber',
  red: 'text-brand-red',
  gray: 'text-gray-700 dark:text-gray-200',
}

export function KpiCard({ icon: Icon, label, value, sublabel, color = 'blue' }) {
  return (
    <div className="panel flex flex-1 flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold text-gray-600 dark:text-gray-300">
          {label}
        </span>
        <Icon size={16} className={COLOR_MAP[color]} />
      </div>

      <div>
        <p className={`font-display text-[32px] font-bold leading-tight ${COLOR_MAP[color]}`}>{value}</p>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{sublabel}</p>
      </div>
    </div>
  )
}
