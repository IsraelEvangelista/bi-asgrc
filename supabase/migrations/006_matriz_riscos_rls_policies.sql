-- Habilitar RLS na tabela 006_matriz_riscos
ALTER TABLE "006_matriz_riscos" ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários autenticados podem visualizar todos os riscos não deletados
CREATE POLICY "Authenticated users can view active risks" ON "006_matriz_riscos"
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Política para INSERT: usuários autenticados podem criar novos riscos
CREATE POLICY "Authenticated users can create risks" ON "006_matriz_riscos"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para UPDATE: usuários autenticados podem atualizar riscos não deletados
CREATE POLICY "Authenticated users can update active risks" ON "006_matriz_riscos"
  FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

-- Política para DELETE: usuários autenticados podem fazer soft delete (atualizar deleted_at)
-- Nota: O soft delete é implementado via UPDATE, não DELETE físico
CREATE POLICY "Authenticated users can soft delete risks" ON "006_matriz_riscos"
  FOR UPDATE
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL OR deleted_at IS NULL);

-- Conceder permissões básicas para roles anon e authenticated
GRANT SELECT ON "006_matriz_riscos" TO anon;
GRANT ALL PRIVILEGES ON "006_matriz_riscos" TO authenticated;