-- Verificação final após correção da filtragem hierárquica
-- Confirmar que todos os dados necessários estão disponíveis

-- 1. Verificar o subprocesso problemático e sua cadeia hierárquica completa
SELECT 
    'CADEIA HIERÁRQUICA COMPLETA' as verificacao,
    s.id as subprocesso_id,
    s.subprocesso,
    s.id_processo,
    p.processo,
    p.id_macroprocesso,
    m.macroprocesso
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';

-- 2. Verificar quantos subprocessos têm cadeia hierárquica completa
SELECT 
    'ESTATÍSTICAS GERAIS' as verificacao,
    COUNT(*) as total_subprocessos,
    COUNT(p.id) as subprocessos_com_processo,
    COUNT(m.id) as subprocessos_com_macroprocesso,
    COUNT(CASE WHEN p.id IS NOT NULL AND m.id IS NOT NULL THEN 1 END) as cadeia_completa
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id;

-- 3. Listar alguns subprocessos que não têm cadeia hierárquica completa
SELECT 
    'SUBPROCESSOS SEM CADEIA COMPLETA' as verificacao,
    s.id,
    s.subprocesso,
    CASE WHEN p.id IS NULL THEN 'SEM PROCESSO' ELSE 'COM PROCESSO' END as status_processo,
    CASE WHEN m.id IS NULL THEN 'SEM MACROPROCESSO' ELSE 'COM MACROPROCESSO' END as status_macroprocesso
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE p.id IS NULL OR m.id IS NULL
LIMIT 10;

-- 4. Verificar se o processo do subprocesso problemático agora está sendo incluído
SELECT 
    'PROCESSO DO SUBPROCESSO PROBLEMÁTICO' as verificacao,
    p.id,
    p.processo,
    p.id_macroprocesso,
    CASE WHEN COUNT(r.id_processo) > 0 THEN 'TEM RISCOS' ELSE 'SEM RISCOS' END as status_riscos
FROM "005_processos" p
LEFT JOIN "015_riscos_x_acoes_proc_trab" r ON p.id = r.id_processo
WHERE p.id = '8b86049c-fb42-4293-96e5-c0eeb30a55d7'
GROUP BY p.id, p.processo, p.id_macroprocesso;