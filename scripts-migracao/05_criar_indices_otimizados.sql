-- ============================================================================
-- SCRIPT 5: CRIAR ÍNDICES OTIMIZADOS E FUNÇÕES UTILITÁRIAS
-- Propósito: Otimizar performance das consultas e criar funções de apoio
-- ============================================================================

-- Iniciar transação para garantir consistência
BEGIN;

-- Registrar início do passo
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('criar_indices_otimizados', 'Criar índices otimizados e funções utilitárias', 'IN_PROGRESS', NOW());

DO $$
BEGIN
    RAISE NOTICE 'Criando índices otimizados para as tabelas...';

    -- Índices para tabela dimensão (008_indicadores)
    DROP INDEX IF EXISTS idx_008_indicadores_composite_1;
    CREATE INDEX idx_008_indicadores_composite_1 ON 008_indicadores(id_risco, situacao_indicador);

    DROP INDEX IF EXISTS idx_008_indicadores_composite_2;
    CREATE INDEX idx_008_indicadores_composite_2 ON 008_indicadores(responsavel_risco, tolerancia);

    DROP INDEX IF EXISTS idx_008_indicadores_meta;
    CREATE INDEX idx_008_indicadores_meta ON 008_indicadores(meta_efetiva);

    -- Índices para tabela fato (019_historico_indicadores)
    DROP INDEX IF EXISTS idx_019_historico_composite_1;
    CREATE INDEX idx_019_historico_composite_1 ON 019_historico_indicadores(id_indicador, data_apuracao DESC);

    DROP INDEX IF EXISTS idx_019_historico_composite_2;
    CREATE INDEX idx_019_historico_composite_2 ON 019_historico_indicadores(data_apuracao DESC, resultado_mes);

    DROP INDEX IF EXISTS idx_019_historico_justificativa;
    CREATE INDEX idx_019_historico_justificativa ON 019_historico_indicadores USING gin(to_tsvector('portuguese', justificativa_observacao));

    -- Criar índices parciais para consultas comuns
    DROP INDEX IF EXISTS idx_019_historico_resultado_nao_nulo;
    CREATE INDEX idx_019_historico_resultado_nao_nulo ON 019_historico_indicadores(id_indicador)
    WHERE resultado_mes IS NOT NULL;

    DROP INDEX IF EXISTS idx_019_historico_ultimos_12_meses;
    CREATE INDEX idx_019_historico_ultimos_12_meses ON 019_historico_indicadores(id_indicador, data_apuracao DESC)
    WHERE data_apuracao >= NOW() - INTERVAL '12 months';

    RAISE NOTICE 'Índices criados com sucesso';

    -- Criar views para consultas comuns
    DROP VIEW IF EXISTS vw_indicadores_com_historico_recente;
    CREATE VIEW vw_indicadores_com_historico_recente AS
    SELECT
        i.id,
        i.indicador_risco,
        i.situacao_indicador,
        i.meta_desc,
        i.tolerancia,
        i.responsavel_risco,
        i.apuracao,
        h.resultado_mes,
        h.data_apuracao,
        h.justificativa_observacao,
        h.impacto_n_implementacao,
        i.created_at as indicador_created_at,
        i.updated_at as indicador_updated_at,
        h.created_at as historico_created_at
    FROM 008_indicadores i
    LEFT JOIN LATERAL (
        SELECT DISTINCT ON (id_indicador) *
        FROM 019_historico_indicadores
        WHERE id_indicador = i.id
        ORDER BY id_indicador, data_apuracao DESC
    ) h ON true
    WHERE i.deleted_at IS NULL;

    DROP VIEW IF EXISTS vw_indicadores_fora_tolerancia;
    CREATE VIEW vw_indicadores_fora_tolerancia AS
    SELECT
        i.id,
        i.indicador_risco,
        i.meta_desc,
        i.tolerancia,
        h.resultado_mes,
        h.data_apuracao,
        CASE
            WHEN i.tolerancia = 'Dentro da Tolerância' THEN 'Dentro'
            WHEN i.tolerancia = 'Fora da Tolerância' THEN 'Fora'
            ELSE 'Não Classificado'
        END as status_tolerancia
    FROM 008_indicadores i
    JOIN 019_historico_indicadores h ON i.id = h.id_indicador
    WHERE i.tolerancia = 'Fora da Tolerância'
        AND h.resultado_mes IS NOT NULL
        AND i.deleted_at IS NULL;

    -- Criar funções utilitárias
    DROP FUNCTION IF EXISTS fn_calcular_tolerancia_indicador;
    CREATE OR REPLACE FUNCTION fn_calcular_tolerancia_indicador(
        p_resultado_mes NUMERIC,
        p_meta_efetiva FLOAT
    )
    RETURNS TEXT AS $$
    BEGIN
        IF p_resultado_mes IS NULL OR p_meta_efetiva IS NULL THEN
            RETURN 'Não Classificado';
        END IF;

        IF p_resultado_mes >= p_meta_efetiva THEN
            RETURN 'Dentro da Tolerância';
        ELSE
            RETURN 'Fora da Tolerância';
        END IF;
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;

    DROP FUNCTION IF EXISTS fn_obter_ultimo_historico_indicador;
    CREATE OR REPLACE FUNCTION fn_obter_ultimo_historico_indicador(
        p_id_indicador UUID
    )
    RETURNS TABLE (
        id UUID,
        resultado_mes NUMERIC,
        data_apuracao TIMESTAMP WITH TIME ZONE,
        justificativa_observacao TEXT,
        impacto_n_implementacao TEXT
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT h.id, h.resultado_mes, h.data_apuracao, h.justificativa_observacao, h.impacto_n_implementacao
        FROM 019_historico_indicadores h
        WHERE h.id_indicador = p_id_indicador
        ORDER BY h.data_apuracao DESC
        LIMIT 1;
    END;
    $$ LANGUAGE plpgsql STABLE;

    -- Criar triggers para validação automática
    DROP FUNCTION IF EXISTS fn_validar_indicador_update;
    CREATE OR REPLACE FUNCTION fn_validar_indicador_update()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Validação de campos obrigatórios
        IF NEW.indicador_risco IS NULL OR NEW.indicador_risco = '' THEN
            RAISE EXCEPTION 'O campo indicador_risco é obrigatório';
        END IF;

        IF NEW.id_risco IS NULL THEN
            RAISE EXCEPTION 'O campo id_risco é obrigatório';
        END IF;

        -- Atualizar timestamp
        NEW.updated_at = NOW();

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS tr_indicador_update ON 008_indicadores;
    CREATE TRIGGER tr_indicador_update
        BEFORE INSERT OR UPDATE ON 008_indicadores
        FOR EACH ROW
        EXECUTE FUNCTION fn_validar_indicador_update();

    RAISE NOTICE 'Views, funções e triggers criados com sucesso';

    -- Registrar conclusão do passo
    UPDATE migration_log
    SET status = 'COMPLETED',
        executed_at = NOW()
    WHERE step = 'criar_indices_otimizados';

    RAISE NOTICE 'Script 05: Criação de índices otimizados e funções utilitárias executado com sucesso';

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW()
        WHERE step = 'criar_indices_otimizados';

        RAISE EXCEPTION 'Erro ao executar script 05: %', SQLERRM;
END $$;

-- Confirmar transação
COMMIT;

-- Exibir resumo dos índices criados
SELECT
    'Índices' as tipo,
    indexname as nome,
    indexdef as definicao
FROM pg_indexes
WHERE tablename IN ('008_indicadores', '019_historico_indicadores')
    AND schemaname = 'public'

UNION ALL

SELECT
    'Views' as tipo,
    viewname as nome,
    'View para consulta simplificada' as definicao
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name IN ('vw_indicadores_com_historico_recente', 'vw_indicadores_fora_tolerancia')

UNION ALL

SELECT
    'Funções' as tipo,
    routine_name as nome,
    routine_type as definicao
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('fn_calcular_tolerancia_indicador', 'fn_obter_ultimo_historico_indicador', 'fn_validar_indicador_update')

ORDER BY tipo, nome;