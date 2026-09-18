import { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Target,
  TimerOff,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { KpiCard } from "./components/cards/KpiCard";
import { TicketsEvolutionChart } from "./components/charts/TicketsEvolutionChart";
import { OpeningDensityHeatmap } from "./components/charts/OpeningDensityHeatmap";
import { DemandByAreaChart } from "./components/charts/DemandByAreaChart";
import { EfficiencyByPriorityTable } from "./components/charts/EfficiencyByPriorityTable";
import { TasksByResponsibleChart } from "./components/charts/TasksByResponsibleChart";
import { KanbanBoard } from "./components/tickets/KanbanBoard";
import { ExecutionGrid } from "./components/tickets/ExecutionGrid";
import { getTickets, getDashboardData } from "./services/ticketService";
import { filterTickets } from "./utils/metrics";
import { DEFAULT_FILTERS } from "./components/layout/FiltersPanel";

export default function App() {
  const [allTickets, setAllTickets] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") navigate("/dashboard", { replace: true });
  }, [location.pathname, navigate]);

  const activePage =
    location.pathname === "/tickets"
      ? "tickets"
      : location.pathname === "/execucao"
        ? "execucao"
        : "dashboard";

  const PAGE_PATHS = { tickets: "/tickets", execucao: "/execucao", dashboard: "/dashboard" };
  const handleNavigate = (page) => navigate(PAGE_PATHS[page] || "/dashboard");

  const refreshTickets = () => {
    getTickets()
      .then(setAllTickets)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  // Modo apresentação: a cada 2 minutos, busca os tickets de novo no ClickUp
  // e avança pra próxima aba (Dashboard -> Tickets -> Em Execução -> ...).
  // O timer reinicia sempre que a rota muda — inclusive por navegação manual,
  // então clicar numa aba também "reseta o relógio" a partir de onde parou.
  // secondsLeft conta 1 em 1 segundo só pra alimentar o timer visual no Topbar.
  const ROTATION_PAGES = ["dashboard", "tickets", "execucao"];
  const ROTATION_SECONDS = 2 * 60; // 2 minutos

  const [secondsLeft, setSecondsLeft] = useState(ROTATION_SECONDS);

  useEffect(() => {
    setSecondsLeft(ROTATION_SECONDS);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          refreshTickets();
          const currentIndex = ROTATION_PAGES.indexOf(activePage);
          const nextPage = ROTATION_PAGES[(currentIndex + 1) % ROTATION_PAGES.length];
          navigate(PAGE_PATHS[nextPage]);
          return ROTATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

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

  // Kanban ignora o filtro de PERÍODO, pelo mesmo motivo do gráfico "Tarefas
  // por Responsável": mostra o status atual dos tickets, não faz sentido
  // limitar por quando foram criados. Ainda respeita Responsável/Categoria.
  const kanbanTickets = useMemo(() => {
    if (!allTickets) return [];
    return filterTickets(allTickets, { ...filters, period: "all" });
  }, [allTickets, filters]);

  // Aba "Em Execução" -> mesmo recorte do Kanban, só que restrito ao status
  // em_andamento
  const executionTickets = useMemo(
    () => kanbanTickets.filter((t) => t.displayStatus === "em_andamento"),
    [kanbanTickets],
  );

  const layoutProps = {
    filters,
    onFiltersChange: setFilters,
    assignees,
    categories,
    activePage,
    onNavigate: handleNavigate,
    secondsLeft,
  };

  if (error) {
    return (
      <Layout {...layoutProps}>
        <p className="text-sm text-brand-red">
          Não foi possível carregar os tickets do ClickUp: {error}
        </p>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout {...layoutProps}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Carregando dashboard...
        </p>
      </Layout>
    );
  }

  if (activePage === "tickets") {
    return (
      <Layout {...layoutProps}>
        <KanbanBoard tickets={kanbanTickets} />
      </Layout>
    );
  }

  if (activePage === "execucao") {
    return (
      <Layout {...layoutProps}>
        <ExecutionGrid tickets={executionTickets} />
      </Layout>
    );
  }

  const { kpis, evolution, density, demand, efficiency, tasksByResponsible } =
    data;

  return (
    <Layout {...layoutProps}>
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