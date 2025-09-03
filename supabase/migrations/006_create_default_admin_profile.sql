-- Criar perfil padrão de usuário para novos cadastros
-- Este perfil será usado como padrão para novos usuários

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
) ON CONFLICT (id) DO NOTHING;

-- Verificar se já existe um perfil Administrador, se não, criar um
INSERT INTO "001_perfis" (
    nome,
    descricao,
    acessos_interfaces,
    regras_permissoes,
    ativo
) 
SELECT 
    'Administrador Sistema',
    'Perfil de administrador com acesso completo ao sistema',
    '["*"]'::jsonb,
    '{"admin": true, "all": true, "visualizar": true, "editar": true, "relatorios": true, "gerenciar_usuarios": true}'::jsonb,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM "001_perfis" WHERE nome ILIKE '%administrador%'
);