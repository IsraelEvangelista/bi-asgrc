-- Corrigir permissões para a tabela 020_conceitos
-- Garantir que usuários autenticados possam acessar os conceitos

-- Verificar se RLS está habilitado (já está conforme verificado)
-- ALTER TABLE public.020_conceitos ENABLE ROW LEVEL SECURITY;

-- Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON public."020_conceitos" TO anon;
GRANT ALL PRIVILEGES ON public."020_conceitos" TO authenticated;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Permitir leitura de conceitos para usuários autenticados" 
ON public."020_conceitos" 
FOR SELECT 
TO authenticated 
USING (true);

-- Criar política para permitir leitura para usuários anônimos (se necessário)
CREATE POLICY "Permitir leitura de conceitos para usuários anônimos" 
ON public."020_conceitos" 
FOR SELECT 
TO anon 
USING (true);

-- Verificar permissões atuais (para debug)
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' 
-- AND table_name = '020_conceitos' 
-- AND grantee IN ('anon', 'authenticated') 
-- ORDER BY table_name, grantee;