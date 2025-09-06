-- Inserir o usuário que deveria estar na tabela 002_usuarios
-- Este usuário já existe no Supabase Auth mas não foi criado na nossa tabela

-- Primeiro, vamos verificar se existe um perfil padrão
INSERT INTO "001_perfis" (id, nome, descricao, ativo)
VALUES (
  '3d20218e-f2bb-4424-a672-7b883572ed7b',
  'Administrador',
  'Perfil de administrador do sistema',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Inserir o usuário na tabela 002_usuarios
INSERT INTO "002_usuarios" (
  id,
  nome,
  email,
  perfil_id,
  ativo,
  verified_against_employee_table
) VALUES (
  'cf541a54-153f-4523-a57a-9ae9dab899cc',
  'Usuário Administrador',
  'isademocrata@gmail.com',
  '3d20218e-f2bb-4424-a672-7b883572ed7b',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se o usuário foi inserido corretamente
SELECT 
  u.id,
  u.nome,
  u.email,
  u.perfil_id,
  p.nome as perfil_nome
FROM "002_usuarios" u
LEFT JOIN "001_perfis" p ON u.perfil_id = p.id
WHERE u.email = 'isademocrata@gmail.com';