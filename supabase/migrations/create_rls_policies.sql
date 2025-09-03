-- Migration: Create RLS Policies for Security Advisor Warnings
-- This migration creates comprehensive RLS policies for all identified tables

-- 1. RLS Policies for 003_areas_gerencias
CREATE POLICY "Users can view areas_gerencias" ON public."003_areas_gerencias"
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            is_admin(auth.uid()) OR
            id = (SELECT u.area_gerencia_id FROM "002_usuarios" u WHERE u.email = auth.email())
        )
    );

CREATE POLICY "Admins can manage areas_gerencias" ON public."003_areas_gerencias"
    FOR ALL USING (is_admin(auth.uid()));

-- 2. RLS Policies for 004_macroprocessos
CREATE POLICY "Users can view macroprocessos" ON public."004_macroprocessos"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage macroprocessos" ON public."004_macroprocessos"
    FOR ALL USING (is_admin(auth.uid()));

-- 3. RLS Policies for 005_processos
CREATE POLICY "Users can view processos" ON public."005_processos"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage processos" ON public."005_processos"
    FOR ALL USING (is_admin(auth.uid()));

-- 4. RLS Policies for 007_riscos_trabalho
CREATE POLICY "Users can view riscos_trabalho" ON public."007_riscos_trabalho"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage riscos_trabalho" ON public."007_riscos_trabalho"
    FOR ALL USING (is_admin(auth.uid()));

-- 5. RLS Policies for 008_indicadores
CREATE POLICY "Users can view indicadores" ON public."008_indicadores"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their area indicadores" ON public."008_indicadores"
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            is_admin(auth.uid()) OR
            EXISTS (
                SELECT 1 FROM "002_usuarios" u 
                WHERE u.email = auth.email() 
                AND u.area_gerencia_id IS NOT NULL
            )
        )
    );

-- 6. RLS Policies for 009_acoes
CREATE POLICY "Users can view acoes" ON public."009_acoes"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage acoes" ON public."009_acoes"
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            is_admin(auth.uid()) OR
            EXISTS (
                SELECT 1 FROM "002_usuarios" u 
                WHERE u.email = auth.email() 
                AND u.area_gerencia_id IS NOT NULL
            )
        )
    );

-- 7. RLS Policies for 010_natureza (singular, not plural)
CREATE POLICY "Users can view natureza" ON public."010_natureza"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage natureza" ON public."010_natureza"
    FOR ALL USING (is_admin(auth.uid()));

-- 8. RLS Policies for 011_categoria
CREATE POLICY "Users can view categoria" ON public."011_categoria"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categoria" ON public."011_categoria"
    FOR ALL USING (is_admin(auth.uid()));

-- 9. RLS Policies for 012_subcategoria
CREATE POLICY "Users can view subcategoria" ON public."012_subcategoria"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage subcategoria" ON public."012_subcategoria"
    FOR ALL USING (is_admin(auth.uid()));

-- Grant permissions to roles
GRANT SELECT ON public."003_areas_gerencias" TO authenticated;
GRANT SELECT ON public."004_macroprocessos" TO authenticated;
GRANT SELECT ON public."005_processos" TO authenticated;
GRANT SELECT ON public."007_riscos_trabalho" TO authenticated;
GRANT SELECT ON public."008_indicadores" TO authenticated;
GRANT SELECT ON public."009_acoes" TO authenticated;
GRANT SELECT ON public."010_natureza" TO authenticated;
GRANT SELECT ON public."011_categoria" TO authenticated;
GRANT SELECT ON public."012_subcategoria" TO authenticated;

GRANT ALL PRIVILEGES ON public."003_areas_gerencias" TO authenticated;
GRANT ALL PRIVILEGES ON public."004_macroprocessos" TO authenticated;
GRANT ALL PRIVILEGES ON public."005_processos" TO authenticated;
GRANT ALL PRIVILEGES ON public."007_riscos_trabalho" TO authenticated;
GRANT ALL PRIVILEGES ON public."008_indicadores" TO authenticated;
GRANT ALL PRIVILEGES ON public."009_acoes" TO authenticated;
GRANT ALL PRIVILEGES ON public."010_natureza" TO authenticated;
GRANT ALL PRIVILEGES ON public."011_categoria" TO authenticated;
GRANT ALL PRIVILEGES ON public."012_subcategoria" TO authenticated;

-- Grant basic read access to anon role for public data
GRANT SELECT ON public."004_macroprocessos" TO anon;
GRANT SELECT ON public."005_processos" TO anon;
GRANT SELECT ON public."010_natureza" TO anon;
GRANT SELECT ON public."011_categoria" TO anon;
GRANT SELECT ON public."012_subcategoria" TO anon;

COMMIT;