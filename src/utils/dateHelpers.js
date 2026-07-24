import {
  differenceInHours,
  differenceInCalendarDays,
  format,
  isAfter,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday as dfIsToday,
  startOfDay,
  endOfDay,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
export const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function monthLabel(date) {
  return MONTH_LABELS[new Date(date).getMonth()]
}

export function hoursBetween(startISO, endISO) {
  return differenceInHours(new Date(endISO), new Date(startISO))
}

export function daysBetween(startISO, endISO) {
  return differenceInCalendarDays(new Date(endISO), new Date(startISO))
}

export function isOverdue(ticket) {
  const reference = ticket.closedAt ? new Date(ticket.closedAt) : new Date()
  return isAfter(reference, new Date(ticket.slaDeadline))
}

export function formatDatePt(date) {
  return format(new Date(date), "dd 'de' MMMM", { locale: ptBR })
}

// -----------------------------------------------------------------------------
// Matriz de calendário do mês atual — usada no Heatmap de densidade
// -----------------------------------------------------------------------------
// Retorna um array de semanas, cada uma com 7 dias (Dom -> Sáb), incluindo os
// dias de preenchimento do mês anterior/seguinte (marcados com inCurrentMonth: false)
export function getCurrentMonthCalendar(referenceDate = new Date()) {
  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date,
    dayNumber: date.getDate(),
    inCurrentMonth: isSameMonth(date, referenceDate),
    isToday: dfIsToday(date),
  }))

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

// -----------------------------------------------------------------------------
// Agrupamento por mês/trimestre/semestre/ano — usado no heatmap quando o
// filtro de período é "Todos" (a granularidade se ajusta ao intervalo de dados)
// -----------------------------------------------------------------------------
export function monthBucketLabel(date) {
  return `${MONTH_LABELS[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`
}

export function quarterBucketLabel(date) {
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `T${quarter} ${date.getFullYear()}`
}

export function semesterBucketLabel(date) {
  const semester = date.getMonth() < 6 ? 1 : 2
  return `S${semester} ${date.getFullYear()}`
}

export function yearBucketLabel(date) {
  return `${date.getFullYear()}`
}

// Decide a granularidade ideal com base em quantos meses os dados cobrem
export function pickGranularity(monthsSpan) {
  if (monthsSpan <= 3) return 'month'
  if (monthsSpan <= 12) return 'quarter'
  if (monthsSpan <= 36) return 'semester'
  return 'year'
}

export function bucketLabelFor(date, granularity) {
  if (granularity === 'month') return monthBucketLabel(date)
  if (granularity === 'quarter') return quarterBucketLabel(date)
  if (granularity === 'semester') return semesterBucketLabel(date)
  return yearBucketLabel(date)
}

// Chave de ordenação (garante ordem cronológica correta entre os buckets)
export function bucketSortKeyFor(date, granularity) {
  if (granularity === 'month') return date.getFullYear() * 12 + date.getMonth()
  if (granularity === 'quarter') return date.getFullYear() * 4 + Math.floor(date.getMonth() / 3)
  if (granularity === 'semester') return date.getFullYear() * 2 + (date.getMonth() < 6 ? 0 : 1)
  return date.getFullYear()
}

// -----------------------------------------------------------------------------
// Intervalo de datas a partir do filtro de período selecionado na sidebar
// -----------------------------------------------------------------------------
export function getPeriodRange(filters) {
  const now = new Date()

  switch (filters.period) {
    case 'all':
      return { start: null, end: null }
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'this_week':
      return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfDay(now) }
    case 'last_30_days':
      return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) }
    case 'custom':
      return {
        start: filters.startDate ? startOfDay(new Date(filters.startDate)) : null,
        end: filters.endDate ? endOfDay(new Date(filters.endDate)) : null,
      }
    case 'this_month':
    default:
      return { start: startOfMonth(now), end: endOfDay(now) }
  }
}
