-- Migração 007: Configurar políticas RLS para tabelas de perfis e usuários
-- Data: 2024-01-24
-- Descrição: Configurar Row Level Security para controle de acesso às tabelas 001_perfis e 002_usuarios

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "perfis_select_policy" ON "001_perfis";
DROP POLICY IF EXISTS "perfis_insert_policy" ON "001_perfis";
DROP POLICY IF EXISTS "perfis_update_policy" ON "001_perfis";
DROP POLICY IF EXISTS "perfis_delete_policy" ON "001_perfis";
DROP POLICY IF EXISTS "usuarios_select_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_insert_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_update_policy" ON "002_usuarios";
DROP POLICY IF EXISTS "usuarios_delete_policy" ON "002_usuarios";

-- Remover funções existentes se existirem
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS has_permission(text);

-- =====================================================
-- HABILITAR RLS NAS TABELAS
-- =====================================================

-- Habilitar RLS na tabela de perfis
ALTER TABLE "001_perfis" ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela de usuários
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÕES AUXILIARES PARA VERIFICAÇÃO DE PERMISSÕES
-- =====================================================

-- Função para verificar se o usuário atual é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Obter o UUID do usuário autenticado
    user_uuid := auth.uid();
    
    -- Se não há usuário autenticado, retornar false
    IF user_uuid IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar se o usuário tem perfil de administrador
    RETURN EXISTS (
        SELECT 1 FROM "002_usuarios" u
        JOIN "001_perfis" p ON u.perfil_id = p.id
        WHERE u.id = user_uuid
        AND u.ativo = true
        AND p.ativo = true
        AND (
            p.nome = 'Administrador' OR
            (p.regras_permissoes->>'admin')::boolean = true
        )
    );
END;
$$;

-- Função para verificar permissão específica do usuário atual
CREATE OR REPLACE FUNCTION has_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Obter o UUID do usuário autenticado
    user_uuid := auth.uid();
    
    -- Se não há usuário autenticado, retornar false
    IF user_uuid IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar se o usuário tem a permissão específica
    RETURN EXISTS (
        SELECT 1 FROM "002_usuarios" u
        JOIN "001_perfis" p ON u.perfil_id = p.id
        WHERE u.id = user_uuid
        AND u.ativo = true
        AND p.ativo = true
        AND (
            p.nome = 'Administrador' OR
            (p.regras_permissoes->>'admin')::boolean = true OR
            (p.regras_permissoes->>permission_name)::boolean = true
        )
    );
END;
$$;

-- =====================================================
-- POLÍTICAS PARA TABELA 001_PERFIS
-- =====================================================

-- Política de SELECT: Usuários autenticados podem ver todos os perfis ativos
CREATE POLICY "perfis_select_policy" ON "001_perfis"
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        ativo = true
    );

-- Política de INSERT: Apenas administradores podem criar perfis
CREATE POLICY "perfis_insert_policy" ON "001_perfis"
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        is_admin()
    );

-- Política de UPDATE: Apenas administradores podem atualizar perfis (exceto o perfil Administrador)
CREATE POLICY "perfis_update_policy" ON "001_perfis"
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        nome != 'Administrador' AND -- Protege o perfil Administrador de alterações
        is_admin()
    )
    WITH CHECK (
        nome != 'Administrador' -- Impede que o nome seja alterado para Administrador
    );

-- Política de DELETE: Apenas administradores podem "deletar" perfis (soft delete via ativo = false)
-- Nota: O perfil Administrador não pode ser deletado
CREATE POLICY "perfis_delete_policy" ON "001_perfis"
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        nome != 'Administrador' AND -- Protege o perfil Administrador
        is_admin()
    );

-- =====================================================
-- POLÍTICAS PARA TABELA 002_USUARIOS
-- =====================================================

-- Política de SELECT: Usuários podem ver outros usuários se tiverem permissão
CREATE POLICY "usuarios_select_policy" ON "002_usuarios"
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        (
            -- Usuário pode ver seu próprio perfil
            id = auth.uid() OR
            -- Ou tem permissão para gerenciar usuários
            has_permission('manage_users')
        )
    );

-- Política de INSERT: Apenas administradores ou usuários com permissão podem criar usuários
CREATE POLICY "usuarios_insert_policy" ON "002_usuarios"
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        has_permission('manage_users')
    );

-- Política de UPDATE: Usuários podem atualizar seu próprio perfil ou administradores podem atualizar qualquer usuário
CREATE POLICY "usuarios_update_policy" ON "002_usuarios"
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        (
            -- Usuário pode atualizar seu próprio perfil (dados básicos)
            id = auth.uid() OR
            -- Ou tem permissão administrativa para gerenciar usuários
            has_permission('manage_users')
        )
    );

-- Política de DELETE: Apenas administradores podem "deletar" usuários (soft delete via ativo = false)
CREATE POLICY "usuarios_delete_policy" ON "002_usuarios"
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        id != auth.uid() AND -- Usuário não pode deletar a si mesmo
        has_permission('manage_users')
    );

-- =====================================================
-- GRANT PERMISSIONS TO ROLES
-- =====================================================

-- Conceder permissões básicas para o role anon (usuários não autenticados)
-- Apenas para permitir que o sistema funcione, mas sem acesso aos dados
GRANT USAGE ON SCHEMA public TO anon;

-- Conceder permissões para o role authenticated (usuários autenticados)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON "001_perfis" TO authenticated;
GRANT ALL ON "002_usuarios" TO authenticated;
GRANT ALL ON "001_perfis" TO authenticated;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "perfis_select_policy" ON "001_perfis" IS 
'Permite que usuários autenticados vejam todos os perfis ativos';

COMMENT ON POLICY "perfis_insert_policy" ON "001_perfis" IS 
'Apenas administradores podem criar novos perfis';

COMMENT ON POLICY "perfis_update_policy" ON "001_perfis" IS 
'Apenas administradores podem atualizar perfis, exceto o perfil Administrador que é imutável';

COMMENT ON POLICY "usuarios_select_policy" ON "002_usuarios" IS 
'Usuários podem ver seu próprio perfil ou outros usuários se tiverem permissão administrativa';

COMMENT ON POLICY "usuarios_insert_policy" ON "002_usuarios" IS 
'Apenas usuários com permissão manage_users podem criar novos usuários';

COMMENT ON POLICY "usuarios_update_policy" ON "002_usuarios" IS 
'Usuários podem atualizar seu próprio perfil ou administradores podem atualizar qualquer usuário';

COMMENT ON FUNCTION is_admin() IS 
'Função auxiliar para verificar se o usuário atual possui privilégios de administrador';

COMMENT ON FUNCTION has_permission(text) IS 
'Função auxiliar para verificar se o usuário atual possui uma permissão específica';