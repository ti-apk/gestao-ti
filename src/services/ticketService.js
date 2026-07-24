import { fetchClickUpTasks, mapClickUpTaskToTicket } from './clickupClient'
import {
  getKpiSummary,
  getTicketsEvolution,
  getFinalizedDensityCalendar,
  getFinalizedDensityAggregate,
  getDemandByArea,
  getEfficiencyQuadrant,
  getSlaByResponsible,
  filterTickets,
} from '../utils/metrics'

// Busca as tasks reais do ClickUp e converte para o formato normalizado "Ticket"
export async function getTickets() {
  const rawTasks = await fetchClickUpTasks()
  return rawTasks.map(mapClickUpTaskToTicket)
}

// Monta todos os dados do dashboard já filtrados pelo painel de Filtros da sidebar
// (síncrona de propósito: os tickets já foram buscados antes, em getTickets())
export function getDashboardData(allTickets, filters) {
  const tickets = filterTickets(allTickets, filters)

  // Período "Todos" -> heatmap vira uma faixa agregada (mês/trimestre/semestre/ano).
  // Qualquer outro período -> calendário do mês atual, dia a dia.
  const density =
    filters.period === 'all'
      ? { mode: 'aggregate', ...getFinalizedDensityAggregate(tickets) }
      : { mode: 'calendar', weeks: getFinalizedDensityCalendar(tickets) }

  return {
    kpis: getKpiSummary(tickets),
    evolution: getTicketsEvolution(tickets, filters),
    density,
    demand: getDemandByArea(tickets),
    quadrant: getEfficiencyQuadrant(tickets),
    sla: getSlaByResponsible(tickets),
  }
}
