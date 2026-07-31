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
        subtasks: false, // subtarefas não são tratadas como tickets próprios no BI
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

const DISPLAY_STATUS_MAP = {
  backlog: 'backlog',
  pendente: 'pendente',
  'em execucao': 'em_andamento',
  'aguardando interno': 'aguardando_interno',
  'aguardando externo': 'aguardando_externo',
  cancelado: 'cancelado',
  concluido: 'concluido',
}

function mapDisplayStatus(status) {
  return DISPLAY_STATUS_MAP[normalize(status?.status)] || null
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

  // Categoria -> primeira Etiqueta (tag) da task. Sem etiqueta, category fica
  // null — esses tickets são excluídos do gráfico "Áreas com maior demanda"
  // (ver getDemandByArea em metrics.js), em vez de caírem num "Geral" genérico.
  const category = task.tags?.[0]?.name
    ? task.tags[0].name.charAt(0).toUpperCase() + task.tags[0].name.slice(1)
    : null

  const firstAssignee = task.assignees?.[0]
  const assigneeName = firstAssignee?.username || firstAssignee?.email || 'Não atribuído'

  return {
    id: task.id,
    title: task.name,
    category,
    status,
    displayStatus: mapDisplayStatus(task.status),
    priority,
    assignee: assigneeName,
    assigneePhoto: firstAssignee?.profilePicture || null, // pode ser null se a pessoa não tem foto no ClickUp
    assigneeInitials: firstAssignee?.initials || assigneeName.slice(0, 2).toUpperCase(),
    createdAt: createdAt.toISOString(),
    closedAt: closedAt ? closedAt.toISOString() : null,
    cycleTimeHours,
  }
}