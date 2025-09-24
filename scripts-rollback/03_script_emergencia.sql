-- ============================================================================
-- SCRIPT 03: RECUPERAÇÃO DE EMERGÊNCIA
-- Propósito: Script de emergência para restauração rápida em caso de falha crítica
-- ============================================================================

-- Este script deve ser usado apenas em situações de emergência
-- Ele realiza as ações mínimas necessárias para restaurar o sistema

-- INSTRUÇÕES DE USO:
-- 1. Executar este script apenas se o sistema estiver inoperante
-- 2. Verificar se há backups disponíveis antes de executar
-- 3. Manter registro da execução para auditoria

-- ATENÇÃO: Este script pode causar perda de dados recentes
-- Use apenas quando necessário e com supervisão

BEGIN;

-- Registrar operação de emergência
CREATE TABLE IF NOT EXISTS emergency_log (
    id SERIAL PRIMARY KEY,
    operation_type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    executed_by TEXT DEFAULT 'emergency_script',
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rollback_completed BOOLEAN DEFAULT FALSE
);

INSERT INTO emergency_log (operation_type, description, status)
VALUES ('emergency_restore', 'Restauração de emergência das tabelas de indicadores', 'STARTING');

DO $$
DECLARE
    start_time TIMESTAMP := NOW();
    backup_available BOOLEAN;
    system_restored BOOLEAN := FALSE;
    emergency_actions TEXT := '';
