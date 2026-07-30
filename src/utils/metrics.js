import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  hoursBetween,
  daysBetween,
  getCurrentMonthCalendar,
  getPeriodRange,
  pickGranularity,
  bucketLabelFor,
  bucketSortKeyFor,
} from './dateHelpers'
import { isWithinInterval, isSameDay, startOfDay, subDays, addDays, differenceInCalendarDays } from 'date-fns'

// -----------------------------------------------------------------------------
// META DE SLA — calculada a partir do histórico real do time, não de um prazo
// de vencimento (o time não usa "Data de Vencimento" no ClickUp).
// -----------------------------------------------------------------------------
// Para cada prioridade, a meta é o percentil 75 do tempo de ciclo dos tickets
// já concluídos (cancelados não entram: não representam trabalho resolvido).
// Com poucos dados ainda, usa um valor padrão conservador até acumular
// pelo menos MIN_SAMPLES tickets concluídos daquela prioridade.
const FALLBACK_TARGET_HOURS = { urgente: 8, alta: 24, normal: 72, baixa: 96 }
const MIN_SAMPLES_FOR_BASELINE = 5

function percentile75(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.ceil(0.75 * sorted.length) - 1)
  return sorted[Math.max(0, index)]
}

// IMPORTANTE: recebe SEMPRE a lista completa de tickets (não a filtrada pela
// tela), para a meta não oscilar cada vez que alguém troca o filtro de período
export function getSlaTargets(allTickets) {
  const concluded = allTickets.filter((t) => t.status === 'concluido')

  const targets = {}
  for (const priority of Object.keys(FALLBACK_TARGET_HOURS)) {
    const cycleTimes = concluded.filter((t) => t.priority === priority).map((t) => t.cycleTimeHours)
    const p75 = percentile75(cycleTimes)
    targets[priority] =
      cycleTimes.length >= MIN_SAMPLES_FOR_BASELINE && p75 != null ? p75 : FALLBACK_TARGET_HOURS[priority]
  }
  return targets
}

// Um ticket "bloqueado" (aguardando interno/externo) não conta como fora do
// prazo — o time não consegue tratá-lo até a dependência ser resolvida.
// Cancelados também não contam (não é um atraso, é um ticket abandonado).
export function isOverdue(ticket, slaTargets) {
  if (ticket.status === 'bloqueado' || ticket.status === 'cancelado') return false

  const targetHours = slaTargets[ticket.priority]
  if (targetHours == null) return false

  const elapsedHours = ticket.closedAt ? ticket.cycleTimeHours : hoursBetween(ticket.createdAt, new Date().toISOString())
  return elapsedHours > targetHours
}

// -----------------------------------------------------------------------------
// FILTRO — aplica período (sidebar), responsável e categoria sobre a lista bruta
// -----------------------------------------------------------------------------
export function filterTickets(tickets, filters) {
  const { start, end } = getPeriodRange(filters)

  return tickets.filter((t) => {
    if (start && end) {
      const created = new Date(t.createdAt)
      if (!isWithinInterval(created, { start, end })) return false
    }
    if (filters.assignee !== 'all' && t.assignee !== filters.assignee) return false
    if (filters.category !== 'all' && t.category !== filters.category) return false
    return true
  })
}

// -----------------------------------------------------------------------------
// 1. KPI CARDS (Total de Tickets, Lead Time Médio, Taxa de SLA, Urgente(s),
//    Tempo Médio, Fora do prazo)
// -----------------------------------------------------------------------------
export function getKpiSummary(tickets, slaTargets) {
  // Total representa TUDO, independente do status (decisão do time)
  const total = tickets.length

  // Lead Time, Taxa de SLA e Tempo Médio olham só pra quem foi efetivamente
  // concluído — cancelado não é "resolvido", não deve puxar essas médias
  const concluded = tickets.filter((t) => t.status === 'concluido')

  const avgLeadTimeDays =
    concluded.length === 0
      ? 0
      : concluded.reduce((sum, t) => sum + daysBetween(t.createdAt, t.closedAt), 0) / concluded.length

  const withinSla = concluded.filter((t) => !isOverdue(t, slaTargets)).length
  const slaRate = concluded.length === 0 ? 0 : (withinSla / concluded.length) * 100

  // Urgente(s): impacto atual na operação -> conta tudo que ainda não foi
  // encerrado, incluindo tickets bloqueados (eles continuam urgentes, só não
  // contam contra o prazo). Só exclui o que já foi concluído ou cancelado.
  const urgentCount = tickets.filter(
    (t) => t.priority === 'urgente' && t.status !== 'concluido' && t.status !== 'cancelado'
  ).length

  const avgMinutes =
    concluded.length === 0
      ? 0
      : concluded.reduce((sum, t) => sum + hoursBetween(t.createdAt, t.closedAt) * 60, 0) / concluded.length
  const avgHours = Math.floor(avgMinutes / 60)
  const avgRemainingMinutes = Math.round(avgMinutes % 60)

  // Fora do prazo: qualquer ticket (aberto ou concluído) que passou da meta —
  // exceto bloqueado/cancelado, já filtrados dentro de isOverdue()
  const overdueCount = tickets.filter((t) => isOverdue(t, slaTargets)).length

  return {
    totalTickets: total,
    avgLeadTimeDays: avgLeadTimeDays.toFixed(0),
    slaRate: slaRate.toFixed(1).replace('.', ','),
    urgentCount,
    avgTime: `${avgHours}h ${avgRemainingMinutes}m`,
    overdueCount,
  }
}

