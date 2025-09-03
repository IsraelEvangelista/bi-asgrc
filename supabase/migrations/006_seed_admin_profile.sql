-- Migração para criar perfil Administrador padrão
-- Este perfil é imutável e tem acesso total ao sistema

-- Inserir perfil Administrador padrão (apenas se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "001_perfis" WHERE nome = 'Administrador') THEN
    INSERT INTO "001_perfis" (
      id,
      nome,
      descricao,
      acessos_interfaces,
      regras_permissoes,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'Administrador',
      'Perfil de administrador com acesso total ao sistema. Este perfil não pode ser modificado ou removido.',
      '["*"]'::jsonb,
      '{"admin": true, "all": true, "create": true, "read": true, "update": true, "delete": true}'::jsonb,
      true,
      now(),
      now()
    );
  END IF;
END $$;

-- Comentário para identificar o perfil como imutável
COMMENT ON TABLE "001_perfis" IS 'Tabela de perfis de acesso. O perfil "Administrador" é imutável e não deve ser modificado via interface.';

-- Criar função para prevenir modificação do perfil Admin
CREATE OR REPLACE FUNCTION prevent_admin_profile_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevenir UPDATE do perfil Administrador
  IF TG_OP = 'UPDATE' AND OLD.nome = 'Administrador' THEN
    RAISE EXCEPTION 'O perfil Administrador não pode ser modificado';
  END IF;
  
  -- Prevenir DELETE do perfil Administrador
  IF TG_OP = 'DELETE' AND OLD.nome = 'Administrador' THEN
    RAISE EXCEPTION 'O perfil Administrador não pode ser removido';
  END IF;
  
  -- Prevenir mudança do nome do perfil Admin para outro nome
  IF TG_OP = 'UPDATE' AND OLD.nome = 'Administrador' AND NEW.nome != 'Administrador' THEN
    RAISE EXCEPTION 'O nome do perfil Administrador não pode ser alterado';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para proteger o perfil Admin
DROP TRIGGER IF EXISTS protect_admin_profile ON "001_perfis";
CREATE TRIGGER protect_admin_profile
  BEFORE UPDATE OR DELETE ON "001_perfis"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_profile_modification();

-- Garantir que existe pelo menos um usuário Admin (para setup inicial)
-- Esta parte será executada apenas se não existir nenhum usuário com perfil Admin
DO $$
DECLARE
  admin_profile_id UUID;
  admin_user_count INTEGER;
BEGIN
  -- Buscar ID do perfil Administrador
  SELECT id INTO admin_profile_id 
  FROM "001_perfis" 
  WHERE nome = 'Administrador';
  
  -- Verificar se já existe usuário com perfil Admin
  SELECT COUNT(*) INTO admin_user_count
  FROM "002_usuarios"
  WHERE perfil_id = admin_profile_id AND ativo = true;
  
  -- Se não existir usuário Admin, criar um usuário padrão
  IF admin_user_count = 0 THEN
    INSERT INTO "002_usuarios" (
      id,
      nome,
      email,
      perfil_id,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'Administrador do Sistema',
      'admin@cogerh.com.br',
      admin_profile_id,
      true,
      now(),
      now()
    ) ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;