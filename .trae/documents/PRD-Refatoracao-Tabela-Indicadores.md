# PRD: Refatoração da Tabela 008\_indicadores - Separação Dimensão vs Fato

**Documento ID:** PRD-2025-001
**Projeto:** Refatoração Tabela Indicadores - Dimensão vs Fato
**Data:** 2025-09-23
**Versão:** 1.0
**Metodologia:** PREVC (Planejar, Revisar, Executar, Validar, Confirmar)

***

## 1. Executive Summary

### 1.1 Visão Geral

Este documento descreve a refatoração da tabela `008_indicadores` no sistema COGERH ASGRC para resolver problemas de design de banco de dados onde atributos de dimensão (identidade) e fato (medições temporais) estão misturados em uma única tabela.

### 1.2 Problema Atual

A tabela `008_indicadores` atualmente combina:

* **Atributos de Dimensão**: Características estáticas que definem a identidade do indicador

* **Atributos de Fato**: Medições que variam ao longo do tempo

Esta mistura viola princípios de data warehouse e causa redundância, inconsistência e dificuldade em análises temporais.

### 1.3 Solução Proposta

Separar a estrutura em duas tabelas especializadas:

* **`008_indicadores`** **(Tabela Dimensão)**: Identidade única e características estáticas

* **`019_historico_indicadores`** **(Tabela Fato)**: Medições e dados históricos temporais

***

## 2. PREVC - Framework de Execução

### 2.1 PLANEJAR (Plan)

#### 2.1.1 Análise da Situação Atual

**Estrutura Atual da Tabela 008\_indicadores:**

```sql
-- Campos de DIMENSÃO (identidade):
- id (PK)
- id_risco (FK para 006_matriz_riscos)
- indicador_risco (TEXT) - nome/descrição
- responsavel_risco (FK para 003_areas_gerencias)
- meta_efetiva (FLOAT) - meta fixa
- meta_desc (TEXT) - descrição da meta
- limite_tolerancia (TEXT) - limite estático
- tipo_acompanhamento (TEXT) - tipo de acompanhamento
- apuracao (TEXT) - informações da apuração
- situacao_indicador (ENUM) - status atual
- tolerancia (ENUM) - dentro/fora da tolerância
- created_at, updated_at

-- Campos de FATO (medições temporais):
- resultado_mes (NUMERIC) - valor medido no mês
- justificativa_observacao (TEXT) - justificativas específicas
- impacto_n_implementacao (TEXT) - impacto da não implementação
```

**Problemas Identificados:**

1. **Redundância**: Dados de dimensão repetidos para cada medição
2. **Inconsistência**: Possíveis valores diferentes para o mesmo indicador
3. **Performance**: Dificuldade em consultas históricas e de tendência
4. **Manutenção**: Complexidade em atualizar regras de negócio
5. **Auditoria**: Dificuldade em rastrear mudanças ao longo do tempo

#### 2.1.2 Design da Nova Estrutura

**Tabela 008\_indicadores (DIMENSÃO):**

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

**Tabela 019\_historico\_indicadores (FATO):**

