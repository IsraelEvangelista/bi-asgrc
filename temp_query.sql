-- Investigar estrutura da tabela 006_matriz_riscos
-- Especialmente o campo responsavel_risco e sua relação com 003_areas_gerencias

-- 1. Verificar alguns registros da tabela matriz_riscos
SELECT 
  id,
  responsavel_risco,
  demais_responsaveis,
  eventos_riscos,
  sigla
FROM "006_matriz_riscos" 
WHERE deleted_at IS NULL
LIMIT 5;

-- 2. Verificar tipos de dados dos campos responsavel_risco
SELECT 
  responsavel_risco,
  pg_typeof(responsavel_risco) as tipo_responsavel_risco,
  demais_responsaveis,
  pg_typeof(demais_responsaveis) as tipo_demais_responsaveis
FROM "006_matriz_riscos" 
WHERE deleted_at IS NULL
AND responsavel_risco IS NOT NULL
LIMIT 3;

-- 3. Verificar relação com areas_gerencias
SELECT 
  mr.id as risco_id,
  mr.responsavel_risco,
  ag.id as area_id,
  ag.sigla_area,
  ag.area_gerencia
FROM "006_matriz_riscos" mr
LEFT JOIN "003_areas_gerencias" ag ON mr.responsavel_risco = ag.id::text
WHERE mr.deleted_at IS NULL
AND mr.responsavel_risco IS NOT NULL
LIMIT 5;

-- 4. Verificar se responsavel_risco é UUID ou texto
SELECT DISTINCT 
  responsavel_risco,
  CASE 
    WHEN responsavel_risco ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN 'UUID' 
    ELSE 'TEXTO' 
  END as tipo_formato
FROM "006_matriz_riscos" 
WHERE deleted_at IS NULL
AND responsavel_risco IS NOT NULL
LIMIT 10;