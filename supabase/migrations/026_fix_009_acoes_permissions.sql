-- Corrigir permissões da tabela 009_acoes
-- Verificar e conceder permissões necessárias para as roles anon e authenticated

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = '009_acoes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões de SELECT para a role anon (usuários não autenticados)
GRANT SELECT ON "009_acoes" TO anon;

-- Conceder todas as permissões para a role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON "009_acoes" TO authenticated;

-- Verificar se há políticas RLS que podem estar bloqueando o acesso
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = '009_acoes';

-- Criar política RLS básica para permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "009_acoes";
CREATE POLICY "Enable read access for authenticated users" ON "009_acoes"
    FOR SELECT USING (true);

-- Criar política RLS para permitir leitura para usuários anônimos
DROP POLICY IF EXISTS "Enable read access for anonymous users" ON "009_acoes";
CREATE POLICY "Enable read access for anonymous users" ON "009_acoes"
    FOR SELECT USING (true);

-- Verificar permissões após as alterações
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = '009_acoes' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

COMMENT ON TABLE "009_acoes" IS 'Permissões corrigidas em 23/09/2025 - Acesso garantido para roles anon e authenticated';