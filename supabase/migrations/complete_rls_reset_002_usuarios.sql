-- Reset completo das políticas RLS da tabela 002_usuarios
-- Remove todas as políticas existentes e cria novas políticas simples

-- 1. Desabilitar RLS temporariamente
ALTER TABLE "002_usuarios" DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "usuarios_select_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_update_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_insert_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_delete_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "select_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "update_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "insert_user" ON "002_usuarios";
DROP POLICY IF EXISTS "delete_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable read access for all users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "002_usuarios";

-- 3. Reabilitar RLS
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples e diretas SEM referências circulares

-- Política de SELECT: usuários autenticados podem ver apenas seus próprios dados
CREATE POLICY "simple_select_policy" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

-- Política de INSERT: usuários autenticados podem inserir dados
CREATE POLICY "simple_insert_policy" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = id::text);

-- Política de UPDATE: usuários autenticados podem atualizar apenas seus próprios dados
CREATE POLICY "simple_update_policy" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Política de DELETE: usuários autenticados podem deletar apenas seus próprios dados
CREATE POLICY "simple_delete_policy" ON "002_usuarios"
    FOR DELETE
    TO authenticated
    USING (auth.uid()::text = id::text);

-- 5. Garantir permissões básicas
GRANT SELECT, INSERT, UPDATE, DELETE ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = '002_usuarios'
ORDER BY policyname;