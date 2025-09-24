# Análise de Dependências - Migração Tabela de Indicadores

## Visão Geral
**Data:** 2025-09-23
**Projeto:** ASGRC BI - Refatoração da Estrutura de Indicadores
**Versão:** 1.0

## Estrutura Atual vs Nova Estrutura

### Estrutura Atual da Tabela 019_historico_indicadores
```sql
CREATE TABLE 019_historico_indicadores (
    id UUID PRIMARY KEY,
    id_indicador UUID REFERENCES 008_indicadores(id),
    valor_anterior FLOAT,
    valor_atual FLOAT,
    data_alteracao TIMESTAMP WITH TIME ZONE,
    usuario_alteracao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);
```

### Nova Estrutura da Tabela 019_historico_indicadores (Fato)
```sql
CREATE TABLE 019_historico_indicadores (
    id UUID PRIMARY KEY,
    id_indicador UUID REFERENCES 008_indicadores(id),
    justificativa_observacao TEXT,        -- Migrado da 008
    impacto_n_implementacao TEXT,          -- Migrado da 008
    resultado_mes NUMERIC,                 -- Migrado da 008
    data_apuracao TIMESTAMP WITH TIME ZONE, -- Migrado da 008 (updated_at)
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
);
```

## Impactos Identificados

### 1. Arquivos TypeScript - Tipos e Interfaces 📝

**Arquivo:** `src/types/indicator.ts`
- **Impacto:** Alto
- **Status:** Necessita atualização
- **Campos afetados:**
  - Interface `Indicator` - Remover campos que migrarão para a tabela fato
  - Interface `IndicatorHistory` - Atualizar para nova estrutura
  - Interfaces de formulário - Ajustar para separar dimensão vs fato

**Mudanças necessárias:**
- Remover `justificativa_observacao`, `impacto_n_implementacao`, `resultado_mes` da interface `Indicator`
- Atualizar `IndicatorHistory` para usar `resultado_mes`, `data_apuracao` em vez de `valor_anterior/valor_atual`
- Criar novas interfaces para separar operações de dimensão vs fato

### 2. Componentes React 🎯

#### 2.1 Página de Indicadores (`src/pages/Indicators.tsx`)
- **Impacto:** Alto
- **Status:** Query precisa ser atualizada
- **Problema:** Atualmente busca todos os dados em uma única query

**Query atual:**
```typescript
// Será necessário fazer join entre as tabelas
query = supabase
  .from('008_indicadores')
  .select(`
    id,
    indicador_risco,
    situacao_indicador,
    resultado_mes,          // Isso não existirá mais
    meta_desc,
    tolerancia,
    responsavel_risco,
    apuracao,
    created_at,
    updated_at
  `);
```

**Query necessária:**
```typescript
query = supabase
  .from('008_indicadores')
  .select(`
    id,
    indicador_risco,
    situacao_indicador,
    meta_desc,
    tolerancia,
    responsavel_risco,
    apuracao,
    created_at,
    updated_at,
    historico:019_historico_indicadores(
      id,
      resultado_mes,
      data_apuracao,
      justificativa_observacao,
      impacto_n_implementacao
    )
  `);
```

#### 2.2 Formulário de Indicadores (`src/pages/IndicatorForm.tsx`)
- **Impacto:** Alto
- **Status:** Lógica de salvamento precisa ser dividida
- **Problema:** Atualmente salva tudo em uma única tabela

**Mudanças necessárias:**
- Separar formulário em duas partes: dados do indicador (dimensão) e medições (fato)
- Criar fluxo separado para inserir medições na tabela fato

#### 2.3 Dashboard (`src/pages/Dashboard.tsx`)
- **Impacto:** Médio
- **Status:** Queries precisam de joins
- **Problema:** Utiliza dados dos indicadores para métricas

#### 2.4 Páginas de Detalhes e Edição
- `src/pages/IndicatorDetails.tsx` - Impacto Alto
- `src/pages/EditIndicator.tsx` - Impacto Alto
- `src/pages/CreateIndicator.tsx` - Impacto Alto

### 3. Hooks Personalizados 🪝

