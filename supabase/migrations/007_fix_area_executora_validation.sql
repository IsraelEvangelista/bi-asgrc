-- Migração para corrigir validação do campo area_executora na tabela 009_acoes
-- Data: 2025-01-15
-- Objetivo: Permitir null, array vazio [] ou UUIDs válidos no campo area_executora

-- 1. Remover a constraint existente
ALTER TABLE "009_acoes" DROP CONSTRAINT IF EXISTS check_area_executora_valid_ids;

-- 2. Recriar a função de validação com lógica corrigida
CREATE OR REPLACE FUNCTION validate_area_executora_ids(area_ids JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    area_id UUID;
    area_count INTEGER;
BEGIN
    -- Permitir NULL
    IF area_ids IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se o JSONB é um array
    IF jsonb_typeof(area_ids) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Permitir array vazio
    IF jsonb_array_length(area_ids) = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar cada UUID no array
    FOR area_id IN SELECT jsonb_array_elements_text(area_ids)::UUID
    LOOP
        SELECT COUNT(*) INTO area_count
        FROM "003_areas_gerencias"
        WHERE id = area_id;
        
        -- Se algum UUID não existir, retornar FALSE
        IF area_count = 0 THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro (ex: UUID inválido), retornar FALSE
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar a constraint com a função corrigida
ALTER TABLE "009_acoes" 
ADD CONSTRAINT check_area_executora_valid_ids 
CHECK (validate_area_executora_ids(area_executora));

-- 4. Atualizar comentário da função
COMMENT ON FUNCTION validate_area_executora_ids(JSONB) IS 
'Valida se todos os UUIDs no array JSONB existem na tabela 003_areas_gerencias. Permite NULL e array vazio.';

COMMENT ON CONSTRAINT check_area_executora_valid_ids ON "009_acoes" IS 
'Garante que todos os UUIDs no campo area_executora existam na tabela 003_areas_gerencias. Permite NULL e array vazio.';

-- 5. Exemplos de valores válidos para area_executora:
-- NULL: permitido
-- []: array vazio, permitido
-- ["uuid1"]: array com um UUID válido
-- ["uuid1", "uuid2"]: array com múltiplos UUIDs válidos
-- "invalid": não é array, será rejeitado
-- ["invalid-uuid"]: UUID inválido, será rejeitado
-- ["uuid-inexistente"]: UUID válido mas não existe na tabela, será rejeitado