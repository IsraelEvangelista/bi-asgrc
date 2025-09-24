-- Migração para implementar atualização automática do campo novo_prazo
-- baseado na tabela 022_fato_prazo

-- Função para atualizar novo_prazo de uma ação específica
CREATE OR REPLACE FUNCTION atualizar_novo_prazo_acao(p_id_acao uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_novo_prazo date;
BEGIN
    -- Buscar a data mais recente de novo_prazo da tabela 022_fato_prazo
    SELECT MAX(novo_prazo)
    INTO v_novo_prazo
    FROM "022_fato_prazo"
    WHERE id_acao = p_id_acao
    AND novo_prazo IS NOT NULL;
    
    -- Atualizar o campo novo_prazo na tabela 009_acoes
    UPDATE "009_acoes"
    SET novo_prazo = v_novo_prazo
    WHERE id = p_id_acao;
END;
$$;

-- Função para atualizar novo_prazo de todas as ações
CREATE OR REPLACE FUNCTION atualizar_todos_novos_prazos()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    acao_record RECORD;
BEGIN
    -- Iterar sobre todas as ações
    FOR acao_record IN 
        SELECT DISTINCT id FROM "009_acoes"
    LOOP
        PERFORM atualizar_novo_prazo_acao(acao_record.id);
    END LOOP;
END;
$$;

-- Trigger para atualizar novo_prazo quando houver mudanças na tabela 022_fato_prazo
CREATE OR REPLACE FUNCTION trigger_atualizar_novo_prazo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualizar novo_prazo da ação relacionada
    PERFORM atualizar_novo_prazo_acao(NEW.id_acao);
    
    -- Atualizar situação da ação após mudança no prazo
    PERFORM atualizar_situacao_acao_manual(NEW.id_acao);
    
    RETURN NEW;
END;
$$;

-- Criar trigger na tabela 022_fato_prazo
DROP TRIGGER IF EXISTS trigger_novo_prazo_fato_prazo ON "022_fato_prazo";
CREATE TRIGGER trigger_novo_prazo_fato_prazo
    AFTER INSERT OR UPDATE OF novo_prazo ON "022_fato_prazo"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_novo_prazo();

-- Aplicar atualização para todas as ações existentes
SELECT atualizar_todos_novos_prazos();