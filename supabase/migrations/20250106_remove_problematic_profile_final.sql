-- Migração para remover definitivamente o perfil problemático
-- Data: 2025-01-06
-- Descrição: Remove o registro com ID '00000000-0000-0000-0000-000000000001' da tabela 001_perfis

-- Verificar se o registro ainda existe
DO $$
BEGIN
    -- Log do estado atual
    RAISE NOTICE 'Verificando existência do perfil problemático...';
    
    -- Verificar se existe
    IF EXISTS (SELECT 1 FROM "001_perfis" WHERE id = '00000000-0000-0000-0000-000000000001') THEN
        RAISE NOTICE 'Perfil problemático encontrado. Removendo...';
        
        -- Primeiro, verificar se há usuários vinculados a este perfil
        IF EXISTS (SELECT 1 FROM "002_usuarios" WHERE perfil_id = '00000000-0000-0000-0000-000000000001') THEN
            RAISE NOTICE 'ATENÇÃO: Existem usuários vinculados a este perfil. Atualizando para perfil padrão...';
            
            -- Atualizar usuários para um perfil válido (assumindo que existe um perfil de administrador)
            UPDATE "002_usuarios" 
            SET perfil_id = (
                SELECT id FROM "001_perfis" 
                WHERE nome ILIKE '%admin%' OR nome ILIKE '%administrador%' 
                LIMIT 1
            )
            WHERE perfil_id = '00000000-0000-0000-0000-000000000001';
            
            RAISE NOTICE 'Usuários atualizados para perfil válido.';
        END IF;
        
        -- Remover o perfil problemático
        DELETE FROM "001_perfis" WHERE id = '00000000-0000-0000-0000-000000000001';
        
        RAISE NOTICE 'Perfil problemático removido com sucesso!';
    ELSE
        RAISE NOTICE 'Perfil problemático não encontrado. Nenhuma ação necessária.';
    END IF;
    
    -- Verificação final
    RAISE NOTICE 'Verificação final: Total de perfis na tabela: %', (SELECT COUNT(*) FROM "001_perfis");
    RAISE NOTICE 'Migração concluída. Verificar logs acima para confirmar sucesso.';
END $$;

-- Verificar integridade dos dados após a operação
SELECT 
    'Perfis ativos' as tipo,
    COUNT(*) as quantidade
FROM "001_perfis" 
WHERE ativo = true

UNION ALL

SELECT 
    'Usuários sem perfil válido' as tipo,
    COUNT(*) as quantidade
FROM "002_usuarios" u
LEFT JOIN "001_perfis" p ON u.perfil_id = p.id
WHERE p.id IS NULL;