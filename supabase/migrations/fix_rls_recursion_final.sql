-- Correção final para recursão infinita na tabela 002_usuarios
-- Remover todas as políticas e criar políticas simples sem recursão

-- 1. Desabilitar RLS temporariamente
ALTER TABLE "002_usuarios" DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "usuarios_select_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_insert_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_update_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_delete_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "select_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "insert_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "update_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "delete_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "002_usuarios";

-- 3. Reabilitar RLS
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples SEM auth.uid() para evitar recursão
-- Permitir que usuários autenticados vejam apenas registros com seu email
CREATE POLICY "select_by_email" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (email = auth.email());

-- Permitir inserção para usuários autenticados
CREATE POLICY "insert_authenticated" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Permitir atualização apenas do próprio registro baseado no email
CREATE POLICY "update_by_email" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- Não permitir delete por enquanto para evitar problemas
-- DELETE será tratado separadamente se necessário

-- 5. Garantir permissões básicas
GRANT SELECT, INSERT, UPDATE ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- 6. Comentário explicativo
COMMENT ON TABLE "002_usuarios" IS 'Tabela de usuários com políticas RLS baseadas em email para evitar recursão infinita. Usuários autenticados podem acessar apenas seus próprios dados baseado no email da sessão.';