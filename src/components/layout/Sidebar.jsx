import { useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  Zap,
  SlidersHorizontal,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { FiltersPanel } from "./FiltersPanel";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tickets", label: "Tickets", icon: ListChecks },
  { key: "execucao", label: "Em Execução", icon: Zap },
];

export function Sidebar({
  filters,
  onFiltersChange,
  assignees,
  categories,
  activePage,
  onNavigate,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden border-r border-border-light bg-surface-card py-4 transition-all duration-200 dark:border-border-dark dark:bg-surface-dark-card ${collapsed ? "w-16" : "w-56"
        }`}
    >
      <div className={`flex px-3 ${collapsed ? "justify-center" : "justify-end"}`}>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = key === activePage;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl py-3 text-left font-display text-sm font-semibold transition-colors
                ${collapsed ? "justify-center px-0" : "px-4"}
                ${isActive
                  ? "bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* Recolhida: os Filtros somem inteiros (largura não comporta os selects
          e a seleção não faria sentido sem ver o valor escolhido) */}
      {!collapsed && (
        <>
          <div className="border-t border-border-light dark:border-border-dark" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 font-display text-sm font-semibold text-gray-500 dark:text-gray-400">
              <SlidersHorizontal size={16} />
              Filtros
            </div>
            <FiltersPanel
              filters={filters}
              onChange={onFiltersChange}
              assignees={assignees}
              categories={categories}
              showPeriod={activePage === 'dashboard'}
            />
          </div>
        </>
      )}
    </aside>
  );
}