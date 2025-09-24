-- Consulta de diagnóstico para verificar distribuição de status na tabela 009_acoes
SELECT 
    status, 
    COUNT(*) as quantidade 
FROM "009_acoes" 
WHERE status IS NOT NULL 
GROUP BY status 
ORDER BY status;

-- Verificar total de registros
SELECT 
    COUNT(*) as total_registros,
    COUNT(status) as registros_com_status,
    COUNT(*) - COUNT(status) as registros_sem_status
FROM "009_acoes";

-- Verificar se há registros com status NULL
SELECT COUNT(*) as registros_nulos
FROM "009_acoes" 
WHERE status IS NULL;