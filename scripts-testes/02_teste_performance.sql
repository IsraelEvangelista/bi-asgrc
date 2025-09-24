-- ============================================================================
-- TESTE 2: PERFORMANCE DE CONSULTAS
-- Propósito: Validar performance das consultas após a migração
-- ============================================================================

BEGIN;

-- Limpar tabela de resultados anteriores
DELETE FROM test_results WHERE test_name LIKE '2.%';

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
    performance_threshold_ms INTEGER := 1000; -- 1 segundo
BEGIN
    RAISE NOTICE 'Iniciando Teste 2: Performance de Consultas...';

    -- Teste 2.1: Performance da view vw_indicadores_com_historico_recente
    DECLARE
        start_time TIMESTAMP;
        end_time TIMESTAMP;
        execution_time_ms INTEGER;
        view_count INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        start_time := clock_timestamp();

        EXECUTE 'SELECT COUNT(*) FROM vw_indicadores_com_historico_recente' INTO view_count;

        end_time := clock_timestamp();
        execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

        IF execution_time_ms <= performance_threshold_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.1 - Performance view indicadores com histórico', 'PASS',
                   'Executou em ' || execution_time_ms || 'ms. Registros: ' || view_count);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 2.1: View executou em %ms (% registros)', execution_time_ms, view_count;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.1 - Performance view indicadores com histórico', 'FAIL',
                   'Executou em ' || execution_time_ms || 'ms (limite: ' || performance_threshold_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 2.1: View demorou %ms (limite: %ms)', execution_time_ms, performance_threshold_ms;
        END IF;
    END;

    -- Teste 2.2: Performance de join entre dimensão e fato
    DECLARE
        join_time_ms INTEGER;
        join_count INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        start_time := clock_timestamp();

        EXECUTE 'SELECT COUNT(*)
                  FROM 008_indicadores i
                  JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                  WHERE h.data_apuracao >= NOW() - INTERVAL ''3 months''' INTO join_count;

        end_time := clock_timestamp();
        join_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

        IF join_time_ms <= performance_threshold_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.2 - Performance join dimensão-fato', 'PASS',
                   'Executou em ' || join_time_ms || 'ms. Registros: ' || join_count);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 2.2: Join executou em %ms (% registros)', join_time_ms, join_count;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.2 - Performance join dimensão-fato', 'FAIL',
                   'Executou em ' || join_time_ms || 'ms (limite: ' || performance_threshold_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 2.2: Join demorou %ms (limite: %ms)', join_time_ms, performance_threshold_ms;
        END IF;
    END;

    -- Teste 2.3: Performance de consulta com filtro de período
    DECLARE
        period_time_ms INTEGER;
        period_count INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        start_time := clock_timestamp();

        EXECUTE 'SELECT i.indicador_risco, h.resultado_mes, h.data_apuracao
                  FROM 008_indicadores i
                  JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                  WHERE h.data_apuracao BETWEEN NOW() - INTERVAL ''6 months'' AND NOW()
                  ORDER BY h.data_apuracao DESC
                  LIMIT 100' INTO period_count;

        end_time := clock_timestamp();
        period_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

        IF period_time_ms <= performance_threshold_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.3 - Performance consulta com período', 'PASS',
                   'Executou em ' || period_time_ms || 'ms. Registros: ' || period_count);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 2.3: Consulta com período executou em %ms', period_time_ms;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.3 - Performance consulta com período', 'FAIL',
                   'Executou em ' || period_time_ms || 'ms (limite: ' || performance_threshold_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 2.3: Consulta com período demorou %ms', period_time_ms;
        END IF;
    END;

    -- Teste 2.4: Performance de consulta analítica (agregação)
    DECLARE
        analytics_time_ms INTEGER;
        analytics_count INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        start_time := clock_timestamp();

        EXECUTE 'SELECT
                     i.id_risco,
                     COUNT(h.id) as total_medicoes,
                     AVG(h.resultado_mes) as media_resultado,
                     MIN(h.data_apuracao) as primeira_medicao,
                     MAX(h.data_apuracao) as ultima_medicao
                  FROM 008_indicadores i
                  LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                  GROUP BY i.id_risco
                  ORDER BY total_medicoes DESC' INTO analytics_count;

        end_time := clock_timestamp();
        analytics_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

        IF analytics_time_ms <= performance_threshold_ms * 2 THEN -- Limite maior para consulta analítica
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.4 - Performance consulta analítica', 'PASS',
                   'Executou em ' || analytics_time_ms || 'ms. Grupos: ' || analytics_count);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 2.4: Consulta analítica executou em %ms (% grupos)', analytics_time_ms, analytics_count;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('2.4 - Performance consulta analítica', 'FAIL',
                   'Executou em ' || analytics_time_ms || 'ms (limite: ' || (performance_threshold_ms * 2) || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 2.4: Consulta analítica demorou %ms', analytics_time_ms;
        END IF;
    END;

    -- Teste 2.5: Performance da função utilitária
    DECLARE
        function_time_ms INTEGER;
        function_result RECORD;
    BEGIN
        total_tests := total_tests + 1;

        -- Obter um ID de indicador válido para teste
        DECLARE
            test_indicador_id UUID;
        BEGIN
            SELECT id INTO test_indicador_id
            FROM 008_indicadores
            LIMIT 1;

            IF test_indicador_id IS NOT NULL THEN
                start_time := clock_timestamp();

                SELECT * INTO function_result
                FROM fn_obter_ultimo_historico_indicador(test_indicador_id);

                end_time := clock_timestamp();
                function_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

                IF function_time_ms <= 100 THEN -- Limite menor para função
                    INSERT INTO test_results (test_name, status, details)
                    VALUES ('2.5 - Performance função utilitária', 'PASS',
                           'Executou em ' || function_time_ms || 'ms');
                    passed_tests := passed_tests + 1;
                    RAISE NOTICE '✓ Teste 2.5: Função utilitária executou em %ms', function_time_ms;
                ELSE
                    INSERT INTO test_results (test_name, status, details)
                    VALUES ('2.5 - Performance função utilitária', 'FAIL',
                           'Executou em ' || function_time_ms || 'ms (limite: 100ms)');
                    failed_tests := failed_tests + 1;
                    RAISE WARNING '✗ Teste 2.5: Função utilitária demorou %ms', function_time_ms;
                END IF;
            ELSE
                INSERT INTO test_results (test_name, status, details)
                VALUES ('2.5 - Performance função utilitária', 'SKIP', 'Nenhum indicador encontrado para teste');
                RAISE NOTICE '! Teste 2.5: Pulado - nenhum indicador encontrado';
            END IF;
        END;
    END;

    -- Resumo do teste de performance
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTE DE PERFORMANCE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE 'Limite de performance: %ms por consulta', performance_threshold_ms;
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '✓ TESTE DE PERFORMANCE: APROVADO';
    ELSE
        RAISE NOTICE '✗ TESTE DE PERFORMANCE: REPROVADO';
        RAISE NOTICE 'Verifique os detalhes na tabela test_results';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results WHERE test_name LIKE '2.%' ORDER BY test_name;

-- Exibir plano de execução para análise
RAISE NOTICE 'Plano de execução da view vw_indicadores_com_historico_recente:';
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM vw_indicadores_com_historico_recente LIMIT 10;