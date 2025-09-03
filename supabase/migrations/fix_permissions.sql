-- Conceder permissões para as tabelas principais

-- Permissões para a tabela 001_perfis
GRANT SELECT ON "001_perfis" TO anon;
GRANT ALL PRIVILEGES ON "001_perfis" TO authenticated;

-- Permissões para a tabela 002_usuarios
GRANT SELECT ON "002_usuarios" TO anon;
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;

-- Permissões para a tabela 003_areas_gerencias (se existir)
GRANT SELECT ON "003_areas_gerencias" TO anon;
GRANT ALL PRIVILEGES ON "003_areas_gerencias" TO authenticated;

-- Verificar permissões atuais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
    AND table_name IN ('001_perfis', '002_usuarios', '003_areas_gerencias')
ORDER BY table_name, grantee;