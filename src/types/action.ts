// Tipos para o módulo de Planos de Ação
// Baseado na tabela 009_acoes do PRD

// Enums para campos controlados
export enum TipoAcao {
  ORIGINAL = 'Original',
  ALTERADA = 'Alterada',
  INCLUIDA = 'Incluída'
}

export enum StatusAcao {
  NAO_INICIADA = 'Não iniciada',
  EM_IMPLEMENTACAO = 'Em implementação',
  IMPLEMENTADA = 'Implementada'
}

export enum SituacaoAcao {
  NO_PRAZO = 'No Prazo',
  ATRASADO = 'Atrasado'
}

// Interface principal da Ação
export interface Action {
  id: string;
  id_ref?: string; // Referência para ação pai (relacionamento recursivo)
  id_risco?: string; // FK para tabela 006_matriz_riscos
  desc_acao: string;
  area_executora: string[]; // JSONB array de áreas
  acao_transversal: boolean;
  tipo_acao?: TipoAcao;
  prazo_implementacao?: string; // Date como string
  novo_prazo?: string; // Date como string
  status?: StatusAcao;
  justificativa_observacao?: string;
  impacto_atraso_nao_implementacao?: string;
  desc_evidencia?: string;
  situacao?: SituacaoAcao;
  mitiga_fatores_risco?: string;
  url?: string;
  perc_implementacao?: number; // 0-100
  apuracao?: string;
  created_at: string;
  updated_at: string;
  // Campos relacionados das tabelas JOINadas
  eventos_riscos?: string; // Da tabela 006_matriz_riscos
  sigla_area?: string; // Da tabela 003_areas_gerencias
  hist_created_at?: string; // Da tabela 023_hist_acao
}

// Interface para criação de ação
export interface CreateActionInput {
  id_ref?: string;
  desc_acao: string;
  area_executora: string[];
  acao_transversal?: boolean;
  tipo_acao?: TipoAcao;
  prazo_implementacao?: string;
  novo_prazo?: string;
  status?: StatusAcao;
  justificativa_observacao?: string;
  impacto_atraso_nao_implementacao?: string;
  desc_evidencia?: string;
  situacao?: SituacaoAcao;
  mitiga_fatores_risco?: string;
  url?: string;
  perc_implementacao?: number;
  apuracao?: string;
}

// Interface para atualização de ação
export interface UpdateActionInput {
  id_ref?: string;
  desc_acao?: string;
  area_executora?: string[];
  acao_transversal?: boolean;
  tipo_acao?: TipoAcao;
  prazo_implementacao?: string;
  novo_prazo?: string;
  status?: StatusAcao;
  justificativa_observacao?: string;
  impacto_atraso_nao_implementacao?: string;
  desc_evidencia?: string;
  situacao?: SituacaoAcao;
  mitiga_fatores_risco?: string;
  url?: string;
  perc_implementacao?: number;
  apuracao?: string;
}

// Interface para filtros de ações
export interface ActionFilters {
  area_executora?: string;
  tipo_acao?: TipoAcao;
  status?: StatusAcao;
  situacao?: SituacaoAcao;
  acao_transversal?: boolean;
  prazo_inicio?: string;
  prazo_fim?: string;
  perc_min?: number;
  perc_max?: number;
  search?: string;
}

// Interface para dados do formulário
export interface ActionFormData {
  id_ref: string;
  desc_acao: string;
  area_executora: string[];
  acao_transversal: boolean;
  tipo_acao: TipoAcao;
  prazo_implementacao: string;
  novo_prazo: string;
  status: StatusAcao;
  justificativa_observacao: string;
  impacto_atraso_nao_implementacao: string;
  desc_evidencia: string;
  situacao: SituacaoAcao;
  mitiga_fatores_risco: string;
  url: string;
  perc_implementacao: string; // String para controle do formulário
  apuracao: string;
}

// Interface para ação com relacionamentos
export interface ActionWithRelations {
  action: Action;
  parent_action?: Action;
  child_actions?: Action[];
  related_risks?: string[]; // IDs dos riscos relacionados
  risk_names?: string[]; // Nomes dos riscos para exibição
}