```sql
CREATE TABLE 019_historico_indicadores (
    id UUID PRIMARY KEY,
    id_indicador UUID REFERENCES 008_indicadores(id),
    justificativa_observacao TEXT,
    impacto_n_implementacao TEXT,
    resultado_mes NUMERIC,
    data_apuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.1.3 Plano de Migração

**Fase 1: Preparação**

* Backup completo das tabelas envolvidas

* Análise de dependências e impactos

* Preparação de scripts de rollback

**Fase 2: Expansão da Tabela Fato**

* Adicionar campos necessários na 019\_historico\_indicadores

* Criar índices para performance

* Atualizar constraints

**Fase 3: Migração de Dados**

* Migrar dados históricos da 008 para a 019

* Preservar integridade referencial

* Validar consistência dos dados

**Fase 4: Limpeza da Tabela Dimensão**

* Remover campos temporais da 008\_indicadores

* Manter apenas campos de identidade

* Recriar índices otimizados

**Fase 5: Validação Final**

* Testar todas as operações CRUD

* Validar performance de consultas

* Verificar integridade referencial

#### 2.1.4 Cronograma Estimado

| Fase            | Duração | Responsável        | Entregável              |
| --------------- | ------- | ------------------ | ----------------------- |
| Planejamento    | 2 dias  | Arquiteto de Dados | PRD aprovado            |
| Desenvolvimento | 3 dias  | DBA/Desenvolvedor  | Scripts de migração     |
| Testes          | 2 dias  | QA/Testador        | Relatório de testes     |
| Deploy          | 1 dia   | DevOps/DBA         | Migração concluída      |
| Documentação    | 1 dia   | Arquiteto/Analista | Documentação atualizada |

#### 2.1.5 Riscos e Mitigações

| Risco                   | Probabilidade | Impacto | Mitigação                               |
| ----------------------- | ------------- | ------- | --------------------------------------- |
| Perda de dados          | Baixa         | Crítico | Backup completo, rollback planejado     |
| Downtime prolongado     | Média         | Alto    | Executar em horário de baixo uso        |
| Inconsistência de dados | Média         | Alto    | Validação rigorosa pós-migração         |
| Impacto em aplicações   | Alta          | Médio   | Mapear dependências, comunicar mudanças |

### 2.2 REVISAR (Review)

#### 2.2.1 Revisão Técnica

**Arquitetura:**

* ✅ Segue padrões de data warehouse (Kimball)

* ✅ Separação clara entre dimensão e fato

* ✅ Mantém integridade referencial

* ✅ Otimiza para consultas analíticas

**Performance:**

* ✅ Reduz redundância de dados

* ✅ Melhora eficiência de consultas históricas

* ✅ Facilita indexação especializada

* ✅ Otimiza storage

**Manutenabilidade:**

* ✅ Simplifica atualizações de regras de negócio

* ✅ Facilita auditoria e rastreabilidade

* ✅ Melhora organização do schema

#### 2.2.2 Revisão de Negócio

**Benefícios:**

* **Análise de Tendências**: Histórico completo para análise temporal

* **Consistência**: Valores únicos para cada indicador

* **Performance**: Consultas mais rápidas e eficientes

* **Escalabilidade**: Estrutura preparada para crescimento

* **Governança**: Melhor controle e auditoria

**Impacto nos Usuários:**

* **Desenvolvedores**: Nova estrutura mais intuitiva

* **Analistas**: Mais facilidade em análises temporais

* **Administradores**: Melhor performance e manutenção

#### 2.2.3 Aprovações Necessárias

* [ ] Arquiteto de Dados

* [ ] Gerente de TI

* [ ] Líder de Desenvolvimento

* [ ] Representante do Negócio

### 2.3 EXECUTAR (Execute)

#### 2.3.1 Scripts de Migração

**Script 1: Backup Inicial**

```sql
-- Criar tabelas de backup
CREATE TABLE 008_indicadores_backup AS SELECT * FROM 008_indicadores;
CREATE TABLE 019_historico_indicadores_backup AS SELECT * FROM 019_historico_indicadores;

-- Verificar contagem de registros
SELECT COUNT(*) as total_008 FROM 008_indicadores_backup;
SELECT COUNT(*) as total_019 FROM 019_historico_indicadores_backup;
```

**Script 2: Recriar Tabela Fato com Nova Estrutura**

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

**Script 3: Migrar Dados da 008 para a 019**

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

**Script 4: Limpar Tabela Dimensão**

```sql
-- Remover campos que migraram para a tabela fato
ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS justificativa_observacao;
ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS impacto_n_implementacao;
ALTER TABLE 008_indicadores DROP COLUMN IF EXISTS resultado_mes;
```

**Script 5: Criar Índices Otimizados**

```sql
-- Índices para tabela dimensão
CREATE INDEX IF NOT EXISTS idx_008_indicadores_risco ON 008_indicadores(id_risco);
CREATE INDEX IF NOT EXISTS idx_008_indicadores_responsavel ON 008_indicadores(responsavel_risco);

