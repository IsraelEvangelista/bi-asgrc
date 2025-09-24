-- Migração para implementar regra de preenchimento automático do campo 'situacao' na tabela 009_acoes
-- Data: 2025-01-24
-- Descrição: Implementa lógica completa de cálculo automático da situação baseada em percentual de implementação e prazos

-- Configurar timezone para Fortaleza-CE
SET TIME ZONE 'America/Fortaleza';

-- REMOVER TODOS OS TRIGGERS E FUNÇÕES RELACIONADOS PRIMEIRO
DROP TRIGGER IF EXISTS trigger_hist_acao_situacao ON "023_hist_acao";
DROP TRIGGER IF EXISTS trigger_fato_prazo_situacao ON "022_fato_prazo";
DROP TRIGGER IF EXISTS trigger_acao_situacao ON "009_acoes";
DROP TRIGGER IF EXISTS trigger_atualizar_situacao_prazo_implementacao ON "009_acoes";
DROP TRIGGER IF EXISTS trigger_update_situacao_009_acoes ON "009_acoes";
DROP TRIGGER IF EXISTS trigger_update_situacao_023_hist_acao ON "023_hist_acao";
DROP TRIGGER IF EXISTS trigger_update_situacao_022_fato_prazo ON "022_fato_prazo";
DROP TRIGGER IF EXISTS trigger_acoes_atualizar_situacao ON "009_acoes";

