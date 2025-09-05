-- Verificar e configurar permissões para a tabela 016_rel_acoes_riscos
-- Data: 2025-01-05
-- Descrição: Garante que os roles anon e authenticated tenham acesso adequado à tabela

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = '016_rel_acoes_riscos'
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Garantir permissões básicas para o role anon (leitura)
GRANT SELECT ON "016_rel_acoes_riscos" TO anon;

-- Garantir permissões completas para o role authenticated
GRANT ALL PRIVILEGES ON "016_rel_acoes_riscos" TO authenticated;

-- Verificar se RLS está habilitado (já está conforme resultado anterior)
-- ALTER TABLE "016_rel_acoes_riscos" ENABLE ROW LEVEL SECURITY; -- Já habilitado

-- Criar política RLS básica se não existir
DO $$
BEGIN
    -- Política para SELECT: usuários autenticados podem visualizar todos os relacionamentos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = '016_rel_acoes_riscos' 
          AND policyname = 'Authenticated users can view action-risk relations'
    ) THEN
        CREATE POLICY "Authenticated users can view action-risk relations" ON "016_rel_acoes_riscos"
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    -- Política para INSERT: usuários autenticados podem criar relacionamentos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = '016_rel_acoes_riscos' 
          AND policyname = 'Authenticated users can create action-risk relations'
    ) THEN
        CREATE POLICY "Authenticated users can create action-risk relations" ON "016_rel_acoes_riscos"
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;

    -- Política para UPDATE: usuários autenticados podem atualizar relacionamentos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = '016_rel_acoes_riscos' 
          AND policyname = 'Authenticated users can update action-risk relations'
    ) THEN
        CREATE POLICY "Authenticated users can update action-risk relations" ON "016_rel_acoes_riscos"
            FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;

    -- Política para DELETE: usuários autenticados podem deletar relacionamentos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = '016_rel_acoes_riscos' 
          AND policyname = 'Authenticated users can delete action-risk relations'
    ) THEN
        CREATE POLICY "Authenticated users can delete action-risk relations" ON "016_rel_acoes_riscos"
            FOR DELETE
            TO authenticated
            USING (true);
    END IF;
END
$$;

-- Comentário sobre as permissões configuradas
COMMENT ON TABLE "016_rel_acoes_riscos" IS 'Tabela de relacionamento entre ações e riscos - Permissões: anon (SELECT), authenticated (ALL)';