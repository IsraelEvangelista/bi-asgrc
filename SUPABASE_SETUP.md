# Configuração do Supabase - Sistema BI COGERH ASGRC

## Visão Geral

Este documento descreve a configuração completa do banco de dados Supabase para o Sistema de Business Intelligence da Assessoria de Risco e Compliance da COGERH.

## Status Atual

✅ **Epic 1 Concluído**: Fundação do banco de dados implementada
- 19 tabelas criadas conforme especificação do PRD
- Relacionamentos e chaves estrangeiras configurados
- Índices de performance implementados
- RLS (Row Level Security) habilitado
- Permissões para usuários anônimos e autenticados configuradas
- **Tabelas vazias e prontas para receber dados reais**

## Estrutura do Banco de Dados

### Tabelas Implementadas (19 total)

#### 1. Tabelas Principais
- `001_perfis` - Perfis/cargos com definições de acesso e permissões
- `002_usuarios` - Usuários do sistema com referências a perfis e áreas
- `003_areas_gerencias` - Áreas e gerências da organização
- `004_macroprocessos` - Macroprocessos organizacionais
- `005_processos` - Processos vinculados aos macroprocessos
- `006_matriz_riscos` - Matriz principal de riscos
- `007_riscos_trabalho` - Riscos específicos de trabalho
- `008_indicadores` - Indicadores de monitoramento
- `009_acoes` - Ações de mitigação

#### 2. Tabelas de Classificação
- `010_natureza` - Natureza dos riscos
- `011_categoria` - Categorias por natureza
- `012_subcategoria` - Subcategorias por categoria
- `013_subprocessos` - Subprocessos detalhados
- `014_acoes_controle_proc_trab` - Ações de controle para processos

#### 3. Tabelas de Relacionamento
- `015_riscos_x_acoes_proc_trab` - Relacionamento riscos x ações x processos
- `016_rel_acoes_riscos` - Relacionamento ações e riscos
- `017_rel_risco_processo` - Relacionamento risco e macroprocesso
- `018_rel_risco` - Relacionamento risco e classificação

#### 4. Tabelas de Auditoria
- `019_historico_indicadores` - Histórico de alterações nos indicadores

## Migrações Aplicadas

### 001_initial_schema.sql
- Criação das 8 tabelas iniciais
- Tipo ENUM para macroprocessos
- Índices de performance
- Configuração RLS e permissões

### 002_missing_tables.sql
- Criação das 9 tabelas faltantes
- Relacionamentos adicionais
- Índices complementares
- Extensão da tabela `riscos_x_acoes_proc_trab`

### 003_remove_test_data.sql
- Remoção de todos os dados de teste
- Limpeza completa das tabelas
- Preparação para dados reais

### 004_user_profile_tables.sql
- Criação das tabelas `perfis` e `usuarios`
- Controle de acesso baseado em perfis
- Atributos JSON para interfaces e regras de permissão
- Relacionamentos com áreas/gerências

### 005_rename_tables_with_prefixes.sql
- Renomeação de todas as 19 tabelas com prefixos numerados (001_ a 019_)
- Atualização de todas as referências de chaves estrangeiras
- Atualização de índices e constraints
- Organização e identificação melhorada das tabelas

## Características Técnicas

### Segurança
- **RLS Habilitado**: Todas as tabelas possuem Row Level Security
- **Permissões Configuradas**:
  - `anon`: Acesso de leitura (SELECT)
  - `authenticated`: Acesso completo (SELECT, INSERT, UPDATE, DELETE)

### Performance
- **Índices Otimizados**: Criados para consultas frequentes
- **Chaves Estrangeiras**: Relacionamentos íntegros entre tabelas
- **UUIDs**: Chaves primárias universalmente únicas

### Auditoria
- **Timestamps**: Campos `created_at` e `updated_at` em todas as tabelas
- **Histórico**: Tabela dedicada para rastreamento de alterações

## Próximos Passos (Epic 2)

Com a fundação do banco de dados completa, o sistema está pronto para:

1. **Desenvolvimento da API Backend**
   - Endpoints para CRUD das entidades
   - Autenticação e autorização
   - Validações de negócio

2. **Interface Frontend**
   - Dashboards de visualização
   - Formulários de entrada de dados
   - Relatórios e análises

3. **Integração de Dados**
   - Importação de dados existentes
   - Sincronização com sistemas legados
   - Validação e limpeza de dados

## Comandos Úteis

```sql
-- Verificar se as tabelas estão vazias
SELECT 
  schemaname,
  tablename,
  n_tup_ins as "Registros Inseridos",
  n_tup_upd as "Registros Atualizados",
  n_tup_del as "Registros Deletados"
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## Observações Importantes

- ⚠️ **Dados Limpos**: Todas as tabelas estão vazias após a aplicação da migração 003
- ✅ **Estrutura Completa**: 19 tabelas conforme especificação do PRD
- 🔒 **Segurança Configurada**: RLS e permissões implementadas
- 🚀 **Pronto para Produção**: Estrutura otimizada e documentada

---

**Última Atualização**: Epic 1 concluído - Tabelas criadas e limpas, prontas para Epic 2