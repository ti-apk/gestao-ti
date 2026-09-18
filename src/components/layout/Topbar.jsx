import { Clock } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../ui/ThemeToggle'
import logoRed from '../../../public/images/apk_red_new.svg'
import logoWhite from '../../../public/images/apk_branco_new.svg'

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function Topbar({ secondsLeft }) {
  const { theme } = useTheme()

  return (
    <header className="panel relative flex shrink-0 items-center justify-between px-5 py-3">
      <div>
        <h1 className="font-display text-xl font-bold">Gestão T.I</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Gestão de Tickets - Business Intelligence
        </p>
      </div>

      {secondsLeft != null && (
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <Clock size={14} />
          <span className="tabular-nums">{formatCountdown(secondsLeft)}</span>
        </div>
      )}

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