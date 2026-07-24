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

// Mapa exato dos status configurados na lista do usuário
const STATUS_MAP = {
  backlog: 'aberto',
  pendente: 'aberto',
  'em execucao': 'em_andamento',
  'aguardando interno': 'em_andamento',
  'aguardando externo': 'em_andamento',
  cancelado: 'finalizado',
  concluido: 'finalizado',
}

function mapStatus(status) {
  const key = normalize(status?.status)
  if (STATUS_MAP[key]) return STATUS_MAP[key]
  // fallback pelo "type" que o ClickUp classifica automaticamente
  if (status?.type === 'closed' || status?.type === 'done') return 'finalizado'
  if (status?.type === 'open') return 'aberto'
  return 'em_andamento'
}

function mapPriority(clickUpPriority) {
  switch (clickUpPriority) {
    case 'urgent':
      return 'urgente'
    case 'high':
      return 'alta'
    default:
      return 'normal' // cobre "normal" e "low"
  }
}

// Prazo padrão quando a task não tem "Data de Vencimento" preenchida
const DEFAULT_SLA_HOURS = { urgente: 8, alta: 24, normal: 72 }

// Hash simples e determinístico, usado só como último fallback (mesma task -> mesmo valor)
function hashToRange(str, min, max) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return min + (hash % (max - min + 1))
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
  const closedRaw = task.date_closed || task.date_done || (status === 'finalizado' ? task.date_updated : null)
  const closedAt = closedRaw ? new Date(Number(closedRaw)) : null

  const slaDeadline = task.due_date
    ? new Date(Number(task.due_date))
    : new Date(createdAt.getTime() + DEFAULT_SLA_HOURS[priority] * 3600 * 1000)

  const cycleTimeHours = closedAt
    ? Math.max(0, Math.round((closedAt.getTime() - createdAt.getTime()) / 3600000))
    : 0

  // Categoria -> primeira Etiqueta (tag) da task; sem etiqueta, usa o nome da lista
  const category = task.tags?.[0]?.name
    ? task.tags[0].name.charAt(0).toUpperCase() + task.tags[0].name.slice(1)
    : task.list?.name || 'Geral'

  // Esforço -> "Estimativa de Tempo" (time_estimate, em ms); sem estimativa,
  // usa "Rastrear Tempo" (time_spent); sem nenhum dos dois, hash determinístico
  const effortSourceMs = task.time_estimate ?? (task.time_spent > 0 ? task.time_spent : null)
  const effortScore = effortSourceMs
    ? Math.max(1, Math.round(effortSourceMs / 3600000)) // ms -> horas
    : hashToRange(task.id, 1, 19)

  return {
    id: task.id,
    title: task.name,
    category,
    status,
    priority,
    assignee: task.assignees?.[0]?.username || task.assignees?.[0]?.email || 'Não atribuído',
    createdAt: createdAt.toISOString(),
    closedAt: closedAt ? closedAt.toISOString() : null,
    slaDeadline: slaDeadline.toISOString(),
    effortScore,
    cycleTimeHours,
  }
}
