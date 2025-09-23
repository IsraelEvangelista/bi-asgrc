# Plano de Migração - Refatoração Tabela de Indicadores

## Visão Geral

**Projeto:** ASGRC BI - Refatoração da Estrutura de Indicadores
**Data:** 2025-09-23
**Versão:** 1.0
**Status:** Planejamento Concluído

## Resumo da Migração

### Objetivo
Separar a tabela `008_indicadores` em duas tabelas seguindo princípios de data warehouse:
- **008_indicadores** (Tabela Dimensão): Identidade e características estáticas
- **019_historico_indicadores** (Tabela Fato): Medições e dados históricos temporais

### Campos Migrados
**Da 008 para a 019:**
- `justificativa_observacao` → 019_historico_indicadores.justificativa_observacao
- `impacto_n_implementacao` → 019_historico_indicadores.impacto_n_implementacao
- `resultado_mes` → 019_historico_indicadores.resultado_mes
- `updated_at` → 019_historico_indicadores.data_apuracao

## Estrutura Final das Tabelas

### Tabela 008_indicadores (Dimensão)
```sql
CREATE TABLE 008_indicadores (
    id UUID PRIMARY KEY,
    id_risco UUID REFERENCES 006_matriz_riscos(id),
    indicador_risco TEXT,
    responsavel_risco UUID REFERENCES 003_areas_gerencias(id),
    meta_efetiva FLOAT,
    meta_desc TEXT,
    limite_tolerancia TEXT,
    tipo_acompanhamento TEXT,
    apuracao TEXT,
    situacao_indicador situacao_indicador_enum,
    tolerancia tolerancia_enum,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela 019_historico_indicadores (Fato)
```sql
CREATE TABLE 019_historico_indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_indicador UUID REFERENCES 008_indicadores(id),
    justificativa_observacao TEXT,
    impacto_n_implementacao TEXT,
    resultado_mes NUMERIC,
    data_apuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Fluxo de Execução das Tarefas

### Fase 1: Preparação ✅
1. **Analisar estrutura atual** - ✅ Concluído
2. **Desenhar nova estrutura** - ✅ Concluído
3. **Atualizar PRD** - ✅ Concluído

### Fase 2: Análise de Impacto 🔄
4. **Analisar dependências de aplicações existentes**
   - Mapear queries, relatórios e dashboards
   - Identificar impactos no frontend e backend
   - Documentar adaptações necessárias

### Fase 3: Desenvolvimento ⏳
5. **Desenvolver scripts de migração SQL**
   - Script 1: Backup inicial
   - Script 2: Recriar tabela fato com nova estrutura
   - Script 3: Migrar dados da 008 para 019
   - Script 4: Limpar tabela dimensão
   - Script 5: Criar índices otimizados

6. **Criar scripts de validação e testes**
   - Testes de integridade referencial
   - Performance de consultas históricas
   - Operações CRUD em ambas as tabelas

7. **Desenvolver scripts de rollback e recuperação**
   - Procedimentos de recuperação de dados
   - Restauração do estado anterior

### Fase 4: Migração em Ambiente de Teste ⏳
8. **Executar migração em ambiente de teste**
   - Validar cada passo da migração
   - Documentar resultados e ajustes

9. **Validar resultados e performance pós-migração**
   - Comparar performance com baseline anterior
   - Validar integridade dos dados
   - Testar consultas analíticas

### Fase 5: Atualizações de Aplicação ⏳
10. **Atualizar frontend para nova estrutura**
    - Adaptar componentes React
    - Garantir exibição correta de percentuais
    - Formatação correta de datas

11. **Atualizar API endpoints para nova estrutura**
    - Implementar joins entre tabelas
    - Modificar queries de dados

### Fase 6: Deploy em Produção ⏳
12. **Planejar e executar deploy em produção**
    - Agendar janela de manutenção
    - Comunicar stakeholders
    - Executar migração com protocolos de segurança

13. **Atualizar documentação e capacitar equipe**
    - Documentar nova estrutura
    - Capacitar equipe de desenvolvimento e BI

## Scripts de Migração

### Script 1: Backup Inicial
```sql
-- Criar tabelas de backup
CREATE TABLE 008_indicadores_backup AS SELECT * FROM 008_indicadores;
CREATE TABLE 019_historico_indicadores_backup AS SELECT * FROM 019_historico_indicadores;

-- Verificar contagem de registros
SELECT COUNT(*) as total_008 FROM 008_indicadores_backup;
SELECT COUNT(*) as total_019 FROM 019_historico_indicadores_backup;
```

