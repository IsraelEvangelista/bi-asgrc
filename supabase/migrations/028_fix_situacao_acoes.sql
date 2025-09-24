-- Migração para corrigir o loop infinito na atualização de situação das ações
-- Remove triggers problemáticos e implementa solução mais simples

-- 1. Remover todos os triggers e funções que causam recursão
DROP TRIGGER IF EXISTS trigger_atualizar_situacao_009_acoes ON "009_acoes";
DROP TRIGGER IF EXISTS trigger_atualizar_situacao_023_hist_acao ON "023_hist_acao";
DROP TRIGGER IF EXISTS trigger_atualizar_situacao_022_fato_prazo ON "022_fato_prazo";

DROP FUNCTION IF EXISTS trigger_atualizar_situacao_por_acao();
DROP FUNCTION IF EXISTS trigger_atualizar_situacao_por_hist();
DROP FUNCTION IF EXISTS trigger_atualizar_situacao_por_prazo();
DROP FUNCTION IF EXISTS atualizar_situacao_acao(uuid);
DROP FUNCTION IF EXISTS atualizar_todas_situacoes();
DROP FUNCTION IF EXISTS calcular_situacao_acao(uuid) CASCADE;

-- 2. Manter apenas a função de cálculo (sem triggers automáticos)
-- Esta função será chamada manualmente quando necessário
CREATE OR REPLACE FUNCTION calcular_situacao_acao(acao_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    perc_implementacao_atual numeric;
    prazo_referencia date;
    novo_prazo_acao date;
BEGIN
    -- Buscar o percentual de implementação mais recente
    SELECT perc_implementacao INTO perc_implementacao_atual
    FROM "023_hist_acao"
    WHERE id_acao = acao_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não há histórico, retorna NULL
    IF perc_implementacao_atual IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Buscar novo_prazo da tabela 009_acoes
    SELECT novo_prazo INTO novo_prazo_acao
    FROM "009_acoes"
    WHERE id = acao_id;
    
    -- Determinar qual prazo usar (novo_prazo tem prioridade)
    IF novo_prazo_acao IS NOT NULL THEN
        prazo_referencia := novo_prazo_acao;
    ELSE
        -- Usar prazo_implementacao da tabela 009_acoes
        SELECT prazo_implementacao INTO prazo_referencia
        FROM "009_acoes"
        WHERE id = acao_id;
    END IF;
    
    -- Se não há prazo definido, retorna NULL
    IF prazo_referencia IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Aplicar a regra de negócio
    IF perc_implementacao_atual = 100.00 OR CURRENT_DATE <= prazo_referencia THEN
        RETURN 'No Prazo';
    ELSE
        RETURN 'Atrasado';
    END IF;
END;
$$;

-- 3. Função para atualizar situação de uma ação específica (sem recursão)
CREATE OR REPLACE FUNCTION atualizar_situacao_acao_manual(acao_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "009_acoes"
    SET situacao = calcular_situacao_acao(acao_id)
    WHERE id = acao_id;
END;
$$;

-- 4. Função para atualizar todas as situações (execução manual)
CREATE OR REPLACE FUNCTION atualizar_todas_situacoes_manual()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    acao_record RECORD;
BEGIN
    FOR acao_record IN SELECT id FROM "009_acoes" LOOP
        UPDATE "009_acoes"
        SET situacao = calcular_situacao_acao(acao_record.id)
        WHERE id = acao_record.id;
    END LOOP;
END;
$$;

-- 5. Limpar dados existentes no campo prazo_implementacao
UPDATE "009_acoes" SET prazo_implementacao = NULL;

-- 6. Atualizar campo novo_prazo com a data mais recente da tabela 022_fato_prazo
UPDATE "009_acoes" 
SET novo_prazo = (
    SELECT MAX(novo_prazo)
    FROM "022_fato_prazo"
    WHERE id_acao = "009_acoes".id
)
WHERE EXISTS (
    SELECT 1 
    FROM "022_fato_prazo" 
    WHERE id_acao = "009_acoes".id
);

-- 7. Aplicar a função de cálculo a todos os registros existentes
SELECT atualizar_todas_situacoes_manual();

-- 8. Comentários sobre uso futuro
-- Para atualizar a situação de uma ação específica, use:
-- SELECT atualizar_situacao_acao_manual('uuid-da-acao');
--
-- Para atualizar todas as situações, use:
-- SELECT atualizar_todas_situacoes_manual();
--
-- A função calcular_situacao_acao(uuid) pode ser usada para consultas:
-- SELECT id, situacao, calcular_situacao_acao(id) as situacao_calculada FROM "009_acoes";