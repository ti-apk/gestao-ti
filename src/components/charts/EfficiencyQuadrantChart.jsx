import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const EFFORT_MID = 10
const CYCLE_MID = 20
const MAX_EFFORT = 20
const MAX_CYCLE = 40

const QUADRANT_COLOR = {
  esforco_x_ciclo: '#1FA37C',
  lento_alto_esforco: '#E8483C',
  rapido_baixo_esforco: '#1FA37C',
  lento_baixo_esforco: '#F5A623',
}

export function EfficiencyQuadrantChart({ data }) {
  return (
    <div className="panel flex h-full min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold">Quadrante de eficiência</h3>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Esforço x tempo de ciclo</p>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          {/* 4 áreas de fundo representando os quadrantes */}
          <ReferenceArea x1={0} x2={EFFORT_MID} y1={CYCLE_MID} y2={MAX_CYCLE} fill="#1FA37C" fillOpacity={0.08} />
          <ReferenceArea x1={EFFORT_MID} x2={MAX_EFFORT} y1={CYCLE_MID} y2={MAX_CYCLE} fill="#E8483C" fillOpacity={0.08} />
          <ReferenceArea x1={0} x2={EFFORT_MID} y1={0} y2={CYCLE_MID} fill="#1FA37C" fillOpacity={0.04} />
          <ReferenceArea x1={EFFORT_MID} x2={MAX_EFFORT} y1={0} y2={CYCLE_MID} fill="#F5A623" fillOpacity={0.08} />

          <ReferenceLine x={EFFORT_MID} stroke="#9CA3AF" strokeDasharray="4 4" />
          <ReferenceLine y={CYCLE_MID} stroke="#9CA3AF" strokeDasharray="4 4" />

          <XAxis type="number" dataKey="effort" domain={[0, MAX_EFFORT]} tickCount={5} tick={{ fontSize: 11 }} />
          <YAxis type="number" dataKey="cycleTime" domain={[0, MAX_CYCLE]} tickCount={5} tick={{ fontSize: 11 }} width={28} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
            formatter={(value, name) => [value, name === 'effort' ? 'Esforço' : 'Tempo de ciclo']}
          />

          <Scatter data={data}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={QUADRANT_COLOR[entry.quadrant]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
