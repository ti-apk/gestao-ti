export function SlaByResponsibleChart({ data }) {
  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">SLA por Responsável</h3>
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Desempenho individual</p>

      <div className="flex flex-1 flex-col justify-around gap-2">
        {data.map(({ assignee, withinPct, outOfPct }) => (
          <div key={assignee} className="flex items-center gap-2">
            <span className="w-20 shrink-0 truncate text-xs text-gray-700 dark:text-gray-200">
              {assignee}
            </span>

            <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
              <div
                className="flex items-center justify-center bg-brand-green text-[11px] font-semibold text-white"
                style={{ width: `${withinPct}%` }}
              >
                {withinPct > 14 ? `${withinPct}%` : ''}
              </div>
              {outOfPct > 0 && (
                <div
                  className="flex items-center justify-center bg-brand-red text-[11px] font-semibold text-white"
                  style={{ width: `${outOfPct}%` }}
                >
                  {outOfPct > 8 ? `${outOfPct}%` : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
