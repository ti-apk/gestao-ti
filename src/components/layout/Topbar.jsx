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
    <header className="panel relative flex shrink-0 items-center justify-between px-4 py-3 lg:px-5">
      <div className="min-w-0">
        <h1 className="truncate font-display text-base font-bold lg:text-xl">Gestão T.I</h1>
        {/* Subtítulo só no desktop — no mobile o espaço é mais valioso pra
            caber logo + tudo sem quebrar linha */}
        <p className="hidden text-xs text-gray-500 dark:text-gray-400 lg:block">
          Gestão de Tickets - Business Intelligence
        </p>
      </div>

      {/* Timer de apresentação: só aparece a partir do lg. No mobile o modo
          apresentação não é o caso de uso principal e o espaço do header é
          curto — prioriza o título + logo. */}
      {secondsLeft != null && (
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 lg:flex">
          <Clock size={14} />
          <span className="tabular-nums">{formatCountdown(secondsLeft)}</span>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-3 lg:gap-4">
        <img
          src={theme === 'dark' ? logoWhite : logoRed}
          alt="APK"
          className="h-6 w-auto lg:h-7"
        />
        {/* O toggle de tema some no mobile porque já existe na tab bar do
            rodapé — evitar duplicar o controle na tela */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
