-- Reabilitar RLS com políticas seguras e corretas
-- Esta migração corrige o problema de recursão infinita mantendo a segurança

-- Primeiro, garantir que RLS está habilitado
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes para começar limpo
DROP POLICY IF EXISTS "usuarios_select_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_insert_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_update_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_delete_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "002_usuarios";

-- Criar políticas RLS seguras que não causem recursão
-- Política para SELECT: usuários autenticados podem ver apenas seu próprio registro
CREATE POLICY "usuarios_select_own_data" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (email = auth.email());

-- Política para INSERT: apenas usuários autenticados podem inserir
CREATE POLICY "usuarios_insert_authenticated" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (email = auth.email());

-- Política para UPDATE: usuários podem atualizar apenas seus próprios dados
CREATE POLICY "usuarios_update_own_data" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- Política para DELETE: usuários podem deletar apenas seus próprios dados
CREATE POLICY "usuarios_delete_own_data" ON "002_usuarios"
    FOR DELETE
    TO authenticated
    USING (email = auth.email());

-- Garantir que as permissões básicas estão corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- Comentário explicativo
COMMENT ON TABLE "002_usuarios" IS 'Tabela de usuários com RLS habilitado e políticas seguras baseadas em auth.email()';