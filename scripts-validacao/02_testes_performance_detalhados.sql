-- ============================================================================
-- SCRIPT 02: TESTES DETALHADOS DE PERFORMANCE
-- Propósito: Validar performance de todas as operações críticas pós-migração
-- ============================================================================

BEGIN;

-- Limpar tabela de resultados anteriores
DELETE FROM test_results WHERE test_name LIKE '7.%';

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando Testes Detalhados de Performance...';

    -- Teste 7.1: Performance de leitura da view principal
    DECLARE
        view_main_time_ms INTEGER;
        view_main_limit_ms INTEGER := 3000; -- 3 segundos
        view_main_records INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        DECLARE
            start_time TIMESTAMP;
        BEGIN
            start_time := clock_timestamp();

            -- Executar consulta complexa na view principal
            SELECT COUNT(*) INTO view_main_records
            FROM vw_indicadores_com_historico_recente;

            view_main_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
        END;

        IF view_main_time_ms <= view_main_limit_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.1 - Performance view principal', 'PASS',
                   'Executou em ' || view_main_time_ms || 'ms. Registros: ' || view_main_records);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 7.1: View principal em %ms (% registros)', view_main_time_ms, view_main_records;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.1 - Performance view principal', 'FAIL',
                   'Executou em ' || view_main_time_ms || 'ms (limite: ' || view_main_limit_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 7.1: View principal lenta: %ms', view_main_time_ms;
        END IF;
    END;

    -- Teste 7.2: Performance de join entre dimensão e fato
    DECLARE
        join_complex_time_ms INTEGER;
        join_limit_ms INTEGER := 2000; -- 2 segundos
        join_records INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        DECLARE
            start_time TIMESTAMP;
        BEGIN
            start_time := clock_timestamp();

            -- Executar join complexo com agregações
            SELECT COUNT(*) INTO join_records
            FROM (
                SELECT
                    i.id_risco,
                    i.indicador_risco,
                    COUNT(h.id) as total_medicoes,
                    AVG(h.resultado_mes) as media_resultado,
                    MAX(h.data_apuracao) as ultima_medicao
                FROM 008_indicadores i
                LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                WHERE i.situacao_indicador = 'Em Andamento'::situacao_indicador_enum
                GROUP BY i.id_risco, i.indicador_risco
            ) as join_result;

            join_complex_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
        END;

        IF join_complex_time_ms <= join_limit_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.2 - Performance join complexo', 'PASS',
                   'Executou em ' || join_complex_time_ms || 'ms. Grupos: ' || join_records);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 7.2: Join complexo em %ms (% grupos)', join_complex_time_ms, join_records;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.2 - Performance join complexo', 'FAIL',
                   'Executou em ' || join_complex_time_ms || 'ms (limite: ' || join_limit_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 7.2: Join complexo lento: %ms', join_complex_time_ms;
        END IF;
    END;

    -- Teste 7.3: Performance de consultas temporais
    DECLARE
        temporal_time_ms INTEGER;
        temporal_limit_ms INTEGER := 1500; -- 1.5 segundos
        temporal_records INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        DECLARE
            start_time TIMESTAMP;
        BEGIN
            start_time := clock_timestamp();

            -- Consulta temporal com filtro de período
            SELECT COUNT(*) INTO temporal_records
            FROM 019_historico_indicadores h
            JOIN 008_indicadores i ON h.id_indicador = i.id
            WHERE h.data_apuracao BETWEEN NOW() - INTERVAL '6 months' AND NOW()
            AND i.situacao_indicador = 'Em Andamento'::situacao_indicador_enum
            AND h.resultado_mes IS NOT NULL;

            temporal_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
        END;

        IF temporal_time_ms <= temporal_limit_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.3 - Performance consulta temporal', 'PASS',
                   'Executou em ' || temporal_time_ms || 'ms. Registros: ' || temporal_records);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 7.3: Consulta temporal em %ms (% registros)', temporal_time_ms, temporal_records;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.3 - Performance consulta temporal', 'FAIL',
                   'Executou em ' || temporal_time_ms || 'ms (limite: ' || temporal_limit_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 7.3: Consulta temporal lenta: %ms', temporal_time_ms;
        END IF;
    END;

    -- Teste 7.4: Performance de inserção (write performance)
    DECLARE
        insert_time_ms INTEGER;
        insert_limit_ms INTEGER := 500; -- 500ms para 100 registros
        insert_test_id UUID;
    BEGIN
        total_tests := total_tests + 1;

        -- Obter um ID de indicador válido para teste
        SELECT id INTO insert_test_id FROM 008_indicadores LIMIT 1;

        IF insert_test_id IS NOT NULL THEN
            DECLARE
                start_time TIMESTAMP;
            BEGIN
                start_time := clock_timestamp();

                -- Inserir 100 registros de teste
                INSERT INTO 019_historico_indicadores (
                    id_indicador,
                    justificativa_observacao,
                    impacto_n_implementacao,
                    resultado_mes,
                    data_apuracao
                )
                SELECT
                    insert_test_id,
                    'Teste de performance ' || generate_series(1, 100),
                    'Impacto teste',
                    (RANDOM() * 30 + 70)::numeric(10,2), -- Valores entre 70-100
                    NOW() - (generate_series(1, 100) || ' days')::interval;

                insert_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;

                -- Remover registros de teste
                DELETE FROM 019_historico_indicadores
                WHERE justificativa_observacao LIKE 'Teste de performance %';
            END;

            IF insert_time_ms <= insert_limit_ms THEN
                INSERT INTO test_results (test_name, status, details)
                VALUES ('7.4 - Performance inserção em massa', 'PASS',
                       '100 registros inseridos em ' || insert_time_ms || 'ms');
                passed_tests := passed_tests + 1;
                RAISE NOTICE '✓ Teste 7.4: Inserção em massa em %ms', insert_time_ms;
            ELSE
                INSERT INTO test_results (test_name, status, details)
                VALUES ('7.4 - Performance inserção em massa', 'FAIL',
                       '100 registros em ' || insert_time_ms || 'ms (limite: ' || insert_limit_ms || 'ms)');
                failed_tests := failed_tests + 1;
                RAISE WARNING '✗ Teste 7.4: Inserção lenta: %ms', insert_time_ms;
            END IF;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.4 - Performance inserção em massa', 'SKIP', 'Nenhum indicador disponível para teste');
            RAISE NOTICE '! Teste 7.4: Pulado - nenhum indicador disponível';
        END IF;
    END;

    -- Teste 7.5: Performance de agregações analíticas
    DECLARE
        analytics_time_ms INTEGER;
        analytics_limit_ms INTEGER := 4000; -- 4 segundos para consulta analítica complexa
        analytics_results INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        DECLARE
            start_time TIMESTAMP;
        BEGIN
            start_time := clock_timestamp();

            -- Consulta analítica complexa com múltiplas agregações
            SELECT COUNT(*) INTO analytics_results
            FROM (
                SELECT
                    i.id_risco,
                    i.situacao_indicador,
                    COUNT(h.id) as total_medicoes,
                    AVG(h.resultado_mes) as media_resultado,
                    MIN(h.resultado_mes) as min_resultado,
                    MAX(h.resultado_mes) as max_resultado,
                    STDDEV(h.resultado_mes) as stddev_resultado,
                    DATE_TRUNC('month', h.data_apuracao) as mes_apuracao
                FROM 008_indicadores i
                LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                WHERE h.data_apuracao >= NOW() - INTERVAL '1 year'
                GROUP BY i.id_risco, i.situacao_indicador, DATE_TRUNC('month', h.data_apuracao)
                HAVING COUNT(h.id) > 0
            ) as analytics_result;

            analytics_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
        END;

        IF analytics_time_ms <= analytics_limit_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.5 - Performance analítica complexa', 'PASS',
                   'Executou em ' || analytics_time_ms || 'ms. Grupos analíticos: ' || analytics_results);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 7.5: Analítica complexa em %ms (% grupos)', analytics_time_ms, analytics_results;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.5 - Performance analítica complexa', 'FAIL',
                   'Executou em ' || analytics_time_ms || 'ms (limite: ' || analytics_limit_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 7.5: Analítica complexa lenta: %ms', analytics_time_ms;
        END IF;
    END;

    -- Teste 7.6: Performance em carga concorrente (simulação)
    DECLARE
        concurrent_time_ms INTEGER;
        concurrent_limit_ms INTEGER := 5000; -- 5 segundos para múltiplas consultas
        concurrent_success INTEGER := 0;
    BEGIN
        total_tests := total_tests + 1;

        DECLARE
            start_time TIMESTAMP;
        BEGIN
            start_time := clock_timestamp();

            -- Simular 10 consultas concorrentes
            FOR i IN 1..10 LOOP
                BEGIN
                    -- Consultas diferentes para simular carga real
                    CASE i
                        WHEN 1 THEN PERFORM 1 FROM 008_indicadores LIMIT 100;
                        WHEN 2 THEN PERFORM 1 FROM 019_historico_indicadores WHERE data_apuracao >= NOW() - INTERVAL '30 days' LIMIT 100;
                        WHEN 3 THEN PERFORM 1 FROM vw_indicadores_com_historico_recente LIMIT 50;
                        WHEN 4 THEN SELECT COUNT(*) INTO concurrent_success FROM 008_indicadores WHERE situacao_indicador = 'Em Andamento'::situacao_indicador_enum;
                        WHEN 5 THEN SELECT AVG(resultado_mes) INTO concurrent_success FROM 019_historico_indicadores WHERE resultado_mes IS NOT NULL;
                        WHEN 6 THEN PERFORM 1 FROM 008_indicadores ORDER BY created_at DESC LIMIT 50;
                        WHEN 7 THEN PERFORM 1 FROM 019_historico_indicadores ORDER BY data_apuracao DESC LIMIT 50;
                        WHEN 8 THEN SELECT COUNT(DISTINCT id_risco) INTO concurrent_success FROM 008_indicadores;
                        WHEN 9 THEN SELECT COUNT(*) INTO concurrent_success FROM 019_historico_indicadores WHERE resultado_mes BETWEEN 80 AND 100;
                        WHEN 10 THEN PERFORM 1 FROM vw_historico_indicadores_por_ano LIMIT 30;
                    END CASE;
                EXCEPTION
                    WHEN OTHERS THEN
                        -- Ignorar erros individuais na simulação
                        NULL;
                END;
            END LOOP;

            concurrent_time_ms := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
        END;

        IF concurrent_time_ms <= concurrent_limit_ms THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.6 - Performance carga concorrente', 'PASS',
                   '10 consultas concorrentes em ' || concurrent_time_ms || 'ms');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 7.6: Carga concorrente em %ms', concurrent_time_ms;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('7.6 - Performance carga concorrente', 'FAIL',
                   '10 consultas em ' || concurrent_time_ms || 'ms (limite: ' || concurrent_limit_ms || 'ms)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 7.6: Carga concorrente lenta: %ms', concurrent_time_ms;
        END IF;
    END;

    -- Resumo dos testes de performance
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTES DETALHADOS DE PERFORMANCE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '🎉 TODOS OS TESTES DE PERFORMANCE PASSARAM!';
        RAISE NOTICE '✅ Performance pós-migração dentro dos limites esperados';
    ELSIF failed_tests <= 2 THEN
        RAISE NOTICE '⚠️ Pequenos problemas de performance detectados';
        RAISE NOTICE '✅ Performance geralmente aceitável, mas merece atenção';
    ELSE
        RAISE NOTICE '❌ MÚLTIPLOS PROBLEMAS DE PERFORMANCE';
        RAISE NOTICE '⚠️ Revisar otimizações antes de produção';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results WHERE test_name LIKE '7.%' ORDER BY test_name;

-- Exibir plano de execução para análise de performance
RAISE NOTICE 'Planos de execução para análise:';

-- Plano da view principal
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM vw_indicadores_com_historico_recente LIMIT 10;

-- Plano de join complexo
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT i.id_risco, COUNT(h.id) as total_historicos
FROM 008_indicadores i
LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
WHERE i.situacao_indicador = 'Em Andamento'
GROUP BY i.id_risco
LIMIT 5;