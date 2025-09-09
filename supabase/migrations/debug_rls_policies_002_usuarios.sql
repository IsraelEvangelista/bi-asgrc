-- Debug das políticas RLS da tabela 002_usuarios
-- Verificar todas as políticas atuais e identificar recursão

-- 1. Listar todas as políticas da tabela 002_usuarios
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
WHERE tablename = '002_usuarios'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = '002_usuarios';

-- 3. Verificar permissões da tabela
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = '002_usuarios'
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 4. Verificar se há dependências circulares nas políticas
-- Procurar por políticas que referenciam a própria tabela
SELECT 
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = '002_usuarios'
    AND (
        qual LIKE '%002_usuarios%' 
        OR with_check LIKE '%002_usuarios%'
        OR qual LIKE '%auth.uid()%'
        OR with_check LIKE '%auth.uid()%'
    );

-- 5. Verificar funções que podem estar causando recursão
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_definition LIKE '%002_usuarios%';