// Interface para timeline de ações
export interface ActionTimeline {
  id: string;
  desc_acao: string;
  prazo_implementacao?: string;
  novo_prazo?: string;
  status: StatusAcao;
  perc_implementacao?: number;
  situacao: SituacaoAcao;
  area_executora: string[];
  is_overdue: boolean;
  days_until_deadline?: number;
}

// Interface para métricas de ações
export interface ActionMetrics {
  total_acoes: number;
  nao_iniciadas: number;
  em_implementacao: number;
  implementadas: number;
  no_prazo: number;
  atrasadas: number;
  percentual_conclusao: number;
  percentual_no_prazo: number;
  media_implementacao: number;
}

// Interface para evidências de ação
export interface ActionEvidence {
  id: string;
  action_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Interface para upload de evidências
export interface ActionEvidenceUpload {
  action_id: string;
  file: File;
  description?: string;
}

// Interface para alertas de ações
export interface ActionAlert {
  id: string;
  action_id: string;
  action_name: string;
  alert_type: 'PRAZO_VENCENDO' | 'ATRASADA' | 'SEM_PROGRESSO';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  days_overdue?: number;
  created_at: string;
  acknowledged: boolean;
}

// Tipos auxiliares
export type ActionStatus = StatusAcao;
export type ActionType = TipoAcao;
export type ActionSituation = SituacaoAcao;

// Interface para opções de select
export interface ActionSelectOption {
  value: string;
  label: string;
}

// Constantes para uso nos componentes
export const TIPO_ACAO_OPTIONS: ActionSelectOption[] = [
  { value: TipoAcao.ORIGINAL, label: 'Original' },
  { value: TipoAcao.ALTERADA, label: 'Alterada' },
  { value: TipoAcao.INCLUIDA, label: 'Incluída' }
];

export const STATUS_ACAO_OPTIONS: ActionSelectOption[] = [
  { value: StatusAcao.NAO_INICIADA, label: 'Não Iniciada' },
  { value: StatusAcao.EM_IMPLEMENTACAO, label: 'Em implementação' },
  { value: StatusAcao.IMPLEMENTADA, label: 'Implementada' }
];

export const SITUACAO_ACAO_OPTIONS: ActionSelectOption[] = [
  { value: SituacaoAcao.NO_PRAZO, label: 'No Prazo' },
  { value: SituacaoAcao.ATRASADO, label: 'Atrasado' }
];

// Funções utilitárias
export const getActionStatusColor = (status: StatusAcao): string => {
  switch (status) {
    case StatusAcao.IMPLEMENTADA:
      return 'text-green-600 bg-green-100';
    case StatusAcao.EM_IMPLEMENTACAO:
      return 'text-yellow-600 bg-yellow-100';
    case StatusAcao.NAO_INICIADA:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getSituacaoColor = (situacao: SituacaoAcao): string => {
  switch (situacao) {
    case SituacaoAcao.NO_PRAZO:
      return 'text-green-600 bg-green-100';
    case SituacaoAcao.ATRASADO:
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

export const isActionOverdue = (action: Action): boolean => {
  if (!action.prazo_implementacao) return false;
  
  const deadline = new Date(action.prazo_implementacao);
  const today = new Date();
  
  return today > deadline && action.status !== StatusAcao.IMPLEMENTADA;
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getActionPriority = (action: Action): 'low' | 'medium' | 'high' | 'critical' => {
  if (action.situacao === SituacaoAcao.ATRASADO) {
    return 'critical';
  }
  
  if (action.prazo_implementacao) {
    const daysUntilDeadline = getDaysUntilDeadline(action.prazo_implementacao);
    if (daysUntilDeadline <= 3) return 'high';
    if (daysUntilDeadline <= 7) return 'medium';
  }
  
  return 'low';
};

export const calculateActionProgress = (action: Action): number => {
  return action.perc_implementacao || 0;
};

export const formatActionDeadline = (deadline?: string): string => {
  if (!deadline) return 'Sem prazo definido';
  
  const date = new Date(deadline);
  return date.toLocaleDateString('pt-BR');
};

export const getActionTypeIcon = (tipo: TipoAcao): string => {
  switch (tipo) {
    case TipoAcao.ORIGINAL:
      return 'circle';
    case TipoAcao.ALTERADA:
      return 'edit';
    case TipoAcao.INCLUIDA:
      return 'plus-circle';
    default:
      return 'circle';
  }
};