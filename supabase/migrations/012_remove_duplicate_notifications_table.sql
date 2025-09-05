-- Remoção da tabela de notificações duplicada
-- Arquivo: 012_remove_duplicate_notifications_table.sql
-- Data: 2025-01-24
-- Descrição: Remover a tabela 'notificacoes' duplicada, mantendo apenas a '021_notificacoes'
-- que segue a convenção de nomenclatura do projeto

-- Remover políticas RLS da tabela duplicada
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public."notificacoes";
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON public."notificacoes";
DROP POLICY IF EXISTS "Sistema pode inserir notificações" ON public."notificacoes";
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias notificações" ON public."notificacoes";

-- Remover triggers da tabela duplicada
DROP TRIGGER IF EXISTS update_notificacoes_updated_at ON public."notificacoes";

-- Remover função de trigger da tabela duplicada (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_notificacoes_updated_at') THEN
        DROP FUNCTION update_notificacoes_updated_at();
    END IF;
END $$;

-- Remover a tabela duplicada
DROP TABLE IF EXISTS public."notificacoes";

-- Comentário de confirmação
COMMENT ON TABLE public."021_notificacoes" IS 'Tabela principal para armazenar notificações do sistema (tabela duplicada removida)';