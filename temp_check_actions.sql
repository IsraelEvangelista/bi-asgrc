-- Verificar dados das ações específicas
SELECT 
    a.id,
    LEFT(a.desc_acao, 50) as desc_acao_short,
    a.status,
    a.situacao,
    h.perc_implementacao
FROM "009_acoes" a
LEFT JOIN (
    SELECT DISTINCT ON (id_acao) 
        id_acao, 
        perc_implementacao
    FROM "023_hist_acao" 
    ORDER BY id_acao, created_at DESC
) h ON a.id = h.id_acao
WHERE a.id IN (
    '7ad86efc-c513-4361-9664-afa73e50314b',
    '3204087d-dcbc-4350-a6cd-32884573ee67', 
    '30407ab8-e883-4487-90c2-0d1a38bf0033',
    '3bc8967c-50c9-4f68-9354-146b76f929f1'
)
ORDER BY a.id;

-- Verificar contagem total por status
SELECT 
    status,
    COUNT(*) as total
FROM "009_acoes"
WHERE status IS NOT NULL
GROUP BY status
ORDER BY status;