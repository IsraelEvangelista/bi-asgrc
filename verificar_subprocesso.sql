-- Verificação específica do subprocesso problemático
-- ID: 1fb553a9-2426-4fa4-a7dc-8ce87a55225b

-- 1. Verificar se o subprocesso existe
SELECT 
    'SUBPROCESSO EXISTE' as verificacao,
    s.id,
    s.subprocesso,
    s.id_processo,
    s.created_at,
    s.updated_at
FROM "013_subprocessos" s
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 2. Verificar o processo relacionado
SELECT 
    'PROCESSO RELACIONADO' as verificacao,
    p.id,
    p.processo,
    p.id_macroprocesso,
    p.created_at,
    p.updated_at
FROM "005_processos" p
WHERE p.id = (
    SELECT s.id_processo 
    FROM "013_subprocessos" s 
    WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b'
);

-- 3. Verificar o macroprocesso relacionado
SELECT 
    'MACROPROCESSO RELACIONADO' as verificacao,
    m.id,
    m.macroprocesso,
    m.tipo_macroprocesso,
    m.created_at,
    m.updated_at
FROM "004_macroprocessos" m
WHERE m.id = (
    SELECT p.id_macroprocesso 
    FROM "005_processos" p
    WHERE p.id = (
        SELECT s.id_processo 
        FROM "013_subprocessos" s 
        WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b'
    )
);

-- 4. Verificar a cadeia completa com JOIN
SELECT 
    'CADEIA COMPLETA' as verificacao,
    s.id as subprocesso_id,
    s.subprocesso,
    p.id as processo_id,
    p.processo,
    m.id as macroprocesso_id,
    m.macroprocesso,
    m.tipo_macroprocesso
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 5. Verificar se há riscos relacionados ao processo
SELECT 
    'RISCOS DO PROCESSO' as verificacao,
    COUNT(*) as total_riscos,
    COUNT(DISTINCT r.id_risco) as riscos_distintos
FROM "015_riscos_x_acoes_proc_trab" r
WHERE r.id_processo = (
    SELECT s.id_processo 
    FROM "013_subprocessos" s 
    WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b'
);

-- 6. Verificar tipos de dados dos IDs
SELECT 
    'TIPOS DE DADOS' as verificacao,
    pg_typeof(s.id) as tipo_subprocesso_id,
    pg_typeof(s.id_processo) as tipo_processo_id,
    pg_typeof(p.id_macroprocesso) as tipo_macroprocesso_id
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';