-- Adicionar campo desc_acao à tabela 016_rel_acoes_riscos
-- Data: 2025-01-05
-- Descrição: Adiciona o campo desc_acao do tipo TEXT à tabela 016_rel_acoes_riscos
-- conforme atualização do PRD

ALTER TABLE "016_rel_acoes_riscos" 
ADD COLUMN desc_acao TEXT;

-- Adicionar comentário ao campo
COMMENT ON COLUMN "016_rel_acoes_riscos".desc_acao IS 'Descrição da ação relacionada ao risco';