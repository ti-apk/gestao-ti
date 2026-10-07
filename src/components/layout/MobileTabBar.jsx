import { LayoutDashboard, ListChecks, Zap, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tickets", label: "Tickets", icon: ListChecks },
  { key: "execucao", label: "Execução", icon: Zap },
];

// Barra de navegação fixa no rodapé — só existe no mobile/tablet (escondida
// a partir do breakpoint lg, onde a Sidebar assume a navegação). Reúne as 3
// abas + o toggle de tema, porque no mobile o Topbar não tem espaço pra
// acomodar tudo que cabia no desktop.
export function MobileTabBar({ activePage, onNavigate }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border-light bg-surface-card pb-[env(safe-area-inset-bottom)] dark:border-border-dark dark:bg-surface-dark-card lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const isActive = key === activePage;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
              isActive
                ? "text-brand-blue"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </button>
        );
      })}

      <button
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-gray-400 dark:text-gray-500"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        Tema
      </button>
    </nav>
  );
}
