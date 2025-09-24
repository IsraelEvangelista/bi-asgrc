-- ============================================================================
-- SCRIPT 01: ROLLBACK COMPLETO DA MIGRAÇÃO
-- Propósito: Restaurar o estado original das tabelas antes da migração
-- ============================================================================

BEGIN;

-- Registrar início do rollback
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('rollback_completo', 'Rollback completo da migração para estado original', 'IN_PROGRESS', NOW());

DO $$
DECLARE
    backup_008_exists BOOLEAN;
    backup_019_exists BOOLEAN;
    rollback_point TIMESTAMP := NOW();
BEGIN
    RAISE NOTICE 'Iniciando rollback completo da migração...';

    -- Verificar se os backups existem
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '008_indicadores_backup')
    INTO backup_008_exists;

    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '019_historico_indicadores_backup')
    INTO backup_019_exists;

    IF NOT backup_008_exists THEN
        RAISE EXCEPTION 'Backup da tabela 008 não encontrado. Rollback não pode ser executado.';
    END IF;

    -- Step 1: Remover tabelas atuais
    RAISE NOTICE 'Step 1: Removendo tabelas atuais...';

    -- Remover constraints e dependências da tabela 019 atual
    DROP TABLE IF EXISTS 019_historico_indicadores CASCADE;

    -- Remover tabela 008 atual
    DROP TABLE IF EXISTS 008_indicadores CASCADE;

    RAISE NOTICE '✓ Tabelas atuais removidas';

    -- Step 2: Restaurar tabela 008 do backup
    RAISE NOTICE 'Step 2: Restaurando tabela 008_indicadores...';

    CREATE TABLE 008_indicadores AS
    SELECT * FROM 008_indicadores_backup;

    -- Restaurar constraints originais da tabela 008
    ALTER TABLE 008_indicadores ADD PRIMARY KEY (id);

    -- Restaurar índices originais
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_id_risco ON 008_indicadores(id_risco);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_situacao ON 008_indicadores(situacao_indicador);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_responsavel ON 008_indicadores(responsavel_risco);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_meta_efetiva ON 008_indicadores(meta_efetiva);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_tipo_acompanhamento ON 008_indicadores(tipo_acompanhamento);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_apuracao ON 008_indicadores(apuracao);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_situacao_indicador ON 008_indicadores(situacao_indicador);
    CREATE INDEX IF NOT EXISTS idx_008_indicadores_tolerancia ON 008_indicadores(tolerancia);

    RAISE NOTICE '✓ Tabela 008_indicadores restaurada com % registros',
                (SELECT COUNT(*) FROM 008_indicadores);

    -- Step 3: Restaurar tabela 019 do backup (se existir)
    IF backup_019_exists THEN
        RAISE NOTICE 'Step 3: Restaurando tabela 019_historico_indicadores...';

        CREATE TABLE 019_historico_indicadores AS
        SELECT * FROM 019_historico_indicadores_backup;

        -- Restaurar constraints originais da tabela 019
        ALTER TABLE 019_historico_indicadores ADD PRIMARY KEY (id);

        -- Restaurar índices originais
        CREATE INDEX IF NOT EXISTS idx_019_historico_indicadores_id_indicador ON 019_historico_indicadores(id_indicador);
        CREATE INDEX IF NOT EXISTS idx_019_historico_indicadores_data_apuracao ON 019_historico_indicadores(data_apuracao);
        CREATE INDEX IF NOT EXISTS idx_019_historico_indicadores_resultado_mes ON 019_historico_indicadores(resultado_mes);

        RAISE NOTICE '✓ Tabela 019_historico_indicadores restaurada com % registros',
                    (SELECT COUNT(*) FROM 019_historico_indicadores);
    ELSE
        RAISE NOTICE '! Step 3: Backup da tabela 019 não encontrado - pulando restauração';
    END IF;

    -- Step 4: Remover objetos criados durante a migração
    RAISE NOTICE 'Step 4: Removendo objetos criados durante migração...';

    -- Remover views
    DROP VIEW IF EXISTS vw_indicadores_com_historico_recente CASCADE;
    DROP VIEW IF EXISTS vw_historico_indicadores_por_ano CASCADE;
    DROP VIEW IF EXISTS vw_indicadores_desempenho CASCADE;
    DROP VIEW IF EXISTS vw_ultimos_resultados_indicadores CASCADE;

    -- Remover funções
    DROP FUNCTION IF EXISTS fn_obter_ultimo_historico_indicador(UUID) CASCADE;
    DROP FUNCTION IF EXISTS fn_calcular_tolerancia_indicador(NUMERIC, NUMERIC) CASCADE;
    DROP FUNCTION IF EXISTS fn_validar_indicador(UUID) CASCADE;

    -- Remover triggers
    DROP TRIGGER IF EXISTS tr_validar_indicador ON 008_indicadores;
    DROP TRIGGER IF EXISTS tr_atualizar_situacao_indicador ON 008_indicadores;
    DROP TRIGGER IF EXISTS tr_log_mudanca_indicador ON 008_indicadores;

    RAISE NOTICE '✓ Objetos de migração removidos';

    -- Step 5: Validar restauração
    RAISE NOTICE 'Step 5: Validando restauração...';

    DECLARE
        total_008_restaurado INTEGER;
        total_008_backup INTEGER;
        validacao_ok BOOLEAN := TRUE;
    BEGIN
        -- Validar tabela 008
        SELECT COUNT(*) INTO total_008_restaurado FROM 008_indicadores;
        SELECT COUNT(*) INTO total_008_backup FROM 008_indicadores_backup;

        IF total_008_restaurado <> total_008_backup THEN
            RAISE WARNING '⚠️ Tabela 008: % registros restaurados, % esperados',
                         total_008_restaurado, total_008_backup;
            validacao_ok := FALSE;
        END IF;

        -- Validar integridade básica
        IF NOT EXISTS (SELECT 1 FROM 008_indicadores WHERE id IS NOT NULL LIMIT 1) THEN
            RAISE WARNING '⚠️ Tabela 008 não contém dados após restauração';
            validacao_ok := FALSE;
        END IF;

        IF validacao_ok THEN
            RAISE NOTICE '✓ Validação concluída com sucesso';
        ELSE
            RAISE WARNING '⚠️ Problemas encontrados na validação';
        END IF;
    END;

    -- Registrar conclusão do rollback
    UPDATE migration_log
    SET status = 'COMPLETED',
        records_affected = (SELECT COUNT(*) FROM 008_indicadores),
        executed_at = NOW(),
        execution_time_ms = EXTRACT(EPOCH FROM (NOW() - rollback_point)) * 1000
    WHERE step = 'rollback_completo';

    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'ROLLBACK COMPLETO CONCLUÍDO COM SUCESSO';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Tabelas restauradas para estado original';
    RAISE NOTICE 'Backup 008: % registros', (SELECT COUNT(*) FROM 008_indicadores_backup);
    RAISE NOTICE 'Restaurado 008: % registros', (SELECT COUNT(*) FROM 008_indicadores);
    IF backup_019_exists THEN
        RAISE NOTICE 'Backup 019: % registros', (SELECT COUNT(*) FROM 019_historico_indicadores_backup);
        RAISE NOTICE 'Restaurado 019: % registros', (SELECT COUNT(*) FROM 019_historico_indicadores);
    END IF;
    RAISE NOTICE 'Tempo de execução: %ms', EXTRACT(EPOCH FROM (NOW() - rollback_point)) * 1000;
    RAISE NOTICE '==========================================';

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro no rollback
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW(),
            execution_time_ms = EXTRACT(EPOCH FROM (NOW() - rollback_point)) * 1000
        WHERE step = 'rollback_completo';

        RAISE EXCEPTION 'ERRO CRÍTICO DURANTE ROLLBACK: %', SQLERRM;
END $$;

COMMIT;

-- Exibir estado final das tabelas
RAISE NOTICE 'Estado final das tabelas após rollback:';

SELECT
    '008_indicadores' as tabela,
    COUNT(*) as total_registros,
    pg_size_pretty(pg_total_relation_size('008_indicadores')) as tamanho
FROM 008_indicadores

UNION ALL

SELECT
    '008_indicadores_backup' as tabela,
    COUNT(*) as total_registros,
    pg_size_pretty(pg_total_relation_size('008_indicadores_backup')) as tamanho
FROM 008_indicadores_backup

UNION ALL

SELECT
    '019_historico_indicadores' as tabela,
    COUNT(*) as total_registros,
    pg_size_pretty(pg_total_relation_size('019_historico_indicadores')) as tamanho
FROM 019_historico_indicadores

UNION ALL

SELECT
    '019_historico_indicadores_backup' as tabela,
    COUNT(*) as total_registros,
    pg_size_pretty(pg_total_relation_size('019_historico_indicadores_backup')) as tamanho
FROM 019_historico_indicadores_backup;