-- Correção das políticas RLS da tabela 002_usuarios
-- Remove políticas problemáticas que causam recursão infinita
-- e cria novas políticas seguras

-- 1. Remover todas as políticas existentes da tabela 002_usuarios
DROP POLICY IF EXISTS "Users can view own profile" ON "002_usuarios";
DROP POLICY IF EXISTS "Users can update own profile" ON "002_usuarios";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "002_usuarios";
DROP POLICY IF EXISTS "Admins can update all profiles" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable delete for users based on email" ON "002_usuarios";

-- 2. Criar políticas RLS simples e seguras

-- Política para SELECT: usuários podem ver apenas seu próprio perfil
CREATE POLICY "usuarios_select_own" ON "002_usuarios"
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Política para UPDATE: usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "usuarios_update_own" ON "002_usuarios"
    FOR UPDATE
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Política para INSERT: permitir inserção para usuários autenticados
CREATE POLICY "usuarios_insert_authenticated" ON "002_usuarios"
    FOR INSERT
    WITH CHECK (auth.uid()::text = id::text);

-- 3. Garantir que a tabela tenha RLS habilitado
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- 4. Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON "002_usuarios" TO anon;
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;

-- 5. Verificar se as políticas foram criadas corretamente
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