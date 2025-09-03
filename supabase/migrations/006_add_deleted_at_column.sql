-- Adicionar coluna deleted_at para implementar soft delete na tabela 006_matriz_riscos
ALTER TABLE "006_matriz_riscos" 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Adicionar comentário explicativo na coluna
COMMENT ON COLUMN "006_matriz_riscos".deleted_at IS 'Timestamp para soft delete - quando preenchido, indica que o registro foi logicamente excluído';

-- Criar índice para otimizar consultas que filtram por registros não deletados
CREATE INDEX idx_006_matriz_riscos_deleted_at ON "006_matriz_riscos" (deleted_at) WHERE deleted_at IS NULL;