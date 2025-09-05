-- Migração para adicionar campos sigla faltantes conforme PRD 6.4.1
-- Data: 2025-01-14
-- Descrição: Adiciona campos sigla nas tabelas que não possuem conforme auditoria

-- Adicionar campo sigla_macro na tabela 004_macroprocessos
ALTER TABLE "004_macroprocessos" 
ADD COLUMN IF NOT EXISTS sigla_macro TEXT;

-- Adicionar campo sigla_rt na tabela 007_riscos_trabalho
ALTER TABLE "007_riscos_trabalho" 
ADD COLUMN IF NOT EXISTS sigla_rt TEXT;

-- Adicionar campo sigla_acao na tabela 009_acoes
ALTER TABLE "009_acoes" 
ADD COLUMN IF NOT EXISTS sigla_acao TEXT;

-- Adicionar campo sigla_natureza na tabela 010_natureza
ALTER TABLE "010_natureza" 
ADD COLUMN IF NOT EXISTS sigla_natureza TEXT;

-- Adicionar campo sigla_categoria na tabela 011_categoria
ALTER TABLE "011_categoria" 
ADD COLUMN IF NOT EXISTS sigla_categoria TEXT;

-- Adicionar campo sigla_subcategoria na tabela 012_subcategoria
ALTER TABLE "012_subcategoria" 
ADD COLUMN IF NOT EXISTS sigla_subcategoria TEXT;

-- Adicionar campo sigla_sub na tabela 013_subprocessos
ALTER TABLE "013_subprocessos" 
ADD COLUMN IF NOT EXISTS sigla_sub TEXT;

-- Adicionar campo sigla_ac_controle na tabela 014_acoes_controle_proc_trab
ALTER TABLE "014_acoes_controle_proc_trab" 
ADD COLUMN IF NOT EXISTS sigla_ac_controle TEXT;

-- Comentários das colunas adicionadas
COMMENT ON COLUMN "004_macroprocessos".sigla_macro IS 'Sigla do macroprocesso';
COMMENT ON COLUMN "007_riscos_trabalho".sigla_rt IS 'Sigla do risco de trabalho';
COMMENT ON COLUMN "009_acoes".sigla_acao IS 'Sigla da ação';
COMMENT ON COLUMN "010_natureza".sigla_natureza IS 'Sigla da natureza';
COMMENT ON COLUMN "011_categoria".sigla_categoria IS 'Sigla da categoria';
COMMENT ON COLUMN "012_subcategoria".sigla_subcategoria IS 'Sigla da subcategoria';
COMMENT ON COLUMN "013_subprocessos".sigla_sub IS 'Sigla do subprocesso';
COMMENT ON COLUMN "014_acoes_controle_proc_trab".sigla_ac_controle IS 'Sigla da ação de controle do processo de trabalho';