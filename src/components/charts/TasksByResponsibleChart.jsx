export function TasksByResponsibleChart({ data }) {
  const maxTotal = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">
        Tarefas por Responsável
      </h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Em aberto x concluídas
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {data.map(({ assignee, open, closed, total }) => {
          const barWidthPct = (total / maxTotal) * 100;
          const openPct = total === 0 ? 0 : (open / total) * 100;
          const closedPct = 100 - openPct;

          return (
            <div key={assignee} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-sm text-gray-700 dark:text-gray-200">
                {assignee}
              </span>

              <div className="flex-1">
                <div
                  className="flex h-6 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800"
                  style={{ width: `${barWidthPct}%` }}
                >
                  {open > 0 && (
                    <div
                      className="flex items-center justify-center bg-brand-blue text-xs font-semibold text-white"
                      style={{ width: `${openPct}%` }}
                    >
                      {openPct > 12 ? open : ""}
                    </div>
                  )}
                  {closed > 0 && (
                    <div
                      className="flex items-center justify-center bg-brand-green text-xs font-semibold text-white"
                      style={{ width: `${closedPct}%` }}
                    >
                      {closedPct > 12 ? closed : ""}
                    </div>
                  )}
                </div>
              </div>

              <span className="w-8 shrink-0 text-right text-xs text-gray-400">
                {total}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-blue" /> Em aberto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-green" /> Concluídas
        </span>
      </div>
    </div>
  );
}
