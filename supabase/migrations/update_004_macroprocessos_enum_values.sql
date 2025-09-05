-- Migração para atualizar valores do enum na tabela 004_macroprocessos
-- Data: 2025-01-24
-- Descrição: Atualizar valores existentes para os padrões do PRD

-- Atualizar valores existentes para os novos padrões do PRD
UPDATE "004_macroprocessos" SET tipo_macroprocesso = 'Finalístico' WHERE tipo_macroprocesso = 'Estratégico';
UPDATE "004_macroprocessos" SET tipo_macroprocesso = 'Suporte' WHERE tipo_macroprocesso = 'Apoio';

-- Verificar se há registros atualizados
SELECT 'Migração concluída: valores de enum atualizados conforme PRD' as status;