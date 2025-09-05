-- Migração para alterar o campo 'priorizado' da tabela 006_matriz_riscos de TEXT para BOOLEAN
-- Data: 2025-01-15
-- Descrição: Converte o campo 'priorizado' de TEXT (Alto/Médio/Baixo) para BOOLEAN

-- 1. Remover a constraint CHECK atual do campo priorizado
ALTER TABLE "006_matriz_riscos" DROP CONSTRAINT IF EXISTS "006_matriz_riscos_priorizado_check";

-- 2. Adicionar uma nova coluna temporária do tipo BOOLEAN
ALTER TABLE "006_matriz_riscos" ADD COLUMN priorizado_temp BOOLEAN;

-- 3. Converter os valores existentes para a nova coluna
UPDATE "006_matriz_riscos" 
SET priorizado_temp = CASE 
    WHEN priorizado IN ('Alto', 'Médio') THEN TRUE
    ELSE FALSE
END;

-- 4. Remover a coluna antiga
ALTER TABLE "006_matriz_riscos" DROP COLUMN priorizado;

-- 5. Renomear a coluna temporária
ALTER TABLE "006_matriz_riscos" RENAME COLUMN priorizado_temp TO priorizado;

-- 6. Definir valor padrão como FALSE
ALTER TABLE "006_matriz_riscos" 
ALTER COLUMN priorizado SET DEFAULT FALSE;

-- 7. Atualizar o comentário da coluna
COMMENT ON COLUMN "006_matriz_riscos".priorizado IS 'Indica se o risco é priorizado (TRUE) ou não (FALSE)';

-- 8. Criar índice para otimizar consultas por priorização
CREATE INDEX IF NOT EXISTS idx_006_matriz_riscos_priorizado 
ON "006_matriz_riscos" (priorizado) 
WHERE deleted_at IS NULL;

-- Comentário da migração
COMMENT ON TABLE "006_matriz_riscos" IS 'Tabela principal da matriz de riscos - core do sistema. Campo priorizado alterado para BOOLEAN em 2025-01-15';