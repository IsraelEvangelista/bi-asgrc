-- Debug do subprocesso problemático
-- ID: 1fb553a9-2426-4fa4-a7dc-8ce87a55225b

-- 1. Verificar se o subprocesso existe
SELECT 
    id,
    subprocesso,
    id_processo,
    created_at
FROM "013_subprocessos" 
WHERE id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 2. Verificar o processo relacionado (se existir)
SELECT 
    p.id,
    p.processo,
    p.id_macroprocesso,
    s.subprocesso
FROM "005_processos" p
INNER JOIN "013_subprocessos" s ON s.id_processo = p.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 3. Verificar a cadeia completa (subprocesso -> processo -> macroprocesso)
SELECT 
    s.id as subprocesso_id,
    s.subprocesso,
    p.id as processo_id,
    p.processo,
    m.id as macroprocesso_id,
    m.macroprocesso
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 4. Verificar se há outros subprocessos com problemas similares
SELECT 
    s.id,
    s.subprocesso,
    s.id_processo,
    CASE 
        WHEN s.id_processo IS NULL THEN 'SEM_PROCESSO'
        WHEN p.id IS NULL THEN 'PROCESSO_NAO_ENCONTRADO'
        WHEN p.id_macroprocesso IS NULL THEN 'SEM_MACROPROCESSO'
        WHEN m.id IS NULL THEN 'MACROPROCESSO_NAO_ENCONTRADO'
        ELSE 'OK'
    END as status_hierarquia
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id_processo IS NULL 
   OR p.id IS NULL 
   OR p.id_macroprocesso IS NULL 
   OR m.id IS NULL
ORDER BY status_hierarquia, s.subprocesso;

-- 5. Contar registros por status
SELECT 
    CASE 
        WHEN s.id_processo IS NULL THEN 'SEM_PROCESSO'
        WHEN p.id IS NULL THEN 'PROCESSO_NAO_ENCONTRADO'
        WHEN p.id_macroprocesso IS NULL THEN 'SEM_MACROPROCESSO'
        WHEN m.id IS NULL THEN 'MACROPROCESSO_NAO_ENCONTRADO'
        ELSE 'OK'
    END as status_hierarquia,
    COUNT(*) as quantidade
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
GROUP BY 
    CASE 
        WHEN s.id_processo IS NULL THEN 'SEM_PROCESSO'
        WHEN p.id IS NULL THEN 'PROCESSO_NAO_ENCONTRADO'
        WHEN p.id_macroprocesso IS NULL THEN 'SEM_MACROPROCESSO'
        WHEN m.id IS NULL THEN 'MACROPROCESSO_NAO_ENCONTRADO'
        ELSE 'OK'
    END
ORDER BY quantidade DESC;