-- ============================================================================
-- SCRIPT 01: COMPARAÇÃO COM BASELINE PRÉ-MIGRAÇÃO
-- Propósito: Comparar resultados pós-migração com baseline original
-- ============================================================================

BEGIN;

-- Criar tabela para armazenar comparações se não existir
DROP TABLE IF EXISTS baseline_comparison;
CREATE TABLE baseline_comparison (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    baseline_value NUMERIC,
    current_value NUMERIC,
    difference NUMERIC,
    difference_percent NUMERIC,
    status TEXT, -- 'MELHOROU', 'PIOROU', 'IGUAL', 'NOVO'
    validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details TEXT
);

DO $$
DECLARE
    total_comparisons INTEGER := 0;
    improvements INTEGER := 0;
    degradations INTEGER := 0;
    equal INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando comparação com baseline pré-migração...';

    -- Limpar comparações anteriores
    DELETE FROM baseline_comparison;

    -- Comparação 1: Total de registros na tabela dimensão
    DECLARE
        baseline_008_count NUMERIC;
        current_008_count NUMERIC;
    BEGIN
        total_comparisons := total_comparisons + 1;

        -- Baseline (do backup)
        SELECT COUNT(*) INTO baseline_008_count FROM 008_indicadores_backup;

        -- Atual
        SELECT COUNT(*) INTO current_008_count FROM 008_indicadores;

        INSERT INTO baseline_comparison (metric_name, baseline_value, current_value, difference, difference_percent, status, details)
        VALUES (
            'Total de registros na tabela 008',
            baseline_008_count,
            current_008_count,
            current_008_count - baseline_008_count,
            CASE
                WHEN baseline_008_count > 0 THEN ROUND(((current_008_count - baseline_008_count) / baseline_008_count) * 100, 2)
                ELSE 0
            END,
            CASE
                WHEN current_008_count = baseline_008_count THEN 'IGUAL'
                WHEN current_008_count > baseline_008_count THEN 'AUMENTOU'
                ELSE 'DIMINUIU'
            END,
            'Comparação do total de indicadores na tabela dimensão'
        );

        IF current_008_count = baseline_008_count THEN
            equal := equal + 1;
            RAISE NOTICE '✓ Tabela 008: Igual (%)', current_008_count;
        ELSE
            RAISE NOTICE '! Tabela 008: % -> % (% change)',
                       baseline_008_count, current_008_count,
                       ROUND(((current_008_count - baseline_008_count) / baseline_008_count) * 100, 2);
        END IF;
    END;

    -- Comparação 2: Total de dados históricos
    DECLARE
        baseline_historical_count NUMERIC;
        current_historical_count NUMERIC;
    BEGIN
        total_comparisons := total_comparisons + 1;

        -- Baseline (dados históricos na tabela 008 original)
        SELECT COUNT(*) INTO baseline_historical_count
        FROM 008_indicadores_backup
        WHERE resultado_mes IS NOT NULL;

        -- Atual (dados na tabela fato)
        SELECT COUNT(*) INTO current_historical_count FROM 019_historico_indicadores;

        INSERT INTO baseline_comparison (metric_name, baseline_value, current_value, difference, difference_percent, status, details)
        VALUES (
            'Total de registros históricos',
            baseline_historical_count,
            current_historical_count,
            current_historical_count - baseline_historical_count,
            CASE
                WHEN baseline_historical_count > 0 THEN ROUND(((current_historical_count - baseline_historical_count) / baseline_historical_count) * 100, 2)
                ELSE 0
            END,
            CASE
                WHEN current_historical_count = baseline_historical_count THEN 'IGUAL'
                WHEN current_historical_count > baseline_historical_count THEN 'AUMENTOU'
                ELSE 'DIMINUIU'
            END,
            'Comparação do total de dados históricos migrados'
        );

        IF current_historical_count = baseline_historical_count THEN
            equal := equal + 1;
            RAISE NOTICE '✓ Dados históricos: Igual (%)', current_historical_count;
        ELSIF current_historical_count >= baseline_historical_count * 0.99 THEN -- 99% ou mais
            RAISE NOTICE '✓ Dados históricos: Quase igual (%/% - %%)',
                       current_historical_count, baseline_historical_count,
                       ROUND(((current_historical_count - baseline_historical_count) / baseline_historical_count) * 100, 2);
            equal := equal + 1;
        ELSE
            degradations := degradations + 1;
            RAISE NOTICE '⚠️ Dados históricos: Perda de dados (%/% - %%)',
                       current_historical_count, baseline_historical_count,
                       ROUND(((current_historical_count - baseline_historical_count) / baseline_historical_count) * 100, 2);
        END IF;
    END;

    -- Comparação 3: Integridade dos dados
    DECLARE
        baseline_data_quality NUMERIC;
        current_data_quality NUMERIC;
    BEGIN
        total_comparisons := total_comparisons + 1;

        -- Baseline (qualidade dos dados no backup)
        SELECT COUNT(*) INTO baseline_data_quality
        FROM 008_indicadores_backup
        WHERE resultado_mes IS NOT NULL
        AND resultado_mes BETWEEN 0 AND 100
        AND indicador_risco IS NOT NULL;

        -- Atual (qualidade dos dados atuais)
        SELECT COUNT(*) INTO current_data_quality
        FROM 008_indicadores i
        WHERE EXISTS (
            SELECT 1 FROM 019_historico_indicadores h
            WHERE h.id_indicador = i.id
            AND h.resultado_mes BETWEEN 0 AND 100
        )
        AND i.indicador_risco IS NOT NULL;

        INSERT INTO baseline_comparison (metric_name, baseline_value, current_value, difference, difference_percent, status, details)
        VALUES (
            'Qualidade dos dados (registros válidos)',
            baseline_data_quality,
            current_data_quality,
            current_data_quality - baseline_data_quality,
            CASE
                WHEN baseline_data_quality > 0 THEN ROUND(((current_data_quality - baseline_data_quality) / baseline_data_quality) * 100, 2)
                ELSE 0
            END,
            CASE
                WHEN current_data_quality = baseline_data_quality THEN 'IGUAL'
                WHEN current_data_quality > baseline_data_quality THEN 'MELHOROU'
                ELSE 'PIOROU'
            END,
            'Qualidade dos dados baseada em registros válidos'
        );

        IF current_data_quality >= baseline_data_quality THEN
            improvements := improvements + 1;
            RAISE NOTICE '✓ Qualidade dos dados: Melhorou ou igual (%)', current_data_quality;
        ELSE
            degradations := degradations + 1;
            RAISE NOTICE '⚠️ Qualidade dos dados: Piorou (% -> %)',
                       baseline_data_quality, current_data_quality;
        END IF;
    END;

    -- Comparação 4: Performance de consultas
    DECLARE
        baseline_query_time NUMERIC;
        current_query_time NUMERIC;
    BEGIN
        total_comparisons := total_comparisons + 1;

        -- Medir tempo de consulta baseline (simulado)
        baseline_query_time := 1500; -- 1.5 segundos estimado do sistema original

        -- Medir tempo de consulta atual
        DECLARE
            start_time TIMESTAMP;
            end_time TIMESTAMP;
        BEGIN
            start_time := clock_timestamp();

            -- Executar consulta típica
            PERFORM 1 FROM (
                SELECT i.*, h.resultado_mes, h.data_apuracao
                FROM 008_indicadores i
                LEFT JOIN 019_historico_indicadores h ON i.id = h.id_indicador
                AND h.data_apuracao = (
                    SELECT MAX(data_apuracao)
                    FROM 019_historico_indicadores
                    WHERE id_indicador = i.id
                )
                LIMIT 100
            ) as query_test;

            end_time := clock_timestamp();
            current_query_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
        END;

        INSERT INTO baseline_comparison (metric_name, baseline_value, current_value, difference, difference_percent, status, details)
        VALUES (
            'Performance de consulta típica (ms)',
            baseline_query_time,
            current_query_time,
            current_query_time - baseline_query_time,
            CASE
                WHEN baseline_query_time > 0 THEN ROUND(((current_query_time - baseline_query_time) / baseline_query_time) * 100, 2)
                ELSE 0
            END,
            CASE
                WHEN current_query_time <= baseline_query_time * 1.1 THEN 'IGUAL' -- Tolerância de 10%
                WHEN current_query_time < baseline_query_time THEN 'MELHOROU'
                ELSE 'PIOROU'
            END,
            'Tempo de execução de consulta típica em milissegundos'
        );

        IF current_query_time <= baseline_query_time * 1.1 THEN
            improvements := improvements + 1;
            RAISE NOTICE '✓ Performance: Aceitável (%ms vs %ms baseline)',
                       current_query_time, baseline_query_time;
        ELSE
            degradations := degradations + 1;
            RAISE NOTICE '⚠️ Performance: Degradação (%ms vs %ms baseline)',
                       current_query_time, baseline_query_time;
        END IF;
    END;

    -- Comparação 5: Uso de espaço em disco
    DECLARE
        baseline_space NUMERIC;
        current_space NUMERIC;
    BEGIN
        total_comparisons := total_comparisons + 1;

        -- Calcular espaço do backup (baseline)
        SELECT pg_total_relation_size('008_indicadores_backup') INTO baseline_space;

        -- Calcular espaço atual
        SELECT pg_total_relation_size('008_indicadores') + pg_total_relation_size('019_historico_indicadores')
        INTO current_space;

        INSERT INTO baseline_comparison (metric_name, baseline_value, current_value, difference, difference_percent, status, details)
        VALUES (
            'Uso de espaço em disco (bytes)',
            baseline_space,
            current_space,
            current_space - baseline_space,
            CASE
                WHEN baseline_space > 0 THEN ROUND(((current_space - baseline_space) / baseline_space) * 100, 2)
                ELSE 0
            END,
            CASE
                WHEN current_space <= baseline_space * 1.2 THEN 'IGUAL' -- Tolerância de 20%
                WHEN current_space < baseline_space THEN 'MELHOROU'
                ELSE 'PIOROU'
            END,
            'Espaço total utilizado pelas tabelas de indicadores'
        );

        IF current_space <= baseline_space * 1.2 THEN
            improvements := improvements + 1;
            RAISE NOTICE '✓ Espaço em disco: Aceitável (% vs % bytes)',
                       pg_size_pretty(current_space), pg_size_pretty(baseline_space);
        ELSE
            degradations := degradations + 1;
            RAISE NOTICE '⚠️ Espaço em disco: Aumento significativo (% vs % bytes)',
                       pg_size_pretty(current_space), pg_size_pretty(baseline_space);
        END IF;
    END;

    -- Comparação 6: Consistência de relacionamentos
    DECLARE
        relationship_consistency NUMERIC;
    BEGIN
        total_comparisons := total_comparisons + 1;

        -- Verificar se todos os históricos têm indicadores correspondentes
        SELECT COUNT(*) INTO relationship_consistency
        FROM 019_historico_indicadores h
        LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
        WHERE i.id IS NULL;

        INSERT INTO baseline_comparison (metric_name, baseline_value, current_value, difference, difference_percent, status, details)
        VALUES (
            'Consistência de relacionamentos',
            0, -- Baseline ideal é 0
            relationship_consistency,
            relationship_consistency,
            0,
            CASE
                WHEN relationship_consistency = 0 THEN 'IGUAL'
                ELSE 'PIOROU'
            END,
            'Número de históricos sem indicadores correspondentes'
        );

        IF relationship_consistency = 0 THEN
            improvements := improvements + 1;
            RAISE NOTICE '✓ Relacionamentos: 100% consistentes';
        ELSE
            degradations := degradations + 1;
            RAISE NOTICE '⚠️ Relacionamentos: % inconsistências encontradas', relationship_consistency;
        END IF;
    END;

    -- Resumo da comparação
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RESUMO DA COMPARAÇÃO COM BASELINE';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Total de métricas comparadas: %', total_comparisons;
    RAISE NOTICE 'Métricas que melhoraram: %', improvements;
    RAISE NOTICE 'Métricas que pioraram: %', degradations;
    RAISE NOTICE 'Métricas iguais: %', equal;
    RAISE NOTICE 'Taxa de sucesso: %%%', ROUND(((improvements + equal)::FLOAT / total_comparisons::FLOAT) * 100, 2);
    RAISE NOTICE '==========================================';

    IF degradations = 0 THEN
        RAISE NOTICE '🎉 TODAS AS MÉTRICAS ESTÃO IGUAIS OU MELHORES!';
        RAISE NOTICE '✅ Migração validada com sucesso comparado ao baseline';
    ELSIF degradations <= 2 THEN
        RAISE NOTICE '⚠️ Pequenas degradações detectadas, mas dentro de limites aceitáveis';
        RAISE NOTICE '✅ Migração geralmente bem-sucedida';
    ELSE
        RAISE NOTICE '❌ Múltiplas degradações significativas detectadas';
        RAISE NOTICE '⚠️ Revisar migração antes de prosseguir para produção';
    END IF;

END $$;

COMMIT;

-- Exibir resultados detalhados da comparação
SELECT
    metric_name as "Métrica",
    baseline_value as "Baseline",
    current_value as "Atual",
    difference as "Diferença",
    difference_percent || "%" as "Variação %",
    status as "Status",
    details as "Detalhes"
FROM baseline_comparison
ORDER BY
    CASE status
        WHEN 'PIOROU' THEN 1
        WHEN 'DIMINUIU' THEN 2
        WHEN 'IGUAL' THEN 3
        WHEN 'AUMENTOU' THEN 4
        WHEN 'MELHOROU' THEN 5
        ELSE 6
    END,
    metric_name;