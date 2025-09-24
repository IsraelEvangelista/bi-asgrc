-- Conceder permissões para a role anon (usuários não autenticados)
GRANT SELECT ON "009_acoes" TO anon;
GRANT SELECT ON "016_rel_acoes_riscos" TO anon;
GRANT SELECT ON "006_matriz_riscos" TO anon;
GRANT SELECT ON "003_areas_gerencias" TO anon;
GRANT SELECT ON "023_hist_acao" TO anon;
GRANT SELECT ON "022_fato_prazo" TO anon;

-- Conceder permissões completas para a role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON "009_acoes" TO authenticated;
GRANT ALL PRIVILEGES ON "016_rel_acoes_riscos" TO authenticated;
GRANT ALL PRIVILEGES ON "006_matriz_riscos" TO authenticated;
GRANT ALL PRIVILEGES ON "003_areas_gerencias" TO authenticated;
GRANT ALL PRIVILEGES ON "023_hist_acao" TO authenticated;
GRANT ALL PRIVILEGES ON "022_fato_prazo" TO authenticated;

-- Criar políticas RLS para permitir acesso aos dados
-- Política para 009_acoes
DROP POLICY IF EXISTS "Allow read access to actions" ON "009_acoes";
CREATE POLICY "Allow read access to actions" ON "009_acoes"
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON "009_acoes";
CREATE POLICY "Allow full access to authenticated users" ON "009_acoes"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para 016_rel_acoes_riscos
DROP POLICY IF EXISTS "Allow read access to action-risk relations" ON "016_rel_acoes_riscos";
CREATE POLICY "Allow read access to action-risk relations" ON "016_rel_acoes_riscos"
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON "016_rel_acoes_riscos";
CREATE POLICY "Allow full access to authenticated users" ON "016_rel_acoes_riscos"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para 006_matriz_riscos
DROP POLICY IF EXISTS "Allow read access to risks" ON "006_matriz_riscos";
CREATE POLICY "Allow read access to risks" ON "006_matriz_riscos"
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON "006_matriz_riscos";
CREATE POLICY "Allow full access to authenticated users" ON "006_matriz_riscos"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para 003_areas_gerencias
DROP POLICY IF EXISTS "Allow read access to areas" ON "003_areas_gerencias";
CREATE POLICY "Allow read access to areas" ON "003_areas_gerencias"
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON "003_areas_gerencias";
CREATE POLICY "Allow full access to authenticated users" ON "003_areas_gerencias"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para 023_hist_acao
DROP POLICY IF EXISTS "Allow read access to action history" ON "023_hist_acao";
CREATE POLICY "Allow read access to action history" ON "023_hist_acao"
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON "023_hist_acao";
CREATE POLICY "Allow full access to authenticated users" ON "023_hist_acao"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para 022_fato_prazo
DROP POLICY IF EXISTS "Allow read access to deadlines" ON "022_fato_prazo";
CREATE POLICY "Allow read access to deadlines" ON "022_fato_prazo"
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON "022_fato_prazo";
CREATE POLICY "Allow full access to authenticated users" ON "022_fato_prazo"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verificar se as permissões foram aplicadas corretamente
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
    AND table_name IN ('009_acoes', '016_rel_acoes_riscos', '006_matriz_riscos', '003_areas_gerencias', '023_hist_acao', '022_fato_prazo')
ORDER BY table_name, grantee;