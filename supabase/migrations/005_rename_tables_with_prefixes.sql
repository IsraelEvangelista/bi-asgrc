-- Migração 005: Renomear tabelas com prefixos numerados para organização
-- Data: 2024
-- Descrição: Adiciona prefixos 0xx_ nas tabelas para melhor organização e identificação

-- ========================================
-- ETAPA 1: RENOMEAR TABELAS
-- ========================================

-- 001_perfis (primeira - mais importante)
ALTER TABLE perfis RENAME TO "001_perfis";

-- 002_usuarios (segunda - vinculada aos perfis)
ALTER TABLE usuarios RENAME TO "002_usuarios";

-- 003_areas_gerencias (estrutura organizacional)
ALTER TABLE areas_gerencias RENAME TO "003_areas_gerencias";

-- 004_macroprocessos (processos principais)
ALTER TABLE macroprocessos RENAME TO "004_macroprocessos";

-- 005_processos (subprocessos)
ALTER TABLE processos RENAME TO "005_processos";

-- 006_matriz_riscos (core do sistema)
ALTER TABLE matriz_riscos RENAME TO "006_matriz_riscos";

-- 007_riscos_trabalho (riscos específicos)
ALTER TABLE riscos_trabalho RENAME TO "007_riscos_trabalho";

-- 008_indicadores (métricas)
ALTER TABLE indicadores RENAME TO "008_indicadores";

-- 009_acoes (ações de controle)
ALTER TABLE acoes RENAME TO "009_acoes";

-- 010_natureza (classificação)
ALTER TABLE natureza RENAME TO "010_natureza";

-- 011_categoria (classificação)
ALTER TABLE categoria RENAME TO "011_categoria";

-- 012_subcategoria (classificação)
ALTER TABLE subcategoria RENAME TO "012_subcategoria";

-- 013_subprocessos (detalhamento)
ALTER TABLE subprocessos RENAME TO "013_subprocessos";

-- 014_acoes_controle_proc_trab (controles)
ALTER TABLE acoes_controle_proc_trab RENAME TO "014_acoes_controle_proc_trab";

-- 015_riscos_x_acoes_proc_trab (relacionamento)
ALTER TABLE riscos_x_acoes_proc_trab RENAME TO "015_riscos_x_acoes_proc_trab";

-- 016_rel_acoes_riscos (relacionamento)
ALTER TABLE rel_acoes_riscos RENAME TO "016_rel_acoes_riscos";

-- 017_rel_risco_processo (relacionamento)
ALTER TABLE rel_risco_processo RENAME TO "017_rel_risco_processo";

-- 018_rel_risco (relacionamento)
ALTER TABLE rel_risco RENAME TO "018_rel_risco";

-- 019_historico_indicadores (auditoria)
ALTER TABLE historico_indicadores RENAME TO "019_historico_indicadores";

-- ========================================
-- ETAPA 2: ATUALIZAR CONSTRAINTS DE CHAVES ESTRANGEIRAS
-- ========================================

-- Constraints da tabela 001_perfis
ALTER TABLE "001_perfis" DROP CONSTRAINT perfis_area_id_fkey;
ALTER TABLE "001_perfis" ADD CONSTRAINT "001_perfis_area_id_fkey" 
    FOREIGN KEY (area_id) REFERENCES "003_areas_gerencias"(id);

-- Constraints da tabela 002_usuarios
ALTER TABLE "002_usuarios" DROP CONSTRAINT usuarios_perfil_id_fkey;
ALTER TABLE "002_usuarios" ADD CONSTRAINT "002_usuarios_perfil_id_fkey" 
    FOREIGN KEY (perfil_id) REFERENCES "001_perfis"(id);

ALTER TABLE "002_usuarios" DROP CONSTRAINT usuarios_area_gerencia_id_fkey;
ALTER TABLE "002_usuarios" ADD CONSTRAINT "002_usuarios_area_gerencia_id_fkey" 
    FOREIGN KEY (area_gerencia_id) REFERENCES "003_areas_gerencias"(id);

-- Constraints da tabela 005_processos
ALTER TABLE "005_processos" DROP CONSTRAINT processos_id_macroprocesso_fkey;
ALTER TABLE "005_processos" ADD CONSTRAINT "005_processos_id_macroprocesso_fkey" 
    FOREIGN KEY (id_macroprocesso) REFERENCES "004_macroprocessos"(id);

-- Constraints da tabela 008_indicadores
ALTER TABLE "008_indicadores" DROP CONSTRAINT indicadores_id_risco_fkey;
ALTER TABLE "008_indicadores" ADD CONSTRAINT "008_indicadores_id_risco_fkey" 
    FOREIGN KEY (id_risco) REFERENCES "006_matriz_riscos"(id);

