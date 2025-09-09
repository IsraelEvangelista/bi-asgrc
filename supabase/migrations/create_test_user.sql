-- Criar usuário de teste na tabela 002_usuarios
-- Este usuário será usado para testar o fluxo de autenticação

INSERT INTO "002_usuarios" (
  id,
  nome,
  email,
  ativo,
  perfil_id,
  area_gerencia_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Usuário Teste',
  'teste@cogerh.com.br',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Comentário: Usuário de teste criado para validar o fluxo de autenticação
-- Email: teste@cogerh.com.br
-- Este usuário deve ser criado também no Supabase Auth para funcionar completamente