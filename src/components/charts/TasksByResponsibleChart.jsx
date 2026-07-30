// Mesmas cores usadas pelo ClickUp para prioridade: cinza/azul/amarelo/vermelho
const PRIORITY_SEGMENTS = [
  { key: "baixa", label: "Baixa", className: "bg-gray-400" },
  { key: "normal", label: "Normal", className: "bg-brand-blue" },
  { key: "alta", label: "Alta", className: "bg-brand-amber" },
  { key: "urgente", label: "Urgente", className: "bg-brand-red" },
];

function firstName(fullName) {
  if (!fullName) return fullName;
  return fullName.trim().split(/\s+/)[0];
}

export function TasksByResponsibleChart({ data }) {
  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">
        Tarefas por Responsável
      </h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Por prioridade dos chamados
      </p>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {data.map((row) => {
          return (
            <div key={row.assignee} className="flex items-center gap-3">
              <div className="flex w-32 shrink-0 items-center gap-2">
                {row.photo ? (
                  <img
                    src={row.photo}
                    alt={row.assignee}
                    className="h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[10px] font-semibold text-white">
                    {row.initials}
                  </div>
                )}
                <span className="truncate text-sm text-gray-700 dark:text-gray-200">
                  {firstName(row.assignee)}
                </span>
              </div>

              <div className="flex h-6 flex-1 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                {PRIORITY_SEGMENTS.map(({ key, className }) => {
                  const count = row[key];
                  if (count === 0) return null;
                  return (
                    <div
                      key={key}
                      className={`flex min-w-[20px] items-center justify-center text-[11px] font-semibold text-white ${className}`}
                      style={{ flexGrow: count, flexBasis: 0 }}
                    >
                      {count}
                    </div>
                  );
                })}
              </div>

              <span className="w-8 shrink-0 text-right text-xs text-gray-400">
                {row.total}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
        {PRIORITY_SEGMENTS.map(({ key, label, className }) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ${className}`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
