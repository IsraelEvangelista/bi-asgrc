export type RiskClassification = 
  | 'estrategico'
  | 'operacional'
  | 'financeiro'
  | 'regulatorio'
  | 'reputacional';

export interface Risk {
  id: string;
  eventos_riscos: string;
  probabilidade: number | null;
  impacto: number | null;
  severidade: number | null; // Calculado automaticamente (probabilidade * impacto)
  classificacao: RiskClassification | null;
  responsavel_risco: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at?: string | null; // Para soft delete
}

export interface CreateRiskInput {
  eventos_riscos: string;
  probabilidade: number;
  impacto: number;
  classificacao: RiskClassification;
  responsavel_risco: string;
}

export interface UpdateRiskInput {
  eventos_riscos?: string;
  probabilidade?: number;
  impacto?: number;
  classificacao?: RiskClassification;
  responsavel_risco?: string;
}

export interface RiskFilters {
  classificacao?: RiskClassification;
  responsavel_risco?: string;
  severidade_min?: number;
  severidade_max?: number;
}

export interface RiskFormData {
  eventos_riscos: string;
  probabilidade: number;
  impacto: number;
  classificacao: RiskClassification;
  responsavel_risco: string;
}