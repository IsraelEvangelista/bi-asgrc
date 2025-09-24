-- ============================================================================
-- TESTE 3: OPERAÇÕES CRUD
-- Propósito: Testar todas as operações CRUD nas tabelas após migração
-- ============================================================================

BEGIN;

-- Limpar tabela de resultados anteriores
DELETE FROM test_results WHERE test_name LIKE '3.%';

DO $$
DECLARE
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
    test_indicador_id UUID;
    test_historico_id UUID;
    test_risco_id UUID;
    test_responsavel_id UUID;
BEGIN
    RAISE NOTICE 'Iniciando Teste 3: Operações CRUD...';

    -- Obter IDs válidos para teste
    SELECT id INTO test_risco_id FROM 006_matriz_riscos LIMIT 1;
    SELECT id INTO test_responsavel_id FROM 003_areas_gerencias LIMIT 1;

    IF test_risco_id IS NULL THEN
        RAISE NOTICE 'Criando risco de teste...';
        INSERT INTO 006_matriz_riscos (
            id, eventos_riscos, probabilidade, impacto, severidade, classificacao,
            responsavel_risco, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'Risco de Teste',
            3, 4, 12, 'Médio',
            test_responsavel_id,
            NOW(), NOW()
        )
        RETURNING id INTO test_risco_id;
    END IF;

    -- Teste 3.1: CREATE - Inserir novo indicador
    BEGIN
        total_tests := total_tests + 1;

        INSERT INTO 008_indicadores (
            id, id_risco, indicador_risco, responsavel_risco, meta_efetiva, meta_desc,
            limite_tolerancia, tipo_acompanhamento, apuracao, situacao_indicador, tolerancia
        ) VALUES (
            gen_random_uuid(),
            test_risco_id,
            'Indicador de Teste CRUD',
            test_responsavel_id,
            95.0,
            'Meta de teste para validação CRUD',
            '5%',
            'Mensal',
            'Apuração mensal de resultados',
            'Em Andamento'::situacao_indicador_enum,
            'Dentro da Tolerância'::tolerancia_enum
        )
        RETURNING id INTO test_indicador_id;

        IF test_indicador_id IS NOT NULL THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.1 - CREATE Indicador', 'PASS', 'Indicador criado com ID: ' || test_indicador_id);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 3.1: Indicador criado com sucesso';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.1 - CREATE Indicador', 'FAIL', 'Falha ao criar indicador');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.1: Falha ao criar indicador';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.1 - CREATE Indicador', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.1: Erro ao criar indicador: %', SQLERRM;
    END;

    -- Teste 3.2: CREATE - Inserir histórico para o indicador
    BEGIN
        total_tests := total_tests + 1;

        INSERT INTO 019_historico_indicadores (
            id_indicador, justificativa_observacao, impacto_n_implementacao, resultado_mes, data_apuracao
        ) VALUES (
            test_indicador_id,
            'Teste de inserção de histórico',
            'Impacto de teste para validação CRUD',
            87.5,
            NOW()
        )
        RETURNING id INTO test_historico_id;

        IF test_historico_id IS NOT NULL THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.2 - CREATE Histórico', 'PASS', 'Histórico criado com ID: ' || test_historico_id);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 3.2: Histórico criado com sucesso';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.2 - CREATE Histórico', 'FAIL', 'Falha ao criar histórico');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.2: Falha ao criar histórico';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.2 - CREATE Histórico', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.2: Erro ao criar histórico: %', SQLERRM;
    END;

    -- Teste 3.3: READ - Consultar indicador com histórico
    DECLARE
        indicador_encontrado RECORD;
    BEGIN
        total_tests := total_tests + 1;

        SELECT * INTO indicador_encontrado
        FROM vw_indicadores_com_historico_recente
        WHERE id = test_indicador_id;

        IF indicador_encontrado.id IS NOT NULL THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.3 - READ Indicador com histórico', 'PASS',
                   'Indicador encontrado: ' || indicador_encontrado.indicador_risco);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 3.3: Indicador lido com sucesso';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.3 - READ Indicador com histórico', 'FAIL', 'Indicador não encontrado');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.3: Indicador não encontrado';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.3 - READ Indicador com histórico', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.3: Erro ao ler indicador: %', SQLERRM;
    END;

    -- Teste 3.4: UPDATE - Atualizar dados do indicador
    BEGIN
        total_tests := total_tests + 1;

        UPDATE 008_indicadores
        SET meta_efetiva = 98.0,
            meta_desc = 'Meta atualizada pelo teste CRUD',
            updated_at = NOW()
        WHERE id = test_indicador_id;

        IF FOUND THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.4 - UPDATE Indicador', 'PASS', 'Indicador atualizado com sucesso');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 3.4: Indicador atualizado com sucesso';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.4 - UPDATE Indicador', 'FAIL', 'Nenhum indicador atualizado');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.4: Falha ao atualizar indicador';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.4 - UPDATE Indicador', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.4: Erro ao atualizar indicador: %', SQLERRM;
    END;

    -- Teste 3.5: UPDATE - Atualizar histórico
    BEGIN
        total_tests := total_tests + 1;

        UPDATE 019_historico_indicadores
        SET resultado_mes = 92.3,
            justificativa_observacao = 'Justificativa atualizada pelo teste CRUD',
            updated_at = NOW()
        WHERE id = test_historico_id;

        IF FOUND THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.5 - UPDATE Histórico', 'PASS', 'Histórico atualizado com sucesso');
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 3.5: Histórico atualizado com sucesso';
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.5 - UPDATE Histórico', 'FAIL', 'Nenhum histórico atualizado');
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.5: Falha ao atualizar histórico';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.5 - UPDATE Histórico', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.5: Erro ao atualizar histórico: %', SQLERRM;
    END;

    -- Teste 3.6: DELETE - Testar cascade delete
    BEGIN
        total_tests := total_tests + 1;

        DELETE FROM 008_indicadores WHERE id = test_indicador_id;

        -- Verificar se o histórico foi deletado em cascade
        DECLARE
            historico_restante INTEGER;
        BEGIN
            SELECT COUNT(*) INTO historico_restante
            FROM 019_historico_indicadores
            WHERE id_indicador = test_indicador_id;

            IF historico_restante = 0 THEN
                INSERT INTO test_results (test_name, status, details)
                VALUES ('3.6 - DELETE Cascade', 'PASS', 'Cascade delete funcionou corretamente');
                passed_tests := passed_tests + 1;
                RAISE NOTICE '✓ Teste 3.6: Cascade delete funcionou corretamente';
            ELSE
                INSERT INTO test_results (test_name, status, details)
                VALUES ('3.6 - DELETE Cascade', 'FAIL', historico_restante || ' registros históricos restantes');
                failed_tests := failed_tests + 1;
                RAISE WARNING '✗ Teste 3.6: Cascade delete falhou - % registros restantes', historico_restante;
            END IF;
        END;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.6 - DELETE Cascade', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.6: Erro no cascade delete: %', SQLERRM;
    END;

    -- Teste 3.7: Testar função de cálculo de tolerância
    DECLARE
        tolerancia_result TEXT;
    BEGIN
        total_tests := total_tests + 1;

        SELECT fn_calcular_tolerancia_indicador(85.0, 90.0) INTO tolerancia_result;

        IF tolerancia_result = 'Fora da Tolerância' THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.7 - Função de tolerância', 'PASS', 'Função retornou: ' || tolerancia_result);
            passed_tests := passed_tests + 1;
            RAISE NOTICE '✓ Teste 3.7: Função de tolerância retornou %', tolerancia_result;
        ELSE
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.7 - Função de tolerância', 'FAIL', 'Retorno inesperado: ' || tolerancia_result);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.7: Função de tolerância retornou % (esperado: Fora da Tolerância)', tolerancia_result;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            INSERT INTO test_results (test_name, status, details)
            VALUES ('3.7 - Função de tolerância', 'FAIL', 'Erro: ' || SQLERRM);
            failed_tests := failed_tests + 1;
            RAISE WARNING '✗ Teste 3.7: Erro na função de tolerância: %', SQLERRM;
    END;

    -- Resumo do teste de CRUD
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO - TESTE DE OPERAÇÕES CRUD';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de testes: %', total_tests;
    RAISE NOTICE 'Testes passados: %', passed_tests;
    RAISE NOTICE 'Testes falhos: %', failed_tests;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((passed_tests::FLOAT / total_tests::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF failed_tests = 0 THEN
        RAISE NOTICE '✓ TESTE DE OPERAÇÕES CRUD: APROVADO';
    ELSE
        RAISE NOTICE '✗ TESTE DE OPERAÇÕES CRUD: REPROVADO';
        RAISE NOTICE 'Verifique os detalhes na tabela test_results';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados
SELECT * FROM test_results WHERE test_name LIKE '3.%' ORDER BY test_name;