-- Migração para corrigir estrutura da tabela 008_indicadores conforme PRD
-- Data: 2025-01-14
-- Descrição: Ajustar campos, tipos de dados, ENUMs e chaves estrangeiras

-- 1. Adicionar campo meta_efetiva (FLOAT)
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS meta_efetiva FLOAT;

-- 2. Adicionar campos faltantes conforme PRD
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS justificativa_observacao TEXT;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS impacto_n_implementacao TEXT;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS meta_desc TEXT;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS limite_tolerancia TEXT;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS tipo_acompanhamento TEXT;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS resultado_mes NUMERIC;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS apuracao TEXT;
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS tolerancia TEXT;

-- 3. Renomear nome_indicador para indicador_risco (se ainda não foi renomeado)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '008_indicadores' AND column_name = 'nome_indicador') THEN
        ALTER TABLE "008_indicadores" RENAME COLUMN nome_indicador TO indicador_risco;
    END IF;
END $$;

-- 4. Criar ENUMs se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'situacao_indicador_enum') THEN
        CREATE TYPE situacao_indicador_enum AS ENUM ('Implementado', 'Não iniciado', 'Em implementação');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tolerancia_enum') THEN
        CREATE TYPE tolerancia_enum AS ENUM ('Dentro da Tolerância', 'Fora da Tolerância');
    END IF;
END $$;

-- 5. Remover constraint atual de situacao_indicador
ALTER TABLE "008_indicadores" DROP CONSTRAINT IF EXISTS "008_indicadores_situacao_indicador_check";

-- 6. Criar coluna temporária para situacao_indicador com novo ENUM
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS situacao_indicador_temp situacao_indicador_enum;

-- Migrar dados existentes para a nova coluna
UPDATE "008_indicadores" SET situacao_indicador_temp = 
  CASE 
    WHEN situacao_indicador = 'Dentro da meta' THEN 'Implementado'::situacao_indicador_enum
    WHEN situacao_indicador = 'Fora da meta' THEN 'Não iniciado'::situacao_indicador_enum
    WHEN situacao_indicador = 'Em monitoramento' THEN 'Em implementação'::situacao_indicador_enum
    ELSE NULL
  END;

-- Remover coluna antiga e renomear a nova
ALTER TABLE "008_indicadores" DROP COLUMN situacao_indicador;
ALTER TABLE "008_indicadores" RENAME COLUMN situacao_indicador_temp TO situacao_indicador;

-- 7. Alterar tolerancia para usar o novo ENUM (aceita NULL)
ALTER TABLE "008_indicadores" ALTER COLUMN tolerancia TYPE tolerancia_enum USING NULL;

-- 8. Alterar responsavel_risco de TEXT para UUID com FK para 003_areas_gerencias
-- Primeiro, limpar dados inválidos (converter para NULL se não for UUID válido)
UPDATE "008_indicadores" SET responsavel_risco = NULL 
WHERE responsavel_risco !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Criar coluna temporária UUID
ALTER TABLE "008_indicadores" ADD COLUMN IF NOT EXISTS responsavel_risco_temp UUID;

-- Migrar dados válidos
UPDATE "008_indicadores" SET responsavel_risco_temp = 
  CASE 
    WHEN responsavel_risco ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN responsavel_risco::UUID 
    ELSE NULL 
  END;

-- Remover coluna antiga e renomear a nova
ALTER TABLE "008_indicadores" DROP COLUMN responsavel_risco;
ALTER TABLE "008_indicadores" RENAME COLUMN responsavel_risco_temp TO responsavel_risco;

-- Adicionar chave estrangeira para 003_areas_gerencias
ALTER TABLE "008_indicadores" ADD CONSTRAINT "008_indicadores_responsavel_risco_fkey" 
  FOREIGN KEY (responsavel_risco) REFERENCES "003_areas_gerencias"(id);

-- 9. Remover campos desnecessários conforme PRD
ALTER TABLE "008_indicadores" DROP COLUMN IF EXISTS meta_indicador;
ALTER TABLE "008_indicadores" DROP COLUMN IF EXISTS valor_atual;
ALTER TABLE "008_indicadores" DROP COLUMN IF EXISTS periodicidade;

-- 10. Adicionar comentários para documentação
COMMENT ON COLUMN "008_indicadores".meta_efetiva IS 'Meta efetiva do indicador (valor numérico)';
COMMENT ON COLUMN "008_indicadores".responsavel_risco IS 'UUID do responsável pelo risco (FK para 003_areas_gerencias)';
COMMENT ON COLUMN "008_indicadores".indicador_risco IS 'Nome/descrição do indicador de risco';
COMMENT ON COLUMN "008_indicadores".situacao_indicador IS 'Situação atual do indicador: Implementado, Não iniciado, Em implementação';
COMMENT ON COLUMN "008_indicadores".tolerancia IS 'Status de tolerância: Dentro da Tolerância, Fora da Tolerância';
COMMENT ON COLUMN "008_indicadores".justificativa_observacao IS 'Justificativas e observações sobre o indicador';
COMMENT ON COLUMN "008_indicadores".impacto_n_implementacao IS 'Impacto da não implementação do indicador';
COMMENT ON COLUMN "008_indicadores".meta_desc IS 'Descrição da meta do indicador';
COMMENT ON COLUMN "008_indicadores".limite_tolerancia IS 'Limite de tolerância definido para o indicador';
COMMENT ON COLUMN "008_indicadores".tipo_acompanhamento IS 'Tipo de acompanhamento do indicador';
COMMENT ON COLUMN "008_indicadores".resultado_mes IS 'Resultado numérico do mês';
COMMENT ON COLUMN "008_indicadores".apuracao IS 'Informações sobre a apuração do indicador';

-- 11. Atualizar comentário da tabela
COMMENT ON TABLE "008_indicadores" IS 'Tabela de indicadores de monitoramento de riscos - estrutura atualizada conforme PRD';

-- 12. Verificar permissões para as novas colunas
GRANT SELECT, INSERT, UPDATE, DELETE ON "008_indicadores" TO authenticated;
GRANT SELECT ON "008_indicadores" TO anon;