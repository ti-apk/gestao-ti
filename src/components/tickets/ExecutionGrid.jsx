import { TicketCard } from './TicketCard'

export function ExecutionGrid({ tickets }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} em execução
      </p>

      {tickets.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Nenhum ticket em execução</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} highlightPriority />
          ))}
        </div>
      )}
    </div>
  )
}