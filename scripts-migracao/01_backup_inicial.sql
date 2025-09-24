-- ============================================================================
-- SCRIPT 1: BACKUP INICIAL
-- Propósito: Criar backup completo das tabelas antes da migração
-- ============================================================================

-- Verificar se as tabelas existem antes do backup
DO $$
BEGIN
    -- Verificar tabela 008_indicadores
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '008_indicadores') THEN
        RAISE NOTICE 'Tabela 008_indicadores existe, criando backup...';

        -- Criar tabela de backup da 008_indicadores
        DROP TABLE IF EXISTS 008_indicadores_backup;
        CREATE TABLE 008_indicadores_backup AS SELECT * FROM 008_indicadores;

        -- Adicionar comentário
        COMMENT ON TABLE 008_indicadores_backup IS 'Backup da tabela 008_indicadores criado em ' || current_timestamp;

        -- Verificar contagem de registros
        DECLARE
            total_records INTEGER;
        BEGIN
            SELECT COUNT(*) INTO total_records FROM 008_indicadores_backup;
            RAISE NOTICE 'Backup da 008_indicadores criado com % registros', total_records;
        END;
    ELSE
        RAISE NOTICE 'Tabela 008_indicadores não existe';
    END IF;

    -- Verificar tabela 019_historico_indicadores
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '019_historico_indicadores') THEN
        RAISE NOTICE 'Tabela 019_historico_indicadores existe, criando backup...';

        -- Criar tabela de backup da 019_historico_indicadores
        DROP TABLE IF EXISTS 019_historico_indicadores_backup;
        CREATE TABLE 019_historico_indicadores_backup AS SELECT * FROM 019_historico_indicadores;

        -- Adicionar comentário
        COMMENT ON TABLE 019_historico_indicadores_backup IS 'Backup da tabela 019_historico_indicadores criado em ' || current_timestamp;

        -- Verificar contagem de registros
        DECLARE
            total_records INTEGER;
        BEGIN
            SELECT COUNT(*) INTO total_records FROM 019_historico_indicadores_backup;
            RAISE NOTICE 'Backup da 019_historico_indicadores criado com % registros', total_records;
        END;
    ELSE
        RAISE NOTICE 'Tabela 019_historico_indicadores não existe';
    END IF;

    -- Criar tabela de log da migração
    DROP TABLE IF EXISTS migration_log;
    CREATE TABLE migration_log (
        id SERIAL PRIMARY KEY,
        step TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        records_affected INTEGER DEFAULT 0,
        error_message TEXT,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        execution_time_ms INTEGER
    );

    -- Registrar início do processo de backup
    INSERT INTO migration_log (step, description, status, executed_at)
    VALUES ('backup_inicial', 'Backup completo das tabelas 008_indicadores e 019_historico_indicadores', 'COMPLETED', NOW());

    RAISE NOTICE 'Script de backup inicial executado com sucesso';
END $$;

-- Exibir resumo dos backups criados
SELECT
    '008_indicadores_backup' as tabela,
    COUNT(*) as total_registros
FROM 008_indicadores_backup
UNION ALL
SELECT
    '019_historico_indicadores_backup' as tabela,
    COUNT(*) as total_registros
FROM 019_historico_indicadores_backup
ORDER BY tabela;