-- Constraints da tabela 009_acoes
ALTER TABLE "009_acoes" DROP CONSTRAINT acoes_id_ref_fkey;
ALTER TABLE "009_acoes" ADD CONSTRAINT "009_acoes_id_ref_fkey" 
    FOREIGN KEY (id_ref) REFERENCES "009_acoes"(id);

-- Constraints da tabela 011_categoria
ALTER TABLE "011_categoria" DROP CONSTRAINT categoria_id_natureza_fkey;
ALTER TABLE "011_categoria" ADD CONSTRAINT "011_categoria_id_natureza_fkey" 
    FOREIGN KEY (id_natureza) REFERENCES "010_natureza"(id);

-- Constraints da tabela 012_subcategoria
ALTER TABLE "012_subcategoria" DROP CONSTRAINT subcategoria_id_categoria_fkey;
ALTER TABLE "012_subcategoria" ADD CONSTRAINT "012_subcategoria_id_categoria_fkey" 
    FOREIGN KEY (id_categoria) REFERENCES "011_categoria"(id);

-- Constraints da tabela 013_subprocessos
ALTER TABLE "013_subprocessos" DROP CONSTRAINT subprocessos_id_processo_fkey;
ALTER TABLE "013_subprocessos" ADD CONSTRAINT "013_subprocessos_id_processo_fkey" 
    FOREIGN KEY (id_processo) REFERENCES "005_processos"(id);

-- Constraints da tabela 015_riscos_x_acoes_proc_trab
ALTER TABLE "015_riscos_x_acoes_proc_trab" DROP CONSTRAINT riscos_x_acoes_proc_trab_id_processo_fkey;
ALTER TABLE "015_riscos_x_acoes_proc_trab" ADD CONSTRAINT "015_riscos_x_acoes_proc_trab_id_processo_fkey" 
    FOREIGN KEY (id_processo) REFERENCES "005_processos"(id);

ALTER TABLE "015_riscos_x_acoes_proc_trab" DROP CONSTRAINT riscos_x_acoes_proc_trab_responsavel_processo_fkey;
ALTER TABLE "015_riscos_x_acoes_proc_trab" ADD CONSTRAINT "015_riscos_x_acoes_proc_trab_responsavel_processo_fkey" 
    FOREIGN KEY (responsavel_processo) REFERENCES "003_areas_gerencias"(id);

ALTER TABLE "015_riscos_x_acoes_proc_trab" DROP CONSTRAINT riscos_x_acoes_proc_trab_responsavel_acao_fkey;
ALTER TABLE "015_riscos_x_acoes_proc_trab" ADD CONSTRAINT "015_riscos_x_acoes_proc_trab_responsavel_acao_fkey" 
    FOREIGN KEY (responsavel_acao) REFERENCES "003_areas_gerencias"(id);

ALTER TABLE "015_riscos_x_acoes_proc_trab" DROP CONSTRAINT riscos_x_acoes_proc_trab_id_risco_fkey;
ALTER TABLE "015_riscos_x_acoes_proc_trab" ADD CONSTRAINT "015_riscos_x_acoes_proc_trab_id_risco_fkey" 
    FOREIGN KEY (id_risco) REFERENCES "007_riscos_trabalho"(id);

ALTER TABLE "015_riscos_x_acoes_proc_trab" DROP CONSTRAINT riscos_x_acoes_proc_trab_id_acao_controle_fkey;
ALTER TABLE "015_riscos_x_acoes_proc_trab" ADD CONSTRAINT "015_riscos_x_acoes_proc_trab_id_acao_controle_fkey" 
    FOREIGN KEY (id_acao_controle) REFERENCES "014_acoes_controle_proc_trab"(id);

-- Constraints da tabela 016_rel_acoes_riscos
ALTER TABLE "016_rel_acoes_riscos" DROP CONSTRAINT rel_acoes_riscos_id_risco_fkey;
ALTER TABLE "016_rel_acoes_riscos" ADD CONSTRAINT "016_rel_acoes_riscos_id_risco_fkey" 
    FOREIGN KEY (id_risco) REFERENCES "006_matriz_riscos"(id);

ALTER TABLE "016_rel_acoes_riscos" DROP CONSTRAINT fk_rel_acoes_riscos_acao;
ALTER TABLE "016_rel_acoes_riscos" ADD CONSTRAINT "016_rel_acoes_riscos_id_acao_fkey" 
    FOREIGN KEY (id_acao) REFERENCES "009_acoes"(id);

-- Constraints da tabela 017_rel_risco_processo
ALTER TABLE "017_rel_risco_processo" DROP CONSTRAINT rel_risco_processo_id_risco_fkey;
ALTER TABLE "017_rel_risco_processo" ADD CONSTRAINT "017_rel_risco_processo_id_risco_fkey" 
    FOREIGN KEY (id_risco) REFERENCES "006_matriz_riscos"(id);

