-- Migração para corrigir a regra de persistência automática do atributo 'situacao'
-- na tabela 009_acoes conforme especificações do usuário
-- Data: 2025-01-24

-- Configurar timezone para Fortaleza-CE
SET TIME ZONE 'America/Fortaleza';

-- 1. Remover função existente e recriar com a lógica correta
DROP FUNCTION IF EXISTS calcular_situacao_acao(uuid) CASCADE;

-- 2. Criar função corrigida para calcular situacao
CREATE OR REPLACE FUNCTION calcular_situacao_acao(acao_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    prazo_implementacao_acao date;
    novo_prazo_acao date;
    prazo_referencia date;
    data_atual date := CURRENT_DATE;
BEGIN
    -- Buscar prazo_implementacao e novo_prazo da ação
    SELECT prazo_implementacao, novo_prazo 
    INTO prazo_implementacao_acao, novo_prazo_acao
    FROM "009_acoes"
    WHERE id = acao_id;
    
    -- Determinar qual prazo usar para comparação
    -- Se novo_prazo não é null, usar novo_prazo
    -- Se novo_prazo é null, usar prazo_implementacao
    IF novo_prazo_acao IS NOT NULL THEN
        prazo_referencia := novo_prazo_acao;
    ELSE
        prazo_referencia := prazo_implementacao_acao;
    END IF;
    
    -- Se não há prazo definido, retorna NULL
    IF prazo_referencia IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Aplicar regras de negócio:
    -- Se data atual <= data de referência: "No Prazo"
    -- Se data atual > data de referência: "Atrasado"
    IF data_atual <= prazo_referencia THEN
        RETURN 'No Prazo';
    ELSE
        RETURN 'Atrasado';
    END IF;
END;
$$;

-- 3. Criar função para atualizar situacao de uma ação específica
CREATE OR REPLACE FUNCTION atualizar_situacao_acao(acao_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "009_acoes"
    SET situacao = calcular_situacao_acao(acao_id),
        updated_at = NOW()
    WHERE id = acao_id;
END;
$$;

-- 4. Criar função para atualizar todas as situações
CREATE OR REPLACE FUNCTION atualizar_todas_situacoes()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    acao_record RECORD;
BEGIN
    FOR acao_record IN 
        SELECT id FROM "009_acoes" 
        WHERE prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL
    LOOP
        UPDATE "009_acoes"
        SET situacao = calcular_situacao_acao(acao_record.id),
            updated_at = NOW()
        WHERE id = acao_record.id;
    END LOOP;
END;
$$;

-- 5. Criar trigger para atualizar automaticamente quando houver mudanças nos prazos
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_por_prazo()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT e UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Só atualizar se houve mudança nos campos de prazo
        IF (TG_OP = 'INSERT') OR 
           (OLD.prazo_implementacao IS DISTINCT FROM NEW.prazo_implementacao) OR
           (OLD.novo_prazo IS DISTINCT FROM NEW.novo_prazo) THEN
            
            NEW.situacao := calcular_situacao_acao(NEW.id);
            NEW.updated_at := NOW();
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para atualizar situacao quando novo_prazo é alterado via tabela 022_fato_prazo
CREATE OR REPLACE FUNCTION trigger_atualizar_situacao_por_fato_prazo()
RETURNS TRIGGER AS $$
BEGIN
    -- Para INSERT e UPDATE na tabela 022_fato_prazo
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Atualizar o novo_prazo na tabela 009_acoes
        UPDATE "009_acoes"
        SET novo_prazo = NEW.novo_prazo,
            situacao = calcular_situacao_acao(NEW.id_acao),
            updated_at = NOW()
        WHERE id = NEW.id_acao;
        
        RETURN NEW;
    END IF;
    
    -- Para DELETE
    IF TG_OP = 'DELETE' THEN
        -- Recalcular novo_prazo baseado nos registros restantes
        UPDATE "009_acoes"
        SET novo_prazo = (
            SELECT MAX(novo_prazo)
            FROM "022_fato_prazo"
            WHERE id_acao = OLD.id_acao
        ),
        situacao = calcular_situacao_acao(OLD.id_acao),
        updated_at = NOW()
        WHERE id = OLD.id_acao;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar os triggers
DROP TRIGGER IF EXISTS trigger_situacao_por_prazo ON "009_acoes";
CREATE TRIGGER trigger_situacao_por_prazo
    BEFORE INSERT OR UPDATE OF prazo_implementacao, novo_prazo ON "009_acoes"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_por_prazo();

DROP TRIGGER IF EXISTS trigger_situacao_por_fato_prazo ON "022_fato_prazo";
CREATE TRIGGER trigger_situacao_por_fato_prazo
    AFTER INSERT OR UPDATE OR DELETE ON "022_fato_prazo"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_situacao_por_fato_prazo();

-- 8. Atualizar o campo novo_prazo com a data mais recente da tabela 022_fato_prazo
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

-- 9. Aplicar a função de cálculo a todos os registros existentes
SELECT atualizar_todas_situacoes();

-- 10. Comentários sobre a implementação
COMMENT ON FUNCTION calcular_situacao_acao(UUID) IS 'Função que calcula a situacao de uma ação baseada na comparação da data atual com prazo_implementacao ou novo_prazo';
COMMENT ON FUNCTION atualizar_situacao_acao(UUID) IS 'Função para atualizar a situacao de uma ação específica';
COMMENT ON FUNCTION atualizar_todas_situacoes() IS 'Função para atualizar a situacao de todas as ações que possuem prazos definidos';
COMMENT ON FUNCTION trigger_atualizar_situacao_por_prazo() IS 'Trigger function para atualizar automaticamente a situacao quando há mudanças nos prazos da tabela 009_acoes';
COMMENT ON FUNCTION trigger_atualizar_situacao_por_fato_prazo() IS 'Trigger function para atualizar automaticamente a situacao quando há mudanças na tabela 022_fato_prazo';

-- Migração aplicada com sucesso
-- Implementação corrigida da regra automática para preenchimento do campo situacao
-- conforme especificações: comparação da data atual com prazo_implementacao ou novo_prazo