-- Migração para remover definitivamente o perfil problemático
-- e verificar dados restantes

DO $$
DECLARE
    problematic_profile_id UUID := '00000000-0000-0000-0000-000000000001';
    profile_exists BOOLEAN := FALSE;
    rec RECORD;
    affected_rows INTEGER;
BEGIN
    -- Verificar se o perfil problemático ainda existe
    SELECT EXISTS(
        SELECT 1 FROM "001_perfis" 
        WHERE id = problematic_profile_id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE 'Perfil problemático encontrado. ID: %', problematic_profile_id;
        
        -- Primeiro, atualizar todos os usuários que referenciam este perfil
        UPDATE "002_usuarios" 
        SET perfil_id = NULL, 
            updated_at = NOW()
        WHERE perfil_id = problematic_profile_id;
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Usuários atualizados: %', affected_rows;
        
        -- Agora remover o perfil problemático
        DELETE FROM "001_perfis" 
        WHERE id = problematic_profile_id;
        
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Perfil problemático removido: %', affected_rows;
    ELSE
        RAISE NOTICE 'Perfil problemático não encontrado. Já foi removido.';
    END IF;
    
    -- Verificar estado final
    RAISE NOTICE 'Perfis restantes: %', (SELECT COUNT(*) FROM "001_perfis");
    RAISE NOTICE 'Usuários sem perfil: %', (SELECT COUNT(*) FROM "002_usuarios" WHERE perfil_id IS NULL);
    RAISE NOTICE 'Usuários com perfil válido: %', (SELECT COUNT(*) FROM "002_usuarios" WHERE perfil_id IS NOT NULL);
    
    -- Listar perfis existentes
    FOR rec IN SELECT id, nome FROM "001_perfis" ORDER BY nome LOOP
        RAISE NOTICE 'Perfil existente: % - %', rec.id, rec.nome;
    END LOOP;
    
    RAISE NOTICE 'Remoção definitiva do perfil problemático concluída!';
END $$;