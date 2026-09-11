import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function EvolutionTick({ x, y, payload, data }) {
  const point = data[payload.index]
  const line1 = point?.dayRange ?? payload.value
  const line2 = point?.monthRange

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={12}
        textAnchor="middle"
        fontSize={12}
        className="fill-gray-600 dark:fill-gray-300"
      >
        {line1}
      </text>
      {line2 && (
        <text
          dy={22}
          textAnchor="middle"
          fontSize={11}
          className="fill-gray-400 dark:fill-gray-500"
        >
          {line2}
        </text>
      )}
    </g>
  )
}

export function TicketsEvolutionChart({ data }) {
  const hasTwoLineLabels = data.some((d) => d.monthRange)

  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">Evolução de tickets</h3>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
        Contagem de status criados x finalizados
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            height={hasTwoLineLabels ? 36 : 24}
            padding={{ left: 12, right: 12 }}
            tick={hasTwoLineLabels ? <EvolutionTick data={data} /> : { fontSize: 11 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={32} />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
          <Legend
            verticalAlign="top"
            align="right"
            height={24}
            iconType="plainline"
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="criados"
            name="Criados"
            stroke="#2E7DF7"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="finalizados"
            name="Finalizados"
            stroke="#1FA37C"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}