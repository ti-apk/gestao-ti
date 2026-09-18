import { PriorityFlag } from '../ui/PriorityFlag'
import { TagChip } from '../ui/TagChip'

function firstName(fullName) {
  if (!fullName) return fullName
  return fullName.trim().split(/\s+/)[0]
}

// Mesma paleta da PriorityFlag, mas em hex — aplicada via style inline (não
// depende da ordem das camadas do Tailwind pra sobrescrever a borda cinza
// padrão do .panel)
const PRIORITY_BORDER_COLOR = {
  baixa: '#9CA3AF', // gray-400
  normal: '#2E7DF7', // brand-blue
  alta: '#F5A623', // brand-amber
  urgente: '#E8483C', // brand-red
}

export function TicketCard({ ticket, highlightPriority = false, compact = false }) {
  const people = ticket.assignees?.length
    ? ticket.assignees
    : [{ name: ticket.assignee, photo: ticket.assigneePhoto, initials: ticket.assigneeInitials }]

  const borderColor = highlightPriority
    ? PRIORITY_BORDER_COLOR[ticket.priority] || PRIORITY_BORDER_COLOR.normal
    : undefined

  if (compact) {
    return (
      <div
        className="panel flex flex-col gap-1.5 p-2.5"
        style={borderColor ? { borderColor, borderWidth: 2 } : undefined}
      >
        <p className="line-clamp-2 text-xs font-medium text-gray-800 dark:text-gray-100">{ticket.title}</p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
          </span>
          <PriorityFlag priority={ticket.priority} compact />
        </div>

        {ticket.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.tags.map((tag) => (
              <TagChip key={tag}>{tag}</TagChip>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`panel flex flex-col gap-2.5 p-3 ${highlightPriority ? 'border-2' : ''}`}
      style={borderColor ? { borderColor } : undefined}
    >
      <p className="line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100">{ticket.title}</p>

      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Data de Criação:</p>
      <p className="text-sm font-regular text-gray-500 dark:text-gray-300">
        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {people.map((person) =>
              person.photo ? (
                <img
                  key={person.name}
                  src={person.photo}
                  alt={person.name}
                  title={person.name}
                  className="h-9 w-9 rounded-full border-2 border-surface-card object-cover dark:border-surface-dark-card"
                />
              ) : (
                <div
                  key={person.name}
                  title={person.name}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-card bg-brand-blue text-[9px] font-semibold text-white dark:border-surface-dark-card"
                >
                  {person.initials}
                </div>
              )
            )}
          </div>
          <span className="truncate text-sm font-medium text-gray-700/200 dark:text-gray-400">
            {firstName(people[0]?.name)}
            {people.length > 1 ? ` +${people.length - 1}` : ''}
          </span>
        </div>

        <PriorityFlag priority={ticket.priority} />
      </div>

      {ticket.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ticket.tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </div>
      )}
    </div>
  )
}