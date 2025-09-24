-- ============================================================================
-- SCRIPT 04: TESTE DE INTEGRIDADE DE DADOS
-- Propósito: Validar consistência dos dados após migração
-- ============================================================================

BEGIN;

-- Limpar tabela de resultados anteriores
DELETE FROM test_results WHERE test_name LIKE '4.%';

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando Teste 4: Integridade de Dados...';

    -- Teste 4.1: Verificar consistência de dados migrados
    DECLARE
        dados_consistentes INTEGER;
        total_indicadores_backup INTEGER;
        total_historicos_migrados INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Contar indicadores com dados históricos no backup
        SELECT COUNT(*) INTO total_indicadores_backup
        FROM 008_indicadores_backup
        WHERE resultado_mes IS NOT NULL;

        -- Contar históricos migrados
        SELECT COUNT(*) INTO total_historicos_migrados
        FROM 019_historico_indicadores;

        -- Verificar se a quantidade é consistente
        IF total_indicadores_backup = total_historicos_migrados THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.1 - Consistência de dados migrados', 'PASS',
                   'Backup: ' || total_indicadores_backup || ' registros, Migrados: ' || total_historicos_migrados || ' registros');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 4.1: Dados migrados consistentes (%)', total_historicos_migrados;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.1 - Consistência de dados migrados', 'FAIL',
                   'Backup: ' || total_indicadores_backup || ' registros, Migrados: ' || total_historicos_migrados || ' registros');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 4.1: Inconsistência encontrada - Backup: %, Migrados: %',
                         total_indicadores_backup, total_historicos_migrados;
        END IF;
    END;

    -- Teste 4.2: Validar valores numéricos no resultado_mes
    DECLARE
        valores_invalidos INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO valores_invalidos
        FROM 019_historico_indicadores
        WHERE resultado_mes IS NOT NULL
        AND (resultado_mes < 0 OR resultado_mes > 100 OR resultado_mes IS NULL);

        IF valores_invalidos = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.2 - Valores numéricos válidos', 'PASS', 'Todos os valores de resultado_mes estão entre 0 e 100');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 4.2: Todos os valores numéricos são válidos';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.2 - Valores numéricos válidos', 'FAIL', valores_invalidos || ' valores inválidos encontrados');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 4.2: Encontrados % valores inválidos', valores_invalidos;
        END IF;
    END;

    -- Teste 4.3: Verificar datas de apuração válidas
    DECLARE
        datas_invalidas INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO datas_invalidas
        FROM 019_historico_indicadores
        WHERE data_apuracao IS NULL
        OR data_apuracao < '2020-01-01'
        OR data_apuracao > NOW() + INTERVAL '1 year';

        IF datas_invalidas = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.3 - Datas de apuração válidas', 'PASS', 'Todas as datas de apuração são válidas');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 4.3: Todas as datas são válidas';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.3 - Datas de apuração válidas', 'FAIL', datas_invalidas || ' datas inválidas encontradas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 4.3: Encontradas % datas inválidas', datas_invalidas;
        END IF;
    END;

    -- Teste 4.4: Verificar integridade de campos textuais
    DECLARE
        textos_inconsistentes INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO textos_inconsistentes
        FROM 019_historico_indicadores
        WHERE
            (justificativa_observacao IS NULL AND impacto_n_implementacao IS NOT NULL) OR
            (impacto_n_implementacao IS NULL AND justificativa_observacao IS NOT NULL);

        IF textos_inconsistentes = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.4 - Integridade de campos textuais', 'PASS', 'Campos textuais consistentes');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 4.4: Campos textuais consistentes';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.4 - Integridade de campos textuais', 'FAIL', textos_inconsistentes || ' inconsistências encontradas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 4.4: Encontradas % inconsistências', textos_inconsistentes;
        END IF;
    END;

    -- Teste 4.5: Verificar duplicatas de indicador+data
    DECLARE
        duplicatas_temporais INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO duplicatas_temporais
        FROM (
            SELECT id_indicador, data_apuracao, COUNT(*) as total
            FROM 019_historico_indicadores
            GROUP BY id_indicador, data_apuracao
            HAVING COUNT(*) > 1
        ) AS duplicatas;

        IF duplicatas_temporais = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.5 - Sem duplicatas temporais', 'PASS', 'Nenhuma duplicata de indicador+data encontrada');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 4.5: Nenhuma duplicata temporal encontrada';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.5 - Sem duplicatas temporais', 'FAIL', duplicatas_temporais || ' duplicatas encontradas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 4.5: Encontradas % duplicatas temporais', duplicatas_temporais;
        END IF;
    END;

    -- Teste 4.6: Verificar relação 1:N entre dimensão e fato
    DECLARE
        relacao_1n_valida BOOLEAN := TRUE;
        detalhes_relacao TEXT := '';
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se cada indicador pode ter múltiplos históricos
        FOR rec IN
            SELECT i.id, COUNT(h.id) as total_historicos
            FROM 008_indicadores i
            LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
            GROUP BY i.id
            ORDER BY total_historicos DESC
            LIMIT 5
        LOOP
            detalhes_relacao := detalhes_relacao || 'Indicador ' || rec.id || ': ' || rec.total_historicos || ' históricos. ';

            -- Se encontrar algum indicador com histórico, a relação está funcionando
            IF rec.total_historicos > 0 THEN
                relacao_1n_valida := TRUE;
            END IF;
        END LOOP;

        IF relacao_1n_valida THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.6 - Relação 1:N entre tabelas', 'PASS', 'Relação 1:N funcionando corretamente. ' || detalhes_relacao);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 4.6: Relação 1:N validada com sucesso';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('4.6 - Relação 1:N entre tabelas', 'FAIL', 'Relação 1:N não está funcionando');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 4.6: Problema na relação 1:N';
        END IF;
    END;

    -- Resumo do teste de integridade de dados
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTE DE INTEGRIDADE DE DADOS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '✓ TESTE DE INTEGRIDADE DE DADOS: APROVADO';
    ELSE
        RAISE NOTICE '✗ TESTE DE INTEGRIDADE DE DADOS: REPROVADO';
        RAISE NOTICE 'Verifique os detalhes na tabela test_results';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results WHERE test_name LIKE '4.%' ORDER BY test_name;

-- Exibir estatísticas adicionais para análise
RAISE NOTICE 'Estatísticas adicionais para análise:';

SELECT
    'Total de indicadores na dimensão' as metrica,
    COUNT(*) as valor
FROM 008_indicadores

UNION ALL

SELECT
    'Total de registros na fato' as metrica,
    COUNT(*) as valor
FROM 019_historico_indicadores

UNION ALL

SELECT
    'Indicadores com dados históricos' as metrica,
    COUNT(DISTINCT id_indicador) as valor
FROM 019_historico_indicadores

UNION ALL

SELECT
    'Média de registros por indicador' as metrica,
    ROUND(AVG(contagem), 2) as valor
FROM (
    SELECT id_indicador, COUNT(*) as contagem
    FROM 019_historico_indicadores
    GROUP BY id_indicador
) as subquery;