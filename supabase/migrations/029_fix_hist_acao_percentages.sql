-- Migração para corrigir os valores de perc_implementacao na tabela 023_hist_acao
-- Baseado nas especificações do usuário para as ações específicas
-- Data: 25/01/2025

-- Configurar timezone para Fortaleza-CE
SET TIME ZONE 'America/Fortaleza';

-- Atualizar a ação que deve ser "Implementada" (100%)
UPDATE "023_hist_acao" 
SET perc_implementacao = 100,
    updated_at = NOW()
WHERE id_acao = '7ad86efc-c513-4361-9664-afa73e50314b';

-- Verificar se as outras ações já têm os valores corretos:
-- 3204087d-dcbc-4350-a6cd-32884573ee67 já tem perc_implementacao = 1 (Em implementação)
-- 30407ab8-e883-4487-90c2-0d1a38bf0033 já tem perc_implementacao = 1 (Em implementação)
-- 3bc8967c-50c9-4f68-9354-146b76f929f1 já tem perc_implementacao = 0.1 (Em implementação)

-- Forçar atualização do status na tabela 009_acoes para as ações afetadas
-- usando a função calcular_status_acao
UPDATE "009_acoes" 
SET status = calcular_status_acao(id),
    updated_at = NOW()
WHERE id IN (
    '7ad86efc-c513-4361-9664-afa73e50314b',
    '3204087d-dcbc-4350-a6cd-32884573ee67',
    '30407ab8-e883-4487-90c2-0d1a38bf0033',
    '3bc8967c-50c9-4f68-9354-146b76f929f1'
);

-- Comentário sobre a correção
COMMENT ON TABLE "023_hist_acao" IS 'Dados corrigidos em 25/01/2025 - Ajuste dos percentuais de implementação para ações específicas';