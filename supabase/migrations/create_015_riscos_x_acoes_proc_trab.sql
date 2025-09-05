-- Criação da tabela 015_RISCOS_X_ACOES_PROC_TRAB
-- Esta tabela é fundamental para o relacionamento entre riscos, ações e processos de trabalho

CREATE TABLE 015_riscos_x_acoes_proc_trab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sigla_processo TEXT,
    id_resp_processo UUID REFERENCES 003_areas_gerencias(id),
    responsavel_processo TEXT,
    situacao_risco TEXT,
    id_risco UUID REFERENCES 007_riscos_trabalho(id),
    nivel_risco TEXT,
    nivel_risco_tratado TEXT,
    resposta_risco TEXT,
    id_acao UUID REFERENCES 014_acoes_controle_proc_trab(id),
    id_processo UUID REFERENCES 005_processos(id),
    responsavel_acao UUID REFERENCES 003_areas_gerencias(id),
    inicio_planejado DATE,
    fim_planejado DATE,
    inicio_realizado DATE,
    fim_realizado DATE,
    plano_resposta_risco TEXT,
    obs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_015_riscos_x_acoes_risco ON 015_riscos_x_acoes_proc_trab(id_risco);
CREATE INDEX idx_015_riscos_x_acoes_acao ON 015_riscos_x_acoes_proc_trab(id_acao);
CREATE INDEX idx_015_riscos_x_acoes_processo ON 015_riscos_x_acoes_proc_trab(id_processo);
CREATE INDEX idx_015_riscos_x_acoes_resp_processo ON 015_riscos_x_acoes_proc_trab(id_resp_processo);
CREATE INDEX idx_015_riscos_x_acoes_resp_acao ON 015_riscos_x_acoes_proc_trab(responsavel_acao);

-- Habilitar RLS (Row Level Security)
ALTER TABLE 015_riscos_x_acoes_proc_trab ENABLE ROW LEVEL SECURITY;

-- Permissões Supabase
GRANT SELECT ON 015_riscos_x_acoes_proc_trab TO anon;
GRANT ALL PRIVILEGES ON 015_riscos_x_acoes_proc_trab TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE 015_riscos_x_acoes_proc_trab IS 'Tabela de relacionamento entre riscos, ações e processos de trabalho';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.sigla_processo IS 'Sigla identificadora do processo';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.id_resp_processo IS 'ID da área/gerência responsável pelo processo';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.responsavel_processo IS 'Nome do responsável pelo processo';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.situacao_risco IS 'Situação atual do risco';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.nivel_risco IS 'Nível de risco identificado';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.nivel_risco_tratado IS 'Nível de risco após tratamento';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.resposta_risco IS 'Tipo de resposta ao risco (aceitar, mitigar, transferir, evitar)';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.plano_resposta_risco IS 'Descrição detalhada do plano de resposta ao risco';
COMMENT ON COLUMN 015_riscos_x_acoes_proc_trab.obs IS 'Observações adicionais sobre o relacionamento';