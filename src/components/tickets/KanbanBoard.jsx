import { KanbanColumn } from "./KanbanColumn";

const COLUMNS = [
  { key: "em_andamento", title: "Em Execução", color: "#008af2" },
  { key: "pendente", title: "Pendente", color: "#da4449" },
  { key: "aguardando_interno", title: "Aguardando Interno", color: "#f2bb3a" },
  { key: "aguardando_externo", title: "Aguardando Externo", color: "#eb6308" },
  { key: "backlog", title: "Backlog", color: "#f26aae" },
];

export function KanbanBoard({ tickets }) {
  return (
    <div className="flex h-full min-h-0 gap-3 overflow-x-auto pb-1">
      {COLUMNS.map(({ key, title, color }) => (
        <KanbanColumn
          key={key}
          title={title}
          color={color}
          tickets={tickets.filter((t) => t.displayStatus === key)}
        />
      ))}
    </div>
  );
}
