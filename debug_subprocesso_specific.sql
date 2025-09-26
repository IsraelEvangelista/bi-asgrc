-- Consulta específica para investigar o subprocesso problemático
-- ID: 1fb553a9-2426-4fa4-a7dc-8ce87a55225b

-- 1. Verificar se o subprocesso existe
SELECT 
    'SUBPROCESSO ENCONTRADO' as status,
    s.id,
    s.subprocesso,
    s.id_processo,
    s.cod_subprocesso,
    s.publicado
FROM "013_subprocessos" s
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 2. Verificar o processo relacionado
SELECT 
    'PROCESSO RELACIONADO' as status,
    p.id,
    p.processo,
    p.id_macroprocesso,
    p.sigla_processo,
    p.publicado
FROM "013_subprocessos" s
JOIN "005_processos" p ON s.id_processo = p.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 3. Verificar o macroprocesso relacionado
SELECT 
    'MACROPROCESSO RELACIONADO' as status,
    m.id,
    m.macroprocesso,
    m.sigla_macro,
    m.tipo_macroprocesso,
    m.publicado
FROM "013_subprocessos" s
JOIN "005_processos" p ON s.id_processo = p.id
JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 4. Verificar a cadeia hierárquica completa
SELECT 
    'HIERARQUIA COMPLETA' as status,
    s.id as subprocesso_id,
    s.subprocesso as subprocesso_nome,
    p.id as processo_id,
    p.processo as processo_nome,
    m.id as macroprocesso_id,
    m.macroprocesso as macroprocesso_nome,
    CASE 
        WHEN s.id_processo IS NULL THEN 'SEM_PROCESSO'
        WHEN p.id_macroprocesso IS NULL THEN 'SEM_MACROPROCESSO'
        ELSE 'HIERARQUIA_COMPLETA'
    END as status_hierarquia
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 5. Verificar se há registros na tabela de riscos para o processo deste subprocesso
SELECT 
    'RISCOS RELACIONADOS' as status,
    COUNT(*) as total_riscos,
    COUNT(DISTINCT r.id_processo) as processos_distintos,
    COUNT(DISTINCT r.id_risco) as riscos_distintos
FROM "015_riscos_x_acoes_proc_trab" r
JOIN "013_subprocessos" s ON r.id_processo = s.id_processo
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 6. Verificar outros subprocessos do mesmo processo (para comparação)
SELECT 
    'OUTROS_SUBPROCESSOS_MESMO_PROCESSO' as status,
    s2.id,
    s2.subprocesso,
    s2.publicado
FROM "013_subprocessos" s1
JOIN "013_subprocessos" s2 ON s1.id_processo = s2.id_processo
WHERE s1.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b'
  AND s2.id != '1fb553a9-2426-4fa4-a7dc-8ce87a55225b'
ORDER BY s2.subprocesso;

-- 7. Verificar tipos de dados dos IDs
SELECT 
    'TIPOS_DE_DADOS' as status,
    pg_typeof(s.id) as tipo_subprocesso_id,
    pg_typeof(s.id_processo) as tipo_processo_id,
    pg_typeof(p.id_macroprocesso) as tipo_macroprocesso_id
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';