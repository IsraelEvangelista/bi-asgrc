-- ============================================================================
-- SCRIPT 2: REESTRUTURAR TABELA 019_HISTORICO_INDICADORES (FATO)
-- Propósito: Remover tabela existente e criar nova estrutura para tabela fato
-- ============================================================================

-- Iniciar transação para garantir consistência
BEGIN;

-- Registrar início do passo
INSERT INTO migration_log (step, description, status, executed_at)
VALUES ('recriar_tabela_fato', 'Remover tabela 019_historico_indicadores existente e criar nova estrutura', 'IN_PROGRESS', NOW());

DO $$
BEGIN
    -- Verificar se a tabela existe
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '019_historico_indicadores') THEN
        RAISE NOTICE 'Tabela 019_historico_indicadores existe, removendo...';

        -- Remover constraints que possam existir
        DROP TRIGGER IF EXISTS trigger_019_historico_indicadores_updated_at ON 019_historico_indicadores;
        DROP TRIGGER IF EXISTS trigger_019_historico_indicadores_created_at ON 019_historico_indicadores;

        -- Remover tabela existente
        DROP TABLE IF EXISTS 019_historico_indicadores;

        RAISE NOTICE 'Tabela 019_historico_indicadores removida com sucesso';
    ELSE
        RAISE NOTICE 'Tabela 019_historico_indicadores não existe, será criada nova tabela';
    END IF;

    -- Criar nova tabela com estrutura de fato
    CREATE TABLE 019_historico_indicadores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_indicador UUID NOT NULL REFERENCES 008_indicadores(id) ON DELETE CASCADE,
        justificativa_observacao TEXT,
        impacto_n_implementacao TEXT,
        resultado_mes NUMERIC(10,2),
        data_apuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Constraints adicionais para garantir integridade
        CONSTRAINT chk_resultado_mes CHECK (resultado_mes IS NULL OR resultado_mes >= 0),
        CONSTRAINT chk_data_apuracao CHECK (data_apuracao <= NOW())
    );

    RAISE NOTICE 'Nova tabela 019_historico_indicadores criada com sucesso';

    -- Adicionar comentários para documentação
    COMMENT ON TABLE 019_historico_indicadores IS 'Tabela fato para histórico de medições de indicadores';
    COMMENT ON COLUMN 019_historico_indicadores.id IS 'ID único do registro histórico';
    COMMENT ON COLUMN 019_historico_indicadores.id_indicador IS 'Referência para o indicador (FK para 008_indicadores)';
    COMMENT ON COLUMN 019_historico_indicadores.justificativa_observacao IS 'Justificativa ou observação específica desta medição';
    COMMENT ON COLUMN 019_historico_indicadores.impacto_n_implementacao IS 'Impacto da não implementação da ação';
    COMMENT ON COLUMN 019_historico_indicadores.resultado_mes IS 'Resultado medido no mês (formato decimal)';
    COMMENT ON COLUMN 019_historico_indicadores.data_apuracao IS 'Data da apuração/medição';
    COMMENT ON COLUMN 019_historico_indicadores.updated_at IS 'Data da última atualização do registro';
    COMMENT ON COLUMN 019_historico_indicadores.created_at IS 'Data de criação do registro';

    -- Criar índices para performance
    CREATE INDEX idx_019_historico_indicador ON 019_historico_indicadores(id_indicador);
    CREATE INDEX idx_019_historico_data_apuracao ON 019_historico_indicadores(data_apuracao DESC);
    CREATE INDEX idx_019_historico_resultado_mes ON 019_historico_indicadores(resultado_mes);

    RAISE NOTICE 'Índices criados com sucesso';

    -- Criar trigger para atualizar updated_at
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_019_historico_indicadores_updated_at
        BEFORE UPDATE ON 019_historico_indicadores
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_timestamp();

    RAISE NOTICE 'Triggers criados com sucesso';

    -- Registrar conclusão do passo
    UPDATE migration_log
    SET status = 'COMPLETED',
        records_affected = 0,
        executed_at = NOW()
    WHERE step = 'recriar_tabela_fato';

    RAISE NOTICE 'Script 02: Recriação da tabela fato executado com sucesso';

EXCEPTION
    WHEN OTHERS THEN
        -- Registrar erro
        UPDATE migration_log
        SET status = 'FAILED',
            error_message = SQLERRM,
            executed_at = NOW()
        WHERE step = 'recriar_tabela_fato';

        RAISE EXCEPTION 'Erro ao executar script 02: %', SQLERRM;
END $$;

-- Confirmar transação
COMMIT;

-- Exibir estrutura da nova tabela
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = '019_historico_indicadores'
    AND table_schema = 'public'
ORDER BY ordinal_position;