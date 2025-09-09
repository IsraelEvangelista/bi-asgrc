-- Conceder permissões necessárias para a tabela 002_usuarios
-- Isso pode resolver o problema de logout automático

-- Conceder permissões SELECT para o role anon (usuários não autenticados)
GRANT SELECT ON "002_usuarios" TO anon;

-- Conceder todas as permissões para o role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;

-- Verificar se as permissões foram aplicadas corretamente
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = '002_usuarios' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;