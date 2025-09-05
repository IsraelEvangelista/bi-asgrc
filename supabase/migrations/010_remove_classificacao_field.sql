-- Migração para remover o campo 'classificacao' da tabela 006_matriz_riscos
-- Data: 2025-01-15
-- Motivo: Campo não deve existir conforme especificação atualizada do PRD

-- Remove o campo classificacao da tabela 006_matriz_riscos
ALTER TABLE "006_matriz_riscos" DROP COLUMN IF EXISTS "classificacao";

-- Comentário da migração
COMMENT ON TABLE "006_matriz_riscos" IS 'Tabela principal da matriz de riscos - core do sistema. Campo classificacao removido em 2025-01-15';