#### 3.1 useReports.ts (`src/hooks/useReports.ts`)
- **Impacto:** Alto
- **Status:** Queries de relatório precisam ser atualizadas
- **Linhas afetadas:** 57-72 (indicadores_performance), 107-111 (dashboard_executivo), 135-139 (auditoria_completa)

**Query atual:**
```typescript
case 'indicadores_performance':
  query = supabase
    .from('008_indicadores')
    .select(`
      id,
      indicador_risco,
      situacao_indicador,
      resultado_mes,     // Migrará para tabela fato
      meta_desc,
      tolerancia,
      responsavel_risco,
      apuracao,
      created_at,
      updated_at
    `);
  break;
```

### 4. Componentes de Visualização 📊

#### 4.1 HierarchicalTreeChart.tsx
- **Impacto:** Médio
- **Status:** Necessita investigar como utiliza dados de indicadores

#### 4.2 AlertsDashboard.tsx
- **Impacto:** Médio
- **Status:** Pode precisar de ajustes nas queries

#### 4.3 useAlerts.ts
- **Impacto:** Médio
- **Status:** Lógica de alertas pode ser afetada

## Priorização de Impactos

### Impacto CRÍTICO 🚨
1. **Tipos TypeScript** - Base para todo o resto do sistema
2. **Queries do useReports** - Relatórios essenciais do sistema
3. **Página de Indicadores** - Listagem principal do módulo

### Impacto ALTO 🔴
1. **Formulários de Indicadores** - CRUD completo afetado
2. **Páginas de Detalhes/Edição** - Exibição e manipulação de dados
3. **Dashboard** - Métricas executivas afetadas

### Impacto MÉDIO 🟡
1. **Componentes de Alertas** - Sistema de notificações
2. **Gráficos e Visualizações** - Análise de dados
3. **Hooks utilitários** - Funcionalidades complementares

## Plano de Ação por Prioridade

### Fase 1: Tipos e Interfaces (1 dia)
- [ ] Atualizar interface `Indicator` para remover campos migrados
- [ ] Criar interface `IndicatorMeasurement` para tabela fato
- [ ] Atualizar `IndicatorHistory` para nova estrutura
- [ ] Ajustar interfaces de formulário

### Fase 2: Backend e Queries (2 dias)
- [ ] Atualizar hooks e queries para usar joins entre tabelas
- [ ] Modificar `useReports` para trabalhar com nova estrutura
- [ ] Criar novas funções de API para medições
- [ ] Atualizar queries de dashboard e relatórios

### Fase 3: Componentes de UI (2 dias)
- [ ] Atualizar página principal de indicadores
- [ ] Modificar formulários para separar dimensão vs fato
- [ ] Ajustar páginas de detalhes e edição
- [ ] Atualizar componentes de visualização

### Fase 4: Testes e Validação (1 dia)
- [ ] Testar todas as operações CRUD
- [ ] Validar relatórios e dashboard
- [ ] Verificar performance das queries
- [ ] Testar integração entre tabelas

## Riscos Específicos

### Risco de Perda de Dados
- **Mitigação:** Backup completo antes da migração
- **Verificação:** Validar contagem de registros antes e depois

### Risco de Performance
- **Mitigação:** Criar índices otimizados
- **Verificação:** Testar queries complexas antes do deploy

### Risco de Funcionalidades Quebradas
- **Mitigação:** Testes exaustivos em ambiente de desenvolvimento
- **Verificação:** Validar cada componente individualmente

## Checklist de Validação

### Pré-Migração
- [ ] Backup do banco de dados realizado
- [ ] Todos os arquivos de código versionados
- [ ] Testes automatizados executados com sucesso
- [ ] Documentação atualizada

### Pós-Migração
- [ ] Tipos TypeScript compilando sem erros
- [ ] Queries de banco funcionando corretamente
- [ ] Interface do usuário carregando dados
- [ ] Relatórios gerando normalmente
- [ ] Performance aceitável

---

## Próximos Passos

1. **Imediato:** Começar pela atualização dos tipos TypeScript
2. **Prioridade:** Focar nos componentes críticos identificados
3. **Comunicação:** Manter equipe informada sobre o progresso
4. **Testes:** Validar cada mudança antes de prosseguir

**Total estimado:** 6 dias para completar todas as atualizações necessárias.