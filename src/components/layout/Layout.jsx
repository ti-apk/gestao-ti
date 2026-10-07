import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileTabBar } from "./MobileTabBar";

export function Layout({
  children,
  filters,
  onFiltersChange,
  assignees,
  categories,
  activePage,
  onNavigate,
  secondsLeft,
}) {
  return (
    // Mobile/tablet: página normal, com scroll vertical — cada card tem sua
    // própria altura (definida no componente) em vez de "disputar" espaço
    // dentro de uma viewport fixa. A partir de lg, volta a ser o painel
    // "trava na tela" original (h-screen + overflow-hidden), já que no
    // desktop tudo precisa caber numa tela só, sem rolagem.
    <div className="flex min-h-screen flex-col gap-3 bg-surface-light p-3 dark:bg-surface-dark lg:h-screen lg:gap-4 lg:overflow-hidden lg:p-4">
      <Topbar secondsLeft={secondsLeft} />

      {/* Moldura única contendo sidebar + conteúdo (dá a sensação de área separada do header) */}
      <div className="app-frame flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
        <Sidebar
          filters={filters}
          onFiltersChange={onFiltersChange}
          assignees={assignees}
          categories={categories}
          activePage={activePage}
          onNavigate={onNavigate}
        />
        <main className="flex flex-col gap-3 p-3 pb-24 lg:min-h-0 lg:flex-1 lg:gap-4 lg:overflow-hidden lg:p-4 lg:pb-4">
          {children}
        </main>
      </div>

      <MobileTabBar activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
}