### Script 2: Recriar Tabela Fato com Nova Estrutura
```sql
-- Fazer backup da tabela existente
CREATE TABLE 019_historico_indicadores_backup AS SELECT * FROM 019_historico_indicadores;

-- Remover tabela existente
DROP TABLE IF EXISTS 019_historico_indicadores;

-- Criar tabela com nova estrutura
CREATE TABLE 019_historico_indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_indicador UUID REFERENCES 008_indicadores(id),
    justificativa_observacao TEXT,
    impacto_n_implementacao TEXT,
    resultado_mes NUMERIC,
    data_apuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Script 3: Migrar Dados da 008 para a 019
```sql
-- Inserir dados históricos da 008 para a 019
INSERT INTO 019_historico_indicadores (
    id_indicador,
    justificativa_observacao,
    impacto_n_implementacao,
    resultado_mes,
    data_apuracao,
    updated_at,
    created_at
)
SELECT
    id,
    justificativa_observacao,
    impacto_n_implementacao,
    resultado_mes,
    updated_at as data_apuracao,
    updated_at,
    created_at
FROM 008_indicadores
WHERE resultado_mes IS NOT NULL;
```

### Script 4: Limpar Tabela Dimensão
```sql
-- Remover campos que migraram para a tabela fato
ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS justificativa_observacao;
ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS impacto_n_implementacao;
ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS resultado_mes;
```

### Script 5: Criar Índices Otimizados
```sql
-- Índices para tabela dimensão
CREATE INDEX IF NOT EXISTS idx_008_indicadores_risco ON 008_indicadores(id_risco);
CREATE INDEX IF NOT EXISTS idx_008_indicadores_responsavel ON 008_indicadores(responsavel_risco);

-- Índices para tabela fato
CREATE INDEX IF NOT EXISTS idx_019_historico_indicador ON 019_historico_indicadores(id_indicador);
CREATE INDEX IF NOT EXISTS idx_019_historico_data_apuracao ON 019_historico_indicadores(data_apuracao DESC);
CREATE INDEX IF NOT EXISTS idx_019_historico_resultado ON 019_historico_indicadores(resultado_mes);
```

## Validação Pós-Migração

### Testes de Integridade
```sql
-- Verificar se nenhum registro foi perdido
SELECT
    (SELECT COUNT(*) FROM 008_indicadores_backup) as backup_008,
    (SELECT COUNT(*) FROM 008_indicadores) as current_008,
    (SELECT COUNT(*) FROM 019_historico_indicadores_backup) as backup_019,
    (SELECT COUNT(*) FROM 019_historico_indicadores) as current_019;

-- Verificar integridade referencial
SELECT
    COUNT(*) as invalid_fk
FROM 019_historico_indicadores h
LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
WHERE i.id IS NULL;
```

### Testes de Performance
```sql
-- Testar performance de consulta histórica
EXPLAIN ANALYZE
SELECT
    i.indicador_risco,
    h.resultado_mes,
    h.data_apuracao
FROM 019_historico_indicadores h
JOIN 008_indicadores i ON h.id_indicador = i.id
WHERE i.id_risco = 'uuid-do-risco'
  AND h.data_apuracao BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY h.data_apuracao;
```

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Perda de dados | Baixa | Crítico | Backup completo, rollback planejado |
| Downtime prolongado | Média | Alto | Executar em horário de baixo uso |
| Inconsistência de dados | Média | Alto | Validação rigorosa pós-migração |
| Impacto em aplicações | Alta | Médio | Mapear dependências, atualizar frontend/backend |

## Cronograma Estimado

| Fase | Duração | Responsável | Entregável |
|------|---------|-------------|------------|
| Análise de Impacto | 1 dia | Arquiteto/Analista | Mapeamento de dependências |
| Desenvolvimento | 2 dias | DBA/Desenvolvedor | Scripts de migração e validação |
| Testes | 1 dia | QA/Testador | Relatório de testes |
| Atualizações | 2 dias | Frontend/Backend | Aplicações adaptadas |
| Deploy Produção | 1 dia | DevOps/DBA | Migração concluída |

## Checklist Final

### Pré-Migração
- [ ] Backup completo executado
- [ ] Scripts de rollback preparados
- [ ] Dependências mapeadas
- [ ] Janela de manutenção agendada
- [ ] Stakeholders comunicados

### Pós-Migração
- [ ] Migração executada com sucesso
- [ ] Todos os testes passaram
- [ ] Performance validada
- [ ] Aplicações funcionando
- [ ] Documentação atualizada
- [ ] Equipe capacitada

---

**Observações:**
- O campo `resultado_mes` será convertido para percentual na visualização do frontend
- O campo `data_apuracao` substituirá o antigo campo `apuracao` da tabela 008
- Manter backup por pelo menos 30 dias após migração
- Monitorar performance por 15 dias pós-migração