-- Migração para corrigir os valores possíveis do campo status na tabela 009_acoes
-- Data: 2025-01-14
-- Descrição: Atualizar constraint CHECK para permitir valores 'Em implementação', 'Implementada', 'Não iniciada' e NULL

-- 1. Remover a constraint CHECK existente
ALTER TABLE "009_acoes" DROP CONSTRAINT IF EXISTS "acoes_status_check";

-- 2. Adicionar nova constraint CHECK com os valores corretos e permitindo NULL
ALTER TABLE "009_acoes" ADD CONSTRAINT "acoes_status_check" 
  CHECK (status IS NULL OR status IN ('Em implementação', 'Implementada', 'Não iniciada'));

-- 3. Atualizar registros existentes com valores antigos para os novos valores
-- 'Ações implementadas' -> 'Implementada'
UPDATE "009_acoes" 
SET status = 'Implementada' 
WHERE status = 'Ações implementadas';

-- 4. Adicionar comentário na coluna para documentar os valores possíveis
COMMENT ON COLUMN "009_acoes".status IS 'Status da ação: Em implementação, Implementada, Não iniciada (permite NULL)';

-- 5. Verificar se existem outros valores que precisam ser mapeados
-- Esta query pode ser executada para verificar valores únicos antes da migração:
-- SELECT DISTINCT status FROM "009_acoes" WHERE status IS NOT NULL;