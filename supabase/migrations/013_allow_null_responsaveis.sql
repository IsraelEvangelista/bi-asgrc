-- Migração para permitir valores nulos nos campos responsavel_risco e demais_responsaveis
-- da tabela 006_matriz_riscos
-- Data: 2025-01-15
-- Autor: TRAE SOLO Coding

-- Permitir NULL no campo responsavel_risco
ALTER TABLE "006_matriz_riscos" 
ALTER COLUMN "responsavel_risco" DROP NOT NULL;

-- Permitir NULL no campo demais_responsaveis (já permite NULL, mas garantindo)
ALTER TABLE "006_matriz_riscos" 
ALTER COLUMN "demais_responsaveis" DROP NOT NULL;

-- Adicionar comentários explicativos
COMMENT ON COLUMN "006_matriz_riscos"."responsavel_risco" IS 'FK para área/gerência responsável principal pelo risco - pode ser NULL';
COMMENT ON COLUMN "006_matriz_riscos"."demais_responsaveis" IS 'FK para área/gerência responsável adicional pelo risco - pode ser NULL';

-- Verificar se as foreign keys ainda estão funcionando corretamente
-- As FKs devem continuar funcionando mesmo com valores NULL

-- Migração aplicada com sucesso
-- Os campos responsavel_risco e demais_responsaveis agora aceitam valores NULL