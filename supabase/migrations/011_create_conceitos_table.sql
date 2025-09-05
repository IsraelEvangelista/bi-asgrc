-- Criação da tabela de conceitos
-- Arquivo: 011_create_conceitos_table.sql
-- Data: 2025-01-24
-- Descrição: Tabela para armazenar conceitos fundamentais de gestão de riscos

-- Criar tabela de conceitos
CREATE TABLE IF NOT EXISTS public."020_conceitos" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conceitos TEXT NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_020_conceitos_conceitos ON public."020_conceitos"(conceitos);
CREATE INDEX IF NOT EXISTS idx_020_conceitos_created_at ON public."020_conceitos"(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_020_conceitos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_020_conceitos_updated_at
    BEFORE UPDATE ON public."020_conceitos"
    FOR EACH ROW
    EXECUTE FUNCTION update_020_conceitos_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public."020_conceitos" ENABLE ROW LEVEL SECURITY;

-- Política RLS: Todos podem visualizar conceitos
CREATE POLICY "Todos podem visualizar conceitos" ON public."020_conceitos"
    FOR SELECT USING (true);

-- Política RLS: Apenas usuários autenticados podem inserir/atualizar/deletar
CREATE POLICY "Usuários autenticados podem gerenciar conceitos" ON public."020_conceitos"
    FOR ALL USING (auth.role() = 'authenticated');

-- Conceder permissões
GRANT SELECT ON public."020_conceitos" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."020_conceitos" TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE public."020_conceitos" IS 'Tabela para armazenar conceitos fundamentais de gestão de riscos';
COMMENT ON COLUMN public."020_conceitos".id IS 'Identificador único do conceito';
COMMENT ON COLUMN public."020_conceitos".conceitos IS 'Nome ou título do conceito';
COMMENT ON COLUMN public."020_conceitos".descricao IS 'Descrição detalhada do conceito';
COMMENT ON COLUMN public."020_conceitos".created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public."020_conceitos".updated_at IS 'Data e hora da última atualização do registro';

-- Inserir alguns conceitos iniciais
INSERT INTO public."020_conceitos" (conceitos, descricao) VALUES
('Risco', 'Efeito da incerteza nos objetivos organizacionais, podendo ser positivo ou negativo.'),
('Probabilidade', 'Chance de um evento de risco ocorrer, medida em uma escala de 1 a 5.'),
('Impacto', 'Consequência de um evento de risco nos objetivos da organização, medido em uma escala de 1 a 5.'),
('Severidade', 'Resultado da multiplicação entre probabilidade e impacto, indicando a criticidade do risco.'),
('Tolerância', 'Nível aceitável de variação em relação ao cumprimento de um objetivo.'),
('Apetite ao Risco', 'Quantidade de risco que uma organização está disposta a aceitar na busca de seus objetivos.'),
('Controle Interno', 'Processo implementado para fornecer segurança razoável sobre o alcance dos objetivos organizacionais.'),
('Mitigação', 'Ação tomada para reduzir a probabilidade ou o impacto de um risco identificado.');