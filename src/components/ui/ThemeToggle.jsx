import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="flex h-10 w-10 items-center justify-center rounded-xl
                 border border-border-light dark:border-border-dark
                 bg-surface-card dark:bg-surface-dark-card
                 text-gray-600 dark:text-gray-300
                 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-colors"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
