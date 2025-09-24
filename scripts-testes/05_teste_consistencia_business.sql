-- ============================================================================
-- SCRIPT 05: TESTE DE CONSISTÊNCIA DE REGRAS DE NEGÓCIO
-- Propósito: Validar regras de negócio específicas do sistema ASGRC
-- ============================================================================

BEGIN;

-- Limpar tabela de resultados anteriores
DELETE FROM test_results WHERE test_name LIKE '5.%';

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando Teste 5: Consistência de Regras de Negócio...';

    -- Teste 5.1: Verificar se todos os indicadores com metas têm dados históricos
    DECLARE
        indicadores_sem_historico INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO indicadores_sem_historico
        FROM 008_indicadores i
        WHERE i.meta_efetiva IS NOT NULL
        AND i.meta_efetiva > 0
        AND NOT EXISTS (
            SELECT 1 FROM 019_historico_indicadores h
            WHERE h.id_indicador = i.id
        );

        IF indicadores_sem_historico = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.1 - Indicadores com metas têm histórico', 'PASS', 'Todos os indicadores com metas têm dados históricos');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 5.1: Todos os indicadores com metas têm histórico';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.1 - Indicadores com metas têm histórico', 'FAIL',
                   indicadores_sem_historico || ' indicadores com metas não têm histórico');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 5.1: % indicadores com metas não têm histórico', indicadores_sem_historico;
        END IF;
    END;

    -- Teste 5.2: Validar situação dos indicadores vs tolerância
    DECLARE
        inconsistencias_situacao INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se a situação do indicador corresponde ao cálculo de tolerância
        SELECT COUNT(*) INTO inconsistencias_situacao
        FROM 008_indicadores i
        JOIN 019_historico_indicadores h ON i.id = h.id_indicador
        WHERE h.resultado_mes IS NOT NULL
        AND i.tolerancia IS NOT NULL
        AND i.limite_tolerancia IS NOT NULL
        AND (
            -- Se resultado < meta - tolerância, deve estar "Fora da Tolerância"
            (h.resultado_mes < (i.meta_efetiva - i.limite_tolerancia) AND i.tolerancia <> 'Fora da Tolerância'::tolerancia_enum)
            OR
            -- Se resultado > meta + tolerância, deve estar "Fora da Tolerância"
            (h.resultado_mes > (i.meta_efetiva + i.limite_tolerancia) AND i.tolerancia <> 'Fora da Tolerância'::tolerancia_enum)
            OR
            -- Se resultado dentro da tolerância, deve estar "Dentro da Tolerância"
            (h.resultado_mes BETWEEN (i.meta_efetiva - i.limite_tolerancia) AND (i.meta_efetiva + i.limite_tolerancia)
             AND i.tolerancia <> 'Dentro da Tolerância'::tolerancia_enum)
        );

        IF inconsistencias_situacao = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.2 - Consistência situação vs tolerância', 'PASS', 'Situação dos indicadores consistente com tolerância');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 5.2: Situação vs tolerância consistente';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.2 - Consistência situação vs tolerância', 'FAIL',
                   inconsistencias_situacao || ' inconsistências encontradas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 5.2: % inconsistências situação vs tolerância', inconsistencias_situacao;
        END IF;
    END;

    -- Teste 5.3: Verificar dados históricos recentes (últimos 90 dias)
    DECLARE
        dados_recentes INTEGER;
        total_indicadores_ativos INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Contar indicadores ativos (com situação "Em Andamento")
        SELECT COUNT(*) INTO total_indicadores_ativos
        FROM 008_indicadores
        WHERE situacao_indicador = 'Em Andamento'::situacao_indicador_enum;

        -- Contar quantos têm dados nos últimos 90 dias
        SELECT COUNT(DISTINCT h.id_indicador) INTO dados_recentes
        FROM 019_historico_indicadores h
        JOIN 008_indicadores i ON h.id_indicador = i.id
        WHERE i.situacao_indicador = 'Em Andamento'::situacao_indicador_enum
        AND h.data_apuracao >= NOW() - INTERVAL '90 days';

        IF total_indicadores_ativos = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.3 - Dados recentes para indicadores ativos', 'SKIP', 'Nenhum indicador ativo encontrado');
            RAISE NOTICE '! Teste 5.3: Pulado - nenhum indicador ativo';
        ELSIF dados_recentes >= total_indicadores_ativos * 0.8 THEN -- 80% ou mais têm dados recentes
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.3 - Dados recentes para indicadores ativos', 'PASS',
                   dados_recentes || ' de ' || total_indicadores_ativos || ' indicadores ativos têm dados recentes');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 5.3: %/% indicadores ativos com dados recentes', dados_recentes, total_indicadores_ativos;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.3 - Dados recentes para indicadores ativos', 'FAIL',
                   dados_recentes || ' de ' || total_indicadores_ativos || ' indicadores ativos têm dados recentes (esperado >80%)');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 5.3: Apenas %/% indicadores ativos com dados recentes', dados_recentes, total_indicadores_ativos;
        END IF;
    END;

    -- Teste 5.4: Validar responsáveis por indicadores
    DECLARE
        indicadores_sem_responsavel INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        SELECT COUNT(*) INTO indicadores_sem_responsavel
        FROM 008_indicadores
        WHERE responsavel_risco IS NULL;

        IF indicadores_sem_responsavel = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.4 - Responsáveis por indicadores', 'PASS', 'Todos os indicadores têm responsáveis definidos');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 5.4: Todos os indicadores têm responsáveis';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.4 - Responsáveis por indicadores', 'FAIL',
                   indicadores_sem_responsavel || ' indicadores não têm responsáveis');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 5.4: % indicadores sem responsáveis', indicadores_sem_responsavel;
        END IF;
    END;

    -- Teste 5.5: Verificar evolução temporal dos resultados
    DECLARE
        evolucao_consistente BOOLEAN := TRUE;
        detalhes_evolucao TEXT := '';
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se há evolução temporal coerente (datas em ordem crescente)
        FOR rec IN
            SELECT id_indicador, data_apuracao,
                   LAG(data_apuracao) OVER (PARTITION BY id_indicador ORDER BY data_apuracao) as data_anterior
            FROM 019_historico_indicadores
            WHERE id_indicador IN (
                SELECT id_indicador
                FROM 019_historico_indicadores
                GROUP BY id_indicador
                HAVING COUNT(*) > 1
                LIMIT 5
            )
            ORDER BY id_indicador, data_apuracao
        LOOP
            EXIT WHEN rec.data_anterior IS NULL;
            IF rec.data_apuracao < rec.data_anterior THEN
                evolucao_consistente := FALSE;
                detalhes_evolucao := detalhes_evolucao || 'Indicador ' || rec.id_indicador ||
                                    ': Data ' || rec.data_apuracao || ' < Data anterior ' || rec.data_anterior || '. ';
            END IF;
        END LOOP;

        IF evolucao_consistente THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.5 - Evolução temporal consistente', 'PASS', 'Evolução temporal dos dados está consistente');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 5.5: Evolução temporal consistente';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.5 - Evolução temporal consistente', 'FAIL', detalhes_evolucao);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 5.5: Problemas na evolução temporal';
        END IF;
    END;

    -- Teste 5.6: Validar consistência entre metas e resultados
    DECLARE
        metas_inconsistentes INTEGER;
    BEGIN
        total_tests := total_tests + 1;

        -- Verificar se há resultados absurdamente maiores ou menores que as metas
        SELECT COUNT(*) INTO metas_inconsistentes
        FROM 008_indicadores i
        JOIN 019_historico_indicadores h ON i.id = h.id_indicador
        WHERE i.meta_efetiva IS NOT NULL AND i.meta_efetiva > 0
        AND h.resultado_mes IS NOT NULL
        AND (
            h.resultado_mes > i.meta_efetiva * 2 -- Resultado mais que 200% da meta
            OR
            h.resultado_mes < i.meta_efetiva * 0.1 -- Resultado menos que 10% da meta
        );

        IF metas_inconsistentes = 0 THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.6 - Consistência metas vs resultados', 'PASS', 'Resultados consistentes com as metas definidas');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 5.6: Resultados consistentes com metas';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('5.6 - Consistência metas vs resultados', 'FAIL',
                   metas_inconsistentes || ' resultados inconsistentes com metas');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 5.6: % resultados inconsistentes com metas', metas_inconsistentes;
        END IF;
    END;

    -- Resumo do teste de consistência de negócio
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTE DE CONSISTÊNCIA DE NEGÓCIO';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '✓ TESTE DE CONSISTÊNCIA DE NEGÓCIO: APROVADO';
    ELSE
        RAISE NOTICE '✗ TESTE DE CONSISTÊNCIA DE NEGÓCIO: REPROVADO';
        RAISE NOTICE 'Verifique os detalhes na tabela test_results';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results WHERE test_name LIKE '5.%' ORDER BY test_name;

-- Exibir métricas de negócio adicionais
RAISE NOTICE 'Métricas de negócio para análise:';

SELECT
    'Média de resultados' as metrica,
    ROUND(AVG(h.resultado_mes), 2) as valor
FROM 019_historico_indicadores h
WHERE h.resultado_mes IS NOT NULL

UNION ALL

SELECT
    'Meta média' as metrica,
    ROUND(AVG(i.meta_efetiva), 2) as valor
FROM 008_indicadores i
WHERE i.meta_efetiva IS NOT NULL

UNION ALL

SELECT
    'Desvio médio vs meta' as metrica,
    ROUND(AVG(ABS(h.resultado_mes - i.meta_efetiva)), 2) as valor
FROM 008_indicadores i
JOIN 019_historico_indicadores h ON i.id = h.id_indicador
WHERE h.resultado_mes IS NOT NULL AND i.meta_efetiva IS NOT NULL

UNION ALL

SELECT
    'Indicadores fora da tolerância' as metrica,
    COUNT(*) as valor
FROM 008_indicadores
WHERE tolerancia = 'Fora da Tolerância'::tolerancia_enum;