-- Verificar e corrigir políticas RLS para resolver problemas de acesso
-- Esta migração garante que os roles anon e authenticated tenham as permissões necessárias

-- Verificar permissões após as alterações
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' 
-- AND grantee IN ('anon', 'authenticated') 
-- ORDER BY table_name, grantee;

-- Garantir permissões básicas para o role anon (usuários não logados)
GRANT SELECT ON "001_perfis" TO anon;
GRANT SELECT ON "002_usuarios" TO anon;
GRANT SELECT ON "003_areas_gerencias" TO anon;

-- Garantir permissões completas para o role authenticated (usuários logados)
GRANT ALL PRIVILEGES ON "001_perfis" TO authenticated;
GRANT ALL PRIVILEGES ON "002_usuarios" TO authenticated;
GRANT ALL PRIVILEGES ON "003_areas_gerencias" TO authenticated;

-- Criar política para permitir que usuários autenticados vejam perfis
DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON "001_perfis";
CREATE POLICY "Usuários autenticados podem ver perfis" ON "001_perfis"
    FOR SELECT
    TO authenticated
    USING (true);

-- Criar política para permitir que usuários autenticados vejam outros usuários
DROP POLICY IF EXISTS "Usuários autenticados podem ver usuários" ON "002_usuarios";
CREATE POLICY "Usuários autenticados podem ver usuários" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (true);

-- Criar política para permitir que usuários vejam seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON "002_usuarios";
CREATE POLICY "Usuários podem ver seu próprio perfil" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (auth.email() = email);

-- Criar política para permitir que usuários atualizem seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON "002_usuarios";
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (auth.email() = email)
    WITH CHECK (auth.email() = email);

-- Criar política para permitir inserção de novos usuários
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON "002_usuarios";
CREATE POLICY "Permitir inserção de novos usuários" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.email() = email);

-- Verificar se o perfil padrão existe e tem o ID correto
DO $$
BEGIN
    -- Se não existe o perfil com o UUID específico, criar
    IF NOT EXISTS (SELECT 1 FROM "001_perfis" WHERE id = '00000000-0000-0000-0000-000000000001') THEN
        INSERT INTO "001_perfis" (
            id,
            nome,
            descricao,
            acessos_interfaces,
            regras_permissoes,
            ativo
        ) VALUES (
            '00000000-0000-0000-0000-000000000001'::uuid,
            'Usuário Padrão',
            'Perfil padrão para novos usuários do sistema',
            '["dashboard", "indicadores", "relatorios"]'::jsonb,
            '{"visualizar": true, "editar": false, "relatorios": true, "admin": false}'::jsonb,
            true
        );
        RAISE NOTICE 'Perfil padrão criado com sucesso';
    ELSE
        RAISE NOTICE 'Perfil padrão já existe';
    END IF;
END $$;

-- Verificar permissões após as alterações
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' 
-- AND grantee IN ('anon', 'authenticated') 
-- ORDER BY table_name, grantee;