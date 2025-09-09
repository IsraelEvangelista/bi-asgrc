-- Forçar limpeza completa de todas as políticas RLS e recriar com segurança
-- Esta migração remove todas as políticas existentes e cria novas políticas seguras

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE "002_usuarios" DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes (usando CASCADE para forçar)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Buscar todas as políticas da tabela 002_usuarios
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = '002_usuarios' AND schemaname = 'public'
    LOOP
        -- Executar DROP POLICY para cada política encontrada
        EXECUTE format('DROP POLICY IF EXISTS %I ON "002_usuarios"', policy_record.policyname);
    END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE "002_usuarios" ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS seguras que não causem recursão
-- Usar auth.email() diretamente sem referências circulares

-- Política para SELECT: usuários autenticados podem ver apenas seu próprio registro
CREATE POLICY "usuarios_select_own_data" ON "002_usuarios"
    FOR SELECT
    TO authenticated
    USING (email = auth.email());

-- Política para INSERT: apenas usuários autenticados podem inserir
CREATE POLICY "usuarios_insert_authenticated" ON "002_usuarios"
    FOR INSERT
    TO authenticated
    WITH CHECK (email = auth.email());

-- Política para UPDATE: usuários podem atualizar apenas seus próprios dados
CREATE POLICY "usuarios_update_own_data" ON "002_usuarios"
    FOR UPDATE
    TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- Política para DELETE: usuários podem deletar apenas seus próprios dados
CREATE POLICY "usuarios_delete_own_data" ON "002_usuarios"
    FOR DELETE
    TO authenticated
    USING (email = auth.email());

-- Garantir permissões corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON "002_usuarios" TO authenticated;
GRANT SELECT ON "002_usuarios" TO anon;

-- Comentário explicativo
COMMENT ON TABLE "002_usuarios" IS 'Tabela de usuários com RLS habilitado e políticas seguras baseadas em auth.email() - sem recursão';