-- Migração para implementar regra de preenchimento automático do campo 'status' na tabela '009_acoes'
-- Baseado no 'perc_implementacao' mais recente da tabela '023_hist_acao'
-- Data: 24/01/2025

-- 1. Limpar dados de status existentes na tabela '009_acoes'
UPDATE "009_acoes" SET status = NULL;

-- 2. Criar função para calcular o status baseado no percentual de implementação mais recente
CREATE OR REPLACE FUNCTION calcular_status_acao(p_id_acao UUID)
RETURNS TEXT AS $$
DECLARE
    v_perc_implementacao NUMERIC;
    v_status TEXT;
BEGIN
    -- Buscar o percentual de implementação mais recente para a ação
    SELECT perc_implementacao 
    INTO v_perc_implementacao
    FROM "023_hist_acao" 
    WHERE id_acao = p_id_acao 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Se não encontrou histórico, retorna NULL
    IF v_perc_implementacao IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Aplicar regras de negócio para definir o status
    IF v_perc_implementacao = 0.00 THEN
        v_status := 'Não iniciada';
    ELSIF v_perc_implementacao > 0 AND v_perc_implementacao < 100 THEN
        v_status := 'Em implementação';
    ELSIF v_perc_implementacao = 100.00 THEN
        v_status := 'Implementada';
    ELSE
        v_status := NULL;
    END IF;
    
    RETURN v_status;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função trigger para atualizar automaticamente o status
CREATE OR REPLACE FUNCTION trigger_atualizar_status_acao()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o status da ação relacionada
    UPDATE "009_acoes" 
    SET status = calcular_status_acao(NEW.id_acao),
        updated_at = NOW()
    WHERE id = NEW.id_acao;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger na tabela '023_hist_acao' para executar após INSERT ou UPDATE
DROP TRIGGER IF EXISTS trigger_hist_acao_status ON "023_hist_acao";
CREATE TRIGGER trigger_hist_acao_status
    AFTER INSERT OR UPDATE OF perc_implementacao ON "023_hist_acao"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_status_acao();

-- 5. Atualizar o status de todas as ações existentes baseado no histórico atual
UPDATE "009_acoes" 
SET status = calcular_status_acao(id),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT id_acao 
    FROM "023_hist_acao"
);

-- 6. Comentários para documentação
COMMENT ON FUNCTION calcular_status_acao(UUID) IS 'Função que calcula o status da ação baseado no percentual de implementação mais recente do histórico';
COMMENT ON FUNCTION trigger_atualizar_status_acao() IS 'Função trigger que atualiza automaticamente o status da ação quando há mudanças no histórico';
COMMENT ON TRIGGER trigger_hist_acao_status ON "023_hist_acao" IS 'Trigger que executa a atualização automática do status quando há inserção ou atualização do percentual de implementação';

-- Regras implementadas:
-- perc_implementacao = 0.00 → status = 'Não iniciada'
-- perc_implementacao > 0 e < 100 → status = 'Em implementação' 
-- perc_implementacao = 100.00 → status = 'Implementada'
-- perc_implementacao IS NULL → status = NULL