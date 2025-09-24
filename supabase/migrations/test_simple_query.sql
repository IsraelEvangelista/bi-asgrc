-- Teste simples para verificar acesso à tabela 009_acoes
SELECT COUNT(*) as total_registros FROM "009_acoes";

-- Verificar se conseguimos buscar registros básicos
SELECT 
    id,
    desc_acao,
    status
FROM "009_acoes" 
LIMIT 5;

-- Verificar se há problemas com as foreign keys nas consultas relacionadas
-- Testar consulta da tabela 016_rel_acoes_riscos
SELECT COUNT(*) as total_relacoes FROM "016_rel_acoes_riscos";

-- Testar consulta da tabela 023_hist_acao
SELECT COUNT(*) as total_historico FROM "023_hist_acao";

-- Testar uma consulta com JOIN simples
SELECT 
    a.id,
    a.desc_acao,
    a.status,
    h.perc_implementacao
FROM "009_acoes" a
LEFT JOIN "023_hist_acao" h ON h.id_acao = a.id
LIMIT 5;

-- Verificar se há registros órfãos na tabela de histórico
SELECT COUNT(*) as historico_orfao
FROM "023_hist_acao" h
WHERE NOT EXISTS (
    SELECT 1 FROM "009_acoes" a WHERE a.id = h.id_acao
);

-- Verificar se há registros órfãos na tabela de relações
SELECT COUNT(*) as relacoes_orfaos
FROM "016_rel_acoes_riscos" r
WHERE NOT EXISTS (
    SELECT 1 FROM "009_acoes" a WHERE a.id = r.id_acao
);