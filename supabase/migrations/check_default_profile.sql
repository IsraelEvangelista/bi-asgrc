-- Verificar se existe o perfil padrão usado no código
SELECT id, nome, ativo, regras_permissoes, acessos_interfaces
FROM "001_perfis" 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verificar todos os perfis disponíveis
SELECT id, nome, ativo, regras_permissoes, acessos_interfaces
FROM "001_perfis" 
ORDER BY nome;

-- Inserir perfil padrão se não existir
INSERT INTO "001_perfis" (id, nome, ativo, regras_permissoes, acessos_interfaces)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Usuário Padrão',
  true,
  '{"read": true, "dashboard": true}',
  '["dashboard", "profile"]'
)
ON CONFLICT (id) DO NOTHING;

-- Verificar novamente após inserção
SELECT 'Após inserção' as status, id, nome, ativo
FROM "001_perfis" 
WHERE id = '00000000-0000-0000-0000-000000000001';