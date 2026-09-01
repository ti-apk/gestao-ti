import { PriorityFlag } from '../ui/PriorityFlag'
import { TagChip } from '../ui/TagChip'

function firstName(fullName) {
  if (!fullName) return fullName
  return fullName.trim().split(/\s+/)[0]
}

export function TicketCard({ ticket }) {
  const people = ticket.assignees?.length
    ? ticket.assignees
    : [{ name: ticket.assignee, photo: ticket.assigneePhoto, initials: ticket.assigneeInitials }]

  return (
    <div className="panel flex flex-col gap-2.5 p-3">
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