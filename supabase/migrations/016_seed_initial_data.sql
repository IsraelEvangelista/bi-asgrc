-- Migração para inserir dados iniciais nas tabelas de macroprocessos, processos e subprocessos
-- Data: 2025-01-24
-- Descrição: Popular tabelas com dados de exemplo para teste do sistema

-- Inserir macroprocessos de exemplo
INSERT INTO "004_macroprocessos" (
    sigla_macro, 
    tipo_macroprocesso, 
    macroprocesso, 
    publicado,
    situacao
) VALUES 
('MP001', 'Finalístico', 'Gestão de Recursos Hídricos', true, 'Ativo'),
('MP002', 'Gestão', 'Planejamento Estratégico', true, 'Ativo'),