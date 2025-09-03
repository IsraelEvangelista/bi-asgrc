-- Verificar permissões das tabelas
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('001_perfis', '002_usuarios')
ORDER BY table_name, grantee;

-- Verificar se há usuários na tabela
SELECT id, nome, email, ativo, perfil_id 
FROM "002_usuarios" 
LIMIT 5;

-- Verificar se há perfis na tabela
SELECT id, nome, ativo 
FROM "001_perfis" 
LIMIT 5;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('001_perfis', '002_usuarios')