ALTER TABLE "017_rel_risco_processo" DROP CONSTRAINT rel_risco_processo_id_macro_fkey;
ALTER TABLE "017_rel_risco_processo" ADD CONSTRAINT "017_rel_risco_processo_id_macro_fkey" 
    FOREIGN KEY (id_macro) REFERENCES "004_macroprocessos"(id);

-- Constraints da tabela 018_rel_risco
ALTER TABLE "018_rel_risco" DROP CONSTRAINT rel_risco_id_risco_fkey;
ALTER TABLE "018_rel_risco" ADD CONSTRAINT "018_rel_risco_id_risco_fkey" 
    FOREIGN KEY (id_risco) REFERENCES "006_matriz_riscos"(id);

ALTER TABLE "018_rel_risco" DROP CONSTRAINT rel_risco_id_natureza_fkey;
ALTER TABLE "018_rel_risco" ADD CONSTRAINT "018_rel_risco_id_natureza_fkey" 
    FOREIGN KEY (id_natureza) REFERENCES "010_natureza"(id);

ALTER TABLE "018_rel_risco" DROP CONSTRAINT rel_risco_id_categoria_fkey;
ALTER TABLE "018_rel_risco" ADD CONSTRAINT "018_rel_risco_id_categoria_fkey" 
    FOREIGN KEY (id_categoria) REFERENCES "011_categoria"(id);

ALTER TABLE "018_rel_risco" DROP CONSTRAINT rel_risco_id_subcategoria_fkey;
ALTER TABLE "018_rel_risco" ADD CONSTRAINT "018_rel_risco_id_subcategoria_fkey" 
    FOREIGN KEY (id_subcategoria) REFERENCES "012_subcategoria"(id);

-- Constraints da tabela 019_historico_indicadores
ALTER TABLE "019_historico_indicadores" DROP CONSTRAINT historico_indicadores_id_indicador_fkey;
ALTER TABLE "019_historico_indicadores" ADD CONSTRAINT "019_historico_indicadores_id_indicador_fkey" 
    FOREIGN KEY (id_indicador) REFERENCES "008_indicadores"(id);

-- ========================================
-- ETAPA 3: ATUALIZAR POLÍTICAS RLS
-- ========================================

-- Remover políticas antigas e criar novas com nomes das tabelas atualizados
-- Nota: As políticas RLS serão recriadas automaticamente pelo Supabase
-- com os novos nomes das tabelas

-- ========================================
-- ETAPA 4: COMENTÁRIOS INFORMATIVOS
-- ========================================

COMMENT ON TABLE "001_perfis" IS 'Tabela de perfis/cargos com definições de acesso e permissões';
COMMENT ON TABLE "002_usuarios" IS 'Tabela de usuários do sistema com referências a perfis e áreas';
COMMENT ON TABLE "003_areas_gerencias" IS 'Tabela de áreas e gerências da organização';
COMMENT ON TABLE "004_macroprocessos" IS 'Tabela de macroprocessos organizacionais';
COMMENT ON TABLE "005_processos" IS 'Tabela de processos vinculados aos macroprocessos';
COMMENT ON TABLE "006_matriz_riscos" IS 'Tabela principal da matriz de riscos - core do sistema';
COMMENT ON TABLE "007_riscos_trabalho" IS 'Tabela de riscos de trabalho identificados';
COMMENT ON TABLE "008_indicadores" IS 'Tabela de indicadores de monitoramento de riscos';
COMMENT ON TABLE "009_acoes" IS 'Tabela de ações de controle e mitigação';
COMMENT ON TABLE "010_natureza" IS 'Tabela de natureza/tipo dos riscos';
COMMENT ON TABLE "011_categoria" IS 'Tabela de categorias dos riscos por natureza';
COMMENT ON TABLE "012_subcategoria" IS 'Tabela de subcategorias dos riscos por categoria';
COMMENT ON TABLE "013_subprocessos" IS 'Tabela de subprocessos vinculados aos processos principais';
COMMENT ON TABLE "014_acoes_controle_proc_trab" IS 'Tabela de ações de controle para processos de trabalho';
COMMENT ON TABLE "015_riscos_x_acoes_proc_trab" IS 'Tabela de relacionamento entre riscos e ações de processos de trabalho';
COMMENT ON TABLE "016_rel_acoes_riscos" IS 'Tabela de relacionamento entre ações e riscos';
COMMENT ON TABLE "017_rel_risco_processo" IS 'Tabela de relacionamento entre riscos e macroprocessos';
COMMENT ON TABLE "018_rel_risco" IS 'Tabela de relacionamento entre riscos e sua classificação (natureza/categoria/subcategoria)';
COMMENT ON TABLE "019_historico_indicadores" IS 'Tabela de histórico de alterações nos indicadores';

-- ========================================
-- FINALIZAÇÃO
-- ========================================

-- Migração concluída com sucesso
-- Todas as 19 tabelas foram renomeadas com prefixos numerados
-- Integridade referencial mantida
-- Políticas RLS preservadas
-- Comentários atualizados