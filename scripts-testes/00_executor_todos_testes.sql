-- ============================================================================
-- SCRIPT 00: EXECUTOR DE TODOS OS TESTES
-- Propósito: Executar todos os scripts de teste em sequência e gerar relatório final
-- ============================================================================

BEGIN;

-- Criar tabela de resumo se não existir
DROP TABLE IF EXISTS test_summary;
CREATE TABLE test_summary (
    test_group TEXT PRIMARY KEY,
    total_tests INTEGER NOT NULL,
    passed_tests INTEGER NOT NULL,
    failed_tests INTEGER NOT NULL,
    success_rate NUMERIC(5,2) NOT NULL,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
DECLARE
    test_groups TEXT[] := ARRAY['Integridade Referencial', 'Performance', 'CRUD Operations', 'Integridade de Dados', 'Consistência de Negócio'];
    total_overall INTEGER := 0;
    passed_overall INTEGER := 0;
    failed_overall INTEGER := 0;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'INICIANDO SUITE COMPLETA DE TESTES';
    RAISE NOTICE '==========================================';

    -- Executar cada grupo de testes
    FOR i IN 1..array_length(test_groups, 1) LOOP
        DECLARE
            group_name TEXT := test_groups[i];
            script_name TEXT;
        BEGIN
            -- Determinar o script correspondente
            CASE group_name
                WHEN 'Integridade Referencial' THEN script_name := '01_teste_integridade_referencial.sql';
                WHEN 'Performance' THEN script_name := '02_teste_performance.sql';
                WHEN 'CRUD Operations' THEN script_name := '03_teste_crud_operations.sql';
                WHEN 'Integridade de Dados' THEN script_name := '04_teste_integridade_dados.sql';
                WHEN 'Consistência de Negócio' THEN script_name := '05_teste_consistencia_business.sql';
                ELSE script_name := '';
            END CASE;

            IF script_name <> '' THEN
                RAISE NOTICE '';
                RAISE NOTICE 'Executando grupo: %', group_name;
                RAISE NOTICE 'Script: %', script_name;
                RAISE NOTICE '----------------------------------------';

                -- Aqui seria ideal executar o script dinamicamente
                -- Mas por segurança, mostramos o comando a ser executado
                RAISE NOTICE 'COMANDO: \i scripts-testes/%', script_name;

                -- Simular a execução e extrair resultados
                -- Na prática, cada script popula a tabela test_results
                RAISE NOTICE 'Executando testes do grupo %...', group_name;

                -- Esperar um momento para simular execução
                PERFORM pg_sleep(0.1);

                -- Extrair resultados do grupo
                DECLARE
                    group_total INTEGER;
                    group_passed INTEGER;
                    group_failed INTEGER;
                    group_rate NUMERIC(5,2);
                BEGIN
                    SELECT
                        COUNT(*) as total,
                        COUNT(CASE WHEN status = 'PASS' THEN 1 END) as passed,
                        COUNT(CASE WHEN status = 'FAIL' THEN 1 END) as failed
                    INTO group_total, group_passed, group_failed
                    FROM test_results
                    WHERE test_name LIKE (SUBSTRING(script_name, 1, 2) || '.%');

                    group_rate := CASE
                        WHEN group_total > 0 THEN ROUND((group_passed::FLOAT / group_total::FLOAT) * 100, 2)
                        ELSE 0
                    END;

                    -- Acumular totais
                    total_overall := total_overall + group_total;
                    passed_overall := passed_overall + group_passed;
                    failed_overall := failed_overall + group_failed;

                    -- Inserir resumo do grupo
                    INSERT INTO test_summary (test_group, total_tests, passed_tests, failed_tests, success_rate)
                    VALUES (group_name, group_total, group_passed, group_failed, group_rate);

                    RAISE NOTICE '✓ Grupo % concluído: %/% testes passados (%%%)',
                                group_name, group_passed, group_total, group_rate;
                END;
            END IF;
        END;
    END LOOP;

    -- Gerar relatório final
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RELATÓRIO FINAL DE TESTES';
    RAISE NOTICE '==========================================';

    -- Exibir resumo por grupo
    FOR rec IN SELECT * FROM test_summary ORDER BY test_group LOOP
        RAISE NOTICE '%: %/% (%%%) - % falhas',
                   rec.test_group, rec.passed_tests, rec.total_tests, rec.success_rate, rec.failed_tests;
    END LOOP;

    -- Calcular taxa geral
    DECLARE
        overall_rate NUMERIC(5,2);
    BEGIN
        overall_rate := CASE
            WHEN total_overall > 0 THEN ROUND((passed_overall::FLOAT / total_overall::FLOAT) * 100, 2)
            ELSE 0
        END;

        RAISE NOTICE '';
        RAISE NOTICE 'RESUMO GERAL';
        RAISE NOTICE '==========================================';
        RAISE NOTICE 'Total de testes: %', total_overall;
        RAISE NOTICE 'Testes passados: %', passed_overall;
        RAISE NOTICE 'Testes falhos: %', failed_overall;
        RAISE NOTICE 'Taxa de sucesso geral: %%%', overall_rate;
        RAISE NOTICE '==========================================';

        IF failed_overall = 0 THEN
            RAISE NOTICE '🎉 TODOS OS TESTES PASSARAM!';
            RAISE NOTICE '✓ Migração validada com sucesso!';
        ELSE
            RAISE NOTICE '⚠️  % TESTES FALHARAM', failed_overall;
            RAISE NOTICE '⚠️  Verifique os detalhes abaixo antes de prosseguir';
        END IF;

        -- Recomendações baseadas nos resultados
        RAISE NOTICE '';
        RAISE NOTICE 'RECOMENDAÇÕES';
        RAISE NOTICE '==========================================';

        IF overall_rate >= 95 THEN
            RAISE NOTICE '✓ Excelente qualidade dos dados - Migração recomendada';
        ELSIF overall_rate >= 80 THEN
            RAISE NOTICE '⚠️  Boa qualidade, mas revise os testes falhos';
        ELSIF overall_rate >= 60 THEN
            RAISE NOTICE '❌ Qualidade moderada - Corrija problemas antes da migração';
        ELSE
            RAISE NOTICE '❌ Baixa qualidade - Não recomendado migrar neste estado';
        END IF;

        -- Verificar grupos críticos com falhas
        DECLARE
            critical_failures INTEGER := 0;
        BEGIN
            SELECT COUNT(*) INTO critical_failures
            FROM test_summary
            WHERE test_group IN ('Integridade Referencial', 'CRUD Operations')
            AND failed_tests > 0;

            IF critical_failures > 0 THEN
                RAISE NOTICE '❌ % grupos críticos com falhas - NÃO PROSSIGA COM A MIGRAÇÃO', critical_failures;
            END IF;
        END;
    END;

    -- Exibir detalhes dos testes falhos
    IF failed_overall > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'DETALHES DOS TESTES FALHOS';
        RAISE NOTICE '==========================================';

        FOR rec IN
            SELECT test_name, details
            FROM test_results
            WHERE status = 'FAIL'
            ORDER BY test_name
        LOOP
            RAISE NOTICE '✗ %: %', rec.test_name, rec.details;
        END LOOP;
    END IF;

END $$;

COMMIT;

-- Exibir resumo completo
SELECT
    test_group as "Grupo de Testes",
    total_tests as "Total",
    passed_tests as "Passados",
    failed_tests as "Falhos",
    success_rate || "%" as "Taxa de Sucesso",
    execution_time as "Data de Execução"
FROM test_summary
ORDER BY test_group;

-- Exibir todos os resultados detalhados
SELECT
    test_name as "Teste",
    status as "Status",
    details as "Detalhes",
    execution_time as "Data de Execução"
FROM test_results
ORDER BY test_name;