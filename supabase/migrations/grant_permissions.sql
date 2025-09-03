-- Conceder permissões para a tabela 001_perfis
GRANT SELECT ON "001_perfis" TO anon;
GRANT SELECT ON "001_perfis" TO authenticated;
GRANT ALL PRIVILEGES ON "001_perfis" TO authenticated;

-- Conceder permissões para a tabela 002_usuarios
GRANT SELECT ON "002_usuarios" TO anon;
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;

-- Verificar se as permissões foram aplicadas
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('001_perfis', '002_usuarios')
ORDER BY table_name, grantee;