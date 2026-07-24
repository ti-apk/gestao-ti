import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  hoursBetween,
  daysBetween,
  isOverdue,
  getCurrentMonthCalendar,
  getPeriodRange,
  pickGranularity,
  bucketLabelFor,
  bucketSortKeyFor,
} from './dateHelpers'
import { isWithinInterval, isSameDay, startOfDay, subDays, addDays, differenceInCalendarDays } from 'date-fns'

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
export function getKpiSummary(tickets) {
  const total = tickets.length
  const closed = tickets.filter((t) => t.closedAt)

  const avgLeadTimeDays =
    closed.length === 0
      ? 0
      : closed.reduce((sum, t) => sum + daysBetween(t.createdAt, t.closedAt), 0) / closed.length

  const withinSla = closed.filter((t) => !isOverdue(t)).length
  const slaRate = closed.length === 0 ? 0 : (withinSla / closed.length) * 100

  const urgentCount = tickets.filter((t) => t.priority === 'urgente').length

  // Tempo MÉDIO dedicado por ticket (não mais a soma total)
  const avgMinutes =
    closed.length === 0
      ? 0
      : closed.reduce((sum, t) => sum + hoursBetween(t.createdAt, t.closedAt) * 60, 0) / closed.length
  const avgHours = Math.floor(avgMinutes / 60)
  const avgRemainingMinutes = Math.round(avgMinutes % 60)

  const overdueCount = tickets.filter(isOverdue).length

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
    const finalizados = tickets.filter((t) => t.closedAt && isSameDay(new Date(t.closedAt), day)).length
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
  tickets.forEach((t) => t.closedAt && bump(t.closedAt, 'finalizados'))

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
      (t) => t.closedAt && new Date(t.closedAt).getMonth() === monthIndex
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
      const count = tickets.filter((t) => t.closedAt && isSameDay(new Date(t.closedAt), day.date)).length
      return { ...day, count }
    })
  )
}

// Variante usada quando o filtro de período é "Todos": em vez de um calendário
// de um único mês, agrupa os finalizados em mês/trimestre/semestre/ano — a
// granularidade se ajusta automaticamente ao intervalo de datas dos tickets
export function getFinalizedDensityAggregate(tickets) {
  const closedDates = tickets.filter((t) => t.closedAt).map((t) => new Date(t.closedAt))
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
  tickets.forEach((t) => {
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
// 5. QUADRANTE DE EFICIÊNCIA (Scatter: esforço x tempo de ciclo)
// -----------------------------------------------------------------------------
export function getEfficiencyQuadrant(tickets, { effortMid = 10, cycleMid = 20 } = {}) {
  return tickets
    .filter((t) => t.closedAt)
    .slice(0, 12)
    .map((t) => {
      const cycleTimeDisplay = t.cycleTimeHours / 3
      const fast = t.effortScore <= effortMid
      const slow = cycleTimeDisplay > cycleMid
      let quadrant = 'rapido_baixo_esforco'
      if (fast && slow) quadrant = 'esforco_x_ciclo'
      else if (!fast && slow) quadrant = 'lento_alto_esforco'
      else if (!fast && !slow) quadrant = 'lento_baixo_esforco'

      return {
        id: t.id,
        effort: t.effortScore,
        cycleTime: Number(cycleTimeDisplay.toFixed(1)),
        quadrant,
      }
    })
}

// -----------------------------------------------------------------------------
// 6. SLA POR RESPONSÁVEL (barras empilhadas: % dentro x fora do prazo)
// -----------------------------------------------------------------------------
export function getSlaByResponsible(tickets) {
  const byAssignee = {}
  tickets
    .filter((t) => t.closedAt)
    .forEach((t) => {
      if (!byAssignee[t.assignee]) byAssignee[t.assignee] = { total: 0, withinSla: 0 }
      byAssignee[t.assignee].total++
      if (!isOverdue(t)) byAssignee[t.assignee].withinSla++
    })

  return Object.entries(byAssignee).map(([assignee, { total, withinSla }]) => {
    const withinPct = total === 0 ? 0 : Math.round((withinSla / total) * 100)
    return { assignee, withinPct, outOfPct: 100 - withinPct }
  })
}
