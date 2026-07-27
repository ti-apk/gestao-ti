import axios from 'axios'

// -----------------------------------------------------------------------------
// CLICKUP CLIENT
// -----------------------------------------------------------------------------
// Mapeamento ajustado à estrutura real da lista do usuário:
// Título, Status (Backlog/Pendente/Em Execução/Aguardando Interno/Aguardando
// Externo/Cancelado/Concluído), Responsáveis, Data de Abertura (start_date),
// Data de Vencimento (due_date), Prioridade, Estimativa de Tempo (time_estimate),
// Rastrear Tempo (time_spent), Etiquetas (tags). Não usa Custom Fields.
//
// ATENÇÃO / SEGURANÇA: app front-end puro (Vite) -> o token fica no bundle do
// navegador. OK para uso pessoal/interno; se for expor publicamente, mova para
// um backend/proxy que guarde o token no servidor.
// -----------------------------------------------------------------------------

const API_BASE = 'https://api.clickup.com/api/v2'
const TOKEN = import.meta.env.VITE_CLICKUP_API_TOKEN
const LIST_ID = import.meta.env.VITE_CLICKUP_LIST_ID

const client = axios.create({
  baseURL: API_BASE,
  headers: { Authorization: TOKEN },
})

// Busca TODAS as tasks da lista, paginando automaticamente (ClickUp devolve no máx. 100 por página)
export async function fetchClickUpTasks() {
  if (!TOKEN || !LIST_ID) {
    throw new Error('VITE_CLICKUP_API_TOKEN ou VITE_CLICKUP_LIST_ID não configurados no .env')
  }

  let page = 0
  let lastPage = false
  const allTasks = []

  while (!lastPage) {
    const { data } = await client.get(`/list/${LIST_ID}/task`, {
      params: {
        page,
        archived: false,
        subtasks: true,
        include_closed: true, // necessário para trazer os tickets "Concluído"/"Cancelado"
      },
    })

    allTasks.push(...data.tasks)
    lastPage = data.last_page
    page++
  }

  return allTasks
}

// -----------------------------------------------------------------------------
// Mapeamento: task do ClickUp -> formato normalizado "Ticket"
// -----------------------------------------------------------------------------

// Normaliza "Em Execução" -> "em execucao" para casar com o texto vindo da API
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Mapa exato dos status configurados na lista do usuário.
// Mais granular que antes: "bloqueado" (aguardando) e "cancelado" agora são
// distintos de "em_andamento" e "concluido", porque os indicadores precisam
// tratá-los de forma diferente (ver metrics.js).
const STATUS_MAP = {
  backlog: 'backlog',
  pendente: 'pendente',
  'em execucao': 'em_andamento',
  'aguardando interno': 'bloqueado',
  'aguardando externo': 'bloqueado',
  cancelado: 'cancelado',
  concluido: 'concluido',
}

function mapStatus(status) {
  const key = normalize(status?.status)
  if (STATUS_MAP[key]) return STATUS_MAP[key]
  // fallback pelo "type" que o ClickUp classifica automaticamente
  if (status?.type === 'closed' || status?.type === 'done') return 'concluido'
  if (status?.type === 'open') return 'pendente'
  return 'em_andamento'
}

function mapPriority(clickUpPriority) {
  switch (clickUpPriority) {
    case 'urgent':
      return 'urgente'
    case 'high':
      return 'alta'
    case 'low':
      return 'baixa'
    default:
      return 'normal' // cobre "normal" e tasks sem prioridade definida
  }
}

export function mapClickUpTaskToTicket(task) {
  // "Data de Abertura" = start_date; se a task não tiver, cai para date_created
  const createdAtMs = Number(task.start_date || task.date_created)
  const createdAt = new Date(createdAtMs)

  const priority = mapPriority(task.priority?.priority)
  const status = mapStatus(task.status)

  // Quando finalizado, o ClickUp normalmente preenche date_closed/date_done.
  // Se o status "Concluído/Cancelado" não estiver configurado como tipo
  // closed/done no espaço do ClickUp, usamos date_updated como aproximação.
  const isFinished = status === 'concluido' || status === 'cancelado'
  const closedRaw = task.date_closed || task.date_done || (isFinished ? task.date_updated : null)
  const closedAt = closedRaw ? new Date(Number(closedRaw)) : null

  const cycleTimeHours = closedAt
    ? Math.max(0, Math.round((closedAt.getTime() - createdAt.getTime()) / 3600000))
    : 0

  // Categoria -> primeira Etiqueta (tag) da task; sem etiqueta, usa "Geral"
  // (antes caía no nome da Lista, o que fazia tickets sem etiqueta aparecerem
  // com o nome da lista do ClickUp em vez de uma categoria genérica)
  const category = task.tags?.[0]?.name
    ? task.tags[0].name.charAt(0).toUpperCase() + task.tags[0].name.slice(1)
    : 'Sem Etiqueta'

  return {
    id: task.id,
    title: task.name,
    category,
    status,
    priority,
    assignee: task.assignees?.[0]?.username || task.assignees?.[0]?.email || 'Não atribuído',
    createdAt: createdAt.toISOString(),
    closedAt: closedAt ? closedAt.toISOString() : null,
    cycleTimeHours,
  }
}