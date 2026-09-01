import { TicketCard } from "./TicketCard";

export function KanbanColumn({ title, color, tickets }) {
  return (
    <div 
      className="panel flex h-full min-w-[240px] flex-1 flex-col p-0"
      style={{backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`}}
    >
      <div className="flex items-center gap-2 border-b border-border-light px-3 py-3 dark:border-border-dark">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="truncate font-display text-sm font-semibold text-gray-700 dark:text-gray-200">
          {title}
        </h3>
        <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {tickets.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
        {tickets.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">
            Nenhum ticket
          </p>
        )}
      </div>
    </div>
  );
}
