# Gestão T.I — Dashboard de BI (Tickets)

## 1. Visão geral
Painel de Business Intelligence para controle de chamados/tickets abertos por uma
equipe de T.I., com suporte a light/dark mode. A fonte de dados inicial é mockada,
com arquitetura já preparada para consumir a **API pública do ClickUp** em uma
próxima etapa, sem necessidade de reescrever os componentes visuais.

## 2. Stack técnica

| Camada        | Tecnologia         | Motivo                                                            |
|---------------|--------------------|--------------------------------------------------------------------|
| Framework     | React + Vite       | HMR rápido, componentização, ampla compatibilidade com libs de gráfico |
| Estilização   | Tailwind CSS       | Dark mode nativo (`dark:` classes), fácil replicar design de referência |
| Gráficos      | Recharts           | Cobre LineChart, BarChart, BarChart empilhado e ScatterChart       |
| Heatmap       | Componente próprio | Matriz de células coloridas via CSS Grid + Tailwind (não é gráfico tradicional) |
| Ícones        | lucide-react       | Estilo consistente com os ícones do mockup                         |
| Datas         | date-fns           | Cálculo de Lead Time, SLA, agrupamento por dia/semana               |
| HTTP (futuro) | axios              | Consumo da API do ClickUp                                          |

## 3. Mapeamento gráfico → biblioteca

- **Evolução de Tickets** (linha, criados x finalizados) → Recharts `LineChart`
- **Densidade de Aberturas** (heatmap diário) → Grid customizado (Tailwind)
- **Áreas com Maior Demanda** (barras horizontais) → Recharts `BarChart`
- **Quadrante de Eficiência** (esforço x tempo de ciclo) → Recharts `ScatterChart`
  + `ReferenceLine`/`ReferenceArea` para os 4 quadrantes
- **SLA por Responsável** (barras empilhadas) → Recharts `BarChart` (stackId) horizontal

## 4. Cards principais (KPIs)
- Total de Tickets
- Lead Time Médio
- Taxa de SLA
- Urgente(s)
- Tempo Total
- Fora do Prazo

Todos calculados em `src/utils/metrics.js` a partir da lista normalizada de tickets.

## 5. Estrutura de pastas

```
gestao-ti-bi/
├── public/
│   └── logo-apk.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── cards/
│   │   │   └── KpiCard.jsx
│   │   ├── charts/
│   │   │   ├── TicketsEvolutionChart.jsx
│   │   │   ├── OpeningDensityHeatmap.jsx
│   │   │   ├── DemandByAreaChart.jsx
│   │   │   ├── EfficiencyQuadrantChart.jsx
│   │   │   └── SlaByResponsibleChart.jsx
│   │   └── ui/
│   │       ├── ThemeToggle.jsx
│   │       └── Badge.jsx
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── data/
│   │   └── mockTickets.js
│   ├── services/
│   │   ├── ticketService.js     # camada de abstração de dados
│   │   └── clickupClient.js     # stub — implementado na próxima etapa
│   ├── utils/
│   │   ├── metrics.js
│   │   └── dateHelpers.js
│   └── hooks/
│       └── useTheme.js
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── PROJECT_INFO.md
```

**Princípio de arquitetura:** componentes de gráfico/card NUNCA acessam a API
diretamente. Eles consomem dados já normalizados vindos de `ticketService.js`.
Trocar a fonte de dados (mock → ClickUp) significa alterar apenas esse arquivo.

## 6. Modelo de dados normalizado (Ticket)

Formato que qualquer fonte de dados deve entregar aos componentes:

```js
{
  id: string,
  title: string,
  category: string,                 // -> Áreas com maior demanda
  status: "aberto" | "em_andamento" | "finalizado",
  priority: "normal" | "alta" | "urgente",  // -> card Urgente(s)
  assignee: string,                 // -> SLA por Responsável
  createdAt: string,                // ISO date -> Evolução de tickets / Heatmap
  closedAt: string | null,          // ISO date
  slaDeadline: string,              // ISO date -> Taxa de SLA / Fora do prazo
  effortScore: number,              // -> eixo X do Quadrante de Eficiência
  cycleTimeHours: number,           // -> eixo Y do Quadrante / Tempo Total
}
```

Esse formato já foi pensado para mapear diretamente campos padrão e customizados
do ClickUp (task, status, assignees, custom fields, due date, time tracked).

## 7. Instalação

```bash
npm create vite@latest gestao-ti-bi -- --template react
cd gestao-ti-bi
npm install recharts lucide-react date-fns axios clsx
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 8. Paleta de cores (referência do mockup)

### Light mode
- Fundo geral: `#F5F6F8`
- Cards: `#FFFFFF`
- Texto primário: `#1A1A1A`
- Azul (Total/Criados): `#2E7DF7`
- Verde (SLA ok/Finalizados): `#1FA37C`
- Amarelo/laranja (SLA %/Tempo Total): `#F5A623`
- Vermelho (Urgente/Fora do prazo): `#E8483C`

### Dark mode
- Fundo geral: `#1A1B1E`
- Cards: `#242529`
- Texto primário: `#F2F2F2`
- Mesmas cores de destaque (azul, verde, amarelo, vermelho), levemente ajustadas
  para contraste em fundo escuro