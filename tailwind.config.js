/** @type {import('tailwindcss').Config} */
export default {
  // "class" = o dark mode é ativado manualmente (via classe "dark" na <html>),
  // e não pelo tema do sistema operacional. É isso que o ThemeContext controla.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cores de apoio (fundo, cartões, bordas) — separadas por tema
        surface: {
          light: '#F7F5F0',
          card: '#FFFFFF',
          dark: '#1A1B1E',
          'dark-card': '#242529',
        },
        border: {
          light: '#E9E6DD',
          dark: '#33343A',
        },
        // Cores de destaque (usadas nos cards, gráficos e badges)
        brand: {
          blue: '#2E7DF7',
          green: '#1FA37C',
          amber: '#F5A623',
          orange: '#ff6918',
          red: '#ff4639',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      fontFamily: {
        // Inter = texto padrão (corpo, labels, valores auxiliares)
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Sora = títulos: "Gestão T.I", nav do menu, título/valor dos cards, título dos gráficos
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
