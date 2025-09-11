-- Conceder permissões de leitura para as tabelas necessárias
-- Tabela 006_matriz_riscos
GRANT SELECT ON "006_matriz_riscos" TO anon;
GRANT SELECT ON "006_matriz_riscos" TO authenticated;
GRANT ALL PRIVILEGES ON "006_matriz_riscos" TO authenticated;

-- Tabela 010_natureza
GRANT SELECT ON "010_natureza" TO anon;
GRANT SELECT ON "010_natureza" TO authenticated;
GRANT ALL PRIVILEGES ON "010_natureza" TO authenticated;

-- Tabela 018_rel_risco
GRANT SELECT ON "018_rel_risco" TO anon;
GRANT SELECT ON "018_rel_risco" TO authenticated;
GRANT ALL PRIVILEGES ON "018_rel_risco" TO authenticated;

-- Verificar as permissões concedidas
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated') 
  AND table_name IN ('018_rel_risco', '010_natureza', '006_matriz_riscos') 
ORDER BY table_name, grantee;