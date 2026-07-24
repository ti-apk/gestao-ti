// -----------------------------------------------------------------------------
// DADOS MOCKADOS
// -----------------------------------------------------------------------------
// Este arquivo simula o retorno de "getTickets()" que, na próxima etapa,
// vai ser substituído por uma chamada real à API do ClickUp (ver services/clickupClient.js).
// Por isso cada ticket já segue exatamente o formato normalizado descrito no
// PROJECT_INFO.md — nenhum componente vai precisar mudar quando trocarmos a fonte.
// -----------------------------------------------------------------------------

// Gerador pseudo-aleatório com seed fixa (mulberry32) -> os dados ficam
// sempre iguais entre execuções, o que facilita comparar telas e ajustar CSS.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min

const CATEGORIES = [
  { name: 'GR', weight: 32 },
  { name: 'Manifesto', weight: 27 },
  { name: 'CIOT', weight: 21 },
  { name: 'Relatório', weight: 16 },
  { name: 'Geral', weight: 11 },
  { name: 'Outros', weight: 7 },
]

const ASSIGNEES = [
  { name: 'Eduardo', outOfSlaRate: 0.10 },
  { name: 'Cristopher', outOfSlaRate: 0.15 },
  { name: 'Cleberson', outOfSlaRate: 0.05 },
  { name: 'Valdinei', outOfSlaRate: 0.0 },
  { name: 'Clarissa', outOfSlaRate: 0.0 },
]

const PRIORITIES = ['normal', 'normal', 'normal', 'alta', 'urgente']

// Quantidade de tickets CRIADOS por mês (bate com o gráfico de Evolução do mockup)
const CREATED_PER_MONTH = [
  { month: 0, count: 50 }, // Jan
  { month: 1, count: 54 }, // Fev
  { month: 2, count: 61 }, // Mar
  { month: 3, count: 58 }, // Abr
  { month: 4, count: 61 }, // Mai
  { month: 5, count: 57 }, // Jun
  { month: 6, count: 68 }, // Jul
]

// Expande a lista de categorias em um array "achatado" respeitando o peso de cada uma
const weightedCategories = CATEGORIES.flatMap((c) => Array(c.weight).fill(c.name))

const YEAR = 2026

function randomDateInMonth(month) {
  const day = randInt(1, 28)
  const hour = randInt(8, 18)
  const minute = randInt(0, 59)
  return new Date(YEAR, month, day, hour, minute)
}

function buildTicket(id, month) {
  const category = pick(weightedCategories)
  const assignee = pick(ASSIGNEES)
  const priority = pick(PRIORITIES)
  const createdAt = randomDateInMonth(month)

  // SLA combinado com o prazo esperado por prioridade (em horas)
  const slaHours = priority === 'urgente' ? 8 : priority === 'alta' ? 24 : 72
  const slaDeadline = new Date(createdAt.getTime() + slaHours * 3600 * 1000)

  // ~78% dos tickets já estão finalizados (para alimentar "Finalizados" no gráfico)
  const isClosed = rand() < 0.78
  const cycleTimeHours = randInt(2, 96)
  const closedAt = isClosed
    ? new Date(createdAt.getTime() + cycleTimeHours * 3600 * 1000)
    : null

  // Define se ficou fora do prazo, respeitando a taxa de cada responsável
  const wentOverSla = rand() < assignee.outOfSlaRate
  const finalClosedAt = isClosed && wentOverSla
    ? new Date(slaDeadline.getTime() + randInt(1, 48) * 3600 * 1000)
    : closedAt

  return {
    id: `TCK-${String(id).padStart(4, '0')}`,
    title: `Chamado de ${category} #${id}`,
    category,
    status: isClosed ? 'finalizado' : rand() < 0.5 ? 'em_andamento' : 'aberto',
    priority,
    assignee: assignee.name,
    createdAt: createdAt.toISOString(),
    closedAt: finalClosedAt ? finalClosedAt.toISOString() : null,
    slaDeadline: slaDeadline.toISOString(),
    // effortScore (eixo X) e cycleTimeHours (eixo Y) alimentam o Quadrante de Eficiência
    effortScore: randInt(1, 19),
    cycleTimeHours,
  }
}

function generateMockTickets() {
  let id = 1
  const tickets = []
  for (const { month, count } of CREATED_PER_MONTH) {
    for (let i = 0; i < count; i++) {
      tickets.push(buildTicket(id, month))
      id++
    }
  }
  return tickets
}

export const mockTickets = generateMockTickets()
