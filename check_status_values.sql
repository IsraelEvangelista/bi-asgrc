-- Verificar valores distintos de status na tabela 009_acoes
SELECT DISTINCT status 
FROM "009_acoes" 
WHERE status IS NOT NULL 
ORDER BY status;

-- Verificar contagem por status
SELECT status, COUNT(*) as quantidade
FROM "009_acoes" 
WHERE status IS NOT NULL 
GROUP BY status 
ORDER BY status;

-- Verificar as ações específicas mencionadas
SELECT 
    a.id,
    a.desc_acao,
    a.status,
    h.perc_implementacao
FROM "009_acoes" a
LEFT JOIN (
    SELECT 
        id_acao,
        perc_implementacao,
        ROW_NUMBER() OVER (PARTITION BY id_acao ORDER BY created_at DESC) as rn
    FROM "023_hist_acao"
) h ON a.id = h.id_acao AND h.rn = 1
WHERE a.id IN (
    '7ad86efc-c513-4361-9664-afa73e50314b',
    '3204087d-dcbc-4350-a6cd-32884573ee67', 
    '30407ab8-e883-4487-90c2-0d1a38bf0033',
    '3bc8967c-50c9-4f68-9354-146b76f929f1'
)
ORDER BY a.desc_acao;