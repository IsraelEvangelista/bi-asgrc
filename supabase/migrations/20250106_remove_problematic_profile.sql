-- Migração para remover perfil problemático
-- Data: 2025-01-06
-- Descrição: Remove o perfil com ID '00000000-0000-0000-0000-000000000001' que está causando problemas de autenticação

-- Verificar se o perfil existe antes de tentar remover
DO $$
BEGIN
    -- Log da operação
    RAISE NOTICE 'Iniciando remoção do perfil problemático ID: 00000000-0000-0000-0000-000000000001';
    
    -- Verificar se existem usuários vinculados a este perfil
    IF EXISTS (
        SELECT 1 FROM "002_usuarios" 
        WHERE perfil_id = '00000000-0000-0000-0000-000000000001'
    ) THEN
        RAISE NOTICE 'ATENÇÃO: Existem usuários vinculados a este perfil. Atualizando para NULL.';
        
        -- Atualizar usuários para perfil NULL (será tratado pela aplicação)
        UPDATE "002_usuarios" 
        SET perfil_id = NULL, 
            updated_at = NOW()
        WHERE perfil_id = '00000000-0000-0000-0000-000000000001';
        
        RAISE NOTICE 'Usuários atualizados: %', ROW_COUNT;
    END IF;
    
    -- Remover o perfil problemático
    IF EXISTS (
        SELECT 1 FROM "001_perfis" 
        WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN
        DELETE FROM "001_perfis" 
        WHERE id = '00000000-0000-0000-0000-000000000001';
        
        RAISE NOTICE 'Perfil problemático removido com sucesso!';
    ELSE
        RAISE NOTICE 'Perfil não encontrado - pode já ter sido removido.';
    END IF;
    
    -- Verificação final
    IF NOT EXISTS (
        SELECT 1 FROM "001_perfis" 
        WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN
        RAISE NOTICE 'Confirmação: Perfil problemático não existe mais na base.';
    ELSE
        RAISE WARNING 'ERRO: Perfil ainda existe após tentativa de remoção!';
    END IF;
END $$;

-- Verificar integridade dos dados após a operação
SELECT 
    'Perfis ativos' as tipo,
    COUNT(*) as quantidade
FROM "001_perfis" 
WHERE ativo = true

UNION ALL

SELECT 
    'Usuários sem perfil' as tipo,
    COUNT(*) as quantidade
FROM "002_usuarios" 
WHERE perfil_id IS NULL;

-- Log final da migração concluído