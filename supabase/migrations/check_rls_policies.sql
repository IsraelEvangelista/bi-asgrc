-- Verificar as políticas RLS atuais da tabela 002_usuarios
-- Esta consulta mostra todas as políticas ativas

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

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = '002_usuarios';

-- Verificar permissões das roles
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = '002_usuarios'
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;