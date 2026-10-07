import { TrendingUp, TrendingDown } from 'lucide-react'

function ChangeIndicator({ change }) {
  if (change === 'parcial') {
    return <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">parcial</span>
  }

  if (change == null) {
    return <span className="text-[11px] text-gray-400 dark:text-gray-500">—</span>
  }

  const isUp = change >= 0
  const Icon = isUp ? TrendingUp : TrendingDown
  const colorClass = isUp ? 'text-brand-green' : 'text-brand-red'

  return (
    <span className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold ${colorClass}`}>
      <Icon size={12} />
      {Math.abs(Math.round(change))}%
    </span>
  )
}

export function CompletedByWeekChart({ data }) {
  const { rows, totalConcluidos, mediaPorSemana, taxaConclusao } = data

  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4 lg:flex-[0.85]">
      <h3 className="font-display text-base font-semibold">Chamados concluídos por semana</h3>
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Finalizados nas últimas 5 semanas</p>

      <div className="mb-2 grid shrink-0 grid-cols-3 gap-1.5">
        <div className="rounded-lg bg-gray-50 px-1.5 py-1 text-center dark:bg-gray-800/60">
          <p className="text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100">{totalConcluidos}</p>
          <p className="text-[9px] leading-tight text-gray-500 dark:text-gray-400">concluídos no período</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-1.5 py-1 text-center dark:bg-gray-800/60">
          <p className="text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100">{mediaPorSemana}</p>
          <p className="text-[9px] leading-tight text-gray-500 dark:text-gray-400">média por semana</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-1.5 py-1 text-center dark:bg-gray-800/60">
          <p className="text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100">{taxaConclusao}%</p>
          <p className="text-[9px] leading-tight text-gray-500 dark:text-gray-400">taxa de conclusão</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-0.5">
        {rows.map((row) => {
          const barWidth = Math.max(row.count > 0 ? 4 : 0, row.barPercent)
          // A listra da semana em andamento é feita via inline style (não como
          // classe Tailwind arbitrária) porque o JIT do Tailwind não extrai
          // corretamente um gradiente com vírgulas aninhadas dentro de rgba() —
          // a classe nunca era gerada no CSS final.
          const barStyle = {
            width: `${barWidth}%`,
            ...(row.isCurrent
              ? {
                  backgroundColor: '#2E7DF7',
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.45) 0px, rgba(255,255,255,0.45) 4px, transparent 4px, transparent 8px)',
                }
              : { backgroundColor: '#2E7DF7' }),
          }

          return (
            <div key={row.dayRange} className="flex items-center gap-2 text-xs">
              <span className="w-28 shrink-0 whitespace-nowrap py-1 pr-3 leading-tight text-gray-500 dark:text-gray-400">
                {row.dayRange} <span className="lowercase">{row.monthRange}</span>
              </span>

              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full rounded-full" style={barStyle} />
              </div>

              <span className="w-5 shrink-0 text-right font-semibold leading-tight text-gray-700 dark:text-gray-200">
                {row.count}
              </span>

              <div className="w-11 shrink-0 text-right leading-tight">
                <ChangeIndicator change={row.change} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}