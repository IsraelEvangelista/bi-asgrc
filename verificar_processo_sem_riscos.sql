-- Verificar se o processo do subprocesso problemático tem riscos associados
-- Processo ID: 8b86049c-fb42-4293-96e5-c0eeb30a55d7

-- 1. Verificar se o processo existe na tabela de processos
SELECT 
    'PROCESSO EXISTE' as verificacao,
    p.id,
    p.processo,
    p.id_macroprocesso,
    p.created_at
FROM "005_processos" p
WHERE p.id = '8b86049c-fb42-4293-96e5-c0eeb30a55d7';

-- 2. Verificar se o processo tem riscos associados
SELECT 
    'RISCOS DO PROCESSO' as verificacao,
    COUNT(*) as total_riscos
FROM "015_riscos_x_acoes_proc_trab" r
WHERE r.id_processo = '8b86049c-fb42-4293-96e5-c0eeb30a55d7';

-- 3. Verificar todos os processos que NÃO têm riscos associados
SELECT 
    'PROCESSOS SEM RISCOS' as verificacao,
    COUNT(*) as total_processos_sem_riscos
FROM "005_processos" p
LEFT JOIN "015_riscos_x_acoes_proc_trab" r ON p.id = r.id_processo
WHERE r.id_processo IS NULL;

-- 4. Listar alguns processos sem riscos para comparação
SELECT 
    'EXEMPLOS PROCESSOS SEM RISCOS' as verificacao,
    p.id,
    p.processo,
    p.id_macroprocesso
FROM "005_processos" p
LEFT JOIN "015_riscos_x_acoes_proc_trab" r ON p.id = r.id_processo
WHERE r.id_processo IS NULL
LIMIT 10;

-- 5. Verificar quantos subprocessos estão ligados a processos sem riscos
SELECT 
    'SUBPROCESSOS DE PROCESSOS SEM RISCOS' as verificacao,
    COUNT(*) as total_subprocessos_afetados
FROM "013_subprocessos" s
INNER JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "015_riscos_x_acoes_proc_trab" r ON p.id = r.id_processo
WHERE r.id_processo IS NULL;