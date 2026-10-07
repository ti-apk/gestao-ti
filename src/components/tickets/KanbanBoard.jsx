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
    // Mobile/tablet: scroll horizontal com "snap" — cada coluna ocupa quase a
    // largura inteira da tela e a rolagem para alinhada nela (como trocar de
    // cartão), já que 5 colunas lado a lado não cabem numa tela de celular.
    // A partir do lg, volta a ser o board tradicional com todas as colunas
    // visíveis e altura travada na tela.
    <div className="flex h-[calc(100dvh-230px)] snap-x snap-mandatory gap-3 overflow-x-auto pb-1 lg:h-full lg:min-h-0 lg:snap-none">
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
