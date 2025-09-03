-- Criar usuário de teste para debug
INSERT INTO "002_usuarios" (id, nome, email, ativo, perfil_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Usuário Teste',
  'test@cogerh.com.br',
  true,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  ativo = true,
  perfil_id = '00000000-0000-0000-0000-000000000001',
  updated_at = NOW();

-- Verificar se o usuário foi criado
SELECT u.id, u.nome, u.email, u.ativo, u.perfil_id, p.nome as perfil_nome
FROM "002_usuarios" u
LEFT JOIN "001_perfis" p ON u.perfil_id = p.id
WHERE u.email = 'test@cogerh.com.br';