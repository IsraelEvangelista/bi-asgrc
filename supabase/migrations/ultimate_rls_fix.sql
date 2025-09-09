-- Ultimate RLS Fix - Remove all policies and create the simplest possible ones
-- This migration completely removes all RLS policies and creates basic ones

-- Disable RLS temporarily
ALTER TABLE "002_usuarios" DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "usuarios_select_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_insert_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_update_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_delete_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "select_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "insert_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "update_own_user" ON "002_usuarios";
DROP POLICY IF EXISTS "delete_own_user" ON "002_usuarios";

-- Re-enable RLS
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies possible - allow all for authenticated users
-- No auth.uid(), no auth.email(), no complex conditions
CREATE POLICY "allow_all_select" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "allow_all_insert" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "allow_all_update" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_delete" ON "002_usuarios"
    FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- Add comment
COMMENT ON TABLE "002_usuarios" IS 'Tabela de usuários com políticas RLS básicas - permite acesso total para usuários autenticados';