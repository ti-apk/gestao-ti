import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

export function DemandByAreaChart({ data }) {
  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">Áreas com maior demanda</h3>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Identificação por categoria</p>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            width={80}
            tick={{ fontSize: 11 }}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
          <Bar dataKey="count" fill="#2E7DF7" radius={[0, 6, 6, 0]} barSize={14}>
            <LabelList dataKey="count" position="right" className="fill-gray-600 dark:fill-gray-300 text-xs" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
