-- Verificar permissões da tabela 002_usuarios
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = '002_usuarios' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Verificar políticas RLS da tabela 002_usuarios
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = '002_usuarios';