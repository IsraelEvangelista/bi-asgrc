-- Criação da tabela 023_hist_acao para normalização da estrutura de dados
-- Separando conceitos de fato (histórico/transacionais) dos conceitos de dimensão
-- Esta tabela armazenará os atributos históricos das ações

CREATE TABLE "023_hist_acao" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_acao UUID NOT NULL,
    justificativa_observacao TEXT,
    impacto_atraso_nao_implementacao TEXT,
    perc_implementacao NUMERIC(5,2) CHECK (perc_implementacao >= 0 AND perc_implementacao <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign Key para tabela 009_acoes
    CONSTRAINT fk_hist_acao_acao FOREIGN KEY (id_acao) REFERENCES "009_acoes"(id) ON DELETE CASCADE
);

-- Índices para otimização de consultas
CREATE INDEX idx_hist_acao_id_acao ON "023_hist_acao"(id_acao);
CREATE INDEX idx_hist_acao_created_at ON "023_hist_acao"(created_at);
CREATE INDEX idx_hist_acao_perc_implementacao ON "023_hist_acao"(perc_implementacao);

-- Trigger para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hist_acao_updated_at
    BEFORE UPDATE ON "023_hist_acao"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitação do Row Level Security (RLS)
ALTER TABLE "023_hist_acao" ENABLE ROW LEVEL SECURITY;

-- Política de segurança para usuários autenticados (leitura e escrita)
CREATE POLICY "Usuários autenticados podem gerenciar histórico de ações"
    ON "023_hist_acao"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política de segurança para usuários anônimos (apenas leitura)
CREATE POLICY "Usuários anônimos podem visualizar histórico de ações"
    ON "023_hist_acao"
    FOR SELECT
    TO anon
    USING (true);

-- Concessão de permissões para os roles
GRANT ALL PRIVILEGES ON "023_hist_acao" TO authenticated;
GRANT SELECT ON "023_hist_acao" TO anon;

-- Comentários para documentação
COMMENT ON TABLE "023_hist_acao" IS 'Tabela de histórico de ações - armazena dados transacionais/históricos das ações para normalização do modelo de dados';
COMMENT ON COLUMN "023_hist_acao".id IS 'Chave primária da tabela';
COMMENT ON COLUMN "023_hist_acao".id_acao IS 'Chave estrangeira referenciando a tabela 009_acoes';
COMMENT ON COLUMN "023_hist_acao".justificativa_observacao IS 'Justificativa ou observação sobre a ação';
COMMENT ON COLUMN "023_hist_acao".impacto_atraso_nao_implementacao IS 'Descrição do impacto em caso de atraso ou não implementação';
COMMENT ON COLUMN "023_hist_acao".perc_implementacao IS 'Percentual de implementação da ação (0-100)';
COMMENT ON COLUMN "023_hist_acao".created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN "023_hist_acao".updated_at IS 'Data e hora da última atualização do registro';