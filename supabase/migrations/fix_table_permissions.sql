-- Corrigir permissões das tabelas para os cards de riscos

-- Garantir que a tabela 005_processos tenha permissões corretas
GRANT SELECT ON "005_processos" TO anon;
GRANT SELECT ON "005_processos" TO authenticated;

-- Garantir que a tabela 015_riscos_x_acoes_proc_trab tenha permissões corretas
GRANT SELECT ON "015_riscos_x_acoes_proc_trab" TO anon;
GRANT SELECT ON "015_riscos_x_acoes_proc_trab" TO authenticated;

-- Verificar se RLS está habilitado (opcional, apenas para verificação)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('005_processos', '015_riscos_x_acoes_proc_trab');

-- Verificar permissões atuais (opcional, apenas para verificação)
-- SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated') AND table_name IN ('005_processos', '015_riscos_x_acoes_proc_trab') ORDER BY table_name, grantee;