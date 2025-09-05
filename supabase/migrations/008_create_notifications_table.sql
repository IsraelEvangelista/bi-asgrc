-- Criação da tabela de notificações
-- Arquivo: 008_create_notifications_table.sql
-- Data: 2025-01-24
-- Descrição: Tabela para gerenciar notificações do sistema

-- Criar ENUM para tipos de notificação
CREATE TYPE tipo_notificacao_enum AS ENUM ('ALERTA', 'INFORMATIVO', 'SUCESSO', 'URGENTE');

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public."020_notificacoes" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_usuario_destino UUID NOT NULL,
    mensagem TEXT NOT NULL,
    tipo_notificacao tipo_notificacao_enum NOT NULL DEFAULT 'INFORMATIVO',
    lida BOOLEAN NOT NULL DEFAULT false,
    url_redirecionamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_020_notificacoes_usuario_destino ON public."020_notificacoes"(id_usuario_destino);
CREATE INDEX IF NOT EXISTS idx_020_notificacoes_lida ON public."020_notificacoes"(lida);
CREATE INDEX IF NOT EXISTS idx_020_notificacoes_tipo ON public."020_notificacoes"(tipo_notificacao);
CREATE INDEX IF NOT EXISTS idx_020_notificacoes_created_at ON public."020_notificacoes"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_020_notificacoes_usuario_lida ON public."020_notificacoes"(id_usuario_destino, lida);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_020_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_020_notificacoes_updated_at
    BEFORE UPDATE ON public."020_notificacoes"
    FOR EACH ROW
    EXECUTE FUNCTION update_020_notificacoes_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public."020_notificacoes" ENABLE ROW LEVEL SECURITY;

-- Política RLS: Usuários podem ver apenas suas próprias notificações
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public."020_notificacoes"
    FOR SELECT USING (auth.uid()::text = id_usuario_destino);

-- Política RLS: Usuários podem atualizar apenas suas próprias notificações (marcar como lida)
CREATE POLICY "Usuários podem atualizar suas próprias notificações" ON public."020_notificacoes"
    FOR UPDATE USING (auth.uid()::text = id_usuario_destino)
    WITH CHECK (auth.uid()::text = id_usuario_destino);

-- Política RLS: Apenas usuários autenticados podem inserir notificações
CREATE POLICY "Sistema pode inserir notificações" ON public."020_notificacoes"
    FOR INSERT WITH CHECK (true);

-- Política RLS: Usuários podem deletar apenas suas próprias notificações
CREATE POLICY "Usuários podem deletar suas próprias notificações" ON public."020_notificacoes"
    FOR DELETE USING (auth.uid()::text = id_usuario_destino);

-- Conceder permissões para roles do Supabase
GRANT SELECT, INSERT, UPDATE, DELETE ON public."020_notificacoes" TO authenticated;
GRANT SELECT ON public."020_notificacoes" TO anon;

-- Conceder permissões para o ENUM
GRANT USAGE ON TYPE tipo_notificacao_enum TO authenticated;
GRANT USAGE ON TYPE tipo_notificacao_enum TO anon;

-- Comentários para documentação
COMMENT ON TABLE public."020_notificacoes" IS 'Tabela para armazenar notificações do sistema';
COMMENT ON COLUMN public."020_notificacoes".id IS 'Identificador único da notificação';
COMMENT ON COLUMN public."020_notificacoes".id_usuario_destino IS 'ID do usuário que receberá a notificação';
COMMENT ON COLUMN public."020_notificacoes".mensagem IS 'Conteúdo da mensagem da notificação';
COMMENT ON COLUMN public."020_notificacoes".tipo_notificacao IS 'Tipo da notificação (info, warning, error, success)';
COMMENT ON COLUMN public."020_notificacoes".lida IS 'Indica se a notificação foi lida pelo usuário';
COMMENT ON COLUMN public."020_notificacoes".url_redirecionamento IS 'URL opcional para redirecionamento ao clicar na notificação';
COMMENT ON COLUMN public."020_notificacoes".created_at IS 'Data e hora de criação da notificação';
COMMENT ON COLUMN public."020_notificacoes".updated_at IS 'Data e hora da última atualização da notificação';