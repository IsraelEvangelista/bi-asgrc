// Tipos para o módulo de processos organizacionais

// Tabela 004_MACROPROCESSOS
export interface Macroprocesso {
  id: string;
  tipo_macroprocesso: string;
  macroprocesso: string;
  link_macro?: string;
  situacao: 'Ativo' | 'Inativo';
  created_at?: string;
  updated_at?: string;
}

export interface CreateMacroprocessoInput {
  tipo_macroprocesso: string;
  macroprocesso: string;
  link_macro?: string;
  situacao?: 'Ativo' | 'Inativo';
}

export interface UpdateMacroprocessoInput extends Partial<CreateMacroprocessoInput> {
  id: string;
}

// Tabela 005_PROCESSOS
export interface Processo {
  id: string;
  id_macroprocesso: string;
  processo: string;
  responsavel_processo?: string;
  objetivo_processo?: string;
  entregas_processo?: string;
  situacao: 'Ativo' | 'Inativo';
  created_at?: string;
  updated_at?: string;
  // Relacionamentos
  macroprocesso?: Macroprocesso;
}

export interface ProcessoWithMacro extends Processo {
  macroprocesso: Macroprocesso;
}

export interface CreateProcessoInput {
  id_macroprocesso: string;
  processo: string;
  responsavel_processo?: string;
  situacao?: 'Ativo' | 'Inativo';
}

export interface UpdateProcessoInput extends Partial<CreateProcessoInput> {
  id: string;
}

// Tabela 013_SUBPROCESSOS
export interface Subprocesso {
  id: string;
  id_processo: string;
  subprocesso: string;
  responsavel_subprocesso?: string;
  situacao: 'Ativo' | 'Inativo';
  created_at?: string;
  updated_at?: string;
  // Relacionamentos
  processo?: Processo;
}

export interface SubprocessoWithProcesso extends Subprocesso {
  processo: ProcessoWithMacro;
}

export interface CreateSubprocessoInput {
  id_processo: string;
  subprocesso: string;
  responsavel_subprocesso?: string;
  situacao?: 'Ativo' | 'Inativo';
}

export interface UpdateSubprocessoInput extends Partial<CreateSubprocessoInput> {
  id: string;
}

// Tipos para hierarquia de processos
export interface ProcessHierarchy {
  macroprocesso: Macroprocesso;
  processos: ProcessoWithSubprocessos[];
}

export interface ProcessoWithSubprocessos extends Processo {
  subprocessos: Subprocesso[];
  riscos_associados?: number;
}

export interface MacroprocessoWithProcessos extends Macroprocesso {
  processos: ProcessoWithSubprocessos[];
  total_processos?: number;
  total_subprocessos?: number;
  total_riscos?: number;
}

// Tipos para mapeamento de riscos
export interface ProcessRiskMapping {
  processo_id: string;
  processo_nome: string;
  macroprocesso_nome: string;
  riscos_count: number;
  riscos: {
    id: string;
    eventos_riscos: string;
    severidade: number;
    classificacao: string;
  }[];
}

// Tipos para filtros e busca
export interface ProcessFilters {
  search?: string;
  macroprocesso_id?: string;
  processo_id?: string;
  situacao?: 'Ativo' | 'Inativo' | 'Todos';
  responsavel?: string;
  tipo_macroprocesso?: string;
}

export interface ProcessSearchParams {
  search?: string;
  filters?: ProcessFilters;
  sortBy?: 'macroprocesso' | 'processo' | 'subprocesso' | 'situacao' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Tipos para formulários
export interface MacroprocessoFormData {
  tipo_macroprocesso: string;
  macroprocesso: string;
  link_macro: string;
  situacao: 'Ativo' | 'Inativo';
}

export interface ProcessoFormData {
  id_macroprocesso: string;
  processo: string;
  responsavel_processo: string;
  situacao: 'Ativo' | 'Inativo';
}

export interface SubprocessoFormData {
  id_processo: string;
  subprocesso: string;
  responsavel_subprocesso: string;
  situacao: 'Ativo' | 'Inativo';
}

// Tipos para validação de formulários
export interface ProcessFormErrors {
  tipo_macroprocesso?: string;
  macroprocesso?: string;
  processo?: string;
  subprocesso?: string;
  id_macroprocesso?: string;
  id_processo?: string;
  situacao?: string;
  general?: string;
}

// Tipos para respostas da API
export interface MacroprocessosResponse {
  macroprocessos: MacroprocessoWithProcessos[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcessosResponse {
  processos: ProcessoWithMacro[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubprocessosResponse {
  subprocessos: SubprocessoWithProcesso[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Enums e constantes
export const SITUACAO_OPTIONS = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' }
] as const;

export const TIPO_MACROPROCESSO_OPTIONS = [
  { value: 'Estratégico', label: 'Estratégico' },
  { value: 'Operacional', label: 'Operacional' },
  { value: 'Suporte', label: 'Suporte' },
  { value: 'Gerencial', label: 'Gerencial' }
] as const;

// Tipos para estatísticas
export interface ProcessStatistics {
  total_macroprocessos: number;
  total_processos: number;
  total_subprocessos: number;
  macroprocessos_ativos: number;
  processos_ativos: number;
  subprocessos_ativos: number;
  processos_com_riscos: number;
  processos_sem_riscos: number;
  distribuicao_por_tipo: {
    tipo: string;
    count: number;
  }[];
}

// Tipos para navegação hierárquica
export interface HierarchyNode {
  id: string;
  name: string;
  type: 'macroprocesso' | 'processo' | 'subprocesso';
  level: number;
  parent_id?: string;
  children?: HierarchyNode[];
  expanded?: boolean;
  riscos_count?: number;
  situacao: 'Ativo' | 'Inativo';
}

export interface ProcessTreeData {
  nodes: HierarchyNode[];
  total_nodes: number;
  max_depth: number;
}