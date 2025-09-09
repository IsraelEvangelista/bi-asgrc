-- Debug script para investigar o problema de logout automático

-- 1. Verificar se a tabela 002_usuarios existe e tem dados
SELECT 'Verificando tabela 002_usuarios' as check_type;
SELECT COUNT(*) as total_usuarios FROM "002_usuarios";
SELECT * FROM "002_usuarios" LIMIT 5;

-- 2. Verificar permissões da tabela 002_usuarios
SELECT 'Verificando permissões da tabela 002_usuarios' as check_type;
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = '002_usuarios'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 3. Verificar políticas RLS da tabela 002_usuarios
SELECT 'Verificando políticas RLS da tabela 002_usuarios' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = '002_usuarios';

-- 4. Verificar se RLS está habilitado
SELECT 'Verificando se RLS está habilitado' as check_type;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = '002_usuarios';

-- 5. Verificar estrutura da tabela 002_usuarios
SELECT 'Verificando estrutura da tabela 002_usuarios' as check_type;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = '002_usuarios'
ORDER BY ordinal_position;

-- 6. Verificar se há triggers na tabela que possam causar problemas
SELECT 'Verificando triggers da tabela 002_usuarios' as check_type;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = '002_usuarios';

-- 7. Verificar configurações básicas
SELECT 'Verificando configurações básicas' as check_type;
SELECT current_user as current_user, session_user as session_user;

-- 8. Verificar se há usuários duplicados por email
SELECT 'Verificando usuários duplicados por email' as check_type;
SELECT email, COUNT(*) as count
FROM "002_usuarios" 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 9. Verificar relações com outras tabelas
SELECT 'Verificando relações da tabela 002_usuarios' as check_type;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='002_usuarios';

-- 10. Verificar logs de erro recentes (se disponível)
SELECT 'Debug concluído' as status