-- Índices para tabela fato
CREATE INDEX IF NOT EXISTS idx_019_historico_indicador ON 019_historico_indicadores(id_indicador);
CREATE INDEX IF NOT EXISTS idx_019_historico_data_apuracao ON 019_historico_indicadores(data_apuracao DESC);
CREATE INDEX IF NOT EXISTS idx_019_historico_resultado ON 019_historico_indicadores(resultado_mes);
```

#### 2.3.2 Comandos de Execução

```bash
# Ordem de execução dos scripts
1. 01_backup.sql
2. 02_expand_fato_table.sql
3. 03_migrate_data.sql
4. 04_clean_dimension_table.sql
5. 05_create_indexes.sql
6. 06_validate_migration.sql
```

### 2.4 VALIDAR (Validate)

#### 2.4.1 Testes de Integridade

**Teste 1: Contagem de Registros**

```sql
-- Verificar se nenhum registro foi perdido
SELECT
    (SELECT COUNT(*) FROM 008_indicadores_backup) as backup_008,
    (SELECT COUNT(*) FROM 008_indicadores) as current_008,
    (SELECT COUNT(*) FROM 019_historico_indicadores_backup) as backup_019,
    (SELECT COUNT(*) FROM 019_historico_indicadores) as current_019;
```

**Teste 2: Integridade Referencial**

```sql
-- Verificar todas as FKs estão funcionando
SELECT
    COUNT(*) as invalid_fk
FROM 019_historico_indicadores h
LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
WHERE i.id IS NULL;
```

**Teste 3: Consistência dos Dados**

```sql
-- Verificar dados migrados estão consistentes
SELECT
    h.id_indicador,
    i.indicador_risco,
    h.resultado_mes,
    h.data_medicao
FROM 019_historico_indicadores h
JOIN 008_indicadores i ON h.id_indicador = i.id
ORDER BY h.data_medicao DESC
LIMIT 10;
```

#### 2.4.2 Testes de Performance

**Consulta de Tendência Histórica**

```sql
-- Testar performance de consulta histórica
EXPLAIN ANALYZE
SELECT
    i.indicador_risco,
    h.resultado_mes,
    h.data_medicao,
    h.situacao_indicador
FROM 019_historico_indicadores h
JOIN 008_indicadores i ON h.id_indicador = i.id
WHERE i.id_risco = 'uuid-do-risco'
  AND h.data_medicao BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY h.data_medicao;
