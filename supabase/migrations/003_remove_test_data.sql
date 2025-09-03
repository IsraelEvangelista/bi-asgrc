-- Migração para remover dados de teste inseridos nas migrações anteriores
-- Esta migração limpa todas as tabelas que receberam dados de teste

-- Remover dados de teste da tabela matriz_riscos
DELETE FROM matriz_riscos 
WHERE eventos_riscos IN (
    'Falha no sistema de monitoramento de recursos hídricos',
    'Não conformidade com regulamentações ambientais',
    'Interrupção no fornecimento de energia elétrica'
);

-- Remover dados de teste da tabela acoes_controle_proc_trab
DELETE FROM acoes_controle_proc_trab 
WHERE acao IN (
    'Implementar sistema de backup para monitoramento',
    'Realizar auditoria de conformidade regulatória',
    'Instalar sistema de energia alternativa'
);

-- Remover dados de teste da tabela riscos_trabalho
DELETE FROM riscos_trabalho 
WHERE risco IN (
    'Falha no sistema de monitoramento de recursos hídricos',
    'Não conformidade com regulamentações ambientais',
    'Interrupção no fornecimento de energia elétrica'
);

-- Remover dados de teste da tabela subcategoria
DELETE FROM subcategoria 
WHERE desc_subcategoria IN (
    'Definição de Objetivos',
    'Monitoramento de Processos',
    'Controle Orçamentário',
    'Atendimento a Normas',
    'Comunicação Externa'
);

-- Remover dados de teste da tabela categoria
DELETE FROM categoria 
WHERE desc_categoria IN (
    'Planejamento Estratégico',
    'Processos Operacionais',
    'Gestão Financeira',
    'Conformidade Legal',
    'Imagem Institucional'
);

-- Remover dados de teste da tabela natureza
DELETE FROM natureza 
WHERE desc_natureza IN (
    'estrategico',
    'operacional',
    'financeiro',
    'regulatorio',
    'reputacional'
);

-- Verificar se as tabelas estão vazias (opcional - para confirmação)
-- SELECT COUNT(*) as matriz_riscos_count FROM matriz_riscos;
-- SELECT COUNT(*) as acoes_controle_count FROM acoes_controle_proc_trab;
-- SELECT COUNT(*) as riscos_trabalho_count FROM riscos_trabalho;
-- SELECT COUNT(*) as subcategoria_count FROM subcategoria;
-- SELECT COUNT(*) as categoria_count FROM categoria;
-- SELECT COUNT(*) as natureza_count FROM natureza;

-- Comentário de confirmação
-- Dados de teste removidos - tabelas prontas para receber dados reais do sistema