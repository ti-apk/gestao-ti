import { Flag } from 'lucide-react'

const PRIORITY_STYLES = {
  baixa: { label: 'Baixa', className: 'text-gray-400' },
  normal: { label: 'Normal', className: 'text-brand-blue' },
  alta: { label: 'Alta', className: 'text-brand-amber' },
  urgente: { label: 'Urgente', className: 'text-brand-red' },
}

export function PriorityFlag({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.normal

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${style.className}`}>
      <Flag size={12} fill="currentColor" />
      {style.label}
    </span>
  )
}