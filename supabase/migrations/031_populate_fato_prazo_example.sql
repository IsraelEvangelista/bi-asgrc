-- Migração para popular dados de exemplo na tabela 022_fato_prazo
-- para demonstrar o funcionamento da regra de situação

-- Inserir alguns registros de exemplo na tabela 022_fato_prazo
-- com novos prazos para algumas ações existentes
INSERT INTO "022_fato_prazo" (id_acao, novo_prazo, created_at)
SELECT 
    id,
    CASE 
        WHEN RANDOM() < 0.3 THEN CURRENT_DATE + INTERVAL '30 days'  -- 30% das ações com prazo futuro
        WHEN RANDOM() < 0.6 THEN CURRENT_DATE - INTERVAL '15 days'  -- 30% das ações com prazo passado
        ELSE CURRENT_DATE + INTERVAL '60 days'                      -- 40% das ações com prazo futuro mais longo
    END as novo_prazo,
    CURRENT_TIMESTAMP as created_at
FROM "009_acoes"
WHERE id IN (
    SELECT id 
    FROM "009_acoes" 
    ORDER BY RANDOM() 
    LIMIT 50  -- Popula 50 ações com novos prazos
);

-- Executar a função para atualizar todos os novos prazos
SELECT atualizar_todos_novos_prazos();

-- Aplicar a regra de situação para todas as ações
DO $$
DECLARE
    acao_record RECORD;
    total_acoes INTEGER := 0;
    acoes_atualizadas INTEGER := 0;
BEGIN
    -- Contar total de ações
    SELECT COUNT(*) INTO total_acoes FROM "009_acoes";
    
    -- Atualizar situação de cada ação
    FOR acao_record IN SELECT id FROM "009_acoes" LOOP
        PERFORM atualizar_situacao_acao_manual(acao_record.id);
        acoes_atualizadas := acoes_atualizadas + 1;
    END LOOP;
    
    RAISE NOTICE 'Migração concluída: % ações processadas de % total', acoes_atualizadas, total_acoes;
END $$;