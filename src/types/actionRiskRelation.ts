// Tipos TypeScript para a tabela 016_rel_acoes_riscos
// Tabela de relacionamento entre ações e riscos

export interface ActionRiskRelation {
  id: string;
  id_acao: string; // FK para tabela 009_acoes
  id_risco: string; // FK para tabela 006_matriz_riscos
  desc_acao?: string; // Descrição da ação relacionada ao risco
  created_at: string;
  updated_at: string;
}

// Interface para criação de nova relação (sem campos auto-gerados)
export interface CreateActionRiskRelation {
  id_acao: string;
  id_risco: string;
  desc_acao?: string;
}

// Interface para atualização de relação existente
export interface UpdateActionRiskRelation {
  id_acao?: string;
  id_risco?: string;
  desc_acao?: string;
}

// Interface para relação com dados expandidos (joins)
export interface ActionRiskRelationWithDetails extends ActionRiskRelation {
  acao?: {
    id: string;
    desc_acao: string;
    area_executora?: string;
  };
  risco?: {
    id: string;
    eventos_riscos: string;
    probabilidade?: number;
    impacto?: number;
  };
}