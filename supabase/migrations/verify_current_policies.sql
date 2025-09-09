-- Verificar o estado atual das políticas RLS da tabela 002_usuarios
-- após a tentativa de correção

-- 1. Verificar todas as políticas atuais
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = '002_usuarios'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = '002_usuarios';

-- 3. Verificar permissões atuais
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = '002_usuarios'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Tentar uma consulta simples para testar se há recursão
-- Esta consulta deve falhar se ainda houver recursão infinita
SELECT COUNT(*) as total_usuarios FROM "002_usuarios";

-- 5. Verificar se há dependências circulares nas políticas
SELECT 
    p1.policyname as policy1,
    p1.qual as qual1,
    p2.policyname as policy2,
    p2.qual as qual2
FROM pg_policies p1
CROSS JOIN pg_policies p2
WHERE p1.tablename = '002_usuarios'
    AND p2.tablename = '002_usuarios'
    AND p1.policyname != p2.policyname
    AND (p1.qual ILIKE '%' || p2.policyname || '%' OR p2.qual ILIKE '%' || p1.policyname || '%');