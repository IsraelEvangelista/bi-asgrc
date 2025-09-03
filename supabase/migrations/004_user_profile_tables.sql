-- Migração 004: Criação das tabelas de usuários e perfis
-- Adicionando tabelas de perfis e usuários para controle de acesso

-- Tabela de perfis (cargos/funções)
CREATE TABLE perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL, -- Nome do cargo/função
    descricao TEXT, -- Descrição detalhada do perfil
    area_id UUID REFERENCES areas_gerencias(id), -- Área/gerência do perfil
    acessos_interfaces JSONB NOT NULL DEFAULT '[]'::jsonb, -- Lista de interfaces permitidas
    regras_permissoes JSONB NOT NULL DEFAULT '{}'::jsonb, -- Regras de acesso, edição, relatórios
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE, -- Email único para login
    perfil_id UUID REFERENCES perfis(id), -- Referência ao perfil
    area_gerencia_id UUID REFERENCES areas_gerencias(id), -- Gerência do usuário
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_perfis_area ON perfis(area_id);
CREATE INDEX idx_perfis_ativo ON perfis(ativo);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil_id);
CREATE INDEX idx_usuarios_area ON usuarios(area_gerencia_id);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Habilitar RLS (Row Level Security)
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Permissões Supabase
GRANT SELECT ON perfis TO anon;
GRANT ALL PRIVILEGES ON perfis TO authenticated;
GRANT SELECT ON usuarios TO anon;
GRANT ALL PRIVILEGES ON usuarios TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE perfis IS 'Tabela de perfis/cargos com definições de acesso e permissões';
COMMENT ON COLUMN perfis.acessos_interfaces IS 'JSON array com lista de interfaces que o perfil pode acessar';
COMMENT ON COLUMN perfis.regras_permissoes IS 'JSON object com regras específicas de permissões (visualizar, editar, relatórios, etc.)';
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema com referências a perfis e áreas';
COMMENT ON COLUMN usuarios.email IS 'Email único usado para autenticação';