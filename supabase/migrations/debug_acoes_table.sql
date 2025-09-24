-- Verificar se a tabela 009_acoes tem dados
SELECT COUNT(*) as total_acoes FROM "009_acoes";

-- Verificar algumas ações de exemplo
SELECT 
    id,
    desc_acao,
    status,
    prazo_implementacao,
    situacao
FROM "009_acoes" 
LIMIT 10;

-- Verificar distribuição de status
SELECT 
    status,
    COUNT(*) as quantidade
FROM "009_acoes" 
GROUP BY status
ORDER BY quantidade DESC;

-- Verificar políticas RLS ativas para a tabela 009_acoes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = '009_acoes';

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = '009_acoes';

-- Verificar permissões da tabela
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = '009_acoes'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- Testar uma consulta simples como seria feita pelo frontend
SELECT id, desc_acao, status FROM "009_acoes" LIMIT 5;