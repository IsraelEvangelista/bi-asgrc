# Guia de Rollback e Recuperação

## Visão Geral

Este diretório contém scripts de rollback e recuperação para a migração das tabelas de indicadores, permitindo restaurar o sistema para seu estado original em caso de problemas.

## Scripts Disponíveis

### 1. `01_rollback_completo.sql`
**Propósito:** Restauração completa do estado original antes da migração

**Quando usar:**
- Falha completa da migração
- Decisão de cancelar a migração
- Requisitos de retornar ao estado original

**O que faz:**
- Remove tabelas atuais (008 e 019)
- Restaura tabelas originais dos backups
- Remove views, funções e índices criados
- Valida a restauração completa

### 2. `02_rollback_parcial.sql`
**Propósito:** Rollback de etapas específicas da migração

**Quando usar:**
- Problemas em etapas específicas
- Teste de etapas individuais
- Rollback seletivo baseado em impacto

**Etapas disponíveis:**
- `dados`: Rollback apenas da migração de dados
- `estrutura`: Rollback da recriação da tabela fato
- `indices`: Rollback dos índices otimizados
- `views`: Rollback de views e funções

**Como usar:**
```sql
-- Configurar etapa antes de executar
SET LOCAL rollback.etapa = 'dados';

-- Executar script
\i 02_rollback_parcial.sql
```

### 3. `03_script_emergencia.sql`
**Propósito:** Recuperação rápida em emergências críticas

**Quando usar:**
- Sistema inoperante
- Falhas críticas que precisam de solução imediata
- Perda de acesso às tabelas principais

**Características:**
- Restauração rápida e mínima
- Backup de emergência do estado atual
- Validação básica de funcionalidade

## Procedimentos de Rollback

### Antes de Executar Qualquer Rollback

1. **Avaliar o Impacto**
   ```sql
   -- Verificar usuários ativos
   SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database();

   -- Verificar transações em andamento
   SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';
   ```

2. **Notificar Usuários**
   - Comunicar downtime programado
   - Estimar tempo de indisponibilidade
   - Preparar equipe de suporte

3. **Verificar Backups**
   ```sql
   -- Verificar disponibilidade de backups
   SELECT
       tablename,
       COUNT(*) as total_registros
   FROM pg_tables
   WHERE tablename LIKE '%backup%'
   AND schemaname = 'public'
   GROUP BY tablename;
   ```

### Executando Rollback Completo

1. **Preparar Ambiente**
   ```sql
   -- Verificar espaço em disco
   SELECT pg_size_pretty(pg_database_size(current_database()));

   -- Conectar como superusuário se necessário
   ```

2. **Executar Script**
   ```bash
   # Via psql
   psql -h localhost -U usuario -d banco_asgrc -f scripts-rollback/01_rollback_completo.sql
   ```

3. **Validar Restauração**
   ```sql
   -- Verificar integridade básica
   SELECT COUNT(*) FROM 008_indicadores;
   SELECT COUNT(*) FROM 019_historico_indicadores;

   -- Verificar constraints
   SELECT COUNT(*) FROM information_schema.table_constraints
   WHERE table_name IN ('008_indicadores', '019_historico_indicadores');
   ```

### Executando Rollback Parcial

1. **Identificar Etapa Problemática**
   ```sql
   -- Consultar log de migração
   SELECT * FROM migration_log ORDER BY executed_at DESC;
   ```

2. **Configurar e Executar**
   ```sql
   -- Definir etapa específica
   SET LOCAL rollback.etapa = 'dados';

   -- Executar rollback parcial
   \i scripts-rollback/02_rollback_parcial.sql
   ```

3. **Validar Resultado Parcial**
   ```sql
   -- Verificar estado específico
   SELECT COUNT(*) FROM 008_indicadores WHERE resultado_mes IS NOT NULL;
   SELECT COUNT(*) FROM 019_historico_indicadores;
   ```

### Emergência Crítica

1. **Avaliar Urgência**
   - Sistema está inoperante?
   - Há perda de dados em andamento?
   - Usuários não conseguem trabalhar?

2. **Executar Emergência**
   ```bash
   # Executar script de emergência
   psql -h localhost -U usuario -d banco_asgrc -f scripts-rollback/03_script_emergencia.sql
   ```

3. **Documentar Incidente**
   ```sql
   -- Registrar detalhes do incidente
   INSERT INTO emergency_log (operation_type, description, status)
   VALUES ('incident_report', 'Descrição detalhada do problema', 'DOCUMENTED');
   ```

## Validação Pós-Rollback

### Verificação Básica

```sql
-- Script de validação pós-rollback
SELECT
    '008_indicadores' as tabela,
    COUNT(*) as total_registros,
    pg_size_pretty(pg_total_relation_size('008_indicadores')) as tamanho
FROM 008_indicadores

UNION ALL

SELECT
    '019_historico_indicadores' as tabela,
    COUNT(*) as total_registros,
    pg_size_pretty(pg_total_relation_size('019_historico_indicadores')) as tamanho
FROM 019_historico_indicadores;

-- Verificar integridade referencial
SELECT COUNT(*) as fk_invalidas
FROM 019_historico_indicadores h
LEFT JOIN 008_indicadores i ON h.id_indicador = i.id
WHERE i.id IS NULL;
```

### Testes Funcionais

1. **Acesso ao Sistema**
   - Frontend carrega corretamente?
   - Usuários conseguem fazer login?
   - Módulos principais funcionam?

2. **Dados de Indicadores**
   - Indicadores são exibidos corretamente?
   - Dados históricos estão disponíveis?
   - Metas e tolerâncias funcionam?

3. **Performance**
   - Tempos de resposta aceitáveis?
   - Relatórios geram corretamente?
   - Consultas não apresentam erros?

## Recomendações de Segurança

### Antes do Rollback

1. **Backup Adicional**
   ```sql
   -- Criar backup adicional antes do rollback
   CREATE TABLE pre_rollback_backup_008 AS SELECT * FROM 008_indicadores;
   CREATE TABLE pre_rollback_backup_019 AS SELECT * FROM 019_historico_indicadores;
   ```

2. **Horário Adequado**
   - Realizar em horário de baixo uso
   - Comunicar manutenção prévia
   - Ter equipe de suporte disponível

### Durante o Rollback

1. **Monitoramento**
   ```sql
   -- Monitorar progresso
   SELECT * FROM migration_log WHERE status = 'IN_PROGRESS';

   -- Verificar bloqueios
   SELECT * FROM pg_locks WHERE NOT granted;
   ```

2. **Log Detalhado**
   - Registrar todas as etapas
   - Documentar problemas encontrados
   - Manter timestamp para auditoria

### Após o Rollback

1. **Validação Completa**
   - Executar todos os testes de validação
   - Verificar com usuários-chave
   - Comparar com baseline original

2. **Documentação**
   - Atualizar documentação do sistema
   - Registrar lições aprendidas
   - Revisar procedimentos de migração

## Contatos de Suporte

Em caso de problemas durante rollback:

- **Suporte Técnico:** [Contato do time de DBA]
- **Desenvolvimento:** [Contato do time de desenvolvimento]
- **Arquitetura:** [Contato do arquiteto de dados]
- **Gerência:** [Contato do gerente do projeto]

---

**Importante:** Sempre testes scripts de rollback em ambiente de desenvolvimento antes de usar em produção. Mantenha cópias de segurança atualizadas e documente todas as operações de rollback.