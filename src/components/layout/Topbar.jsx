import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../ui/ThemeToggle'
import logoRed from '../../../public/images/apk_red_new.svg'
import logoWhite from '../../../public/images/apk_branco_new.svg'

export function Topbar() {
  const { theme } = useTheme()

  return (
    <header className="panel flex shrink-0 items-center justify-between px-5 py-3">
      <div>
        <h1 className="font-display text-xl font-bold">Gestão T.I</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Gestão de Tickets - Business Intelligence
        </p>
      </div>

      <div className="flex items-center gap-4">
        <img
          src={theme === 'dark' ? logoWhite : logoRed}
          alt="APK"
          className="h-7 w-auto"
        />
        <ThemeToggle />
      </div>
    </header>
  )
}
