import { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // 1. tenta ler o tema salvo; 2. senão, respeita a preferência do SO; 3. senão, light
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('gestao-ti-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Toda vez que o tema muda, aplica/remove a classe "dark" na <html>
  // (é essa classe que o Tailwind usa, já que definimos darkMode: 'class')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('gestao-ti-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
