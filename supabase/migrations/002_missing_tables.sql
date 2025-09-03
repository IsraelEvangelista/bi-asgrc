-- Migração para adicionar as 9 tabelas faltantes do PRD
-- Tabelas: RISCOS_TRABALHO, SUBPROCESSOS, NATUREZA, CATEGORIA, SUBCATEGORIA, 
-- ACOES_CONTROLE_PROC_TRAB, REL_RISCO_PROCESSO, REL_RISCO, HISTORICO_INDICADORES

-- Tabela de riscos de trabalho
CREATE TABLE riscos_trabalho (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risco TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de subprocessos
CREATE TABLE subprocessos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cod_subprocesso TEXT,
    subprocesso TEXT NOT NULL,
    id_processo UUID REFERENCES processos(id),
    link_subprocesso TEXT,
    link_manual TEXT,
    data_inicio DATE,
    data_termino_prevista DATE,
    situacao TEXT,
    planejamento_inicial TEXT,
    mapeamento_situacao_atual TEXT,
    desenho_situacao_futura TEXT,
    monitoramento TEXT,
    encerramento TEXT,
    publicado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de natureza dos riscos
CREATE TABLE natureza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    desc_natureza TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categoria dos riscos
CREATE TABLE categoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    desc_categoria TEXT NOT NULL,
    id_natureza UUID REFERENCES natureza(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de subcategoria dos riscos
CREATE TABLE subcategoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    desc_subcategoria TEXT NOT NULL,
    id_categoria UUID REFERENCES categoria(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ações de controle de processos de trabalho
CREATE TABLE acoes_controle_proc_trab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acao TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento entre risco e processo
CREATE TABLE rel_risco_processo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_risco UUID REFERENCES matriz_riscos(id),
    id_macro UUID REFERENCES macroprocessos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento entre risco e classificação (natureza/categoria/subcategoria)
CREATE TABLE rel_risco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_risco UUID REFERENCES matriz_riscos(id),
    id_natureza UUID REFERENCES natureza(id),
    id_categoria UUID REFERENCES categoria(id),
    id_subcategoria UUID REFERENCES subcategoria(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de indicadores
CREATE TABLE historico_indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_indicador UUID REFERENCES indicadores(id),
    valor_anterior FLOAT,
    valor_atual FLOAT,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_alteracao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar tabela riscos_x_acoes_proc_trab para referenciar as novas tabelas
ALTER TABLE riscos_x_acoes_proc_trab 
ADD COLUMN situacao_risco TEXT,
ADD COLUMN nivel_risco TEXT,
ADD COLUMN nivel_risco_tratado TEXT,
ADD COLUMN resposta_risco TEXT,
ADD COLUMN responsavel_processo UUID REFERENCES areas_gerencias(id),
ADD COLUMN responsavel_acao UUID REFERENCES areas_gerencias(id),
ADD COLUMN inicio_planejado DATE,
ADD COLUMN fim_planejado DATE,
ADD COLUMN inicio_realizado DATE,
ADD COLUMN fim_realizado DATE,
ADD COLUMN plano_resposta_risco TEXT,
ADD COLUMN obs TEXT;

-- Atualizar referências para as novas tabelas
ALTER TABLE riscos_x_acoes_proc_trab 
DROP CONSTRAINT riscos_x_acoes_proc_trab_id_risco_fkey,
ADD CONSTRAINT riscos_x_acoes_proc_trab_id_risco_fkey 
    FOREIGN KEY (id_risco) REFERENCES riscos_trabalho(id);

ALTER TABLE riscos_x_acoes_proc_trab 
ADD COLUMN id_acao_controle UUID REFERENCES acoes_controle_proc_trab(id);

-- Índices para performance das novas tabelas
CREATE INDEX idx_subprocessos_processo ON subprocessos(id_processo);
CREATE INDEX idx_categoria_natureza ON categoria(id_natureza);
CREATE INDEX idx_subcategoria_categoria ON subcategoria(id_categoria);
CREATE INDEX idx_rel_risco_processo_risco ON rel_risco_processo(id_risco);
CREATE INDEX idx_rel_risco_processo_macro ON rel_risco_processo(id_macro);
CREATE INDEX idx_rel_risco_risco ON rel_risco(id_risco);
CREATE INDEX idx_rel_risco_natureza ON rel_risco(id_natureza);
CREATE INDEX idx_historico_indicadores_indicador ON historico_indicadores(id_indicador);
CREATE INDEX idx_historico_indicadores_data ON historico_indicadores(data_alteracao DESC);

-- Habilitar RLS (Row Level Security) para as novas tabelas
ALTER TABLE riscos_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE natureza ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes_controle_proc_trab ENABLE ROW LEVEL SECURITY;
ALTER TABLE rel_risco_processo ENABLE ROW LEVEL SECURITY;
ALTER TABLE rel_risco ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_indicadores ENABLE ROW LEVEL SECURITY;

-- Permissões Supabase para as novas tabelas
GRANT SELECT ON riscos_trabalho TO anon;
GRANT ALL PRIVILEGES ON riscos_trabalho TO authenticated;
GRANT SELECT ON subprocessos TO anon;
GRANT ALL PRIVILEGES ON subprocessos TO authenticated;
GRANT SELECT ON natureza TO anon;
GRANT ALL PRIVILEGES ON natureza TO authenticated;
GRANT SELECT ON categoria TO anon;
GRANT ALL PRIVILEGES ON categoria TO authenticated;
GRANT SELECT ON subcategoria TO anon;
GRANT ALL PRIVILEGES ON subcategoria TO authenticated;
GRANT SELECT ON acoes_controle_proc_trab TO anon;
GRANT ALL PRIVILEGES ON acoes_controle_proc_trab TO authenticated;
GRANT SELECT ON rel_risco_processo TO anon;
GRANT ALL PRIVILEGES ON rel_risco_processo TO authenticated;
GRANT SELECT ON rel_risco TO anon;
GRANT ALL PRIVILEGES ON rel_risco TO authenticated;
GRANT SELECT ON historico_indicadores TO anon;
GRANT ALL PRIVILEGES ON historico_indicadores TO authenticated;

-- Estrutura das 9 tabelas faltantes criada - pronta para receber dados reais

-- Comentários para documentação
COMMENT ON TABLE riscos_trabalho IS 'Tabela de riscos de trabalho identificados';
COMMENT ON TABLE subprocessos IS 'Tabela de subprocessos vinculados aos processos principais';
COMMENT ON TABLE natureza IS 'Tabela de natureza/tipo dos riscos';
COMMENT ON TABLE categoria IS 'Tabela de categorias dos riscos por natureza';
COMMENT ON TABLE subcategoria IS 'Tabela de subcategorias dos riscos por categoria';
COMMENT ON TABLE acoes_controle_proc_trab IS 'Tabela de ações de controle para processos de trabalho';
COMMENT ON TABLE rel_risco_processo IS 'Tabela de relacionamento entre riscos e macroprocessos';
COMMENT ON TABLE rel_risco IS 'Tabela de relacionamento entre riscos e sua classificação (natureza/categoria/subcategoria)';
COMMENT ON TABLE historico_indicadores IS 'Tabela de histórico de alterações nos indicadores';