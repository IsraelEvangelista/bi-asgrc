// Tipos TypeScript para o módulo de indicadores de risco
// Baseado na tabela 008_indicadores do PRD

// Enums para campos controlados
export enum SituacaoIndicador {
  EM_IMPLEMENTACAO = 'Em implementação',
  IMPLEMENTADO = 'Implementado',
  NAO_INICIADO = 'Não Iniciado'
}

export enum Tolerancia {
  DENTRO_TOLERANCIA = 'Dentro da Tolerância',
  FORA_TOLERANCIA = 'Fora da Tolerância'
}

export enum StatusImplementacao {
  NAO_INICIADO = 'Não Iniciado',
  EM_IMPLEMENTACAO = 'Em implementação',
  IMPLEMENTADO = 'Implementado'
}

// Interface principal do Indicador
export interface Indicator {
  id: string;
  id_risco: string;
  responsavel_risco: string;
  indicador_risco: string;
  situacao_indicador: SituacaoIndicador;
  justificativa_observacao?: string;
  impacto_n_implementacao?: string;
  meta_desc?: string;
  tolerancia: Tolerancia;
  limite_tolerancia?: string;
  tipo_acompanhamento?: string;
  resultado_mes?: number;
  apuracao?: string;
  created_at: string;
  updated_at: string;
}

// Interface para criação de indicador
export interface CreateIndicatorInput {
  id_risco: string;
  responsavel_risco: string;
  indicador_risco: string;
  situacao_indicador: SituacaoIndicador;
  justificativa_observacao?: string;
  impacto_n_implementacao?: string;
  meta_desc?: string;
  tolerancia: Tolerancia;
  limite_tolerancia?: string;
  tipo_acompanhamento?: string;
  resultado_mes?: number;
  apuracao?: string;
}

// Interface para atualização de indicador
export interface UpdateIndicatorInput {
  id_risco?: string;
  responsavel_risco?: string;
  indicador_risco?: string;
  situacao_indicador?: SituacaoIndicador;
  justificativa_observacao?: string;
  impacto_n_implementacao?: string;
  meta_desc?: string;
  tolerancia?: Tolerancia;
  limite_tolerancia?: string;
  tipo_acompanhamento?: string;
  resultado_mes?: number;
  apuracao?: string;
}

// Interface para filtros de indicadores
export interface IndicatorFilters {
  id_risco?: string;
  responsavel_risco?: string;
  situacao_indicador?: SituacaoIndicador;
  tolerancia?: Tolerancia;
  tipo_acompanhamento?: string;
  periodo_inicio?: string;
  periodo_fim?: string;
}

// Interface para dados do formulário
export interface IndicatorFormData {
  id_risco: string;
  responsavel_risco: string;
  indicador_risco: string;
  situacao_indicador: SituacaoIndicador;
  justificativa_observacao: string;
  impacto_n_implementacao: string;
  meta_desc: string;
  tolerancia: Tolerancia;
  limite_tolerancia: string;
  tipo_acompanhamento: string;
  resultado_mes: number;
  apuracao: string;
}

// Opções para dropdowns
export const SITUACAO_INDICADOR_OPTIONS = [
  { value: SituacaoIndicador.NAO_INICIADO, label: 'Não Iniciado' },
  { value: SituacaoIndicador.EM_IMPLEMENTACAO, label: 'Em Implementação' },
  { value: SituacaoIndicador.IMPLEMENTADO, label: 'Implementado' }
];

export const TOLERANCIA_OPTIONS = [
  { value: Tolerancia.DENTRO_TOLERANCIA, label: 'Dentro da Tolerância' },
  { value: Tolerancia.FORA_TOLERANCIA, label: 'Fora da Tolerância' }
];

export const TIPO_ACOMPANHAMENTO_OPTIONS = [
  { value: 'Percentual', label: 'Percentual (%)' },
  { value: 'Absoluto', label: 'Valor Absoluto' },
  { value: 'Binário', label: 'Sim/Não' }
];

// Funções utilitárias para cores e estilos
export const getIndicatorStatusColor = (status: SituacaoIndicador): string => {
  switch (status) {
    case SituacaoIndicador.NAO_INICIADO:
      return 'bg-gray-100 text-gray-800';
    case SituacaoIndicador.EM_IMPLEMENTACAO:
      return 'bg-yellow-100 text-yellow-800';
    case SituacaoIndicador.IMPLEMENTADO:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getToleranceColor = (tolerance: Tolerancia): string => {
  switch (tolerance) {
    case Tolerancia.DENTRO_TOLERANCIA:
      return 'bg-green-100 text-green-800';
    case Tolerancia.FORA_TOLERANCIA:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Interface para histórico de indicadores
export interface IndicatorHistory {
  id: string;
  indicator_id: string;
  resultado_mes: number;
  tolerancia: Tolerancia;
  apuracao: string;
  observacoes?: string;
  recorded_at: string;
  recorded_by: string;
}

// Interface para métricas de indicadores
export interface IndicatorMetrics {
  total_indicadores: number;
  indicadores_implementados: number;
  indicadores_em_implementacao: number;
  indicadores_nao_iniciados: number;
  indicadores_dentro_tolerancia: number;
  indicadores_fora_tolerancia: number;
  percentual_conformidade: number;
}

// Interface para alertas de indicadores
export interface IndicatorAlert {
  id: string;
  indicador_id: string;
  indicador_nome: string;
  tipo_alerta: 'FORA_TOLERANCIA' | 'PRAZO_VENCIDO' | 'SEM_RESULTADO';
  mensagem: string;
  severidade: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data_criacao: string;
  resolvido: boolean;
}

export default {
  SituacaoIndicador,
  Tolerancia,
  StatusImplementacao,
  SITUACAO_INDICADOR_OPTIONS,
  TOLERANCIA_OPTIONS,
  TIPO_ACOMPANHAMENTO_OPTIONS,
  getIndicatorStatusColor,
  getToleranceColor
};