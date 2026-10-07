import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

// Mesma paleta de destaque do painel + alguns tons extras pra comportar mais
// de 5 responsáveis sem repetir cor
const COLORS = ['#2E7DF7', '#1FA37C', '#F5A623', '#ff6918', '#ff4639', '#8b5cf6', '#06b6d4', '#ec4899']

export function CompletedByResponsibleChart({ data }) {
  const { byResponsible, totalConcluidos } = data

  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4 lg:flex-[0.52]">
      <h3 className="font-display text-base font-semibold">Concluídos por responsável</h3>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Tickets concluídos nesta semana</p>

      {byResponsible.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          Nenhum ticket concluído esta semana
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center gap-2">
          {/* Área da rosca: largura fixa própria, então o label central é
              centralizado DENTRO dela — não depende de "adivinhar" quanto
              espaço a legenda do lado vai ocupar */}
          <div className="relative h-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byResponsible}
                  dataKey="count"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {byResponsible.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--tooltip-border)',
                    fontSize: 12,
                    backgroundColor: 'var(--tooltip-bg)',
                    color: 'var(--tooltip-text)',
                  }}
                  itemStyle={{ color: 'var(--tooltip-text)' }}
                  formatter={(value, name) => [`${value} concluído(s)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold text-gray-800 dark:text-gray-100">
                {totalConcluidos}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">concluídos</span>
            </div>
          </div>

          {/* Legenda própria (em vez do <Legend> do Recharts), assim ela fica
              numa coluna de largura independente e não empurra o centro da rosca */}
          <ul className="flex max-h-full shrink-0 flex-col justify-center gap-1.5 overflow-y-auto pr-1 text-xs">
            {byResponsible.map((entry, index) => (
              <li key={entry.name} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">{entry.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}