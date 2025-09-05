-- Renomeação da tabela de notificações
-- Arquivo: 010_rename_notifications_table.sql
-- Data: 2025-01-24
-- Descrição: Renomear tabela de notificações de 020_notificacoes para 021_notificacoes
-- para seguir a convenção de nomenclatura do projeto

-- Renomear a tabela
ALTER TABLE IF EXISTS public."020_notificacoes" RENAME TO "021_notificacoes";

-- Renomear os índices
ALTER INDEX IF EXISTS idx_020_notificacoes_usuario_destino RENAME TO idx_021_notificacoes_usuario_destino;
ALTER INDEX IF EXISTS idx_020_notificacoes_lida RENAME TO idx_021_notificacoes_lida;
ALTER INDEX IF EXISTS idx_020_notificacoes_tipo RENAME TO idx_021_notificacoes_tipo;
ALTER INDEX IF EXISTS idx_020_notificacoes_created_at RENAME TO idx_021_notificacoes_created_at;
ALTER INDEX IF EXISTS idx_020_notificacoes_usuario_lida RENAME TO idx_021_notificacoes_usuario_lida;

-- Renomear a função de trigger (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_020_notificacoes_updated_at') THEN
        ALTER FUNCTION update_020_notificacoes_updated_at() RENAME TO update_021_notificacoes_updated_at;
    END IF;
END $$;

-- Recriar o trigger com o novo nome
DROP TRIGGER IF EXISTS update_020_notificacoes_updated_at ON public."021_notificacoes";
CREATE TRIGGER update_021_notificacoes_updated_at
    BEFORE UPDATE ON public."021_notificacoes"
    FOR EACH ROW
    EXECUTE FUNCTION update_021_notificacoes_updated_at();

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public."021_notificacoes";
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON public."021_notificacoes";
DROP POLICY IF EXISTS "Sistema pode inserir notificações" ON public."021_notificacoes";
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias notificações" ON public."021_notificacoes";

-- Recriar políticas RLS com novo nome da tabela
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public."021_notificacoes"
    FOR SELECT USING (auth.uid()::text = id_usuario_destino::text);

CREATE POLICY "Usuários podem atualizar suas próprias notificações" ON public."021_notificacoes"
    FOR UPDATE USING (auth.uid()::text = id_usuario_destino::text)
    WITH CHECK (auth.uid()::text = id_usuario_destino::text);

CREATE POLICY "Sistema pode inserir notificações" ON public."021_notificacoes"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem deletar suas próprias notificações" ON public."021_notificacoes"
    FOR DELETE USING (auth.uid()::text = id_usuario_destino::text);

-- Atualizar permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON public."021_notificacoes" TO authenticated;
GRANT SELECT ON public."021_notificacoes" TO anon;

-- Atualizar comentários
COMMENT ON TABLE public."021_notificacoes" IS 'Tabela para armazenar notificações do sistema';
COMMENT ON COLUMN public."021_notificacoes".id IS 'Identificador único da notificação';
COMMENT ON COLUMN public."021_notificacoes".id_usuario_destino IS 'ID do usuário que receberá a notificação';
COMMENT ON COLUMN public."021_notificacoes".mensagem IS 'Conteúdo da mensagem da notificação';
COMMENT ON COLUMN public."021_notificacoes".tipo_notificacao IS 'Tipo da notificação (ALERTA, INFORMATIVO, SUCESSO, URGENTE)';
COMMENT ON COLUMN public."021_notificacoes".lida IS 'Indica se a notificação foi lida pelo usuário';
COMMENT ON COLUMN public."021_notificacoes".url_redirecionamento IS 'URL opcional para redirecionamento ao clicar na notificação';
COMMENT ON COLUMN public."021_notificacoes".created_at IS 'Data e hora de criação da notificação';
COMMENT ON COLUMN public."021_notificacoes".updated_at IS 'Data e hora da última atualização da notificação';