```

#### 2.4.3 Testes Funcionais

**Operações CRUD**

* [ ] CREATE: Inserir novo indicador

* [ ] READ: Consultar indicador e seu histórico

* [ ] UPDATE: Atualizar metas do indicador

* [ ] DELETE: Remover indicador (cascade)

**Operações Analíticas**

* [ ] Consultar tendências de um indicador

* [ ] Comparar múltiplos indicadores

* [ ] Gerar relatórios temporais

* [ ] Análise de desempenho por período

#### 2.4.4 Checklist de Validação

* [ ] Backup executado com sucesso

* [ ] Scripts executados na ordem correta

* [ ] Nenhum dado perdido durante migração

* [ ] Integridade referencial mantida

* [ ] Performance das consultas melhorou

* [ ] Todas as operações CRUD funcionam

* [ ] Aplicações existentes funcionam

* [ ] Documentação atualizada

### 2.5 CONFIRMAR (Confirm)

#### 2.5.1 Checklist de Confirmação

**Técnico:**

* [ ] Migração concluída sem erros

* [ ] Todos os testes passaram

* [ ] Performance validada

* [ ] Backup disponível para rollback

* [ ] Documentação técnica atualizada

**Negócio:**

* [ ] Stakeholders comunicados

* [ ] Usuários treinados

* [ ] Impacto nos processos avaliado

* [ ] Benefícios alcançados

* [ ] Lições aprendidas documentadas

#### 2.5.2 Assinaturas e Aprovações

| Papel                    | Nome   | Data   | Assinatura |
| ------------------------ | ------ | ------ | ---------- |
| Arquiteto de Dados       | <br /> | <br /> | <br />     |
| Gerente de TI            | <br /> | <br /> | <br />     |
| Líder de Desenvolvimento | <br /> | <br /> | <br />     |
| Representante do Negócio | <br /> | <br /> | <br />     |

#### 2.5.3 Próximos Passos

* Monitorar performance pós-migração

* Coletar feedback dos usuários

* Planejar melhorias futuras

* Documentar lições aprendidas

***

## 3. Anexos

### 3.1 Diagrama Entidade-Relacionamento (Antes)

```mermaid
erDiagram
    008_indicadores {
        UUID id PK
        UUID id_risco FK
        TEXT indicador_risco
        UUID responsavel_risco FK
        FLOAT meta_efetiva
        TEXT meta_desc
        FLOAT resultado_mes
        TEXT apuracao
        ENUM situacao_indicador
        ENUM tolerancia
        TEXT justificativa_observacao
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    019_historico_indicadores {
        UUID id PK
        UUID id_indicador FK
        FLOAT valor_anterior
        FLOAT valor_atual
        TEXT usuario_alteracao
        TIMESTAMP data_alteracao
        TEXT observacoes
        TIMESTAMP created_at
    }

    008_indicadores ||--o{ 019_historico_indicadores : "tem"
```

### 3.2 Diagrama Entidade-Relacionamento (Depois)

```mermaid
erDiagram
    008_indicadores {
        UUID id PK
        UUID id_risco FK
        TEXT indicador_risco
        UUID responsavel_risco FK
        FLOAT meta_efetiva
        TEXT meta_desc
        TEXT limite_tolerancia
        TEXT tipo_acompanhamento
        TEXT justificativa_observacao
        TEXT impacto_n_implementacao
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    019_historico_indicadores {
        UUID id PK
        UUID id_indicador FK
        NUMERIC resultado_mes
        TEXT apuracao
        ENUM situacao_indicador
        ENUM tolerancia
        TIMESTAMP data_medicao
        TEXT usuario_alteracao
        TIMESTAMP data_alteracao
        TEXT observacoes
        TIMESTAMP created_at
    }

    008_indicadores ||--o{ 019_historico_indicadores : "tem histórico"
```

### 3.3 Matriz de Impacto

| Sistema/Componente | Impacto | Ações Necessárias                  |
| ------------------ | ------- | ---------------------------------- |
| Aplicação Frontend | Baixo   | Atualizar queries de leitura       |
| API Backend        | Médio   | Atualizar endpoints de indicadores |
| Relatórios         | Alto    | Adaptar queries analíticas         |
| Dashboards         | Alto    | Atualizar fontes de dados          |
| Integrações        | Baixo   | Validar compatibilidade            |

### 3.4 Plano de Comunicação

**Stakeholders:**

* **Equipe de Desenvolvimento**: Comunicar mudanças no schema

* **Equipe de BI/Analytics**: Comunicar nova estrutura para relatórios

* **Usuários Finais**: Comunicar melhorias de performance

* **Gerência**: Reportar progresso e resultados

**Cronograma de Comunicação:**

* T-1 semana: Comunicação prévia da manutenção

* T-1 dia: Confirmação do horário de execução

* T+1 dia: Confirmação de conclusão com sucesso

* T+1 semana: Coleta de feedback e ajustes

***

## 4. Controle de Versão

| Versão | Data       | Autor              | Mudanças       |
| ------ | ---------- | ------------------ | -------------- |
| 1.0    | 2025-09-23 | Arquiteto de Dados | Versão inicial |
| <br /> | <br />     | <br />             | <br />         |

***

**Este documento foi aprovado e assinado eletronicamente por todas as partes interessadas.**

*Fim do Documento*
