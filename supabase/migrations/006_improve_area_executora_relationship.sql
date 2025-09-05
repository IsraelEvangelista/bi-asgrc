-- Migração para melhorar o relacionamento entre 009_acoes.area_executora e 003_areas_gerencias
-- Data: 2025-01-15
-- Objetivo: Implementar validação de integridade referencial para o campo JSONB area_executora

-- 1. Criar função para validar se todos os UUIDs no array JSONB existem na tabela 003_areas_gerencias
CREATE OR REPLACE FUNCTION validate_area_executora_ids(area_ids JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    area_id UUID;
    area_count INTEGER;
BEGIN
    -- Verificar se o JSONB é um array
    IF jsonb_typeof(area_ids) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se o array não está vazio
    IF jsonb_array_length(area_ids) = 0 THEN
        RETURN FALSE;
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

-- 2. Adicionar constraint de validação na tabela 009_acoes
ALTER TABLE "009_acoes" 
ADD CONSTRAINT check_area_executora_valid_ids 
CHECK (validate_area_executora_ids(area_executora));

-- 3. Criar índice GIN para melhorar performance de consultas no campo JSONB
CREATE INDEX IF NOT EXISTS idx_009_acoes_area_executora_gin 
ON "009_acoes" USING GIN (area_executora);

-- 4. Criar função auxiliar para consultas de ações por área executora
CREATE OR REPLACE FUNCTION get_acoes_by_area_executora(area_id UUID)
RETURNS TABLE(
    id UUID,
    desc_acao TEXT,
    area_executora JSONB,
    status TEXT,
    prazo_implementacao DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.desc_acao,
        a.area_executora,
        a.status,
        a.prazo_implementacao
    FROM "009_acoes" a
    WHERE a.area_executora @> to_jsonb(ARRAY[area_id]);
END;
$$ LANGUAGE plpgsql;

-- 5. Criar função para obter informações das áreas executoras de uma ação
CREATE OR REPLACE FUNCTION get_areas_executoras_info(acao_id UUID)
RETURNS TABLE(
    area_id UUID,
    sigla_area TEXT,
    gerencia TEXT,
    diretoria TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ag.id,
        ag.sigla_area,
        ag.gerencia,
        ag.diretoria
    FROM "009_acoes" a
    CROSS JOIN jsonb_array_elements_text(a.area_executora) AS area_uuid
    JOIN "003_areas_gerencias" ag ON ag.id = area_uuid::UUID
    WHERE a.id = acao_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Adicionar comentários para documentação
COMMENT ON FUNCTION validate_area_executora_ids(JSONB) IS 
'Valida se todos os UUIDs no array JSONB existem na tabela 003_areas_gerencias';

COMMENT ON FUNCTION get_acoes_by_area_executora(UUID) IS 
'Retorna todas as ações que têm uma área específica como executora';

COMMENT ON FUNCTION get_areas_executoras_info(UUID) IS 
'Retorna informações detalhadas das áreas executoras de uma ação específica';

COMMENT ON CONSTRAINT check_area_executora_valid_ids ON "009_acoes" IS 
'Garante que todos os UUIDs no campo area_executora existam na tabela 003_areas_gerencias';

-- 7. Exemplo de uso do campo area_executora:
-- INSERT INTO "009_acoes" (desc_acao, area_executora) 
-- VALUES ('Ação de exemplo', '["uuid1", "uuid2", "uuid3"]'::jsonb);

-- 8. Exemplo de consulta para buscar ações por área:
-- SELECT * FROM get_acoes_by_area_executora('uuid-da-area');

-- 9. Exemplo de consulta para obter áreas de uma ação:
-- SELECT * FROM get_areas_executoras_info('uuid-da-acao');