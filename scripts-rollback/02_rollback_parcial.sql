-- ============================================================================
-- SCRIPT 02: ROLLBACK PARCIAL
-- Propósito: Rollback de etapas específicas da migração
-- ============================================================================

BEGIN;

-- Registrar início do rollback parcial
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('rollback_parcial', 'Rollback parcial de etapas específicas', 'IN_PROGRESS', NOW());

DO $$
DECLARE
    backup_008_exists BOOLEAN;
    etapa VARCHAR(50) := COALESCE(current_setting('rollback.etapa', true), 'dados');
    rollback_point TIMESTAMP := NOW();
BEGIN
    RAISE NOTICE 'Iniciando rollback parcial - Etapa: %', etapa;

    -- Verificar se o backup existe
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '008_indicadores_backup')
    INTO backup_008_exists;

    IF NOT backup_008_exists THEN
        RAISE EXCEPTION 'Backup da tabela 008 não encontrado. Rollback não pode ser executado.';
    END IF;

    -- Executar rollback baseado na etapa especificada
    CASE etapa
        WHEN 'dados' THEN
            -- Rollback apenas da migração de dados (Step 3)
            RAISE NOTICE 'Executando rollback da migração de dados...';

            -- Remover dados da tabela fato
            DELETE FROM 019_historico_indicadores;

            -- Restaurar campos originais na tabela dimensão
            ALTER TABLE 008_indicadores
            ADD COLUMN IF NOT EXISTS justificativa_observacao TEXT,
            ADD COLUMN IF NOT EXISTS impacto_n_implementacao TEXT,
            ADD COLUMN IF NOT EXISTS resultado_mes NUMERIC(10,2);

            -- Restaurar dados do backup
            UPDATE 008_indicadores i
            SET
                justificativa_observacao = b.justificativa_observacao,
                impacto_n_implementacao = b.impacto_n_implementacao,
                resultado_mes = b.resultado_mes
            FROM 008_indicadores_backup b
            WHERE i.id = b.id;

            RAISE NOTICE '✓ Rollback de dados concluído';

        WHEN 'estrutura' THEN
            -- Rollback da recriação da tabela fato (Step 2)
            RAISE NOTICE 'Executando rollback da recriação da tabela fato...';

            -- Remover tabela fato atual
            DROP TABLE IF EXISTS 019_historico_indicadores CASCADE;

            -- Restaurar tabela fato original do backup (se existir)
            IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '019_historico_indicadores_backup') THEN
                CREATE TABLE 019_historico_indicadores AS
                SELECT * FROM 019_historico_indicadores_backup;

                ALTER TABLE 019_historico_indicadores ADD PRIMARY KEY (id);
                CREATE INDEX idx_019_historico_indicadores_id_indicador ON 019_historico_indicadores(id_indicador);

                RAISE NOTICE '✓ Tabela fato restaurada do backup';
            ELSE
                RAISE NOTICE '! Backup da tabela 019 não encontrado - tabela não será restaurada';
            END IF;

            -- Remover colunas adicionadas na tabela dimensão
            ALTER TABLE 008_indicadores
            DROP COLUMN IF EXISTS justificativa_observacao,
            DROP COLUMN IF EXISTS impacto_n_implementacao,
            DROP COLUMN IF EXISTS resultado_mes;

            RAISE NOTICE '✓ Rollback de estrutura concluído';

        WHEN 'indices' THEN
            -- Rollback apenas dos índices otimizados (Step 5)
            RAISE NOTICE 'Executando rollback dos índices otimizados...';

            -- Remover índices otimizados
            DROP INDEX IF EXISTS idx_composite_indicadores_risco_severidade;
            DROP INDEX IF EXISTS idx_composite_historico_indicador_data;
            DROP INDEX IF EXISTS idx_composite_historico_indicador_periodo;
            DROP INDEX IF EXISTS idx_composite_indicadores_meta_efetiva;
            DROP INDEX IF EXISTS idx_partial_historico_ultimos_90_dias;

            -- Restaurar índices originais básicos
            CREATE INDEX IF NOT EXISTS idx_008_indicadores_id_risco ON 008_indicadores(id_risco);
            CREATE INDEX IF NOT EXISTS idx_008_indicadores_situacao ON 008_indicadores(situacao_indicador);
            CREATE INDEX IF NOT EXISTS idx_019_historico_indicadores_id_indicador ON 019_historico_indicadores(id_indicador);
            CREATE INDEX IF NOT EXISTS idx_019_historico_indicadores_data_apuracao ON 019_historico_indicadores(data_apuracao);

            RAISE NOTICE '✓ Rollback de índices concluído';

        WHEN 'views' THEN
            -- Rollback das views e funções (Step 5)
            RAISE NOTICE 'Executando rollback de views e funções...';

            -- Remover views criadas
            DROP VIEW IF EXISTS vw_indicadores_com_historico_recente CASCADE;
            DROP VIEW IF EXISTS vw_historico_indicadores_por_ano CASCADE;
            DROP VIEW IF EXISTS vw_indicadores_desempenho CASCADE;
            DROP VIEW IF EXISTS vw_ultimos_resultados_indicadores CASCADE;

            -- Remover funções criadas
            DROP FUNCTION IF EXISTS fn_obter_ultimo_historico_indicador(UUID) CASCADE;
            DROP FUNCTION IF EXISTS fn_calcular_tolerancia_indicador(NUMERIC, NUMERIC) CASCADE;
            DROP FUNCTION IF EXISTS fn_validar_indicador(UUID) CASCADE;

            -- Remover triggers criados
            DROP TRIGGER IF EXISTS tr_validar_indicador ON 008_indicadores;
            DROP TRIGGER IF EXISTS tr_atualizar_situacao_indicador ON 008_indicadores;
            DROP TRIGGER IF EXISTS tr_log_mudanca_indicador ON 008_indicadores;

            RAISE NOTICE '✓ Rollback de views e funções concluído';

        ELSE
            RAISE EXCEPTION 'Etapa de rollback não reconhecida: %. Use: dados, estrutura, indices, views', etapa;
    END CASE;

    -- Validar o rollback parcial
    RAISE NOTICE 'Validando rollback parcial...';

    DECLARE
        validacao_ok BOOLEAN := TRUE;
        detalhes_validacao TEXT := '';
    BEGIN
        CASE etapa
            WHEN 'dados' THEN
                -- Verificar se os dados foram restaurados corretamente
                IF NOT EXISTS (SELECT 1 FROM 008_indicadores WHERE resultado_mes IS NOT NULL LIMIT 1) THEN
                    validacao_ok := FALSE;
                    detalhes_validacao := 'Nenhum dado histórico restaurado na tabela 008';
                END IF;

                IF EXISTS (SELECT 1 FROM 019_historico_indicadores LIMIT 1) THEN
                    validacao_ok := FALSE;
                    detalhes_validacao := detalhes_validacao || ' Tabela 019 ainda contém dados';
                END IF;

            WHEN 'estrutura' THEN
                -- Verificar estrutura das tabelas
                IF EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name = '008_indicadores'
                          AND column_name = 'justificativa_observacao') THEN
                    validacao_ok := FALSE;
                    detalhes_validacao := 'Colunas migradas ainda existem na tabela 008';
                END IF;

            WHEN 'indices' THEN
                -- Verificar índices
                IF EXISTS (SELECT 1 FROM pg_indexes
                          WHERE tablename = '008_indicadores'
                          AND indexname = 'idx_composite_indicadores_risco_severidade') THEN
                    validacao_ok := FALSE;
                    detalhes_validacao := 'Índices otimizados ainda existem';
                END IF;

            WHEN 'views' THEN
                -- Verificar views
                IF EXISTS (SELECT 1 FROM information_schema.views
                          WHERE table_name = 'vw_indicadores_com_historico_recente') THEN
                    validacao_ok := FALSE;
                    detalhes_validacao := 'Views ainda existem';
                END IF;
        END CASE;

        IF validacao_ok THEN
            RAISE NOTICE '✓ Validação do rollback parcial concluída com sucesso';
        ELSE
            RAISE WARNING '⚠️ Problemas na validação: %', detalhes_validacao;
        END IF;
    END;

    -- Registrar conclusão do rollback parcial
    UPDATE migration_log
    SET status = 'COMPLETED',
        records_affected = (SELECT COUNT(*) FROM 008_indicadores),
        executed_at = NOW(),
        execution_time_ms = EXTRACT(EPOCH FROM (NOW() - rollback_point)) * 1000
    WHERE step = 'rollback_parcial';

    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'ROLLBACK PARCIAL CONCLUÍDO - ETAPA: %', etapa;
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Tempo de execução: %ms', EXTRACT(EPOCH FROM (NOW() - rollback_point)) * 1000;
    IF validacao_ok THEN
        RAISE NOTICE 'Status: SUCESSO';
    ELSE
        RAISE NOTICE 'Status: ATENÇÃO - Verificar detalhes';
    END IF;
    RAISE NOTICE '==========================================';

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro no rollback parcial
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW(),
            execution_time_ms = EXTRACT(EPOCH FROM (NOW() - rollback_point)) * 1000
        WHERE step = 'rollback_parcial';

        RAISE EXCEPTION 'ERRO NO ROLLBACK PARCIAL: %', SQLERRM;
END $$;

COMMIT;

-- Exibir estado atual das tabelas
RAISE NOTICE 'Estado atual após rollback parcial:';

SELECT
    table_name as tabela,
    column_name as coluna,
    data_type as tipo
FROM information_schema.columns
WHERE table_name IN ('008_indicadores', '019_historico_indicadores')
ORDER BY table_name, ordinal_position;