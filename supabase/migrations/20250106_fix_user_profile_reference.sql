-- Migração para corrigir referências de usuários ao perfil removido
-- e garantir que não há dados órfãos

DO $$
BEGIN
    -- Verificar se há usuários com perfil_id inválido
    RAISE NOTICE 'Verificando usuários com perfil_id inválido...';
    
    -- Mostrar usuários problemáticos
    PERFORM 1 FROM "002_usuarios" u 
    LEFT JOIN "001_perfis" p ON u.perfil_id = p.id 
    WHERE u.perfil_id IS NOT NULL AND p.id IS NULL;
    
    IF FOUND THEN
        RAISE NOTICE 'Encontrados usuários com perfil_id inválido. Corrigindo...';
        
        -- Atualizar usuários com perfil_id inválido para NULL
        UPDATE "002_usuarios" 
        SET perfil_id = NULL, 
            updated_at = NOW()
        WHERE perfil_id IS NOT NULL 
        AND perfil_id NOT IN (SELECT id FROM "001_perfis");
        
        RAISE NOTICE 'Usuários corrigidos: %', ROW_COUNT;
    ELSE
        RAISE NOTICE 'Nenhum usuário com perfil_id inválido encontrado.';
    END IF;
    
    -- Verificar integridade final
    RAISE NOTICE 'Verificando integridade final...';
    
    -- Contar usuários sem perfil
    PERFORM COUNT(*) FROM "002_usuarios" WHERE perfil_id IS NULL;
    RAISE NOTICE 'Usuários sem perfil: %', (SELECT COUNT(*) FROM "002_usuarios" WHERE perfil_id IS NULL);
    
    -- Contar usuários com perfil válido
    PERFORM COUNT(*) FROM "002_usuarios" u 
    INNER JOIN "001_perfis" p ON u.perfil_id = p.id;
    RAISE NOTICE 'Usuários com perfil válido: %', (SELECT COUNT(*) FROM "002_usuarios" u INNER JOIN "001_perfis" p ON u.perfil_id = p.id);
    
    RAISE NOTICE 'Migração de correção de referências concluída com sucesso!';
END $$;