BEGIN
    RAISE NOTICE '⚠️  INICIANDO RECUPERAÇÃO DE EMERGÊNCIA ⚠️';
    RAISE NOTICE 'Este script deve ser executado apenas em emergências';
    RAISE NOTICE '';

    -- Verificar disponibilidade de backups
    SELECT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename IN ('008_indicadores_backup', '019_historico_indicadores_backup')
        LIMIT 1
    ) INTO backup_available;

    IF NOT backup_available THEN
        RAISE EXCEPTION '❌ NENHUM BACKUP DISPONÍVEL - OPERAÇÃO CANCELADA';
    END IF;

    RAISE NOTICE '✓ Backups disponíveis para restauração';

    -- AÇÃO 1: Parar transações e bloquear tabelas
    RAISE NOTICE '';
    RAISE NOTICE 'AÇÃO 1: Bloqueando tabelas para restauração...';

    -- Bloquear tabelas para evitar acessos concorrentes
    LOCK TABLE 008_indicadores IN EXCLUSIVE MODE;
    LOCK TABLE 019_historico_indicadores IN EXCLUSIVE MODE;

    emergency_actions := emergency_actions || 'Tabelas bloqueadas. ';

    -- AÇÃO 2: Backup de emergência do estado atual
    RAISE NOTICE 'AÇÃO 2: Criando backup de emergência do estado atual...';

    BEGIN
        CREATE TABLE IF NOT EXISTS emergency_backup_008 AS
        SELECT *, NOW() as backup_timestamp
        FROM 008_indicadores;

        CREATE TABLE IF NOT EXISTS emergency_backup_019 AS
        SELECT *, NOW() as backup_timestamp
        FROM 019_historico_indicadores;

        emergency_actions := emergency_actions || 'Backup de emergência criado. ';
        RAISE NOTICE '✓ Backup de emergência criado';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '⚠️ Falha ao criar backup de emergência: %', SQLERRM;
    END;

    -- AÇÃO 3: Restauração rápida das tabelas principais
    RAISE NOTICE '';
    RAISE NOTICE 'AÇÃO 3: Restaurando tabela 008_indicadores...';

    -- Drop e recreate da tabela 008
    DROP TABLE IF EXISTS 008_indicadores CASCADE;

    CREATE TABLE 008_indicadores AS
    SELECT * FROM 008_indicadores_backup;

    -- Restaurar PK básica
    ALTER TABLE 008_indicadores ADD PRIMARY KEY (id);

    emergency_actions := emergency_actions || 'Tabela 008 restaurada. ';
    RAISE NOTICE '✓ Tabela 008 restaurada com % registros',
                (SELECT COUNT(*) FROM 008_indicadores);

    -- AÇÃO 4: Restaurar tabela 019 se o backup existir
    RAISE NOTICE 'AÇÃO 4: Restaurando tabela 019_historico_indicadores...';

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '019_historico_indicadores_backup') THEN
        DROP TABLE IF EXISTS 019_historico_indicadores CASCADE;

        CREATE TABLE 019_historico_indicadores AS
        SELECT * FROM 019_historico_indicadores_backup;

        ALTER TABLE 019_historico_indicadores ADD PRIMARY KEY (id);

        emergency_actions := emergency_actions || 'Tabela 019 restaurada. ';
        RAISE NOTICE '✓ Tabela 019 restaurada com % registros',
                    (SELECT COUNT(*) FROM 019_historico_indicadores);
    ELSE
        emergency_actions := emergency_actions || 'Tabela 019 não restaurada (backup não existe). ';
        RAISE NOTICE '! Tabela 019 não restaurada - backup não disponível';
    END IF;

    -- AÇÃO 5: Limpar objetos problemáticos
    RAISE NOTICE '';
    RAISE NOTICE 'AÇÃO 5: Removendo objetos potencialmente problemáticos...';

    -- Remover views que podem estar inconsistentes
    DROP VIEW IF EXISTS vw_indicadores_com_historico_recente CASCADE;
    DROP VIEW IF EXISTS vw_historico_indicadores_por_ano CASCADE;
    DROP VIEW IF EXISTS vw_indicadores_desempenho CASCADE;

    -- Remover funções que podem causar erros
    DROP FUNCTION IF EXISTS fn_obter_ultimo_historico_indicador(UUID) CASCADE;
    DROP FUNCTION IF EXISTS fn_calcular_tolerancia_indicador(NUMERIC, NUMERIC) CASCADE;

    emergency_actions := emergency_actions || 'Objetos problemáticos removidos. ';
    RAISE NOTICE '✓ Objetos potencialmente problemáticos removidos';

    -- AÇÃO 6: Verificação mínima de integridade
    RAISE NOTICE '';
    RAISE NOTICE 'AÇÃO 6: Verificação de integridade mínima...';

    DECLARE
        table_008_ok BOOLEAN := FALSE;
        table_019_ok BOOLEAN := FALSE;
    BEGIN
        -- Verificar tabela 008
        IF EXISTS (SELECT 1 FROM 008_indicadores WHERE id IS NOT NULL LIMIT 1) THEN
            table_008_ok := TRUE;
            RAISE NOTICE '✓ Tabela 008: OK';
        ELSE
            RAISE WARNING '❌ Tabela 008: SEM DADOS';
        END IF;

        -- Verificar tabela 019
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '019_historico_indicadores') THEN
            IF EXISTS (SELECT 1 FROM 019_historico_indicadores WHERE id IS NOT NULL LIMIT 1) THEN
                table_019_ok := TRUE;
                RAISE NOTICE '✓ Tabela 019: OK';
            ELSE
                RAISE NOTICE '✓ Tabela 019: OK (vazia)';
                table_019_ok := TRUE;
            END IF;
        ELSE
            RAISE NOTICE '! Tabela 019: NÃO EXISTE';
            table_019_ok := TRUE; -- Considerar OK se não existia originalmente
        END IF;

        IF table_008_ok AND table_019_ok THEN
            system_restored := TRUE;
        END IF;
    END;

    -- AÇÃO 7: Finalizar e registrar
    RAISE NOTICE '';
    RAISE NOTICE 'AÇÃO 7: Finalizando recuperação...';

    -- Registrar conclusão
    UPDATE emergency_log
    SET status = 'COMPLETED',
        description = 'Restauração concluída. Ações: ' || emergency_actions,
        rollback_completed = system_restored,
        executed_at = NOW()
    WHERE operation_type = 'emergency_restore'
    ORDER BY executed_at DESC
    LIMIT 1;

    -- Exibir resumo
    RAISE NOTICE '';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RECUPERAÇÃO DE EMERGÊNCIA CONCLUÍDA';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Status: %', CASE WHEN system_restored THEN '✓ SUCESSO' ELSE '❌ FALHA' END;
    RAISE NOTICE 'Tempo total: %ms', EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000;
    RAISE NOTICE 'Ações executadas: %', emergency_actions;
    RAISE NOTICE '';

    IF system_restored THEN
        RAISE NOTICE '✅ SISTEMA RESTAURADO COM SUCESSO';
        RAISE NOTICE '✅ As tabelas principais estão operacionais';
        RAISE NOTICE '⚠️  Execute uma validação completa assim que possível';
    ELSE
        RAISE NOTICE '❌ FALHA NA RESTAURAÇÃO';
        RAISE NOTICE '❌ Contate o suporte técnico imediatamente';
    END IF;

    RAISE NOTICE '==========================================';

    -- Se não conseguiu restaurar, gerar exceção
    IF NOT system_restored THEN
        RAISE EXCEPTION 'FALHA CRÍTICA NA RECUPERAÇÃO DE EMERGÊNCIA';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar falha
        UPDATE emergency_log
        SET status = 'FAILED',
            description = 'Falha na recuperação: ' || SQLERRM,
            executed_at = NOW()
        WHERE operation_type = 'emergency_restore'
        ORDER BY executed_at DESC
        LIMIT 1;

        RAISE EXCEPTION 'ERRO CRÍTICO NA RECUPERAÇÃO DE EMERGÊNCIA: %', SQLERRM;
END $$;

COMMIT;

-- Exibir informações para pós-emergência
RAISE NOTICE '';
RAISE NOTICE 'INFORMAÇÕES PÓS-EMERGÊNCIA';
RAISE NOTICE '==========================================';

-- Estado final das tabelas
SELECT
    'Após Emergência' as status,
    table_name as tabela,
    COUNT(*) as registros
FROM information_schema.tables t
LEFT JOIN (
    SELECT '008_indicadores' as table_name, COUNT(*) as registros FROM 008_indicadores
    UNION ALL
    SELECT '019_historico_indicadores' as table_name, COUNT(*) as registros FROM 019_historico_indicadores
) d ON t.table_name = d.table_name
WHERE t.table_name IN ('008_indicadores', '019_historico_indicadores')
AND t.table_schema = 'public'
GROUP BY status, table_name, registros;

-- Log da emergência
SELECT
    executed_at as "Data/Hora",
    status as "Status",
    description as "Descrição",
    rollback_completed as "Restaurado"
FROM emergency_log
ORDER BY executed_at DESC
LIMIT 5;