// -----------------------------------------------------------------------------
// 2. EVOLUÇÃO DE TICKETS (LineChart: criados x finalizados)
// -----------------------------------------------------------------------------
// A granularidade do eixo X muda de acordo com o período selecionado no painel
// de Filtros:
//   - "Esta semana"                -> 1 ponto por dia (hoje-6 até hoje, 7 dias)
//   - "Este mês" / "Últimos 30 dias" -> 1 ponto por semana
//   - "Todos" / "Personalizado"    -> 1 ponto por mês (comportamento original)
export function getTicketsEvolution(tickets, filters = {}) {
  const period = filters.period || 'all'

  if (period === 'this_week') return getDailyEvolution(tickets)
  if (period === 'this_month' || period === 'last_30_days') return getWeeklyEvolution(tickets, filters)
  return getMonthlyEvolution(tickets)
}

// Últimos 7 dias fechados em hoje (hoje - 6 dias .. hoje)
function getDailyEvolution(tickets) {
  const today = startOfDay(new Date())
  const start = subDays(today, 6)

  return Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((day) => {
    const criados = tickets.filter((t) => isSameDay(new Date(t.createdAt), day)).length
    const finalizados = tickets.filter((t) => t.status === 'concluido' && isSameDay(new Date(t.closedAt), day)).length
    return { label: WEEKDAY_LABELS[day.getDay()], criados, finalizados }
  })
}

// Agrupa por semana, contando a partir do início do período filtrado
// (início do mês para "Este mês", ou hoje-30 para "Últimos 30 dias")
function getWeeklyEvolution(tickets, filters) {
  const { start } = getPeriodRange(filters)
  const rangeStart = start || startOfDay(new Date())

  const byWeek = {}
  const bump = (dateISO, field) => {
    const date = new Date(dateISO)
    const weekIndex = Math.floor(differenceInCalendarDays(date, rangeStart) / 7)
    if (weekIndex < 0) return
    if (!byWeek[weekIndex]) {
      byWeek[weekIndex] = { key: weekIndex, label: `Sem ${weekIndex + 1}`, criados: 0, finalizados: 0 }
    }
    byWeek[weekIndex][field]++
  }

  tickets.forEach((t) => bump(t.createdAt, 'criados'))
  tickets.forEach((t) => t.status === 'concluido' && bump(t.closedAt, 'finalizados'))

  return Object.values(byWeek).sort((a, b) => a.key - b.key)
}

// Comportamento original: 1 ponto por mês
function getMonthlyEvolution(tickets) {
  const months = [...new Set(tickets.map((t) => new Date(t.createdAt).getMonth()))].sort(
    (a, b) => a - b
  )

  return months.map((monthIndex) => {
    const criados = tickets.filter((t) => new Date(t.createdAt).getMonth() === monthIndex).length
    const finalizados = tickets.filter(
      (t) => t.status === 'concluido' && new Date(t.closedAt).getMonth() === monthIndex
    ).length
    return { label: MONTH_LABELS[monthIndex], criados, finalizados }
  })
}

// -----------------------------------------------------------------------------
// 3. DENSIDADE DE ABERTURAS -> agora "Chamados finalizados por dia", no formato
//    de calendário do mês atual (com dias de fora do mês e o dia de hoje marcados)
// -----------------------------------------------------------------------------
export function getFinalizedDensityCalendar(tickets) {
  const weeks = getCurrentMonthCalendar()

  return weeks.map((week) =>
    week.map((day) => {
      const count = tickets.filter((t) => t.status === 'concluido' && isSameDay(new Date(t.closedAt), day.date)).length
      return { ...day, count }
    })
  )
}

