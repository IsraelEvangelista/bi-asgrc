-- Verificar permissões das tabelas principais
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
    AND table_name IN ('009_acoes', '016_rel_acoes_riscos', '006_matriz_riscos', '003_areas_gerencias', '023_hist_acao')
ORDER BY table_name, grantee;

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('009_acoes', '016_rel_acoes_riscos', '006_matriz_riscos', '003_areas_gerencias', '023_hist_acao');

-- Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('009_acoes', '016_rel_acoes_riscos', '006_matriz_riscos', '003_areas_gerencias', '023_hist_acao')
ORDER BY tablename, policyname;

-- Contar registros nas tabelas principais para verificar se estão acessíveis
SELECT 'Total de ações' as tabela, COUNT(*) as total FROM "009_acoes";
SELECT 'Total de relações ações-riscos' as tabela, COUNT(*) as total FROM "016_rel_acoes_riscos";
SELECT 'Total de riscos' as tabela, COUNT(*) as total FROM "006_matriz_riscos";