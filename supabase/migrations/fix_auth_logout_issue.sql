-- Correção definitiva para o problema de logout automático
-- Este script corrige as políticas RLS e permissões da tabela 002_usuarios

-- 1. Garantir que a tabela 002_usuarios tenha as permissões corretas
GRANT SELECT, INSERT, UPDATE ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- 2. Remover políticas RLS existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view own profile" ON "002_usuarios";
DROP POLICY IF EXISTS "Users can update own profile" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "002_usuarios";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "002_usuarios";

-- 3. Criar políticas RLS mais permissivas para evitar problemas de acesso
-- Política para leitura: usuários autenticados podem ler seus próprios dados
CREATE POLICY "authenticated_users_select_own" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (auth.email() = email);

-- Política para inserção: usuários autenticados podem inserir dados
CREATE POLICY "authenticated_users_insert" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.email() = email);

-- Política para atualização: usuários autenticados podem atualizar seus próprios dados
CREATE POLICY "authenticated_users_update_own" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (auth.email() = email)
    WITH CHECK (auth.email() = email);

-- 4. Garantir que RLS esteja habilitado
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- 5. Criar uma política adicional para administradores (se necessário)
CREATE POLICY "admin_full_access" ON "002_usuarios"
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM "002_usuarios" u
            JOIN "001_perfis" p ON u.perfil_id = p.id
            WHERE u.email = auth.email()
            AND p.nome = 'Administrador'
        )
    );

-- 6. Garantir permissões nas tabelas relacionadas
GRANT SELECT ON "001_perfis" TO authenticated, anon;
GRANT SELECT ON "003_areas_gerencias" TO authenticated, anon;

-- 7. Criar políticas para as tabelas relacionadas
ALTER TABLE "001_perfis" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "perfis_read_all" ON "001_perfis";
CREATE POLICY "perfis_read_all" ON "001_perfis"
    FOR SELECT
    TO authenticated, anon
    USING (true);

ALTER TABLE "003_areas_gerencias" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "areas_read_all" ON "003_areas_gerencias";
CREATE POLICY "areas_read_all" ON "003_areas_gerencias"
    FOR SELECT
    TO authenticated, anon
    USING (true);

-- 8. Verificar se as políticas foram criadas corretamente
SELECT 'Políticas criadas com sucesso' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = '002_usuarios';