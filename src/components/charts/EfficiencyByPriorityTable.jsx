export function EfficiencyByPriorityTable({ data }) {
  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4 lg:flex-[0.55]">
      <h3 className="font-display text-base font-semibold">
        Eficiência por Prioridade
      </h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Tempo de ciclo médio por prioridade
      </p>

      <div className="flex-1 overflow-hidden rounded-lg border border-border-light dark:border-border-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-gray-50 text-left text-xs text-gray-500 dark:border-border-dark dark:bg-gray-800/60 dark:text-gray-400">
              <th className="px-3 py-2 font-medium">Prioridade</th>
              <th className="px-3 py-2 font-medium">Tickets</th>
              <th className="px-3 py-2 font-medium">Tempo de ciclo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.priority}
                className="border-b border-border-light last:border-0 dark:border-border-dark"
              >
                <td className="px-3 py-2.5 font-medium text-gray-700 dark:text-gray-200">
                  {row.label}
                </td>
                <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400">
                  {row.count}
                </td>
                <td className="px-3 py-2.5 text-gray-700 dark:text-gray-200">
                  {row.avgCycleTimeDays}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
