-- Script de teste para verificar se a correção da regra de situação está funcionando
-- Data: 2025-01-24

-- 1. Verificar registros que agora têm situacao preenchida
SELECT 
    'Registros com situacao preenchida após correção' as descricao,
    COUNT(*) as quantidade
FROM "009_acoes"
WHERE situacao IS NOT NULL;

-- 2. Verificar registros que ainda estão com situacao vazia
SELECT 
    'Registros ainda com situacao vazia' as descricao,
    COUNT(*) as quantidade
FROM "009_acoes"
WHERE situacao IS NULL;

-- 3. Verificar distribuição por situacao
SELECT 
    'Distribuição por situacao' as descricao,
    situacao,
    COUNT(*) as quantidade
FROM "009_acoes"
GROUP BY situacao
ORDER BY quantidade DESC;

-- 4. Verificar registros com datas mas sem situacao (problemas)
SELECT 
    'Registros problemáticos (com datas mas sem situacao)' as descricao,
    COUNT(*) as quantidade
FROM "009_acoes"
WHERE (prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL)
  AND situacao IS NULL;

-- 5. Testar a função de cálculo em alguns registros específicos
SELECT 
    'Teste da função calcular_situacao_acao' as descricao,
    id,
    desc_acao,
    prazo_implementacao,
    novo_prazo,
    situacao as situacao_atual,
    calcular_situacao_acao(id) as situacao_calculada,
    CASE 
        WHEN novo_prazo IS NOT NULL THEN novo_prazo
        ELSE prazo_implementacao
    END as prazo_referencia,
    CURRENT_DATE as data_atual,
    CASE 
        WHEN (CASE WHEN novo_prazo IS NOT NULL THEN novo_prazo ELSE prazo_implementacao END) IS NULL THEN 'SEM_PRAZO'
        WHEN CURRENT_DATE <= (CASE WHEN novo_prazo IS NOT NULL THEN novo_prazo ELSE prazo_implementacao END) THEN 'NO_PRAZO_ESPERADO'
        ELSE 'ATRASADO_ESPERADO'
    END as situacao_esperada
FROM "009_acoes"
WHERE (prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL)
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar se há inconsistências entre situacao atual e calculada
SELECT 
    'Inconsistências encontradas' as descricao,
    COUNT(*) as quantidade
FROM "009_acoes"
WHERE (prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL)
  AND situacao != calcular_situacao_acao(id);

-- 7. Mostrar exemplos de registros "No Prazo"
SELECT 
    'Exemplos de registros No Prazo' as descricao,
    id,
    LEFT(desc_acao, 50) as desc_acao_resumida,
    prazo_implementacao,
    novo_prazo,
    situacao,
    CASE 
        WHEN novo_prazo IS NOT NULL THEN novo_prazo
        ELSE prazo_implementacao
    END as prazo_usado,
    CURRENT_DATE as data_atual
FROM "009_acoes"
WHERE situacao = 'No Prazo'
ORDER BY 
    CASE 
        WHEN novo_prazo IS NOT NULL THEN novo_prazo
        ELSE prazo_implementacao
    END ASC
LIMIT 5;

-- 8. Mostrar exemplos de registros "Atrasado"
SELECT 
    'Exemplos de registros Atrasado' as descricao,
    id,
    LEFT(desc_acao, 50) as desc_acao_resumida,
    prazo_implementacao,
    novo_prazo,
    situacao,
    CASE 
        WHEN novo_prazo IS NOT NULL THEN novo_prazo
        ELSE prazo_implementacao
    END as prazo_usado,
    CURRENT_DATE as data_atual,
    CURRENT_DATE - (CASE WHEN novo_prazo IS NOT NULL THEN novo_prazo ELSE prazo_implementacao END) as dias_atraso
FROM "009_acoes"
WHERE situacao = 'Atrasado'
ORDER BY 
    CURRENT_DATE - (CASE WHEN novo_prazo IS NOT NULL THEN novo_prazo ELSE prazo_implementacao END) DESC
LIMIT 5;

-- 9. Resumo final
SELECT 
    'RESUMO FINAL' as descricao,
    'Total de ações' as metrica,
    COUNT(*) as valor
FROM "009_acoes"
UNION ALL
SELECT 
    'RESUMO FINAL' as descricao,
    'Ações com prazos definidos' as metrica,
    COUNT(*) as valor
FROM "009_acoes"
WHERE (prazo_implementacao IS NOT NULL OR novo_prazo IS NOT NULL)
UNION ALL
SELECT 
    'RESUMO FINAL' as descricao,
    'Ações com situacao preenchida' as metrica,
    COUNT(*) as valor
FROM "009_acoes"
WHERE situacao IS NOT NULL
UNION ALL
SELECT 
    'RESUMO FINAL' as descricao,
    'Ações No Prazo' as metrica,
    COUNT(*) as valor
FROM "009_acoes"
WHERE situacao = 'No Prazo'
UNION ALL
SELECT 
    'RESUMO FINAL' as descricao,
    'Ações Atrasado' as metrica,
    COUNT(*) as valor
FROM "009_acoes"
WHERE situacao = 'Atrasado'
ORDER BY descricao, metrica;