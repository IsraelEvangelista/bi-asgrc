export type ReportType = 
  | 'riscos_matriz'
  | 'indicadores_performance'
  | 'acoes_mitigacao'
  | 'processos_riscos'
  | 'dashboard_executivo'
  | 'auditoria_completa';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export type FilterPeriod = {
  startDate: string;
  endDate: string;
  preset?: 'last_month' | 'last_quarter' | 'last_year' | 'ytd' | 'custom';
};

export type ReportFilters = {
  period: FilterPeriod;
  responsaveis?: string[];
  tiposRisco?: string[];
  processos?: string[];
  severidadeMin?: number;
  severidadeMax?: number;
  statusIndicadores?: string[];
  statusAcoes?: string[];
  incluirHistorico?: boolean;
};

export interface ReportConfig {
  id?: string;
  name: string;
  description?: string;
  type: ReportType;
  filters: ReportFilters;
  columns: string[];
  groupBy?: string[];
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  includeCharts?: boolean;
  chartTypes?: string[];
  template?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportData {
  config: ReportConfig;
  data: Record<string, unknown>[];
  summary: {
    totalRecords: number;
    filteredRecords: number;
    generatedAt: string;
    generatedBy: string;
  };
  charts?: {
    type: string;
    title: string;
    data: Record<string, unknown>;
    config: Record<string, unknown>;
  }[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  defaultFilters: Partial<ReportFilters>;
  defaultColumns: string[];
  layout: {
    header: boolean;
    footer: boolean;
    logo: boolean;
    charts: boolean;
    summary: boolean;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
  };
}

export interface ExportOptions {
  format: ReportFormat;
  filename?: string;
  includeCharts?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ReportStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isValid: boolean;
  isCompleted: boolean;
}

export interface ReportWizardState {
  currentStep: number;
  steps: ReportStep[];
  config: Partial<ReportConfig>;
  previewData?: Record<string, unknown>[];
  isGenerating: boolean;
  errors: Record<string, string>;
}

// Utility types for form validation
export interface ReportFormErrors {
  name?: string;
  type?: string;
  period?: string;
  columns?: string;
  general?: string;
}

// Available columns for each report type
export const REPORT_COLUMNS: Record<ReportType, { key: string; label: string; type: string }[]> = {
  riscos_matriz: [
    { key: 'eventos_riscos', label: 'Evento de Risco', type: 'text' },
    { key: 'probabilidade', label: 'Probabilidade', type: 'number' },
    { key: 'impacto', label: 'Impacto', type: 'number' },
    { key: 'severidade', label: 'Severidade', type: 'number' },
    { key: 'classificacao', label: 'Classificação', type: 'text' },
    { key: 'responsavel_risco', label: 'Responsável', type: 'text' },
    { key: 'created_at', label: 'Data de Criação', type: 'date' },
    { key: 'updated_at', label: 'Última Atualização', type: 'date' }
  ],
  indicadores_performance: [
    { key: 'indicador_risco', label: 'Indicador', type: 'text' },
    { key: 'situacao_indicador', label: 'Situação', type: 'text' },
    { key: 'meta_efetiva', label: 'Meta Efetiva', type: 'number' },
    { key: 'tolerancia', label: 'Tolerância', type: 'text' },
    { key: 'limite_tolerancia', label: 'Limite de Tolerância', type: 'text' },
    { key: 'responsavel_risco', label: 'Responsável', type: 'text' },
    { key: 'tipo_acompanhamento', label: 'Tipo de Acompanhamento', type: 'text' },
    { key: 'apuracao', label: 'Apuração', type: 'text' },
    { key: 'resultado_mes', label: 'Resultado do Mês', type: 'number' },
    { key: 'data_apuracao', label: 'Data de Apuração', type: 'date' }
  ],
  acoes_mitigacao: [
    { key: 'desc_acao', label: 'Descrição da Ação', type: 'text' },
    { key: 'area_executora', label: 'Área Executora', type: 'array' },
    { key: 'tipo_acao', label: 'Tipo de Ação', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'prazo_implementacao', label: 'Prazo', type: 'date' },
    { key: 'perc_implementacao', label: 'Percentual Implementado', type: 'number' },
    { key: 'situacao', label: 'Situação', type: 'text' }
  ],
  processos_riscos: [
    { key: 'processo', label: 'Processo', type: 'text' },
    { key: 'macroprocesso', label: 'Macroprocesso', type: 'text' },
    { key: 'responsavel_processo', label: 'Responsável', type: 'text' },
    { key: 'riscos_associados', label: 'Riscos Associados', type: 'number' },
    { key: 'situacao', label: 'Situação', type: 'text' }
  ],
  dashboard_executivo: [
    { key: 'total_riscos', label: 'Total de Riscos', type: 'number' },
    { key: 'riscos_altos', label: 'Riscos Altos', type: 'number' },
    { key: 'indicadores_fora_tolerancia', label: 'Indicadores Fora da Tolerância', type: 'number' },
    { key: 'acoes_atrasadas', label: 'Ações Atrasadas', type: 'number' },
    { key: 'percentual_implementacao', label: 'Percentual de Implementação', type: 'number' }
  ],
  auditoria_completa: [
    { key: 'entidade', label: 'Entidade', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'responsavel', label: 'Responsável', type: 'text' },
    { key: 'data_criacao', label: 'Data de Criação', type: 'date' },
    { key: 'ultima_atualizacao', label: 'Última Atualização', type: 'date' }
  ]
};

// Default templates
export const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'executive_summary',
    name: 'Relatório Executivo',
    description: 'Resumo executivo com principais KPIs e métricas',
    type: 'dashboard_executivo',
    defaultFilters: {
      period: {
        startDate: '',
        endDate: '',
        preset: 'last_quarter'
      }
    },
    defaultColumns: ['total_riscos', 'riscos_altos', 'indicadores_fora_tolerancia', 'acoes_atrasadas'],
    layout: {
      header: true,
      footer: true,
      logo: true,
      charts: true,
      summary: true
    },
    styling: {
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      fontSize: 12
    }
  },
  {
    id: 'risk_matrix_detailed',
    name: 'Matriz de Riscos Detalhada',
    description: 'Relatório completo da matriz de riscos com análises',
    type: 'riscos_matriz',
    defaultFilters: {
      period: {
        startDate: '',
        endDate: '',
        preset: 'ytd'
      }
    },
    defaultColumns: ['eventos_riscos', 'probabilidade', 'impacto', 'severidade', 'classificacao', 'responsavel_risco'],
    layout: {
      header: true,
      footer: true,
      logo: true,
      charts: true,
      summary: true
    },
    styling: {
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      fontSize: 11
    }
  },
  {
    id: 'audit_complete',
    name: 'Relatório de Auditoria Completo',
    description: 'Relatório completo para auditoria interna',
    type: 'auditoria_completa',
    defaultFilters: {
      period: {
        startDate: '',
        endDate: '',
        preset: 'last_year'
      },
      incluirHistorico: true
    },
    defaultColumns: ['entidade', 'tipo', 'status', 'responsavel', 'data_criacao', 'ultima_atualizacao'],
    layout: {
      header: true,
      footer: true,
      logo: true,
      charts: false,
      summary: true
    },
    styling: {
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      fontSize: 10
    }
  }
];