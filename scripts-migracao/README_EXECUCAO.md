# Guia de Execução dos Scripts de Migração

## Visão Geral

Este diretório contém 6 scripts SQL para a migração da tabela 008_indicadores, separando-a em estrutura de dimensão (008) e fato (019) seguindo princípios de data warehouse.

## Pré-requisitos

1. **Backup do banco de dados** - Executar backup completo antes de iniciar
2. **Permissões de administrador** - Necessárias para criar/dropar tabelas e índices
3. **Ambiente de teste** - Executar primeiro em ambiente de desenvolvimento/teste

## Ordem de Execução

Os scripts devem ser executados **EXATAMENTE nesta ordem**:

### 1. `01_backup_inicial.sql`
**Propósito:** Criar backup completo das tabelas originais
- Cria tabelas `*_backup` para ambas as tabelas
- Cria tabela de log `migration_log`
- Valida contagem de registros

### 2. `02_recriar_tabela_fato.sql`
**Propósito:** Recriar a tabela 019 com nova estrutura
- Remove tabela 019_historico_indicadores existente
- Cria nova estrutura para tabela fato
- Adiciona constraints, índices e triggers

### 3. `03_migrar_dados.sql`
**Propósito:** Migrar dados da 008 para a 019
- Migra registros com `resultado_mes` não nulo
- Valida integridade referencial
- Preserva timestamps

### 4. `04_limpar_tabela_dimensao.sql`
**Propósito:** Remover campos migrados da tabela 008
- Remove colunas: `justificativa_observacao`, `impacto_n_implementacao`, `resultado_mes`
- Recria índices otimizados
- Adiciona comentários de documentação

### 5. `05_criar_indices_otimizados.sql`
**Propósito:** Otimizar performance e criar utilitários
- Cria índices compostos e parciais
- Cria views para consultas comuns
- Cria funções utilitárias
- Adiciona triggers de validação

### 6. `06_validar_migracao.sql`
**Propósito:** Validação completa da migração
- Executa 6 testes de validação
- Gera relatório final
- Verifica performance e integridade

## Comandos de Execução

### Usando psql (linha de comando):
```bash
# Conectar ao banco de dados
psql -h localhost -U usuario -d banco_asgrc

# Executar scripts em ordem
\i 01_backup_inicial.sql
\i 02_recriar_tabela_fato.sql
\i 03_migrar_dados.sql
\i 04_limpar_tabela_dimensao.sql
\i 05_criar_indices_otimizados.sql
\i 06_validar_migracao.sql
```

### Usando DBeaver ou similar:
1. Conectar ao banco de dados
2. Abrir cada script em uma nova aba
3. Executar um por um na ordem correta
4. Verificar resultados após cada execução

## Validação Após Cada Script

### Após Script 01:
- Verificar se tabelas `*_backup` foram criadas
- Confirmar contagem de registros nos backups

### Após Script 02:
- Verificar se tabela 019_historico_indicadores foi recriada
- Confirmar estrutura com nova coluna `data_apuracao`

### Após Script 03:
- Verificar se dados foram migrados para 019
- Confirmar integridade referencial

### Após Script 04:
- Verificar se colunas foram removidas da 008
- Confirmar que tabela dimensão está limpa

### Após Script 05:
- Verificar criação de índices e views
- Testar funções utilitárias

### Após Script 06:
- Analisar relatório de validação
- Confirmar que todos os testes passaram

## Rollback em Caso de Erro

Se algum script falhar, você pode restaurar o estado original:

```sql
-- Restaurar tabela 008
DROP TABLE IF EXISTS 008_indicadores;
CREATE TABLE 008_indicadores AS SELECT * FROM 008_indicadores_backup;

-- Restaurar tabela 019 (se existia originalmente)
DROP TABLE IF EXISTS 019_historico_indicadores;
CREATE TABLE 019_historico_indicadores AS SELECT * FROM 019_historico_indicadores_backup;
```

## Monitoramento Durante Execução

### Verificar progresso:
```sql
SELECT * FROM migration_log ORDER BY executed_at;
```

### Verificar performance:
```sql
-- Verificar tamanho das tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE '%008%' OR tablename LIKE '%019%'
ORDER BY tablename;
```

## Pós-Migração

### Atualizar Aplicações:
1. **Frontend:** Atualizar queries para usar joins entre 008 e 019
2. **Backend:** Modificar APIs para trabalharem com nova estrutura
3. **Relatórios:** Adaptar consultas analíticas

### Manutenção:
- Manter tabelas de backup por 30 dias
- Monitorar performance por 15 dias
- Documentar quaisquer ajustes necessários

## Contatos

Em caso de dúvidas ou problemas durante a execução:
- **Suporte Técnico:** [Contato do time de DBA]
- **Desenvolvimento:** [Contato do time de desenvolvimento]
- **Arquitetura:** [Contato do arquiteto de dados]

---
**Importante:** Este processo deve ser executado preferencialmente em horário de baixo uso do sistema e com janela de manutenção agendada.