// Variante usada quando o filtro de período é "Todos": em vez de um calendário
// de um único mês, agrupa os finalizados em mês/trimestre/semestre/ano — a
// granularidade se ajusta automaticamente ao intervalo de datas dos tickets
export function getFinalizedDensityAggregate(tickets) {
  const closedDates = tickets.filter((t) => t.status === 'concluido').map((t) => new Date(t.closedAt))
  if (closedDates.length === 0) return { granularity: 'month', buckets: [] }

  const times = closedDates.map((d) => d.getTime())
  const min = new Date(Math.min(...times))
  const max = new Date(Math.max(...times))
  const monthsSpan = (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth()) + 1
  const granularity = pickGranularity(monthsSpan)

  const byKey = {}
  closedDates.forEach((date) => {
    const key = bucketSortKeyFor(date, granularity)
    if (!byKey[key]) byKey[key] = { key, label: bucketLabelFor(date, granularity), count: 0 }
    byKey[key].count++
  })

  const buckets = Object.values(byKey).sort((a, b) => a.key - b.key)
  return { granularity, buckets }
}

// -----------------------------------------------------------------------------
// 4. ÁREAS COM MAIOR DEMANDA (Top 5 categorias + "Outros" agrupando o restante)
// -----------------------------------------------------------------------------
export function getDemandByArea(tickets) {
  const counts = {}
  tickets
    .filter((t) => t.status !== 'cancelado' && t.category)
    .forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1
    })

  const sorted = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const top5 = sorted.slice(0, 5)
  const rest = sorted.slice(5)
  const outrosCount = rest.reduce((sum, c) => sum + c.count, 0)

  return outrosCount > 0 ? [...top5, { category: 'Outros', count: outrosCount }] : top5
}

// -----------------------------------------------------------------------------
// 5. EFICIÊNCIA POR PRIORIDADE (tabela com semáforo de esforço)
// -----------------------------------------------------------------------------
// Substitui o antigo "Quadrante de Eficiência" (scatter) por algo mais direto
// de ler: para cada prioridade, mostra o tempo de ciclo médio (em dias) e um
// badge colorido indicando o nível médio de esforço.
const PRIORITY_ORDER = ['urgente', 'alta', 'normal', 'baixa']
const PRIORITY_LABEL = { urgente: 'Urgente', alta: 'Alta', normal: 'Normal', baixa: 'Baixa' }

// Limiares de esforço na escala 0-20h usada em effortScore (só baseada em
// "Estimativa de Tempo" agora — ver clickupClient.js)
function effortLevel(avgEffort) {
  if (avgEffort <= 7) return { level: 'baixo', color: 'green' }
  if (avgEffort <= 13) return { level: 'médio', color: 'amber' }
  return { level: 'alto', color: 'red' }
}

export function getEfficiencyByPriority(tickets) {
  const concluded = tickets.filter((t) => t.status === 'concluido')

  const groups = PRIORITY_ORDER.map((priority) => {
    const items = concluded.filter((t) => t.priority === priority)
    if (items.length === 0) return null

    const avgCycleTimeDays = items.reduce((sum, t) => sum + t.cycleTimeHours, 0) / items.length / 24

    return {
      priority,
      label: PRIORITY_LABEL[priority],
      count: items.length,
      avgCycleTimeDays: Number(avgCycleTimeDays.toFixed(1)),
    }
  })

  return groups.filter(Boolean)
}

// -----------------------------------------------------------------------------
// 6. TAREFAS POR RESPONSÁVEL (em aberto x concluídas)
// -----------------------------------------------------------------------------
// "Em aberto" agrupa tudo que ainda não foi encerrado: backlog, pendente,
// em_andamento e bloqueado. Cancelados ficam de fora — não são nem um nem outro.
export function getTasksByResponsible(tickets) {
  const byAssignee = {}

  tickets
    .filter((t) => t.status !== 'cancelado')
    .forEach((t) => {
      if (!byAssignee[t.assignee]) byAssignee[t.assignee] = { open: 0, closed: 0 }
      if (t.status === 'concluido') byAssignee[t.assignee].closed++
      else byAssignee[t.assignee].open++
    })

  return Object.entries(byAssignee)
    .map(([assignee, { open, closed }]) => ({ assignee, open, closed, total: open + closed }))
    .sort((a, b) => b.total - a.total)
}