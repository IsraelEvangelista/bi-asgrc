-- Migração: Permitir valores nulos no campo 'indicador_risco' da tabela '008_indicadores'
-- Data: 2025-01-10
-- Descrição: Altera a constraint NOT NULL do campo 'indicador_risco' para permitir valores nulos
--            mantendo todos os outros aspectos da tabela inalterados

-- Alterar o campo 'indicador_risco' para aceitar valores nulos
ALTER TABLE "008_indicadores" 
ALTER COLUMN indicador_risco DROP NOT NULL;

-- Adicionar comentário explicativo sobre a alteração
COMMENT ON COLUMN "008_indicadores".indicador_risco IS 'Nome/descrição do indicador de risco (aceita valores nulos)';