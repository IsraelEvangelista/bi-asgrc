-- Criação da tabela 022_fato_prazo
-- Esta tabela armazena os novos prazos solicitados para as ações
-- Relaciona-se com a tabela 009_acoes através do campo id_acao

CREATE TABLE IF NOT EXISTS public."022_fato_prazo" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_acao UUID NOT NULL,
    novo_prazo DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adicionar foreign key constraint para relacionar com a tabela 009_acoes
ALTER TABLE public."022_fato_prazo"
ADD CONSTRAINT fk_022_fato_prazo_id_acao
FOREIGN KEY (id_acao) REFERENCES public."009_acoes"(id)
ON DELETE CASCADE;

-- Criar índice para melhorar performance nas consultas por id_acao
CREATE INDEX IF NOT EXISTS idx_022_fato_prazo_id_acao ON public."022_fato_prazo"(id_acao);

-- Criar índice para melhorar performance nas consultas por data
CREATE INDEX IF NOT EXISTS idx_022_fato_prazo_novo_prazo ON public."022_fato_prazo"(novo_prazo);

-- Criar índice composto para consultas que buscam o prazo mais recente por ação
CREATE INDEX IF NOT EXISTS idx_022_fato_prazo_acao_data ON public."022_fato_prazo"(id_acao, novo_prazo DESC);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_022_fato_prazo_updated_at
    BEFORE UPDATE ON public."022_fato_prazo"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public."022_fato_prazo" ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON public."022_fato_prazo"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir INSERT para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON public."022_fato_prazo"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir UPDATE para usuários autenticados
CREATE POLICY "Enable update for authenticated users" ON public."022_fato_prazo"
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir DELETE para usuários autenticados
CREATE POLICY "Enable delete for authenticated users" ON public."022_fato_prazo"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Conceder permissões para os roles anon e authenticated
GRANT ALL PRIVILEGES ON public."022_fato_prazo" TO authenticated;
GRANT SELECT ON public."022_fato_prazo" TO anon;

-- Comentários para documentação
COMMENT ON TABLE public."022_fato_prazo" IS 'Tabela que armazena os novos prazos solicitados para as ações. Cada novo prazo gera um novo registro.';
COMMENT ON COLUMN public."022_fato_prazo".id IS 'Identificador único do registro de novo prazo';
COMMENT ON COLUMN public."022_fato_prazo".id_acao IS 'Referência para a ação que terá o prazo alterado (FK para 009_acoes.id)';
COMMENT ON COLUMN public."022_fato_prazo".novo_prazo IS 'Nova data de prazo solicitada para a ação';
COMMENT ON COLUMN public."022_fato_prazo".created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public."022_fato_prazo".updated_at IS 'Data e hora da última atualização do registro';