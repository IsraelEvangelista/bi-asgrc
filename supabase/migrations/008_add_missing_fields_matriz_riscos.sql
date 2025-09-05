-- Migração para adicionar campos faltantes na tabela 006_matriz_riscos
-- Baseado no PRD Sistema BI COGERH ASGRC v6.4.1

-- Adicionar campos faltantes na tabela 006_matriz_riscos
ALTER TABLE public."006_matriz_riscos" 
ADD COLUMN IF NOT EXISTS sigla TEXT,
ADD COLUMN IF NOT EXISTS priorizado TEXT,
ADD COLUMN IF NOT EXISTS vulnerabilidade_imagem BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS afeta_geracao_valor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS responsabilidade_compartilhada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demais_responsaveis UUID;

-- Adicionar foreign key constraint para demais_responsaveis
ALTER TABLE public."006_matriz_riscos" 
ADD CONSTRAINT fk_demais_responsaveis 
FOREIGN KEY (demais_responsaveis) 
REFERENCES public."003_areas_gerencias"(id);

-- Adicionar constraint para o campo priorizado (valores possíveis)
ALTER TABLE public."006_matriz_riscos" 
ADD CONSTRAINT check_priorizado_valid_values 
CHECK (priorizado IS NULL OR priorizado IN ('Alto', 'Médio', 'Baixo'));

-- Comentários para documentação
COMMENT ON COLUMN public."006_matriz_riscos".sigla IS 'Sigla identificadora do risco';
COMMENT ON COLUMN public."006_matriz_riscos".priorizado IS 'Nível de priorização do risco: Alto, Médio, Baixo';
COMMENT ON COLUMN public."006_matriz_riscos".vulnerabilidade_imagem IS 'Indica se o risco afeta a imagem da organização';
COMMENT ON COLUMN public."006_matriz_riscos".afeta_geracao_valor IS 'Indica se o risco afeta a geração de valor';
COMMENT ON COLUMN public."006_matriz_riscos".responsabilidade_compartilhada IS 'Indica se a responsabilidade do risco é compartilhada';
COMMENT ON COLUMN public."006_matriz_riscos".demais_responsaveis IS 'FK para área/gerência responsável adicional pelo risco';

-- Atualizar trigger de updated_at se necessário
-- (assumindo que já existe um trigger para updated_at)

-- Migração aplicada com sucesso
-- Campos adicionados: sigla, priorizado, vulnerabilidade_imagem, afeta_geracao_valor, responsabilidade_compartilhada, demais_responsaveis