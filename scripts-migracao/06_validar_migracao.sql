-- ============================================================================
-- SCRIPT 6: VALIDAR MIGRAÇÃO E GERAR RELATÓRIO FINAL
-- Propósito: Executar testes de validação completa da migração
-- ============================================================================

-- Iniciar transação para garantir consistência
BEGIN;

-- Registrar início do passo
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('validar_migracao', 'Validação completa da migração e relatório final', 'IN_PROGRESS', NOW());

DO $$
DECLARE
    backup_008_count INTEGER;
    backup_019_count INTEGER;
    current_008_count INTEGER;
    current_019_count INTEGER;
    migrated_count INTEGER;
    invalid_fk_count INTEGER;
    duplicate_check INTEGER;
    validation_passed BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE 'Iniciando validação completa da migração...';

    -- Teste 1: Verificar contagem de registros
    RAISE NOTICE 'Teste 1: Verificação de contagem de registros...';

    SELECT COUNT(*) INTO backup_008_count FROM 008_indicadores_backup;
    SELECT COUNT(*) INTO current_008_count FROM 008_indicadores;
    SELECT COUNT(*) INTO current_019_count FROM 019_historico_indicadores;

    -- Verificar se existia tabela 019 no backup
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '019_historico_indicadores_backup') THEN
        SELECT COUNT(*) INTO backup_019_count FROM 019_historico_indicadores_backup;
        RAISE NOTICE 'Backup 019_historico_indicadores: % registros', backup_019_count;
    ELSE
        backup_019_count := 0;
        RAISE NOTICE 'Tabela 019_historico_indicadores_backup não existia antes da migração';
    END IF;

    -- Verificar integridade das contagens
    SELECT COUNT(*) INTO migrated_count FROM 008_indicadores_backup WHERE resultado_mes IS NOT NULL;

    IF current_019_count != migrated_count THEN
        RAISE WARNING 'ERRO: Contagem de registros na tabela fato (%) difere do esperado (%)', current_019_count, migrated_count;
        validation_passed := FALSE;
    ELSE
        RAISE NOTICE '✓ Contagem de registros na tabela fato correta';
    END IF;

    -- Teste 2: Integridade referencial
    RAISE NOTICE 'Teste 2: Verificação de integridade referencial...';

    SELECT COUNT(*) INTO invalid_fk_count
    FROM 019_historico_indicadores h
    LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
    WHERE i.id IS NULL;

    IF invalid_fk_count > 0 THEN
        RAISE WARNING 'ERRO: Encontradas % chaves estrangeiras inválidas', invalid_fk_count;
        validation_passed := FALSE;
    ELSE
        RAISE NOTICE '✓ Todas as chaves estrangeiras são válidas';
    END IF;

    -- Teste 3: Verificar duplicatas
    RAISE NOTICE 'Teste 3: Verificação de duplicatas...';

    SELECT COUNT(*) INTO duplicate_check
    FROM (
        SELECT id_indicador, data_apuracao, COUNT(*)
        FROM 019_historico_indicadores
        GROUP BY id_indicador, data_apuracao
        HAVING COUNT(*) > 1
    ) AS duplicates;

    IF duplicate_check > 0 THEN
        RAISE WARNING 'ERRO: Encontradas % combinações duplicadas de indicador+data', duplicate_check;
        validation_passed := FALSE;
    ELSE
        RAISE NOTICE '✓ Nenhuma duplicata encontrada';
    END IF;

    -- Teste 4: Verificar consistência de dados
    RAISE NOTICE 'Teste 4: Verificação de consistência de dados...';

    -- Verificar se todos os indicadores da dimensão têm registros na fato (se tiveram dados históricos)
    DECLARE
        indicadores_sem_historico INTEGER;
    BEGIN
        SELECT COUNT(*) INTO indicadores_sem_historico
        FROM 008_indicadores i
        WHERE NOT EXISTS (
            SELECT 1 FROM 019_historico_indicadores h
            WHERE h.id_indicador = i.id
        )
        AND EXISTS (
            SELECT 1 FROM 008_indicadores_backup b
            WHERE b.id = i.id AND b.resultado_mes IS NOT NULL
        );

        IF indicadores_sem_historico > 0 THEN
            RAISE WARNING 'AVISO: % indicadores com dados históricos não têm registros na tabela fato', indicadores_sem_historico;
        ELSE
            RAISE NOTICE '✓ Todos os indicadores com dados históricos têm registros na tabela fato';
        END IF;
    END;

    -- Teste 5: Performance de consulta
    RAISE NOTICE 'Teste 5: Teste básico de performance...';

    DECLARE
        start_time TIMESTAMP;
        end_time TIMESTAMP;
        execution_time INTERVAL;
    BEGIN
        start_time := clock_timestamp();

        EXECUTE 'SELECT COUNT(*) FROM vw_indicadores_com_historico_recente';

        end_time := clock_timestamp();
        execution_time := end_time - start_time;

        IF execution_time > INTERVAL '1 second' THEN
            RAISE WARNING 'AVISO: Consulta da view demorou %', execution_time;
        ELSE
            RAISE NOTICE '✓ Consulta da view executada em %', execution_time;
        END IF;
    END;

    -- Teste 6: Verificar constraints
    RAISE NOTICE 'Teste 6: Verificação de constraints...';

    -- Testar inserção válida
    DECLARE
        test_indicador_id UUID;
        test_historico_id UUID;
    BEGIN
        -- Criar um indicador de teste
        INSERT INTO 008_indicadores (
            id, id_risco, indicador_risco, responsavel_risco, meta_efetiva, meta_desc,
            limite_tolerancia, tipo_acompanhamento, apuracao, situacao_indicador, tolerancia
        ) VALUES (
            gen_random_uuid(),
            gen_random_uuid(),
            'Indicador de Teste',
            gen_random_uuid(),
            100.0,
            'Meta de teste',
            '10%',
            'Mensal',
            'Apuração teste',
            'Em Andamento'::situacao_indicador_enum,
            'Dentro da Tolerância'::tolerancia_enum
        )
        RETURNING id INTO test_indicador_id;

        -- Inserir histórico para o indicador de teste
        INSERT INTO 019_historico_indicadores (
            id_indicador, justificativa_observacao, impacto_n_implementacao, resultado_mes, data_apuracao
        ) VALUES (
            test_indicador_id,
            'Teste de validação',
            'Impacto de teste',
            85.5,
            NOW()
        )
        RETURNING id INTO test_historico_id;

        -- Remover dados de teste
        DELETE FROM 019_historico_indicadores WHERE id = test_historico_id;
        DELETE FROM 008_indicadores WHERE id = test_indicador_id;

        RAISE NOTICE '✓ Constraints de inserção funcionando corretamente';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'ERRO: Falha ao testar constraints: %', SQLERRM;
            validation_passed := FALSE;
    END;

    -- Resultado final da validação
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO DA VALIDAÇÃO';
    RAISE NOTICE '==========================================';

    IF validation_passed THEN
        RAISE NOTICE '✓ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
        RAISE NOTICE '✓ Todos os testes de validação passaram';
    ELSE
        RAISE NOTICE '✗ ERROS ENCONTRADOS NA MIGRAÇÃO!';
        RAISE NOTICE '✗ Verifique os warnings acima para detalhes';
    END IF;

    RAISE NOTICE '==========================================';

    -- Registrar conclusão do passo
    UPDATE migration_log
    SET status = CASE WHEN validation_passed THEN 'COMPLETED' ELSE 'FAILED' END,
        records_affected = CASE WHEN validation_passed THEN 1 ELSE 0 END,
        executed_at = NOW()
    WHERE step = 'validar_migracao';

    RAISE NOTICE 'Script 06: Validação da migração concluída';

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW()
        WHERE step = 'validar_migracao';

        RAISE EXCEPTION 'Erro ao executar script 06: %', SQLERRM;
END $$;

-- Confirmar transação
COMMIT;

-- Exibir relatório final da migração
WITH migracao_stats AS (
    SELECT
        'Backup 008_indicadores' as tabela,
        COUNT(*) as total_registros
    FROM 008_indicadores_backup

    UNION ALL

    SELECT
        '008_indicadores (atual)' as tabela,
        COUNT(*) as total_registros
    FROM 008_indicadores

    UNION ALL

    SELECT
        '019_historico_indicadores (nova)' as tabela,
        COUNT(*) as total_registros
    FROM 019_historico_indicadores

    UNION ALL

    SELECT
        'Registros migrados' as tabela,
        COUNT(*) as total_registros
    FROM 008_indicadores_backup
    WHERE resultado_mes IS NOT NULL
)
SELECT * FROM migracao_stats ORDER BY tabela;

-- Exibir log completo da migração
SELECT
    step,
    status,
    records_affected,
    error_message,
    executed_at
FROM migration_log
ORDER BY executed_at;