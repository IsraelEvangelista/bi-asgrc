-- Migração para desabilitar completamente RLS da tabela 002_usuarios
-- Esta é uma solução temporária para resolver o erro de recursão infinita

-- Desabilitar RLS completamente
ALTER TABLE "002_usuarios" DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "usuarios_select_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_insert_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_update_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_delete_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "select_own_profile" ON "002_usuarios";
DROP POLICY IF EXISTS "insert_own_profile" ON "002_usuarios";
DROP POLICY IF EXISTS "update_own_profile" ON "002_usuarios";
DROP POLICY IF EXISTS "delete_own_profile" ON "002_usuarios";

-- Garantir que as permissões básicas estejam configuradas
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- Comentário explicativo
COMMENT ON TABLE "002_usuarios" IS 'RLS desabilitado temporariamente para resolver recursão infinita. Implementar controle de acesso na aplicação.';