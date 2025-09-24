-- ============================================================================
-- SCRIPT 03: RELATÓRIO FINAL DE VALIDAÇÃO PÓS-MIGRAÇÃO
-- Propósito: Gerar relatório consolidado com todas as métricas e validações
-- ============================================================================

BEGIN;

-- Criar tabela para relatório final se não existir
DROP TABLE IF EXISTS final_validation_report;
CREATE TABLE final_validation_report (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value TEXT NOT NULL,
    status TEXT NOT NULL, -- 'OK', 'WARNING', 'ERROR'
    details TEXT,
    impact TEXT, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    recommendation TEXT,
    validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
DECLARE
    total_metrics INTEGER := 0;
    ok_metrics INTEGER := 0;
    warning_metrics INTEGER := 0;
    error_metrics INTEGER := 0;
    migration_ready BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE 'Gerando Relatório Final de Validação Pós-Migração...';

    -- Limpar relatório anterior
    DELETE FROM final_validation_report;

    -- Categoria 1: Integridade de Dados
    RAISE NOTICE 'Validando Integridade de Dados...';

    -- Verificar integridade referencial
    DECLARE
        invalid_fk INTEGER;
    BEGIN
        SELECT COUNT(*) INTO invalid_fk
        FROM 019_historico_indicadores h
        LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
        WHERE i.id IS NULL;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Integridade de Dados',
            'Chaves Estrangeiras Válidas',
            invalid_fk || ' inválidas',
            CASE WHEN invalid_fk = 0 THEN 'OK' ELSE 'ERROR' END,
            'Foreign keys na tabela fato que não referenciam registros existentes na dimensão',
            CASE WHEN invalid_fk = 0 THEN 'LOW' ELSE 'CRITICAL' END,
            CASE
                WHEN invalid_fk = 0 THEN 'Nenhuma ação necessária'
                ELSE 'Corrigir chaves estrangeiras inválidas imediatamente'
            END
        );

        IF invalid_fk > 0 THEN migration_ready := FALSE;
    END;

    -- Verificar duplicatas
    DECLARE
        duplicate_records INTEGER;
    BEGIN
        SELECT COUNT(*) INTO duplicate_records
        FROM (
            SELECT id_indicador, data_apuracao, COUNT(*) as total
            FROM 019_historico_indicadores
            GROUP BY id_indicador, data_apuracao
            HAVING COUNT(*) > 1
        ) AS duplicates;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Integridade de Dados',
            'Registros Duplicados',
            duplicate_records || ' duplicatas',
            CASE WHEN duplicate_records = 0 THEN 'OK' ELSE 'WARNING' END,
            'Registros duplicados na tabela fato',
            CASE WHEN duplicate_records = 0 THEN 'LOW' ELSE 'MEDIUM' END,
            CASE
                WHEN duplicate_records = 0 THEN 'Nenhuma ação necessária'
                WHEN duplicate_records < 10 THEN 'Remover duplicatas manualmente'
                ELSE 'Investigar causa da duplicação em massa'
            END
        );
    END;

    -- Verificar consistência de dados
    DECLARE
        inconsistent_data INTEGER;
    BEGIN
        SELECT COUNT(*) INTO inconsistent_data
        FROM 019_historico_indicadores
        WHERE resultado_mes IS NOT NULL
        AND (resultado_mes < 0 OR resultado_mes > 100);

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Integridade de Dados',
            'Consistência de Valores',
            inconsistent_data || ' inconsistentes',
            CASE WHEN inconsistent_data = 0 THEN 'OK' ELSE 'WARNING' END,
            'Valores de resultado fora do intervalo esperado (0-100)',
            CASE WHEN inconsistent_data = 0 THEN 'LOW' ELSE 'MEDIUM' END,
            CASE
                WHEN inconsistent_data = 0 THEN 'Todos os valores estão dentro do esperado'
                ELSE 'Revisar e corrigir valores inconsistentes'
            END
        );
    END;

    -- Categoria 2: Performance
    RAISE NOTICE 'Avaliando Performance...';

    -- Tamanho das tabelas
    DECLARE
        table_size_008 BIGINT;
        table_size_019 BIGINT;
        total_size BIGINT;
    BEGIN
        SELECT pg_total_relation_size('008_indicadores') INTO table_size_008;
        SELECT pg_total_relation_size('019_historico_indicadores') INTO table_size_019;
        total_size := table_size_008 + table_size_019;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Performance',
            'Tamanho Total das Tabelas',
            pg_size_pretty(total_size),
            'OK',
            'Tabela 008: ' || pg_size_pretty(table_size_008) ||
            ', Tabela 019: ' || pg_size_pretty(table_size_019),
            'LOW',
            'Monitorar crescimento das tabelas'
        );
    END;

    -- Count de índices
    DECLARE
        index_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE tablename IN ('008_indicadores', '019_historico_indicadores');

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Performance',
            'Número de Índices',
            index_count || ' índices',
            CASE WHEN index_count >= 8 THEN 'OK' ELSE 'WARNING' END,
            'Índices para otimização de consultas',
            'MEDIUM',
            CASE
                WHEN index_count >= 8 THEN 'Número adequado de índices'
                ELSE 'Considerar criar mais índices para melhor performance'
            END
        );
    END;

    -- Categoria 3: Completude dos Dados
    RAISE NOTICE 'Verificando Completude dos Dados...';

    -- Total de indicadores
    DECLARE
        total_indicators INTEGER;
        active_indicators INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_indicators FROM 008_indicadores;
        SELECT COUNT(*) INTO active_indicators
        FROM 008_indicadores
        WHERE situacao_indicador = 'Em Andamento'::situacao_indicador_enum;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Completude dos Dados',
            'Total de Indicadores',
            total_indicators || ' (' || active_indicators || ' ativos)',
            'OK',
            'Indicadores cadastrados no sistema',
            'LOW',
            'Manter cadastro atualizado'
        );
    END;

    -- Total de registros históricos
    DECLARE
        total_historical INTEGER;
        indicators_with_history INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_historical FROM 019_historico_indicadores;
        SELECT COUNT(DISTINCT id_indicador) INTO indicators_with_history FROM 019_historico_indicadores;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Completude dos Dados',
            'Registros Históricos',
            total_historical || ' (' || indicators_with_history || ' indicadores com histórico)',
            'OK',
            'Dados históricos migrados para a tabela fato',
            'LOW',
            'Manter acompanhamento regular dos dados'
        );
    END;

    -- Categoria 4: Funcionalidade
    RAISE NOTICE 'Testando Funcionalidades...';

    -- Testar views
    DECLARE
        working_views INTEGER;
        total_views INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_views
        FROM information_schema.views
        WHERE table_name LIKE 'vw_%';

        SELECT COUNT(*) INTO working_views
        FROM (
            SELECT 1 FROM vw_indicadores_com_historico_recente LIMIT 1 UNION ALL
            SELECT 1 FROM vw_historico_indicadores_por_ano LIMIT 1 UNION ALL
            SELECT 1 FROM vw_indicadores_desempenho LIMIT 1
        ) AS views_test;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Funcionalidade',
            'Views Funcionando',
            working_views || '/' || total_views,
            CASE WHEN working_views >= 3 THEN 'OK' ELSE 'ERROR' END,
            'Views criadas para facilitar consultas',
            CASE WHEN working_views >= 3 THEN 'LOW' ELSE 'HIGH' END,
            CASE
                WHEN working_views >= 3 THEN 'Todas as views principais funcionam'
                ELSE 'Investigar e corrigir views com problemas'
            END
        );

        IF working_views < 3 THEN migration_ready := FALSE;
    END;

    -- Testar funções
    DECLARE
        working_functions INTEGER;
    BEGIN
        SELECT COUNT(*) INTO working_functions
        FROM (
            SELECT 1 WHERE fn_calcular_tolerancia_indicador(85, 90) = 'Fora da Tolerância' UNION ALL
            SELECT 1 WHERE fn_calcular_tolerancia_indicador(88, 90) = 'Dentro da Tolerância'
        ) AS functions_test;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Funcionalidade',
            'Funções Utilitárias',
            working_functions || '/2 funções',
            CASE WHEN working_functions = 2 THEN 'OK' ELSE 'WARNING' END,
            'Funções para cálculos automáticos',
            'MEDIUM',
            CASE
                WHEN working_functions = 2 THEN 'Todas as funções funcionam corretamente'
                ELSE 'Revisar implementação das funções'
            END
        );
    END;

    -- Categoria 5: Comparação com Baseline
    RAISE NOTICE 'Comparando com Baseline...';

    -- Comparar quantidade de dados
    DECLARE
        baseline_count INTEGER;
        current_count INTEGER;
        data_loss_percentage NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO baseline_count
        FROM 008_indicadores_backup
        WHERE resultado_mes IS NOT NULL;

        SELECT COUNT(*) INTO current_count FROM 019_historico_indicadores;

        data_loss_percentage := CASE
            WHEN baseline_count > 0 THEN ROUND(((baseline_count - current_count) / baseline_count::FLOAT) * 100, 2)
            ELSE 0
        END;

        INSERT INTO final_validation_report (category, metric_name, value, status, details, impact, recommendation)
        VALUES (
            'Baseline Comparison',
            'Perda de Dados',
            data_loss_percentage || '%',
            CASE
                WHEN data_loss_percentage <= 1 THEN 'OK'
                WHEN data_loss_percentage <= 5 THEN 'WARNING'
                ELSE 'ERROR'
            END,
            'Comparação: Baseline ' || baseline_count || ' vs Atual ' || current_count,
            CASE
                WHEN data_loss_percentage <= 1 THEN 'LOW'
                WHEN data_loss_percentage <= 5 THEN 'MEDIUM'
                ELSE 'CRITICAL'
            END,
            CASE
                WHEN data_loss_percentage <= 1 THEN 'Perda mínima aceitável'
                WHEN data_loss_percentage <= 5 THEN 'Investigar causa da perda'
                ELSE 'Perda significativa - não migrar para produção'
            END
        );

        IF data_loss_percentage > 5 THEN migration_ready := FALSE;
    END;

    -- Resumo final
    SELECT
        COUNT(*) INTO total_metrics,
        COUNT(CASE WHEN status = 'OK' THEN 1 END) INTO ok_metrics,
        COUNT(CASE WHEN status = 'WARNING' THEN 1 END) INTO warning_metrics,
        COUNT(CASE WHEN status = 'ERROR' THEN 1 END) INTO error_metrics
    FROM final_validation_report;

    -- Exibir resumo
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RELATÓRIO FINAL DE VALIDAÇÃO';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de métricas: %', total_metrics;
    RAISE NOTICE '✅ OK: %', ok_metrics;
    RAISE NOTICE '⚠️ WARNING: %', warning_metrics;
    RAISE NOTICE '❌ ERROR: %', error_metrics;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND((ok_metrics::FLOAT / total_metrics::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF migration_ready AND error_metrics = 0 THEN
        RAISE NOTICE '🎉 MIGRAÇÃO VALIDADA COM SUCESSO!';
        RAISE NOTICE '✅ PRONTO PARA MIGRAR PARA PRODUÇÃO';
    ELSIF migration_ready THEN
        RAISE NOTICE '⚠️ MIGRAÇÃO APROVADA COM RESSALVAS';
        RAISE NOTICE '✅ Pode migrar, mas atento aos warnings';
    ELSE
        RAISE NOTICE '❌ MIGRAÇÃO NÃO APROVADA';
        RAISE NOTICE '⚠️ CORRIGIR ERROS CRÍTICOS ANTES DE PROSSEGUIR';
    END IF;
    RAISE NOTICE '==========================================';

END $$;

COMMIT;

-- Exibir relatório completo
SELECT
    category as "Categoria",
    metric_name as "Métrica",
    value as "Valor",
    status as "Status",
    impact as "Impacto",
    recommendation as "Recomendação"
FROM final_validation_report
ORDER BY
    CASE status
        WHEN 'ERROR' THEN 1
        WHEN 'WARNING' THEN 2
        WHEN 'OK' THEN 3
        ELSE 4
    END,
    CASE impact
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
        ELSE 5
    END,
    category,
    metric_name;

-- Exibir resumo por categoria
RAISE NOTICE '';
RAISE NOTICE 'Resumo por Categoria:';

SELECT
    category as "Categoria",
    COUNT(*) as "Total",
    COUNT(CASE WHEN status = 'OK' THEN 1 END) as "OK",
    COUNT(CASE WHEN status = 'WARNING' THEN 1 END) as "Warnings",
    COUNT(CASE WHEN status = 'ERROR' THEN 1 END) as "Errors"
FROM final_validation_report
GROUP BY category
ORDER BY
    COUNT(CASE WHEN status = 'ERROR' THEN 1 END) DESC,
    category;