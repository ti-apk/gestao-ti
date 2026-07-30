import { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Target,
  TimerOff,
} from "lucide-react";

import { Layout } from "./components/layout/Layout";
import { KpiCard } from "./components/cards/KpiCard";
import { TicketsEvolutionChart } from "./components/charts/TicketsEvolutionChart";
import { OpeningDensityHeatmap } from "./components/charts/OpeningDensityHeatmap";
import { DemandByAreaChart } from "./components/charts/DemandByAreaChart";
import { EfficiencyByPriorityTable } from "./components/charts/EfficiencyByPriorityTable";
import { TasksByResponsibleChart } from "./components/charts/TasksByResponsibleChart";
import { getTickets, getDashboardData } from "./services/ticketService";
import { DEFAULT_FILTERS } from "./components/layout/FiltersPanel";

export default function App() {
  const [allTickets, setAllTickets] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    getTickets()
      .then(setAllTickets)
      .catch((err) => setError(err.message));
  }, []);

  const assignees = useMemo(
    () =>
      allTickets ? [...new Set(allTickets.map((t) => t.assignee))].sort() : [],
    [allTickets],
  );

  const categories = useMemo(
    () =>
      allTickets
        ? [...new Set(allTickets.map((t) => t.category).filter(Boolean))].sort()
        : [],
    [allTickets],
  );

  const data = useMemo(() => {
    if (!allTickets) return null;
    return getDashboardData(allTickets, filters);
  }, [allTickets, filters]);

  if (error) {
    return (
      <Layout
        filters={filters}
        onFiltersChange={setFilters}
        assignees={assignees}
        categories={categories}
      >
        <p className="text-sm text-brand-red">
          Não foi possível carregar os tickets do ClickUp: {error}
        </p>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout
        filters={filters}
        onFiltersChange={setFilters}
        assignees={assignees}
        categories={categories}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Carregando dashboard...
        </p>
      </Layout>
    );
  }

  const { kpis, evolution, density, demand, efficiency, tasksByResponsible } =
    data;

  return (
    <Layout
      filters={filters}
      onFiltersChange={setFilters}
      assignees={assignees}
      categories={categories}
    >
      {/* Linha 1 — 6 KPI cards */}
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={Ticket}
          label="Total de Tickets"
          value={kpis.totalTickets}
          sublabel="no período"
          color="blue"
        />
        <KpiCard
          icon={Clock}
          label="Lead Time Médio"
          value={`${kpis.avgLeadTimeDays}d`}
          sublabel="média de resolução"
          color="green"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Taxa de SLA"
          value={`${kpis.slaRate}%`}
          sublabel="dentro da previsão"
          color="amber"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Urgente(s)"
          value={kpis.urgentCount}
          sublabel="impacta(m) operação"
          color="red"
        />
        <KpiCard
          icon={Target}
          label="Tempo Médio"
          value={kpis.avgTime}
          sublabel="média por ticket"
          color="gray"
        />
        <KpiCard
          icon={TimerOff}
          label="Prazo Estendido"
          value={kpis.overdueCount}
          sublabel="além do estimado"
          color="orange"
        />
      </div>

      {/* Linha 2 — Evolução + Heatmap (preenchem o espaço disponível) */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <TicketsEvolutionChart data={evolution} />
        <OpeningDensityHeatmap density={density} />
      </div>

      {/* Linha 3 — Demanda + Eficiência + Tarefas por Responsável */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <DemandByAreaChart data={demand} />
        <EfficiencyByPriorityTable data={efficiency} />
        <TasksByResponsibleChart data={tasksByResponsible} />
      </div>
    </Layout>
  );
}
