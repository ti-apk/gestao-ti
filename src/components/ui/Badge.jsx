const COLOR_MAP = {
  green: 'bg-brand-green text-white',
  red: 'bg-brand-red text-white',
  amber: 'bg-brand-amber text-gray-900',
  gray: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
}

export function Badge({ children, color = 'green' }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${COLOR_MAP[color]}`}>
      {children}
    </span>
  )
}