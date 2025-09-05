-- Migração para ajustar campos da tabela 003_areas_gerencias
-- 1. Mover dados de 'nome_area' para 'gerencia' e remover 'nome_area'
-- 2. Alterar valores do campo 'gerencia' de 'gerencia' para 'diretoria'

BEGIN;

-- Primeiro, copiar dados de nome_area para gerencia onde gerencia está vazio
UPDATE "003_areas_gerencias" 
SET "gerencia" = "nome_area" 
WHERE "gerencia" IS NULL OR "gerencia" = '';

-- Atualizar valores do campo gerencia: alterar 'gerencia' para 'diretoria'
UPDATE "003_areas_gerencias" 
SET "gerencia" = 'diretoria' 
WHERE "gerencia" = 'gerencia';

-- Remover a coluna nome_area (agora desnecessária)
ALTER TABLE "003_areas_gerencias" 
DROP COLUMN "nome_area";

-- Adicionar comentário para documentar a alteração
COMMENT ON COLUMN "003_areas_gerencias"."gerencia" IS 'Nome da gerência/diretoria responsável pela área';

COMMIT;