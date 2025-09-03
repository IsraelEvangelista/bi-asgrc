-- Criação do tipo ENUM para macroprocessos
CREATE TYPE tipo_macroprocesso_enum AS ENUM (
    'Estratégico',
    'Finalístico',
    'Apoio'
);

-- Tabela de áreas e gerências
CREATE TABLE areas_gerencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_area TEXT NOT NULL,
    sigla_area TEXT,
    gerencia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de macroprocessos
CREATE TABLE macroprocessos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_macroprocesso TEXT NOT NULL,
    tipo_macroprocesso tipo_macroprocesso_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de processos
CREATE TABLE processos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_macroprocesso UUID REFERENCES macroprocessos(id),
    nome_processo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de matriz de riscos
CREATE TABLE matriz_riscos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventos_riscos TEXT NOT NULL,
    probabilidade INTEGER CHECK (probabilidade BETWEEN 1 AND 5),
    impacto INTEGER CHECK (impacto BETWEEN 1 AND 5),
    severidade INTEGER GENERATED ALWAYS AS (probabilidade * impacto) STORED,
    classificacao TEXT CHECK (classificacao IN ('estrategico', 'operacional', 'financeiro', 'regulatorio', 'reputacional')),
    responsavel_risco TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento entre riscos e ações/processos/trabalhos
CREATE TABLE riscos_x_acoes_proc_trab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_risco UUID REFERENCES matriz_riscos(id),
    id_processo UUID REFERENCES processos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento entre ações e riscos
CREATE TABLE rel_acoes_riscos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_risco UUID REFERENCES matriz_riscos(id),
    id_acao UUID, -- Será referenciado após criação da tabela acoes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de indicadores
CREATE TABLE indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_risco UUID REFERENCES matriz_riscos(id),
    nome_indicador TEXT NOT NULL,
    responsavel_risco TEXT NOT NULL,
    meta_indicador FLOAT,
    valor_atual FLOAT,
    situacao_indicador TEXT CHECK (situacao_indicador IN ('Dentro da meta', 'Fora da meta', 'Em monitoramento')),
    periodicidade TEXT CHECK (periodicidade IN ('Mensal', 'Trimestral', 'Semestral', 'Anual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ações de mitigação
CREATE TABLE acoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_ref UUID REFERENCES acoes(id),
    desc_acao TEXT NOT NULL,
    area_executora JSONB NOT NULL,
    acao_transversal BOOLEAN DEFAULT FALSE,
    tipo_acao TEXT CHECK (tipo_acao IN ('Original', 'Alterada', 'Incluída')),
    prazo_implementacao DATE,
    novo_prazo DATE,
    status TEXT CHECK (status IN ('Não iniciada', 'Em implementação', 'Ações implementadas')),
    justificativa_observacao TEXT,
    impacto_atraso_nao_implementacao TEXT,
    desc_evidencia TEXT,
    situacao TEXT CHECK (situacao IN ('No prazo', 'Atrasado')),
    mitiga_fatores_risco TEXT,
    url TEXT,
    perc_implementacao FLOAT CHECK (perc_implementacao BETWEEN 0 AND 100),
    apuracao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar foreign key para rel_acoes_riscos após criação da tabela acoes
ALTER TABLE rel_acoes_riscos ADD CONSTRAINT fk_rel_acoes_riscos_acao FOREIGN KEY (id_acao) REFERENCES acoes(id);

-- Índices para performance
CREATE INDEX idx_indicadores_risco ON indicadores(id_risco);
CREATE INDEX idx_indicadores_responsavel ON indicadores(responsavel_risco);
CREATE INDEX idx_indicadores_situacao ON indicadores(situacao_indicador);
CREATE INDEX idx_acoes_status ON acoes(status);
CREATE INDEX idx_acoes_prazo ON acoes(prazo_implementacao);
CREATE INDEX idx_matriz_riscos_severidade ON matriz_riscos(severidade DESC);
CREATE INDEX idx_matriz_riscos_responsavel ON matriz_riscos(responsavel_risco);

-- Habilitar RLS (Row Level Security)
ALTER TABLE matriz_riscos ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas_gerencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE macroprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos_x_acoes_proc_trab ENABLE ROW LEVEL SECURITY;
ALTER TABLE rel_acoes_riscos ENABLE ROW LEVEL SECURITY;

-- Permissões Supabase
GRANT SELECT ON matriz_riscos TO anon;
GRANT ALL PRIVILEGES ON matriz_riscos TO authenticated;
GRANT SELECT ON indicadores TO anon;
GRANT ALL PRIVILEGES ON indicadores TO authenticated;
GRANT SELECT ON acoes TO anon;
GRANT ALL PRIVILEGES ON acoes TO authenticated;
GRANT SELECT ON areas_gerencias TO anon;
GRANT ALL PRIVILEGES ON areas_gerencias TO authenticated;
GRANT SELECT ON macroprocessos TO anon;
GRANT ALL PRIVILEGES ON macroprocessos TO authenticated;
GRANT SELECT ON processos TO anon;
GRANT ALL PRIVILEGES ON processos TO authenticated;
GRANT SELECT ON riscos_x_acoes_proc_trab TO anon;
GRANT ALL PRIVILEGES ON riscos_x_acoes_proc_trab TO authenticated;
GRANT SELECT ON rel_acoes_riscos TO anon;
GRANT ALL PRIVILEGES ON rel_acoes_riscos TO authenticated;

-- Estrutura das tabelas criada - pronta para receber dados reais