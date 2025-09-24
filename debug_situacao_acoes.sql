-- Script para investigar problemas na situacao das ações
-- Data: 2025-01-24

-- 1. Verificar registros com situacao vazia mas com datas preenchidas
SELECT 
    id,
    desc_acao,
    situacao,
    prazo_implementacao,
    novo_prazo,
    status,
    created_at,
    updated_at
FROM "009_acoes"
WHERE (situacao IS NULL OR situacao = '')
  AND (prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL)
ORDER BY created_at DESC;

-- 2. Verificar todas as ações com seus percentuais de implementação mais recentes
SELECT 
    a.id,
    a.desc_acao,
    a.situacao,
    a.prazo_implementacao,
    a.novo_prazo,
    a.status,
    h.perc_implementacao,
    h.created_at as hist_created_at,
    CURRENT_DATE as data_atual,
    CASE 
        WHEN a.novo_prazo IS NOT NULL THEN a.novo_prazo
        ELSE a.prazo_implementacao
    END as prazo_referencia
FROM "009_acoes" a
LEFT JOIN LATERAL (
    SELECT perc_implementacao, created_at
    FROM "023_hist_acao"
    WHERE id_acao = a.id
    ORDER BY created_at DESC
    LIMIT 1
) h ON true
ORDER BY a.created_at DESC;

-- 3. Testar a função calcular_situacao_acao para algumas ações
SELECT 
    id,
    desc_acao,
    situacao as situacao_atual,
    calcular_situacao_acao(id) as situacao_calculada,
    CASE 
        WHEN situacao = calcular_situacao_acao(id) THEN 'OK'
        WHEN situacao IS NULL AND calcular_situacao_acao(id) IS NOT NULL THEN 'PRECISA_ATUALIZAR'
        WHEN situacao IS NOT NULL AND calcular_situacao_acao(id) IS NULL THEN 'SEM_DADOS'
        ELSE 'DIVERGENTE'
    END as status_comparacao
FROM "009_acoes"
WHERE (prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL)
ORDER BY status_comparacao, created_at DESC;

-- 4. Verificar ações que deveriam ter situacao mas estão vazias
SELECT 
    a.id,
    a.desc_acao,
    a.situacao,
    a.prazo_implementacao,
    a.novo_prazo,
    h.perc_implementacao,
    calcular_situacao_acao(a.id) as situacao_deveria_ser
FROM "009_acoes" a
LEFT JOIN LATERAL (
    SELECT perc_implementacao
    FROM "023_hist_acao"
    WHERE id_acao = a.id
    ORDER BY created_at DESC
    LIMIT 1
) h ON true
WHERE (a.situacao IS NULL OR a.situacao = '')
  AND (a.prazo_implementacao IS NOT NULL OR a.novo_prazo IS NOT NULL)
  AND h.perc_implementacao IS NOT NULL;

-- 5. Contar registros por situacao
SELECT 
    situacao,
    COUNT(*) as quantidade
FROM "009_acoes"
GROUP BY situacao
ORDER BY quantidade DESC;