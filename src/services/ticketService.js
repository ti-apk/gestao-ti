import { fetchClickUpTasks, mapClickUpTaskToTicket } from './clickupClient'
import {
  getKpiSummary,
  getTicketsEvolution,
  getFinalizedDensityCalendar,
  getFinalizedDensityAggregate,
  getDemandByArea,
  getEfficiencyByPriority,
  getSlaByResponsible,
  getSlaTargets,
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

  // A meta de SLA é calculada sempre sobre o histórico COMPLETO (allTickets),
  // não sobre o recorte filtrado — senão a meta mudaria toda vez que alguém
  // trocasse o filtro de período, o que não faz sentido pra uma referência
  const slaTargets = getSlaTargets(allTickets)

  // Período "Todos" -> heatmap vira uma faixa agregada (mês/trimestre/semestre/ano).
  // Qualquer outro período -> calendário do mês atual, dia a dia.
  const density =
    filters.period === 'all'
      ? { mode: 'aggregate', ...getFinalizedDensityAggregate(tickets) }
      : { mode: 'calendar', weeks: getFinalizedDensityCalendar(tickets) }

  const efficiencyTickets = filterTickets(allTickets,  { ...filters, period: 'all' })

  return {
    kpis: getKpiSummary(tickets, slaTargets),
    evolution: getTicketsEvolution(tickets, filters),
    density,
    demand: getDemandByArea(tickets),
    efficiency: getEfficiencyByPriority(efficiencyTickets),
    sla: getSlaByResponsible(tickets, slaTargets),
    slaTargets,
  }
}