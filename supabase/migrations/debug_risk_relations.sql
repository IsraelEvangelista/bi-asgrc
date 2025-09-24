-- Verificar a tabela 016_rel_acoes_riscos
SELECT COUNT(*) as total_relacoes FROM "016_rel_acoes_riscos";

-- Verificar se há dados na tabela
SELECT 
    id_acao,
    id_risco,
    created_at
FROM "016_rel_acoes_riscos" 
LIMIT 10;

-- Verificar se há relações para as primeiras ações
SELECT 
    r.id_acao,
    r.id_risco,
    a.desc_acao
FROM "016_rel_acoes_riscos" r
JOIN "009_acoes" a ON a.id = r.id_acao
LIMIT 10;

-- Verificar se a foreign key fk_rel_acoes_riscos_risco existe e está correta
SELECT 
    r.id_acao,
    r.id_risco,
    m.eventos_riscos
FROM "016_rel_acoes_riscos" r
LEFT JOIN "006_matriz_riscos" m ON m.id = r.id_risco
LIMIT 10;

-- Verificar se há registros órfãos na tabela de relações
SELECT COUNT(*) as relacoes_sem_acao
FROM "016_rel_acoes_riscos" r
WHERE NOT EXISTS (
    SELECT 1 FROM "009_acoes" a WHERE a.id = r.id_acao
);

SELECT COUNT(*) as relacoes_sem_risco
FROM "016_rel_acoes_riscos" r
WHERE NOT EXISTS (
    SELECT 1 FROM "006_matriz_riscos" m WHERE m.id = r.id_risco
);