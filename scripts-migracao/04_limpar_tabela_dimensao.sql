-- ============================================================================
-- SCRIPT 4: LIMPAR TABELA DIMENSÃO (008_INDICADORES)
-- Propósito: Remover campos que migraram para a tabela fato
-- ============================================================================

-- Iniciar transação para garantir consistência
BEGIN;

-- Registrar início do passo
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('limpar_tabela_dimensao', 'Remover campos migrados da tabela 008_indicadores', 'IN_PROGRESS', NOW());

DO $$
DECLARE
    table_exists BOOLEAN;
    columns_exist INTEGER;
BEGIN
    -- Verificar se a tabela 008_indicadores existe
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = '008_indicadores'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE EXCEPTION 'Tabela 008_indicadores não encontrada. Execute o script 01 primeiro.';
    END IF;

    RAISE NOTICE 'Iniciando limpeza da tabela 008_indicadores...';

    -- Verificar quais colunas existem antes de remover
    SELECT COUNT(*) INTO columns_exist
    FROM information_schema.columns
    WHERE table_name = '008_indicadores'
    AND table_schema = 'public'
    AND column_name IN ('justificativa_observacao', 'impacto_n_implementacao', 'resultado_mes');

    RAISE NOTICE 'Colunas a serem removidas encontradas: %', columns_exist;

    -- Remover colunas que migraram para a tabela fato
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '008_indicadores'
        AND column_name = 'justificativa_observacao'
    ) THEN
        EXECUTE 'ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS justificativa_observacao';
        RAISE NOTICE 'Coluna justificativa_observacao removida';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '008_indicadores'
        AND column_name = 'impacto_n_implementacao'
    ) THEN
        EXECUTE 'ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS impacto_n_implementacao';
        RAISE NOTICE 'Coluna impacto_n_implementacao removida';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '008_indicadores'
        AND column_name = 'resultado_mes'
    ) THEN
        EXECUTE 'ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS resultado_mes';
        RAISE NOTICE 'Coluna resultado_mes removida';
    END IF;

    -- Adicionar comentário na tabela para documentar a mudança
    COMMENT ON TABLE 008_indicadores IS
        'Tabela dimensão de indicadores. Os campos históricos foram migrados para 019_historico_indicadores. ' ||
        'Atualizada em ' || current_timestamp;

    -- Recriar índices otimizados para a tabela dimensão
    DROP INDEX IF EXISTS idx_008_indicadores_risco;
    DROP INDEX IF EXISTS idx_008_indicadores_responsavel;

    CREATE INDEX idx_008_indicadores_risco ON 008_indicadores(id_risco);
    CREATE INDEX idx_008_indicadores_responsavel ON 008_indicadores(responsavel_risco);

    -- Criar índice para o campo de busca textual
    DROP INDEX IF EXISTS idx_008_indicadores_indicador_risco;
    CREATE INDEX idx_008_indicadores_indicador_risco ON 008_indicadores USING gin(to_tsvector('portuguese', indicador_risco));

    RAISE NOTICE 'Índices otimizados criados com sucesso';

    -- Registrar conclusão do passo
    UPDATE migration_log
    SET status = 'COMPLETED',
        records_affected = columns_exist,
        executed_at = NOW()
    WHERE step = 'limpar_tabela_dimensao';

    RAISE NOTICE 'Script 04: Limpeza da tabela dimensão executada com sucesso';

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW()
        WHERE step = 'limpar_tabela_dimensao';

        RAISE EXCEPTION 'Erro ao executar script 04: %', SQLERRM;
END $$;

-- Confirmar transação
COMMIT;

-- Exibir estrutura atual da tabela dimensão
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = '008_indicadores'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Exibir resumo dos índices criados
SELECT
    indexname as nome_indice,
    indexdef as definicao
FROM pg_indexes
WHERE tablename = '008_indicadores'
    AND schemaname = 'public'
ORDER BY indexname;