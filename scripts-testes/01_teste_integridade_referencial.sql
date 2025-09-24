-- ============================================================================
-- TESTE 1: INTEGRIDADE REFERENCIAL
-- Propósito: Validar todas as chaves estrangeiras e relações entre tabelas
-- ============================================================================

BEGIN;

-- Criar tabela temporária para resultados dos testes
DROP TABLE IF EXISTS test_results;
CREATE TABLE test_results (
    test_name TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    details TEXT,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando Teste 1: Integridade Referencial...';
    total_tests := total_tests + 1;

    -- Teste 1.1: Verificar todas as FKs da tabela fato
    DECLARE
        invalid_fk_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO invalid_fk_count
        FROM 019_historico_indicadores h
        LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
        WHERE i.id IS NULL;

        IF invalid_fk_count = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.1 - FKs válidas na tabela fato', 'PASS', 'Todas as chaves estrangeiras são válidas');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 1.1: Todas as FKs da tabela fato são válidas';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.1 - FKs válidas na tabela fato', 'FAIL', invalid_fk_count || ' chaves estrangeiras inválidas encontradas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 1.1: Encontradas % chaves estrangeiras inválidas', invalid_fk_count;
        END IF;
    END;

    -- Teste 1.2: Verificar duplicatas na tabela fato
    DECLARE
        duplicate_count INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO duplicate_count
        FROM (
            SELECT id_indicador, data_apuracao, COUNT(*)
            FROM 019_historico_indicadores
            GROUP BY id_indicador, data_apuracao
            HAVING COUNT(*) > 1
        ) AS duplicates;

        IF duplicate_count = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.2 - Sem duplicatas na tabela fato', 'PASS', 'Nenhuma duplicata encontrada');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 1.2: Nenhuma duplicata encontrada na tabela fato';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.2 - Sem duplicatas na tabela fato', 'FAIL', duplicate_count || ' combinações duplicadas encontradas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 1.2: Encontradas % combinações duplicadas', duplicate_count;
        END IF;
    END;

    -- Teste 1.3: Verificar integridade dos dados migrados
    DECLARE
        migrated_data_ok BOOLEAN := TRUE;
        missing_data_count INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se todos os indicadores com dados históricos têm registros na tabela fato
        SELECT COUNT(*) INTO missing_data_count
        FROM 008_indicadores i
        WHERE EXISTS (
            SELECT 1 FROM 008_indicadores_backup b
            WHERE b.id = i.id AND b.resultado_mes IS NOT NULL
        )
        AND NOT EXISTS (
            SELECT 1 FROM 019_historico_indicadores h
            WHERE h.id_indicador = i.id
        );

        IF missing_data_count = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.3 - Integridade dos dados migrados', 'PASS', 'Todos os dados históricos foram migrados corretamente');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 1.3: Todos os dados históricos migrados corretamente';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.3 - Integridade dos dados migrados', 'FAIL', missing_data_count || ' indicadores com dados históricos não têm registros na tabela fato');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 1.3: % indicadores com dados históricos não têm registros na tabela fato', missing_data_count;
        END IF;
    END;

    -- Teste 1.4: Verificar constraints não nulas
    DECLARE
        null_constraints_violations INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO null_constraints_violations
        FROM 019_historico_indicadores
        WHERE id_indicador IS NULL;

        IF null_constraints_violations = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.4 - Constraints NOT NULL', 'PASS', 'Todas as constraints NOT NULL estão sendo respeitadas');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 1.4: Todas as constraints NOT NULL estão OK';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.4 - Constraints NOT NULL', 'FAIL', null_constraints_violations || ' violações de constraints NOT NULL');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 1.4: % violações de constraints NOT NULL', null_constraints_violations;
        END IF;
    END;

    -- Teste 1.5: Verificar tipos de dados
    DECLARE
        data_type_issues INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se resultado_mes é numérico quando não nulo
        SELECT COUNT(*) INTO data_type_issues
        FROM 019_historico_indicadores
        WHERE resultado_mes IS NOT NULL
        AND resultado_mes::text !~ '^[0-9]+(\.[0-9]+)?$';

        IF data_type_issues = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.5 - Tipos de dados', 'PASS', 'Todos os dados estão com tipos corretos');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 1.5: Todos os tipos de dados estão corretos';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('1.5 - Tipos de dados', 'FAIL', data_type_issues || ' problemas com tipos de dados encontrados');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 1.5: % problemas com tipos de dados', data_type_issues;
        END IF;
    END;

    -- Resumo do teste de integridade referencial
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTE DE INTEGRIDADE REFERENCIAL';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '✓ TESTE DE INTEGRIDADE REFERENCIAL: APROVADO';
    ELSE
        RAISE NOTICE '✗ TESTE DE INTEGRIDADE REFERENCIAL: REPROVADO';
        RAISE NOTICE 'Verifique os detalhes na tabela test_results';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results ORDER BY test_name;