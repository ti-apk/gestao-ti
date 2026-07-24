import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Layout({ children, filters, onFiltersChange, assignees, categories }) {
  return (
    <div className="flex h-screen flex-col gap-3 overflow-hidden bg-surface-light p-3 dark:bg-surface-dark lg:gap-4 lg:p-4">
      <Topbar />

      {/* Moldura única contendo sidebar + conteúdo (dá a sensação de área separada do header) */}
      <div className="app-frame flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          filters={filters}
          onFiltersChange={onFiltersChange}
          assignees={assignees}
          categories={categories}
        />
        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 lg:gap-4 lg:p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
