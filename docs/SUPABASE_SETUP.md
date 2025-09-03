# Configuração do Supabase - Sistema de Gestão de Riscos COGERH

## Visão Geral

Este documento descreve como configurar o Supabase para o Sistema de Gestão de Riscos da COGERH, incluindo a criação do projeto, configuração das variáveis de ambiente e execução do schema do banco de dados.

## Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Acesso ao projeto no Trae AI
- Conhecimento básico de SQL

## 1. Configuração do Projeto Supabase

### 1.1 Criação do Projeto

1. Acesse o dashboard do Supabase
2. Clique em "New Project"
3. Preencha as informações:
   - **Nome do Projeto**: COGERH ASGRC
   - **Organização**: Selecione sua organização
   - **Região**: Escolha a região mais próxima (ex: South America)
   - **Senha do Banco**: Defina uma senha segura

### 1.2 Obtenção das Credenciais

Após a criação do projeto, acesse:
- **Settings** → **API**
- Copie as seguintes informações:
  - **Project URL**: `https://[seu-projeto].supabase.co`
  - **anon public key**: Chave pública para uso no frontend
  - **service_role key**: Chave privada para operações administrativas

## 2. Configuração das Variáveis de Ambiente

### 2.1 Arquivo .env

Crie o arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-anon]

# Opcional: Para operações administrativas (não usar no frontend)
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role]
```

### 2.2 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env` no repositório
- Adicione `.env` ao arquivo `.gitignore`
- Use apenas a `ANON_KEY` no frontend
- A `SERVICE_ROLE_KEY` deve ser usada apenas em operações server-side

## 3. Estrutura do Banco de Dados

### 3.1 Modelo de Dados

O sistema utiliza as seguintes entidades principais:

- **areas_gerencias**: Áreas e gerências da organização
- **macroprocessos**: Macroprocessos organizacionais (Estratégico, Finalístico, Apoio)
- **processos**: Processos vinculados aos macroprocessos
- **matriz_riscos**: Matriz principal de riscos
- **indicadores**: Indicadores de monitoramento dos riscos
- **acoes**: Ações de mitigação e controle
- **Tabelas de relacionamento**: Para vincular riscos, ações e processos

### 3.2 Características Técnicas

- **Chaves Primárias**: UUID geradas automaticamente
- **Timestamps**: Campos `created_at` e `updated_at` automáticos
- **Validações**: Constraints para garantir integridade dos dados
- **Campos Calculados**: Severidade calculada automaticamente (probabilidade × impacto)
- **ENUM**: Tipo customizado para classificação de macroprocessos

## 4. Execução do Schema

### 4.1 Migração Inicial

O arquivo `supabase/migrations/001_initial_schema.sql` contém:

1. **Criação do tipo ENUM**:
   ```sql
   CREATE TYPE tipo_macroprocesso_enum AS ENUM (
       'Estratégico', 'Finalístico', 'Apoio'
   );
   ```

2. **Criação das tabelas** com todas as colunas e constraints

3. **Índices de performance**:
   - `idx_indicadores_risco`: Para consultas por risco
   - `idx_matriz_riscos_severidade`: Para ordenação por severidade
   - `idx_acoes_status`: Para filtros por status de ação
   - E outros índices estratégicos

4. **Configuração de segurança**:
   - Row Level Security (RLS) habilitado
   - Permissões para roles `anon` e `authenticated`

5. **Dados de teste**: 3 registros de exemplo na tabela `matriz_riscos`

### 4.2 Aplicação da Migração

A migração foi aplicada automaticamente via Trae AI usando:
```bash
supabase_apply_migration("001_initial_schema.sql")
```

## 5. Verificação da Instalação

### 5.1 Tabelas Criadas

Verifique se as seguintes tabelas foram criadas:
- ✅ areas_gerencias
- ✅ macroprocessos  
- ✅ processos
- ✅ matriz_riscos
- ✅ indicadores
- ✅ acoes
- ✅ riscos_x_acoes_proc_trab
- ✅ rel_acoes_riscos

### 5.2 Dados de Teste

Verifique se os 3 registros de teste foram inseridos na tabela `matriz_riscos`:
1. Falha no sistema de monitoramento de recursos hídricos
2. Não conformidade com regulamentações ambientais
3. Interrupção no fornecimento de energia elétrica

### 5.3 Permissões

Verifique se as permissões RLS estão configuradas:
- Role `anon`: SELECT em todas as tabelas
- Role `authenticated`: ALL PRIVILEGES em todas as tabelas

## 6. Próximos Passos

Com o banco configurado, você pode:

1. **Desenvolver o Frontend**: Usar as credenciais para conectar a aplicação React
2. **Implementar Autenticação**: Configurar login/logout via Supabase Auth
3. **Criar APIs**: Desenvolver endpoints para CRUD das entidades
4. **Testes**: Validar operações de inserção, consulta e atualização

## 7. Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Teste a conectividade via dashboard do Supabase

### Erro de Permissão
- Verifique se RLS está habilitado nas tabelas
- Confirme se as policies estão configuradas corretamente
- Use a service_role_key para operações administrativas

### Performance
- Monitore o uso dos índices via dashboard
- Analise queries lentas na aba "Logs"
- Considere índices adicionais conforme necessário

---

**Documento criado em**: Janeiro 2025  
**Versão**: 1.0  
**Responsável**: TRAE SOLO Coding  
**Status**: ✅ Configuração Completa