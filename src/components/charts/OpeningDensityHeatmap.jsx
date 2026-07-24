import { WEEKDAY_LABELS } from "../../utils/dateHelpers";

// Faixas de cor iguais à legenda do mockup: 1-2, 3-5, 6-10, 11-15, 16+
// Cada faixa já traz a cor de TEXTO ideal para o contraste do próprio fundo
// (ex: fundos azul-escuros usam texto claro, fundos azul-clarinhos usam texto escuro)
const BUCKETS = [
  {
    max: 0,
    className: "bg-gray-50 dark:bg-gray-800/60",
    text: "text-gray-400 dark:text-gray-500",
  },
  {
    max: 2,
    className: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-900 dark:text-blue-200",
  },
  {
    max: 5,
    className: "bg-blue-200 dark:bg-blue-900",
    text: "text-blue-900 dark:text-blue-100",
  },
  {
    max: 10,
    className: "bg-blue-400 dark:bg-blue-700",
    text: "text-white dark:text-white",
  },
  {
    max: 15,
    className: "bg-blue-600 dark:bg-blue-600",
    text: "text-white dark:text-white",
  },
  {
    max: Infinity,
    className: "bg-blue-800 dark:bg-blue-400",
    text: "text-white dark:text-blue-950",
  },
];

function bucketFor(count) {
  return BUCKETS.find((b) => count <= b.max);
}

const MONTH_NAME = new Date().toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
});

const GRANULARITY_LABEL = {
  month: "por mês",
  quarter: "por trimestre",
  semester: "por semestre",
  year: "por ano",
};

function Legend() {
  return (
    <div className="mt-2 flex shrink-0 flex-wrap items-center justify-end gap-2 text-[10px] text-gray-500 dark:text-gray-400">
      {["1-2", "3-5", "6-10", "11-15", "16+"].map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <span className={`h-2.5 w-2.5 rounded ${BUCKETS[i + 1].className}`} />
          {label}
        </div>
      ))}
    </div>
  );
}

function CalendarView({ weeks }) {
  return (
    <div className="grid flex-1 grid-rows-[auto_repeat(6,1fr)] gap-1">
      <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1">
          {week.map((day) => {
            const bucket = bucketFor(day.count);
            return (
              <div
                key={day.date.toISOString()}
                title={`${day.dayNumber}: ${day.count} finalizado(s)`}
                className={`relative flex items-start justify-start rounded-md p-1 text-[10px] font-medium
                  ${day.inCurrentMonth ? bucket.className : "bg-transparent"}
                  ${day.inCurrentMonth ? bucket.text : "text-gray-300 dark:text-gray-700"}
                  ${day.isToday ? "ring-2 ring-brand-blue ring-offset-1 ring-offset-white dark:ring-offset-surface-dark-card" : ""}
                `}
              >
                {day.dayNumber}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AggregateView({ buckets }) {
  if (buckets.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-xs text-gray-400">
        Sem tickets finalizados no período
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-end gap-2 overflow-hidden">
      {buckets.map((bucket) => {
        const colorBucket = bucketFor(bucket.count);
        return (
          <div
            key={bucket.key}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              title={`${bucket.label}: ${bucket.count} finalizado(s)`}
              className={`flex w-full flex-1 items-end justify-center rounded-md pb-1 text-xs font-semibold ${colorBucket.className} ${colorBucket.text}`}
            >
              {bucket.count}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {bucket.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OpeningDensityHeatmap({ density }) {
  const isAggregate = density.mode === "aggregate";

  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">
        Densidade de finalizações
      </h3>
      <p className="mb-3 text-xs capitalize text-gray-500 dark:text-gray-400">
        {isAggregate
          ? `Chamados finalizados ${GRANULARITY_LABEL[density.granularity]}`
          : `Chamados finalizados por dia — ${MONTH_NAME}`}
      </p>

      {isAggregate ? (
        <AggregateView buckets={density.buckets} />
      ) : (
        <CalendarView weeks={density.weeks} />
      )}

      <Legend />
    </div>
  );
}
