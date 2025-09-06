-- Inserir usuário existente no Auth que não está na tabela 002_usuarios
-- Este usuário já existe no Supabase Auth mas não foi criado na nossa tabela

-- Primeiro, vamos buscar o perfil padrão (assumindo que existe um perfil "Usuário" ou "Admin")
DO $$
DECLARE
    default_profile_id uuid;
    user_email text := 'ghyj.ccata40@gmail.com'; -- Email do usuário que está logado
    user_id uuid := 'c49b9754-930a-44bb-9feb-e59167a0694b'; -- ID do usuário do Auth
BEGIN
    -- Buscar um perfil padrão (primeiro perfil disponível)
    SELECT id INTO default_profile_id 
    FROM "001_perfis" 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não encontrou perfil, criar um perfil básico
    IF default_profile_id IS NULL THEN
        INSERT INTO "001_perfis" (nome, descricao, ativo)
        VALUES ('Usuário', 'Perfil básico de usuário', true)
        RETURNING id INTO default_profile_id;
        
        RAISE NOTICE 'Perfil básico criado com ID: %', default_profile_id;
    END IF;
    
    -- Inserir o usuário na tabela 002_usuarios se não existir
    INSERT INTO "002_usuarios" (
        id,
        nome,
        email,
        perfil_id,
        ativo,
        verified_against_employee_table
    )
    SELECT 
        user_id,
        'Usuário Sistema', -- Nome padrão, pode ser atualizado depois
        user_email,
        default_profile_id,
        true,
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM "002_usuarios" WHERE email = user_email
    );
    
    -- Verificar se o usuário foi inserido
    IF FOUND THEN
        RAISE NOTICE 'Usuário inserido com sucesso: % (ID: %)', user_email, user_id;
    ELSE
        RAISE NOTICE 'Usuário já existe na tabela: %', user_email;
    END IF;
END $$;

-- Verificar se o usuário foi criado corretamente
SELECT 
    u.id,
    u.nome,
    u.email,
    u.ativo,
    p.nome as perfil_nome
FROM "002_usuarios" u
LEFT JOIN "001_perfis" p ON u.perfil_id = p.id
WHERE u.email = 'ghyj.ccata40@gmail.com';