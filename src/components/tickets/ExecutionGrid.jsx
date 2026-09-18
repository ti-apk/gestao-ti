import { PersonColumn } from './PersonColumn'

// Paleta só pra dar identidade visual a cada coluna (igual ao "tingido" que o
// Kanban usa por status) — aqui não existe uma cor "certa" por pessoa, então
// ciclamos por essas cores só pra manter o mesmo estilo entre as duas telas
const COLUMN_COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#22C55E', '#0EA5E9']

// Agrupa os tickets por responsável — um ticket com múltiplos responsáveis
// aparece na coluna de cada um deles (mesma regra do gráfico "Tarefas por
// Responsável" no Dashboard)
function groupByPerson(tickets) {
  const byPerson = {}

  tickets.forEach((t) => {
    const people = t.assignees?.length
      ? t.assignees
      : [{ name: t.assignee, photo: t.assigneePhoto, initials: t.assigneeInitials }]

    people.forEach((person) => {
      if (!byPerson[person.name]) {
        byPerson[person.name] = { person, tickets: [] }
      }
      byPerson[person.name].tickets.push(t)
    })
  })

  return Object.values(byPerson).sort((a, b) => b.tickets.length - a.tickets.length)
}

export function ExecutionGrid({ tickets }) {
  const columns = groupByPerson(tickets)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'} em execução
      </p>

      {columns.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Nenhum ticket em execução</p>
      ) : (
        <div className="flex h-full min-h-0 gap-3 overflow-x-auto pb-1">
          {columns.map(({ person, tickets: personTickets }, index) => (
            <PersonColumn
              key={person.name}
              person={person}
              tickets={personTickets}
              color={COLUMN_COLORS[index % COLUMN_COLORS.length]}
            />
          ))}
        </div>
      )}
    </div>
  )
}