const COLOR_MAP = {
  green: 'bg-brand-green text-white',
  red: 'bg-brand-red text-white',
  amber: 'bg-brand-amber text-white',
}

export function Badge({ children, color = 'green' }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${COLOR_MAP[color]}`}>
      {children}
    </span>
  )
}
