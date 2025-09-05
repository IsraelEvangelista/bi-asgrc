// Tipos para o módulo de configurações e cadastros gerais

// Tabela 003_AREAS_GERENCIAS
export interface AreaGerencia {
  id: string;
  gerencia: string;
  diretoria?: string;
  sigla_area: string;
  responsavel_area?: string;
  descricao?: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAreaGerenciaInput {
  gerencia: string;
  diretoria?: string;
  sigla_area: string;
  responsavel_area?: string;
  ativa?: boolean;
}

export interface UpdateAreaGerenciaInput extends Partial<CreateAreaGerenciaInput> {
  id: string;
}

// Tabela 010_NATUREZA
export interface Natureza {
  id: string;
  natureza: string;
  descricao?: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNaturezaInput {
  natureza: string;
  descricao?: string;
  ativa?: boolean;
}

export interface UpdateNaturezaInput extends Partial<CreateNaturezaInput> {
  id: string;
}

// Tabela 011_CATEGORIA
export interface Categoria {
  id: string;
  id_natureza: string;
  categoria: string;
  descricao?: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
  // Relacionamentos
  natureza?: Natureza;
}

export interface CategoriaWithNatureza extends Categoria {
  natureza: Natureza;
}

export interface CreateCategoriaInput {
  id_natureza: string;
  categoria: string;
  descricao?: string;
  ativa?: boolean;
}

export interface UpdateCategoriaInput extends Partial<CreateCategoriaInput> {
  id: string;
}

// Tabela 012_SUBCATEGORIA
export interface Subcategoria {
  id: string;
  id_categoria: string;
  subcategoria: string;
  descricao?: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
  // Relacionamentos
  categoria?: Categoria;
}

export interface SubcategoriaWithCategoria extends Subcategoria {
  categoria: CategoriaWithNatureza;
}

export interface CreateSubcategoriaInput {
  id_categoria: string;
  subcategoria: string;
  descricao?: string;
  ativa?: boolean;
}

export interface UpdateSubcategoriaInput extends Partial<CreateSubcategoriaInput> {
  id: string;
}

// Tabela 020_CONCEITOS
export interface Conceito {
  id: string;
  termo: string;
  definicao: string;
  fonte?: string;
  categoria_conceito?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateConceitoInput {
  termo: string;
  definicao: string;
  fonte?: string;
  categoria_conceito?: string;
  ativo?: boolean;
}

export interface UpdateConceitoInput extends Partial<CreateConceitoInput> {
  id: string;
}

// Tipos para hierarquia de classificação
export interface ClassificacaoHierarchy {
  natureza: Natureza;
  categorias: CategoriaWithSubcategorias[];
}

export interface CategoriaWithSubcategorias extends Categoria {
  subcategorias: Subcategoria[];
  total_subcategorias?: number;
}

export interface NaturezaWithCategorias extends Natureza {
  categorias: CategoriaWithSubcategorias[];
  total_categorias?: number;
  total_subcategorias?: number;
}

// Tipos para filtros e busca
export interface ConfigFilters {
  search?: string;
  ativa?: boolean | 'Todos';
  natureza_id?: string;
  categoria_id?: string;
  categoria_conceito?: string;
}

export interface ConfigSearchParams {
  search?: string;
  filters?: ConfigFilters;
  sortBy?: 'nome' | 'sigla' | 'natureza' | 'categoria' | 'termo' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Tipos para formulários
export interface AreaGerenciaFormData {
  gerencia: string;
  diretoria?: string;
  sigla_area: string;
  responsavel_area: string;
  descricao?: string;
  ativa: boolean;
}

export interface NaturezaFormData {
  natureza: string;
  descricao: string;
  ativa: boolean;
}

export interface CategoriaFormData {
  id_natureza: string;
  categoria: string;
  descricao: string;
  ativa: boolean;
}

export interface SubcategoriaFormData {
  id_categoria: string;
  subcategoria: string;
  descricao: string;
  ativa: boolean;
}

export interface ConceitoFormData {
  termo: string;
  definicao: string;
  fonte: string;
  categoria_conceito: string;
  ativo: boolean;
}

// Tipos para validação de formulários
export interface ConfigFormErrors {
  gerencia?: string;
  sigla_area?: string;
  responsavel_area?: string;
  descricao?: string;
  natureza?: string;
  categoria?: string;
  subcategoria?: string;
  termo?: string;
  definicao?: string;
  id_natureza?: string;
  id_categoria?: string;
  general?: string;
}

// Tipos para respostas da API
export interface AreasGerenciasResponse {
  areas: AreaGerencia[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NaturezasResponse {
  naturezas: NaturezaWithCategorias[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriasResponse {
  categorias: CategoriaWithNatureza[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubcategoriasResponse {
  subcategorias: SubcategoriaWithCategoria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConceitosResponse {
  conceitos: Conceito[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Enums e constantes
export const ATIVA_OPTIONS = [
  { value: true, label: 'Ativa' },
  { value: false, label: 'Inativa' }
] as const;

export const ATIVO_OPTIONS = [
  { value: true, label: 'Ativo' },
  { value: false, label: 'Inativo' }
] as const;

export const CATEGORIA_CONCEITO_OPTIONS = [
  { value: 'Gestão de Riscos', label: 'Gestão de Riscos' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Auditoria', label: 'Auditoria' },
  { value: 'Governança', label: 'Governança' },
  { value: 'Processos', label: 'Processos' },
  { value: 'Controles Internos', label: 'Controles Internos' },
  { value: 'Geral', label: 'Geral' }
] as const;

// Tipos para estatísticas
export interface ConfigStatistics {
  total_areas: number;
  areas_ativas: number;
  total_naturezas: number;
  naturezas_ativas: number;
  total_categorias: number;
  categorias_ativas: number;
  total_subcategorias: number;
  subcategorias_ativas: number;
  total_conceitos: number;
  conceitos_ativos: number;
  distribuicao_conceitos: {
    categoria: string;
    count: number;
  }[];
}

// Tipos para navegação e menu
export interface ConfigMenuItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  count?: number;
  color: string;
}

export interface ConfigMenuSection {
  title: string;
  items: ConfigMenuItem[];
}

// Tipos para hierarquia de classificação completa
export interface ClassificacaoCompleta {
  naturezas: NaturezaWithCategorias[];
  total_naturezas: number;
  total_categorias: number;
  total_subcategorias: number;
}

// Tipos para importação/exportação
export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  errors: string[];
  warnings: string[];
}

export interface ConfigExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeInactive?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  fields?: string[];
}

// Tipos para auditoria
export interface ConfigAuditLog {
  id: string;
  entity_type: 'area' | 'natureza' | 'categoria' | 'subcategoria' | 'conceito';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  user_id: string;
  user_name: string;
  timestamp: string;
}

// Tipos para validação de integridade
export interface IntegrityCheck {
  entity_type: string;
  entity_id: string;
  issue_type: 'orphaned' | 'missing_reference' | 'duplicate' | 'invalid_data';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IntegrityReport {
  checks_performed: number;
  issues_found: number;
  issues: IntegrityCheck[];
  last_check: string;
}

// Tipos para configurações do sistema
export interface SystemConfig {
  allow_duplicate_siglas: boolean;
  require_responsavel_area: boolean;
  auto_activate_new_items: boolean;
  enable_audit_log: boolean;
  max_items_per_page: number;
}