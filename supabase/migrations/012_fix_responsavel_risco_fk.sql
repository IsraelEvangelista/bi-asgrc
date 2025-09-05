-- Migração para corrigir o campo responsavel_risco da tabela 006_matriz_riscos
-- Alterando de TEXT para UUID com foreign key para 003_areas_gerencias
-- Data: 2025-01-15
-- Autor: TRAE SOLO Coding

-- Primeiro, vamos limpar os dados existentes que não são UUID válidos
-- pois não podemos converter TEXT arbitrário para UUID
UPDATE "006_matriz_riscos" 
SET "responsavel_risco" = NULL 
WHERE "responsavel_risco" IS NOT NULL;

-- Alterar o tipo da coluna de TEXT para UUID
ALTER TABLE "006_matriz_riscos" 
ALTER COLUMN "responsavel_risco" TYPE UUID USING NULL;

-- Adicionar a constraint de foreign key
ALTER TABLE "006_matriz_riscos" 
ADD CONSTRAINT "fk_responsavel_risco" 
FOREIGN KEY ("responsavel_risco") 
REFERENCES "003_areas_gerencias"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN "006_matriz_riscos"."responsavel_risco" IS 'FK para área/gerência responsável principal pelo risco';

-- Verificar se a constraint foi criada corretamente
-- SELECT constraint_name, table_name, column_name 
-- FROM information_schema.key_column_usage 
-- WHERE table_name = '006_matriz_riscos' AND column_name = 'responsavel_risco';