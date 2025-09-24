-- Migração para corrigir constraint do campo situacao
-- Remove constraint existente e cria nova com valores corretos

-- Verificar e remover constraint existente
DO $$
BEGIN
    -- Remove constraint se existir
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'acoes_situacao_check' 
        AND conrelid = '009_acoes'::regclass
    ) THEN
        ALTER TABLE "009_acoes" DROP CONSTRAINT acoes_situacao_check;
        RAISE NOTICE 'Constraint acoes_situacao_check removida';
    END IF;
END $$;

-- Criar nova constraint com valores corretos
ALTER TABLE "009_acoes" 
ADD CONSTRAINT acoes_situacao_check 
CHECK (situacao IS NULL OR situacao IN ('No Prazo', 'Atrasado'));