-- Garantir permissões corretas para as tabelas principais

-- Conceder permissões de SELECT para role authenticated na tabela 002_usuarios
GRANT SELECT ON "002_usuarios" TO authenticated;

-- Conceder permissões de SELECT para role authenticated na tabela 001_perfis
GRANT SELECT ON "001_perfis" TO authenticated;

-- Conceder permissões de SELECT para role authenticated na tabela 003_areas_gerencias
GRANT SELECT ON "003_areas_gerencias" TO authenticated;

-- Verificar se existem políticas RLS que podem estar bloqueando o acesso
-- Criar política para permitir que usuários vejam seus próprios dados
DROP POLICY IF EXISTS "Users can view their own profile" ON "002_usuarios";
CREATE POLICY "Users can view their own profile" ON "002_usuarios"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id::uuid OR auth.email() = email);

-- Política para permitir leitura de perfis (necessário para joins)
DROP POLICY IF EXISTS "Users can view profiles" ON "001_perfis";
CREATE POLICY "Users can view profiles" ON "001_perfis"
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir leitura de áreas/gerências (necessário para joins)
DROP POLICY IF EXISTS "Users can view areas" ON "003_areas_gerencias";
CREATE POLICY "Users can view areas" ON "003_areas_gerencias"
  FOR SELECT
  TO authenticated
  USING (true);