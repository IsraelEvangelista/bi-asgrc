-- Criar políticas RLS para permitir acesso aos dados

-- Política para tabela 006_matriz_riscos
DROP POLICY IF EXISTS "Allow public read access" ON "006_matriz_riscos";
CREATE POLICY "Allow public read access" ON "006_matriz_riscos"
  FOR SELECT USING (true);

-- Política para tabela 010_natureza
DROP POLICY IF EXISTS "Allow public read access" ON "010_natureza";
CREATE POLICY "Allow public read access" ON "010_natureza"
  FOR SELECT USING (true);

-- Política para tabela 018_rel_risco
DROP POLICY IF EXISTS "Allow public read access" ON "018_rel_risco";
CREATE POLICY "Allow public read access" ON "018_rel_risco"
  FOR SELECT USING (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('006_matriz_riscos', '010_natureza', '018_rel_risco')
ORDER BY tablename;