DROP FUNCTION IF EXISTS trigger_atualizar_situacao_por_hist_acao() CASCADE;
DROP FUNCTION IF EXISTS trigger_atualizar_situacao_por_fato_prazo() CASCADE;
DROP FUNCTION IF EXISTS trigger_atualizar_situacao_por_acao() CASCADE;
DROP FUNCTION IF EXISTS trigger_atualizar_situacao_prazo_implementacao() CASCADE;
DROP FUNCTION IF EXISTS atualizar_todas_situacoes() CASCADE;
DROP FUNCTION IF EXISTS atualizar_situacao_acao(UUID) CASCADE;
DROP FUNCTION IF EXISTS calcular_situacao_acao(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_situacao_009_acoes() CASCADE;
DROP FUNCTION IF EXISTS update_situacao_023_hist_acao() CASCADE;
DROP FUNCTION IF EXISTS update_situacao_022_fato_prazo() CASCADE;

-- 1. LIMPEZA DOS DADOS EXISTENTES NO CAMPO prazo_implementacao
UPDATE "009_acoes" SET prazo_implementacao = NULL;

-- 2. ATUALIZAR CAMPO novo_prazo COM A DATA MAIS RECENTE DA TABELA 022_fato_prazo
UPDATE "009_acoes" 
SET novo_prazo = (
    SELECT MAX(novo_prazo)
    FROM "022_fato_prazo" fp
    WHERE fp.id_acao = "009_acoes".id
    AND fp.novo_prazo IS NOT NULL
)
WHERE EXISTS (
    SELECT 1 
    FROM "022_fato_prazo" fp 
    WHERE fp.id_acao = "009_acoes".id 
    AND fp.novo_prazo IS NOT NULL
);

-- 3. CRIAR FUNÇÃO PARA CALCULAR SITUAÇÃO DA AÇÃO
CREATE OR REPLACE FUNCTION calcular_situacao_acao(acao_id UUID)
RETURNS TEXT AS $$
DECLARE
    perc_implementacao_atual DECIMAL(5,2);
    prazo_referencia DATE;
    data_atual DATE := CURRENT_DATE;
BEGIN
    -- Buscar o percentual de implementação mais recente
    SELECT perc_implementacao INTO perc_implementacao_atual
    FROM "023_hist_acao"
    WHERE id_acao = acao_id
    AND perc_implementacao IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não há histórico de implementação, retorna NULL
    IF perc_implementacao_atual IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Determinar qual prazo usar (novo_prazo tem prioridade sobre prazo_implementacao)
    SELECT COALESCE(novo_prazo, prazo_implementacao) INTO prazo_referencia
    FROM "009_acoes"
    WHERE id = acao_id;
    
    -- Se não há prazo definido, retorna NULL
    IF prazo_referencia IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Aplicar a lógica de situação
    IF perc_implementacao_atual = 100 OR data_atual <= prazo_referencia THEN
        RETURN 'No Prazo';
    ELSIF perc_implementacao_atual < 100 AND data_atual > prazo_referencia THEN
        RETURN 'Atrasado';
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR SITUAÇÃO DE UMA AÇÃO
CREATE OR REPLACE FUNCTION atualizar_situacao_acao(acao_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE "009_acoes"
    SET situacao = calcular_situacao_acao(acao_id)
    WHERE id = acao_id;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR FUNÇÃO PARA ATUALIZAR TODAS AS SITUAÇÕES
CREATE OR REPLACE FUNCTION atualizar_todas_situacoes()
RETURNS VOID AS $$
DECLARE
    acao_record RECORD;
BEGIN
    FOR acao_record IN SELECT id FROM "009_acoes" LOOP
        PERFORM atualizar_situacao_acao(acao_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA

-- Trigger para atualizar situação quando histórico de ação é modificado
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_por_hist_acao()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT e UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM atualizar_situacao_acao(NEW.id_acao);
        RETURN NEW;
    END IF;
    
    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        PERFORM atualizar_situacao_acao(OLD.id_acao);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar situação quando fato_prazo é modificado
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_por_fato_prazo()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT e UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Atualizar novo_prazo na tabela 009_acoes
        UPDATE "009_acoes" 
        SET novo_prazo = (
            SELECT MAX(novo_prazo)
            FROM "022_fato_prazo" fp
            WHERE fp.id_acao = NEW.id_acao
            AND fp.novo_prazo IS NOT NULL
        )
        WHERE id = NEW.id_acao;
        
        -- Atualizar situação
        PERFORM atualizar_situacao_acao(NEW.id_acao);
        RETURN NEW;
    END IF;
    
    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        -- Atualizar novo_prazo na tabela 009_acoes
        UPDATE "009_acoes" 
        SET novo_prazo = (
            SELECT MAX(novo_prazo)
            FROM "022_fato_prazo" fp
            WHERE fp.id_acao = OLD.id_acao
            AND fp.novo_prazo IS NOT NULL
        )
        WHERE id = OLD.id_acao;
        
        -- Atualizar situação
        PERFORM atualizar_situacao_acao(OLD.id_acao);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar situação quando ação é modificada
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_por_acao()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT e UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM atualizar_situacao_acao(NEW.id);
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR OS TRIGGERS
CREATE TRIGGER trigger_hist_acao_situacao
    AFTER INSERT OR UPDATE OR DELETE ON "023_hist_acao"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_por_hist_acao();

CREATE TRIGGER trigger_fato_prazo_situacao
    AFTER INSERT OR UPDATE OR DELETE ON "022_fato_prazo"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_por_fato_prazo();

CREATE TRIGGER trigger_acao_situacao
    AFTER INSERT OR UPDATE ON "009_acoes"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_por_acao();

-- 8. APLICAR A FUNÇÃO A TODOS OS REGISTROS EXISTENTES
SELECT atualizar_todas_situacoes();

-- Comentário sobre a migração
COMMENT ON FUNCTION calcular_situacao_acao(UUID) IS 'Função que calcula a situação de uma ação baseada no percentual de implementação mais recente e nos prazos (novo_prazo tem prioridade sobre prazo_implementacao)';
COMMENT ON FUNCTION atualizar_situacao_acao(UUID) IS 'Função que atualiza a situação de uma ação específica';
COMMENT ON FUNCTION atualizar_todas_situacoes() IS 'Função que atualiza a situação de todas as ações';

-- Log da migração (criar tabela se não existir)
CREATE TABLE IF NOT EXISTS "migration_log" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO "migration_log" (migration_name, executed_at, description) 
VALUES (
    '027_auto_situacao_acoes', 
    NOW(), 
    'Implementação da regra de preenchimento automático do campo situacao na tabela 009_acoes com base em perc_implementacao e prazos'
) ON CONFLICT DO NOTHING;