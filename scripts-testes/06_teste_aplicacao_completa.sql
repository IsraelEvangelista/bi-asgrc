-- ============================================================================
-- SCRIPT 06: TESTE DE APLICAÇÃO COMPLETA PÓS-MIGRAÇÃO
-- Propósito: Testar todas as funcionalidades da aplicação após a migração
-- ============================================================================

BEGIN;

-- Limpar tabela de resultados anteriores
DELETE FROM test_results WHERE test_name LIKE '6.%';

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando Teste 6: Teste de Aplicação Completa...';

    -- Teste 6.1: Testar views criadas pela migração
    DECLARE
        views_funcionando INTEGER;
        total_views INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se as views principais existem e funcionam
        SELECT COUNT(*) INTO views_funcionando
        FROM (
            -- Testar view principal
            SELECT 1 as test UNION ALL
            SELECT 1 FROM vw_indicadores_com_historico_recente LIMIT 1 UNION ALL
            SELECT 1 FROM vw_historico_indicadores_por_ano LIMIT 1 UNION ALL
            SELECT 1 FROM vw_indicadores_desempenho LIMIT 1 UNION ALL
            SELECT 1 FROM vw_ultimos_resultados_indicadores LIMIT 1
        ) AS views_teste;

        SELECT COUNT(*) INTO total_views
        FROM information_schema.views
        WHERE table_name LIKE 'vw_%';

        IF views_funcionando >= 4 THEN -- Pelo menos 4 views principais funcionando
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.1 - Views de migração funcionando', 'PASS',
                   views_funcionando || ' de ' || total_views || ' views testadas com sucesso');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 6.1: Views funcionando corretamente';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.1 - Views de migração funcionando', 'FAIL',
                   'Apenas ' || views_funcionando || ' de ' || total_views || ' views funcionando');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 6.1: Apenas % views funcionando', views_funcionando;
        END IF;
    END;

    -- Teste 6.2: Testar funções utilitárias
    DECLARE
        funcoes_funcionando INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO funcoes_funcionando
        FROM (
            -- Testar função de cálculo de tolerância
            SELECT 1 WHERE fn_calcular_tolerancia_indicador(85.0, 90.0) = 'Fora da Tolerância' UNION ALL
            SELECT 1 WHERE fn_calcular_tolerancia_indicador(88.0, 90.0) = 'Dentro da Tolerância' UNION ALL

            -- Testar função de último histórico
            SELECT 1 FROM (
                SELECT * FROM fn_obter_ultimo_historico_indicador(
                    (SELECT id FROM 008_indicadores LIMIT 1)
                )
            ) as teste LIMIT 1
        ) AS funcoes_teste;

        IF funcoes_funcionando >= 2 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.2 - Funções utilitárias funcionando', 'PASS',
                   funcoes_funcionando || ' funções testadas com sucesso');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 6.2: Funções utilitárias funcionando';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.2 - Funções utilitárias funcionando', 'FAIL',
                   'Apenas ' || funcoes_funcionando || ' funções funcionando');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 6.2: Apenas % funções funcionando', funcoes_funcionando;
        END IF;
    END;

    -- Teste 6.3: Testar queries típicas do frontend
    DECLARE
        queries_frontend_sucesso INTEGER;
        queries_frontend_total INTEGER := 5;
    BEGIN
        total_tests := total_tests + 1;

        -- Simular queries comuns do frontend
        SELECT COUNT(*) INTO queries_frontend_sucesso
        FROM (
            -- Query 1: Listar indicadores com seus dados
            SELECT 1 FROM (
                SELECT i.*, h.resultado_mes, h.data_apuracao
                FROM 008_indicadores i
                LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                AND h.data_apuracao = (
                    SELECT MAX(data_apuracao)
                    FROM 019_historico_indicadores
                    WHERE id_indicador = i.id
                )
                LIMIT 10
            ) as q1 UNION ALL

            -- Query 2: Dados para gráficos
            SELECT 1 FROM (
                SELECT h.data_apuracao, h.resultado_mes, i.indicador_risco
                FROM 019_historico_indicadores h
                JOIN 008_indicadores i ON h.id_indicador = i.id
                WHERE h.data_apuracao >= NOW() - INTERVAL '6 months'
                ORDER BY h.data_apuracao
                LIMIT 100
            ) as q2 UNION ALL

            -- Query 3: Indicadores por situação
            SELECT 1 FROM (
                SELECT situacao_indicador, COUNT(*) as total
                FROM 008_indicadores
                GROUP BY situacao_indicador
            ) as q3 UNION ALL

            -- Query 4: Histórico por indicador
            SELECT 1 FROM (
                SELECT h.*
                FROM 019_historico_indicadores h
                WHERE h.id_indicador = (
                    SELECT id FROM 008_indicadores LIMIT 1
                )
                ORDER BY h.data_apuracao DESC
                LIMIT 12
            ) as q4 UNION ALL

            -- Query 5: Dashboard de desempenho
            SELECT 1 FROM (
                SELECT
                    i.indicador_risco,
                    i.meta_efetiva,
                    h.resultado_mes,
                    i.tolerancia
                FROM 008_indicadores i
                LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                AND h.data_apuracao >= NOW() - INTERVAL '30 days'
                WHERE i.situacao_indicador = 'Em Andamento'
                LIMIT 20
            ) as q5
        ) AS queries_teste;

        IF queries_frontend_sucesso = queries_frontend_total THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.3 - Queries frontend funcionando', 'PASS',
                   'Todas as ' || queries_frontend_total || ' queries testadas com sucesso');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 6.3: Queries frontend funcionando';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.3 - Queries frontend funcionando', 'FAIL',
                   queries_frontend_sucesso || ' de ' || queries_frontend_total || ' queries funcionando');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 6.3: Apenas % queries funcionando', queries_frontend_sucesso;
        END IF;
    END;

    -- Teste 6.4: Testar integridade dos dados para dashboards
    DECLARE
        dashboard_dados_ok BOOLEAN := TRUE;
        detalhes_dashboard TEXT := '';
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar dados para dashboard principal
        IF NOT EXISTS (SELECT 1 FROM 008_indicadores LIMIT 1) THEN
            dashboard_dados_ok := FALSE;
            detalhes_dashboard := detalhes_dashboard || 'Sem dados na tabela 008. ';
        END IF;

        -- Verificar dados históricos para gráficos
        IF NOT EXISTS (SELECT 1 FROM 019_historico_indicadores LIMIT 1) THEN
            detalhes_dashboard := detalhes_dashboard || 'Sem dados históricos. ';
        END IF;

        -- Verificar indicadores ativos
        DECLARE
            indicadores_ativos INTEGER;
        BEGIN
            SELECT COUNT(*) INTO indicadores_ativos
            FROM 008_indicadores
            WHERE situacao_indicador = 'Em Andamento'::situacao_indicador_enum;

            IF indicadores_ativos = 0 THEN
                detalhes_dashboard := detalhes_dashboard || 'Nenhum indicador ativo. ';
            END IF;
        END;

        IF dashboard_dados_ok AND (indicadores_ativos > 0 OR detalhes_dashboard = '') THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.4 - Dados para dashboards', 'PASS',
                   'Dados disponíveis para dashboards. Indicadores ativos: ' || indicadores_ativos);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 6.4: Dados para dashboards OK';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.4 - Dados para dashboards', 'FAIL', detalhes_dashboard);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 6.4: Problemas nos dados para dashboard';
        END IF;
    END;

    -- Teste 6.5: Testar performance de operações críticas
    DECLARE
        performance_ok BOOLEAN := TRUE;
        detalhes_performance TEXT := '';
        tempo_limite_ms INTEGER := 2000; -- 2 segundos
    BEGIN
        total_tests := total_tests + 1;

        -- Testar performance da view principal
        DECLARE
            tempo_view_ms INTEGER;
        BEGIN
            SELECT EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000 INTO tempo_view_ms
            FROM (
                SELECT clock_timestamp() as start_time
                UNION ALL
                SELECT clock_timestamp()
                FROM vw_indicadores_com_historico_recente
                LIMIT 100
            ) as timing;

            IF tempo_view_ms > tempo_limite_ms THEN
                performance_ok := FALSE;
                detalhes_performance := detalhes_performance || 'View principal lenta: ' || tempo_view_ms || 'ms. ';
            END IF;
        END;

        -- Testar performance de join complexo
        DECLARE
            tempo_join_ms INTEGER;
        BEGIN
            SELECT EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000 INTO tempo_join_ms
            FROM (
                SELECT clock_timestamp() as start_time
                UNION ALL
                SELECT clock_timestamp()
                FROM 008_indicadores i
                LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                WHERE i.situacao_indicador = 'Em Andamento'
                LIMIT 200
            ) as timing;

            IF tempo_join_ms > tempo_limite_ms THEN
                performance_ok := FALSE;
                detalhes_performance := detalhes_performance || 'Join complexo lento: ' || tempo_join_ms || 'ms. ';
            END IF;
        END;

        IF performance_ok THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.5 - Performance operações críticas', 'PASS',
                   'Todas as operações dentro do limite de ' || tempo_limite_ms || 'ms');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 6.5: Performance dentro dos limites';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.5 - Performance operações críticas', 'FAIL', detalhes_performance);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 6.5: Performance abaixo do esperado';
        END IF;
    END;

    -- Teste 6.6: Testar consistência de dados pós-migração
    DECLARE
        consistencia_ok BOOLEAN := TRUE;
        detalhes_consistencia TEXT := '';
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se todos os indicadores têm estrutura correta
        DECLARE
            indicadores_sem_campos_essenciais INTEGER;
        BEGIN
            SELECT COUNT(*) INTO indicadores_sem_campos_essenciais
            FROM 008_indicadores
            WHERE indicador_risco IS NULL
            OR id_risco IS NULL
            OR situacao_indicador IS NULL;

            IF indicadores_sem_campos_essenciais > 0 THEN
                consistencia_ok := FALSE;
                detalhes_consistencia := detalhes_consistencia || indicadores_sem_campos_essenciais || ' indicadores sem campos essenciais. ';
            END IF;
        END;

        -- Verificar dados históricos consistentes
        DECLARE
            historicos_inconsistentes INTEGER;
        BEGIN
            SELECT COUNT(*) INTO historicos_inconsistentes
            FROM 019_historico_indicadores h
            LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
            WHERE i.id IS NULL
            OR h.resultado_mes < 0
            OR h.resultado_mes > 100;

            IF historicos_inconsistentes > 0 THEN
                consistencia_ok := FALSE;
                detalhes_consistencia := detalhes_consistencia || historicos_inconsistentes || ' históricos inconsistentes. ';
            END IF;
        END;

        IF consistencia_ok THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.6 - Consistência dados pós-migração', 'PASS', 'Todos os dados consistentes');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 6.6: Dados consistentes pós-migração';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('6.6 - Consistência dados pós-migração', 'FAIL', detalhes_consistencia);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 6.6: Inconsistências encontradas';
        END IF;
    END;

    -- Resumo do teste de aplicação completa
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTE DE APLICAÇÃO COMPLETA';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '✓ TESTE DE APLICAÇÃO COMPLETA: APROVADO';
        RAISE NOTICE '✅ A aplicação está pronta para uso pós-migração';
    ELSE
        RAISE NOTICE '✗ TESTE DE APLICAÇÃO COMPLETA: REPROVADO';
        RAISE NOTICE '⚠️  Corrija os problemas antes de usar em produção';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results WHERE test_name LIKE '6.%' ORDER BY test_name;

-- Exibir resumo funcional da aplicação
RAISE NOTICE 'Resumo funcional pós-migração:';

SELECT
    'Total de Indicadores' as metrica,
    COUNT(*) as valor
FROM 008_indicadores

UNION ALL

SELECT
    'Indicadores Ativos' as metrica,
    COUNT(*) as valor
FROM 008_indicadores
WHERE situacao_indicador = 'Em Andamento'::situacao_indicador_enum

UNION ALL

SELECT
    'Registros Históricos' as metrica,
    COUNT(*) as valor
FROM 019_historico_indicadores

UNION ALL

SELECT
    'Média de Históricos por Indicador' as metrica,
    ROUND(AVG(contagem), 2) as valor
FROM (
    SELECT id_indicador, COUNT(*) as contagem
    FROM 019_historico_indicadores
    GROUP BY id_indicador
) as subquery

UNION ALL

SELECT
    'Indicadores Dentro da Tolerância' as metrica,
    COUNT(*) as valor
FROM 008_indicadores
WHERE tolerancia = 'Dentro da Tolerância'::tolerancia_enum;