-- Verificar se há dados nas tabelas
SELECT 'perfis' as tabela, COUNT(*) as total FROM "001_perfis"
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM "002_usuarios";

-- Verificar estrutura da tabela de usuários
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = '002_usuarios'
ORDER BY ordinal_position;

-- Verificar se há usuário de teste
SELECT id, nome, email, ativo, perfil_id, created_at
FROM "002_usuarios" 
WHERE email LIKE '%test%' OR email LIKE '%admin%'
LIMIT 3;

-- Verificar políticas RLS detalhadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('001_perfis', '002_usuarios')
ORDER BY tablename, policyname;