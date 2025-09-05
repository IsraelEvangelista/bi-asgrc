-- Migração para adicionar campo 'diretoria' na tabela 003_areas_gerencias
-- e atualizar os valores conforme solicitado

-- Adicionar campo diretoria
ALTER TABLE "003_areas_gerencias" 
ADD COLUMN diretoria TEXT;

-- Atualizar valores: onde gerencia = 'gerencia', alterar diretoria para 'diretoria'
UPDATE "003_areas_gerencias" 
SET diretoria = 'diretoria' 
WHERE gerencia = 'gerencia';

-- Para outros valores de gerencia, manter o mesmo valor em diretoria
UPDATE "003_areas_gerencias" 
SET diretoria = gerencia 
WHERE gerencia != 'gerencia' OR gerencia IS NULL;

-- Comentário para documentar a alteração
COMMENT ON COLUMN "003_areas_gerencias".diretoria IS 'Campo diretoria - valores de gerencia atualizados conforme solicitação';