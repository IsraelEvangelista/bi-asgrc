-- ============================================================================
-- SCRIPT 3: MIGRAR DADOS DA TABELA 008 PARA A TABELA 019
-- Propósito: Migrar dados históricos da tabela dimensão para a tabela fato
-- ============================================================================

-- Iniciar transação para garantir consistência
BEGIN;

-- Registrar início do passo
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('migrar_dados', 'Migrar dados da 008_indicadores para a 019_historico_indicadores', 'IN_PROGRESS', NOW());

DO $$
DECLARE
    total_records INTEGER;
    migrated_records INTEGER;
    records_with_data INTEGER;
BEGIN
    -- Verificar se a tabela 008_indicadores_backup existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '008_indicadores_backup') THEN
        RAISE EXCEPTION 'Tabela 008_indicadores_backup não encontrada. Execute o script 01 primeiro.';
    END IF;

    -- Contar registros totais na tabela backup
    SELECT COUNT(*) INTO total_records FROM 008_indicadores_backup;
    RAISE NOTICE 'Total de registros na tabela backup: %', total_records;

    -- Contar registros com dados para migração (resultado_mes não nulo)
    SELECT COUNT(*) INTO records_with_data FROM 008_indicadores_backup WHERE resultado_mes IS NOT NULL;
    RAISE NOTICE 'Registros com dados para migração: %', records_with_data;

    -- Migrar dados da 008 para a 019
    -- IMPORTANTE: A tabela 008 já possui dados existentes que precisam ser migrados
    INSERT INTO 019_historico_indicadores (
        id_indicador,
        justificativa_observacao,
        impacto_n_implementacao,
        resultado_mes,
        data_apuracao,
        updated_at,
        created_at
    )
    SELECT
        id, -- ID do indicador que será referenciado como FK na tabela fato
        COALESCE(justificativa_observacao, '') as justificativa_observacao,
        COALESCE(impacto_n_implementacao, '') as impacto_n_implementacao,
        resultado_mes, -- Valor do resultado que será convertido para percentual no frontend
        CASE
            WHEN updated_at IS NOT NULL THEN updated_at
            WHEN created_at IS NOT NULL THEN created_at
            ELSE NOW()
        END as data_apuracao, -- Data da apuração substituindo o campo apuracao
        COALESCE(updated_at, NOW()) as updated_at,
        COALESCE(created_at, NOW()) as created_at
    FROM 008_indicadores_backup
    WHERE resultado_mes IS NOT NULL; -- Apenas migrar registros que têm dados históricos

    -- Obter número de registros migrados
    GET DIAGNOSTICS migrated_records = ROW_COUNT;
    RAISE NOTICE 'Registros migrados com sucesso: %', migrated_records;

    -- Validar integridade dos dados migrados
    IF migrated_records != records_with_data THEN
        RAISE WARNING 'Número de registros migrados (%) difere do esperado (%)', migrated_records, records_with_data;
    END IF;

    -- Validar integridade referencial
    DECLARE
        invalid_fk INTEGER;
    BEGIN
        SELECT COUNT(*) INTO invalid_fk
        FROM 019_historico_indicadores h
        LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
        WHERE i.id IS NULL;

        IF invalid_fk > 0 THEN
            RAISE WARNING 'Encontrados % registros com foreign key inválida', invalid_fk;
        ELSE
            RAISE NOTICE 'Todas as foreign keys são válidas';
        END IF;
    END;

    -- Registrar conclusão do passo
    UPDATE migration_log
    SET status = 'COMPLETED',
        records_affected = migrated_records,
        executed_at = NOW()
    WHERE step = 'migrar_dados';

    RAISE NOTICE 'Script 03: Migração de dados executada com sucesso';
    RAISE NOTICE 'Total de registros migrados: % de % disponíveis', migrated_records, records_with_data;

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW()
        WHERE step = 'migrar_dados';

        RAISE EXCEPTION 'Erro ao executar script 03: %', SQLERRM;
END $$;

-- Confirmar transação
COMMIT;

-- Exibir resumo da migração
SELECT
    'Dados Migrados' as operacao,
    COUNT(*) as total_registros,
    '019_historico_indicadores' as tabela
FROM 019_historico_indicadores

UNION ALL

SELECT
    'Dados Originais com Resultado' as operacao,
    COUNT(*) as total_registros,
    '008_indicadores_backup' as tabela
FROM 008_indicadores_backup
WHERE resultado_mes IS NOT NULL

UNION ALL

SELECT
    'Chaves Estrangeiras Inválidas' as operacao,
    COUNT(*) as total_registros,
    'Validação' as tabela
FROM 019_historico_indicadores h
LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
WHERE i.id IS NULL

ORDER BY operacao;