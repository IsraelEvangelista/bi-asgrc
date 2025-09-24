-- Migração para implementar regra de preenchimento automático do campo 'situacao' na tabela '009_acoes'
-- Baseado no 'perc_implementacao' mais recente da tabela '023_hist_acao' e comparação de prazos
-- Data: 24/01/2025

-- Configurar timezone para Fortaleza-CE
SET TIME ZONE 'America/Fortaleza';

-- 1. Limpar dados de situacao existentes na tabela '009_acoes'
UPDATE "009_acoes" SET situacao = NULL;

-- 2. Criar função para calcular a situacao baseada no percentual de implementação mais recente e prazos
CREATE OR REPLACE FUNCTION calcular_situacao_acao(p_id_acao UUID)
RETURNS TEXT AS $$
DECLARE
    v_perc_implementacao NUMERIC;
    v_prazo_comparacao DATE;
    v_novo_prazo DATE;
    v_situacao TEXT;
BEGIN
    -- Buscar o percentual de implementação mais recente para a ação
    SELECT perc_implementacao 
    INTO v_perc_implementacao
    FROM "023_hist_acao" 
    WHERE id_acao = p_id_acao 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Se não há histórico ou perc_implementacao é NULL, retornar NULL
    IF v_perc_implementacao IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Buscar o novo_prazo mais recente da tabela 022_fato_prazo
    SELECT novo_prazo 
    INTO v_novo_prazo
    FROM "022_fato_prazo" 
    WHERE id_acao = p_id_acao 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Se existe novo_prazo, usar ele; senão usar prazo_implementacao da tabela 009_acoes
    IF v_novo_prazo IS NOT NULL THEN
        v_prazo_comparacao := v_novo_prazo;
    ELSE
        SELECT prazo_implementacao 
        INTO v_prazo_comparacao
        FROM "009_acoes" 
        WHERE id = p_id_acao;
    END IF;
    
    -- Se não há prazo para comparar, retornar NULL
    IF v_prazo_comparacao IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Aplicar regras de negócio:
    -- Se perc_implementacao = 100 OU data atual <= prazo: "No Prazo"
    -- Se perc_implementacao < 100 E data atual > prazo: "Atrasado"
    IF v_perc_implementacao = 100.00 OR CURRENT_DATE <= v_prazo_comparacao THEN
        v_situacao := 'No Prazo';
    ELSIF v_perc_implementacao < 100.00 AND CURRENT_DATE > v_prazo_comparacao THEN
        v_situacao := 'Atrasado';
    ELSE
        v_situacao := 'No Prazo'; -- Caso padrão
    END IF;
    
    RETURN v_situacao;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para atualizar automaticamente a situacao quando houver mudanças na tabela 023_hist_acao
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_acao()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar a situacao da ação relacionada
    UPDATE "009_acoes" 
    SET situacao = calcular_situacao_acao(NEW.id_acao),
        updated_at = NOW()
    WHERE id = NEW.id_acao;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela 023_hist_acao
DROP TRIGGER IF EXISTS trigger_hist_acao_atualizar_situacao ON "023_hist_acao";
CREATE TRIGGER trigger_hist_acao_atualizar_situacao
    AFTER INSERT OR UPDATE OF perc_implementacao ON "023_hist_acao"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_acao();

-- 4. Criar trigger para atualizar automaticamente a situacao quando houver mudanças na tabela 022_fato_prazo
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_novo_prazo()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar a situacao da ação relacionada
    UPDATE "009_acoes" 
    SET situacao = calcular_situacao_acao(NEW.id_acao),
        updated_at = NOW()
    WHERE id = NEW.id_acao;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela 022_fato_prazo
DROP TRIGGER IF EXISTS trigger_fato_prazo_atualizar_situacao ON "022_fato_prazo";
CREATE TRIGGER trigger_fato_prazo_atualizar_situacao
    AFTER INSERT OR UPDATE OF novo_prazo ON "022_fato_prazo"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_novo_prazo();

-- 5. Criar trigger para atualizar automaticamente a situacao quando houver mudanças no prazo_implementacao da tabela 009_acoes
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_prazo_implementacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar a situacao da ação
    NEW.situacao := calcular_situacao_acao(NEW.id);
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela 009_acoes
DROP TRIGGER IF EXISTS trigger_acoes_atualizar_situacao ON "009_acoes";
CREATE TRIGGER trigger_acoes_atualizar_situacao
    BEFORE UPDATE OF prazo_implementacao ON "009_acoes"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_prazo_implementacao();

-- 6. Aplicar a função para calcular a situacao de todas as ações existentes
UPDATE "009_acoes" 
SET situacao = calcular_situacao_acao(id),
    updated_at = NOW();

-- Comentários sobre a implementação
COMMENT ON FUNCTION calcular_situacao_acao(UUID) IS 'Função que calcula a situacao de uma ação baseada no percentual de implementação mais recente e comparação de prazos';
COMMENT ON FUNCTION trigger_atualizar_situacao_acao() IS 'Trigger function para atualizar automaticamente a situacao quando há mudanças no histórico de ações';
COMMENT ON FUNCTION trigger_atualizar_situacao_novo_prazo() IS 'Trigger function para atualizar automaticamente a situacao quando há mudanças nos novos prazos';
COMMENT ON FUNCTION trigger_atualizar_situacao_prazo_implementacao() IS 'Trigger function para atualizar automaticamente a situacao quando há mudanças no prazo de implementação';

-- Migração aplicada com sucesso
-- Implementação de regra automática para preenchimento do campo situacao na tabela 009_acoes
-- baseado em percentual de implementação e prazos