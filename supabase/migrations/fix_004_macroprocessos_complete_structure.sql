-- Migração para completar a estrutura da tabela 004_macroprocessos conforme PRD 6.4.1
-- Data: 2025-01-24
-- Descrição: Adicionar todos os campos faltantes na tabela 004_macroprocessos

-- Primeiro, adicionar novos valores ao enum se não existirem
DO $$
BEGIN
    -- Adicionar 'Finalístico' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Finalístico' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_macroprocesso_enum')) THEN
        ALTER TYPE tipo_macroprocesso_enum ADD VALUE 'Finalístico';
    END IF;
    
    -- Adicionar 'Gestão' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Gestão' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_macroprocesso_enum')) THEN
        ALTER TYPE tipo_macroprocesso_enum ADD VALUE 'Gestão';
    END IF;
    
    -- Adicionar 'Suporte' se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Suporte' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_macroprocesso_enum')) THEN
        ALTER TYPE tipo_macroprocesso_enum ADD VALUE 'Suporte';
    END IF;
END $$;

-- Commit implícito aqui

-- Renomear coluna nome_macroprocesso para macroprocesso (conforme PRD)
ALTER TABLE "004_macroprocessos" 
RENAME COLUMN nome_macroprocesso TO macroprocesso;

-- Remover coluna sigla duplicada (manter apenas sigla_macro)
ALTER TABLE "004_macroprocessos" 
DROP COLUMN IF EXISTS sigla;

-- Adicionar todos os campos faltantes conforme PRD
ALTER TABLE "004_macroprocessos" 
ADD COLUMN IF NOT EXISTS link_macro TEXT,
ADD COLUMN IF NOT EXISTS publicado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS data_termino_prevista DATE,
ADD COLUMN IF NOT EXISTS situacao TEXT,
ADD COLUMN IF NOT EXISTS planejamento_inicial TEXT,
ADD COLUMN IF NOT EXISTS mapeamento_situacao_atual TEXT,
ADD COLUMN IF NOT EXISTS desenho_situacao_futura TEXT,
ADD COLUMN IF NOT EXISTS monitoramento TEXT,
ADD COLUMN IF NOT EXISTS encerramento TEXT;

-- Atualizar comentários da tabela e colunas
COMMENT ON TABLE "004_macroprocessos" IS 'Tabela de macroprocessos organizacionais - estrutura completa conforme PRD 6.4.1';
COMMENT ON COLUMN "004_macroprocessos".id IS 'Identificador único do macroprocesso';
COMMENT ON COLUMN "004_macroprocessos".sigla_macro IS 'Sigla do macroprocesso';
COMMENT ON COLUMN "004_macroprocessos".tipo_macroprocesso IS 'Tipo do macroprocesso (Finalístico, Gestão, Suporte)';
COMMENT ON COLUMN "004_macroprocessos".macroprocesso IS 'Nome/descrição do macroprocesso';
COMMENT ON COLUMN "004_macroprocessos".link_macro IS 'Link para documentação do macroprocesso';
COMMENT ON COLUMN "004_macroprocessos".publicado IS 'Indica se o macroprocesso está publicado';
COMMENT ON COLUMN "004_macroprocessos".data_inicio IS 'Data de início do macroprocesso';
COMMENT ON COLUMN "004_macroprocessos".data_termino_prevista IS 'Data prevista para término';
COMMENT ON COLUMN "004_macroprocessos".situacao IS 'Situação atual do macroprocesso';
COMMENT ON COLUMN "004_macroprocessos".planejamento_inicial IS 'Descrição do planejamento inicial';
COMMENT ON COLUMN "004_macroprocessos".mapeamento_situacao_atual IS 'Mapeamento da situação atual';
COMMENT ON COLUMN "004_macroprocessos".desenho_situacao_futura IS 'Desenho da situação futura';
COMMENT ON COLUMN "004_macroprocessos".monitoramento IS 'Informações de monitoramento';
COMMENT ON COLUMN "004_macroprocessos".encerramento IS 'Informações de encerramento';
COMMENT ON COLUMN "004_macroprocessos".created_at IS 'Data de criação do registro';
COMMENT ON COLUMN "004_macroprocessos".updated_at IS 'Data da última atualização do registro';