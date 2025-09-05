-- Migração para corrigir estrutura completa da tabela 005_processos
-- Data: 2025-01-24
-- Descrição: Adicionar campos faltantes conforme PRD 6.4.1

-- Renomear coluna existente para seguir padrão do PRD
ALTER TABLE "005_processos" RENAME COLUMN nome_processo TO processo;

-- Adicionar campos faltantes conforme PRD
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS sigla_processo TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS publicado BOOLEAN DEFAULT false;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS link_processo TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS responsavel_processo UUID;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS objetivo_processo TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS entregas_processo TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS data_ultima_atualizacao DATE;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS data_termino_prevista DATE;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS situacao TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS planejamento_inicial TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS mapeamento_situacao_atual TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS desenho_situacao_futura TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS monitoramento TEXT;
ALTER TABLE "005_processos" ADD COLUMN IF NOT EXISTS encerramento TEXT;

-- Adicionar foreign key para responsavel_processo
ALTER TABLE "005_processos" ADD CONSTRAINT fk_005_processos_responsavel_processo 
    FOREIGN KEY (responsavel_processo) REFERENCES "003_areas_gerencias"(id);

-- Atualizar comentários da tabela e colunas
COMMENT ON TABLE "005_processos" IS 'Tabela de processos organizacionais - estrutura completa conforme PRD 6.4.1';
COMMENT ON COLUMN "005_processos".id IS 'Identificador único do processo';
COMMENT ON COLUMN "005_processos".sigla_processo IS 'Sigla do processo';
COMMENT ON COLUMN "005_processos".processo IS 'Nome/descrição do processo';
COMMENT ON COLUMN "005_processos".id_macroprocesso IS 'Referência ao macroprocesso';
COMMENT ON COLUMN "005_processos".publicado IS 'Indica se o processo está publicado';
COMMENT ON COLUMN "005_processos".link_processo IS 'Link para documentação do processo';
COMMENT ON COLUMN "005_processos".responsavel_processo IS 'Área/gerência responsável pelo processo';
COMMENT ON COLUMN "005_processos".objetivo_processo IS 'Objetivo do processo';
COMMENT ON COLUMN "005_processos".entregas_processo IS 'Entregas do processo';
COMMENT ON COLUMN "005_processos".data_ultima_atualizacao IS 'Data da última atualização';
COMMENT ON COLUMN "005_processos".data_inicio IS 'Data de início do processo';
COMMENT ON COLUMN "005_processos".data_termino_prevista IS 'Data prevista para término';
COMMENT ON COLUMN "005_processos".situacao IS 'Situação atual do processo';
COMMENT ON COLUMN "005_processos".planejamento_inicial IS 'Descrição do planejamento inicial';
COMMENT ON COLUMN "005_processos".mapeamento_situacao_atual IS 'Mapeamento da situação atual';
COMMENT ON COLUMN "005_processos".desenho_situacao_futura IS 'Desenho da situação futura';
COMMENT ON COLUMN "005_processos".monitoramento IS 'Informações de monitoramento';
COMMENT ON COLUMN "005_processos".encerramento IS 'Informações de encerramento';
COMMENT ON COLUMN "005_processos".created_at IS 'Data de criação do registro';
COMMENT ON COLUMN "005_processos".updated_at IS 'Data da última atualização do registro';

-- Verificar se a migração foi aplicada
SELECT 'Migração 005_processos concluída: estrutura completa conforme PRD' as status;