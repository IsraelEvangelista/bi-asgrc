# Epic 4: Dashboard Executivo Dinâmico - PRD

## 1. Visão Geral do Epic

### 1.1 Objetivo

Desenvolver a página principal do sistema (/dashboard) que oferece uma visão consolidada e de alto nível dos riscos, com dados e interações filtrados dinamicamente de acordo com o perfil e as permissões do usuário logado.

### 1.2 Valor de Negócio

* Centralização da informação de riscos em uma única interface

* Personalização da experiência baseada no perfil do usuário

* Melhoria na tomada de decisões através de visualizações contextuais

* Redução do tempo de análise através de KPIs focados

## 2. Histórias de Usuário

### 2.1 História 1: Visualização de KPIs Personalizados

**Como:** Um usuário logado\
**Eu quero:** Ver cards de destaque no topo do dashboard com KPIs relevantes para minha área de atuação e permissões\
**Para que:** Ter uma leitura rápida da saúde dos riscos sob minha responsabilidade ou visibilidade

#### Critérios de Aceite:

* [ ] Os dados dos KPIs são filtrados com base no perfil do usuário

* [ ] Administrador vê o total geral, Responsável de Processo vê apenas sua área

* [ ] Interface dos cards segue o design do PRD

* [ ] KPIs são atualizados em tempo real

* [ ] Tratamento de erro quando dados não estão disponíveis

### 2.2 História 2: Matriz de Riscos Contextual

**Como:** Um usuário logado\
**Eu quero:** Visualizar uma matriz de riscos (heatmap) que reflita apenas os riscos que tenho permissão para ver\
**Para que:** Focar a análise nos riscos mais críticos dentro do meu escopo de trabalho

#### Critérios de Aceite:

* [ ] Consulta utiliza ID do usuário/área para filtrar dados pertinentes

* [ ] Matriz renderizada corretamente com cores de severidade

* [ ] Interatividade permite drill-down nos dados

* [ ] Performance otimizada para grandes volumes de dados

### 2.3 História 3: Filtros com Respeito às Permissões

**Como:** Um usuário logado\
**Eu quero:** Utilizar filtros (período, responsável, tipo de risco)\
**Para que:** Refinar minha análise de dados respeitando minhas permissões

#### Critérios de Aceite:

* [ ] Filtros funcionam em conjunto com regras de permissão do perfil

* [ ] Responsável de Processo não pode filtrar por riscos de outra área

* [ ] Filtros são persistidos durante a sessão

* [ ] Interface clara sobre limitações de acesso

### 2.4 História 4: Tratamento de Estados Vazios

**Como:** Um usuário logado\
**Eu quero:** Ver mensagens apropriadas quando não há dados disponíveis\
**Para que:** Entender claramente o status dos meus dados

#### Critérios de Aceite:

* [ ] Mensagem "Não há riscos disponíveis para visualização no momento" quando aplicável

* [ ] Estados vazios diferenciados por contexto (sem permissão vs sem dados)

* [ ] Orientações claras sobre próximos passos

## 3. Especificações Funcionais

### 3.1 Componentes do Dashboard

#### 3.1.1 Header com KPIs

* **Total de Riscos Ativos**: Filtrado por permissões do usuário

* **Riscos Críticos**: Severidade alta dentro do escopo

* **Riscos Vencidos**: Prazos ultrapassados

* **Taxa de Mitigação**: Percentual de riscos tratados

#### 3.1.2 Matriz de Riscos (Heatmap)

* Eixo X: Probabilidade (1-5)

* Eixo Y: Impacto (1-5)

* Cores: Verde (baixo), Amarelo (médio), Laranja (alto), Vermelho (crítico)

* Interatividade: Click para detalhes do risco

#### 3.1.3 Painel de Filtros

* **Período**: Seletor de data (último mês, trimestre, ano, customizado)

* **Responsável**: Dropdown com usuários permitidos

* **Tipo de Risco**: Operacional, Estratégico, Financeiro, Compliance

* **Status**: Ativo, Mitigado, Aceito, Transferido

#### 3.1.4 Gráficos Complementares

* **Evolução Temporal**: Linha do tempo dos riscos

* **Distribuição por Área**: Gráfico de pizza

* **Top 5 Riscos**: Lista dos mais críticos

### 3.2 Sistema de Permissões

#### 3.2.1 Perfis e Acessos

| Perfil                  | Escopo de Visualização            | Filtros Disponíveis |
| ----------------------- | --------------------------------- | ------------------- |
| Administrador           | Todos os riscos                   | Todos os filtros    |
| Gestor de Área          | Riscos da sua área e subordinadas | Filtros da área     |
| Responsável de Processo | Riscos dos seus processos         | Filtros do processo |
| Auditor                 | Todos os riscos (somente leitura) | Todos os filtros    |
| Visualizador            | Riscos públicos                   | Filtros básicos     |

#### 3.2.2 Regras de Filtragem

* Filtros são aplicados em cascata com as permissões

* Usuário não pode expandir além do seu escopo

* Validação tanto no frontend quanto no backend

## 4. Especificações Técnicas

### 4.1 Arquitetura de Componentes

```
Dashboard/
├── DashboardPage.tsx          # Página principal
├── components/
│   ├── KPICards/
│   │   ├── KPICard.tsx        # Card individual
│   │   └── KPIContainer.tsx   # Container dos cards
│   ├── RiskMatrix/
│   │   ├── RiskMatrix.tsx     # Matriz principal
│   │   ├── MatrixCell.tsx     # Célula da matriz
│   │   └── RiskTooltip.tsx    # Tooltip com detalhes
│   ├── Filters/
│   │   ├── FilterPanel.tsx    # Painel de filtros
│   │   ├── DateFilter.tsx     # Filtro de data
│   │   ├── UserFilter.tsx     # Filtro de usuário
│   │   └── TypeFilter.tsx     # Filtro de tipo
│   ├── Charts/
│   │   ├── TimelineChart.tsx  # Gráfico temporal
│   │   ├── AreaChart.tsx      # Gráfico por área
│   │   └── TopRisksList.tsx   # Lista top riscos
│   └── EmptyStates/
│       ├── NoDataState.tsx    # Sem dados
│       └── NoPermissionState.tsx # Sem permissão
├── hooks/
│   ├── useDashboardData.ts    # Hook principal de dados
│   ├── useKPIs.ts            # Hook para KPIs
│   ├── useRiskMatrix.ts      # Hook para matriz
│   └── useDashboardFilters.ts # Hook para filtros
└── types/
    ├── dashboard.ts          # Tipos do dashboard
    └── kpi.ts               # Tipos dos KPIs
```

### 4.2 Estrutura de Dados

#### 4.2.1 Interface KPI

```typescript
interface KPI {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'currency';
  color: 'green' | 'yellow' | 'orange' | 'red';
  description?: string;
}
```

#### 4.2.2 Interface Matriz de Riscos

```typescript
interface RiskMatrixData {
  probability: number; // 1-5
  impact: number; // 1-5
  count: number;
  risks: RiskSummary[];
}

interface RiskSummary {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  area: string;
  responsible: string;
}
```

#### 4.2.3 Interface Filtros

```typescript
interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  responsibleIds: string[];
  riskTypes: RiskType[];
  statuses: RiskStatus[];
  areas: string[];
}
```

### 4.3 APIs e Endpoints

#### 4.3.1 Endpoint de KPIs

```
GET /api/dashboard/kpis
Query Parameters:
- userId: string (obrigatório)
- dateRange: string (opcional)
- area: string (opcional)

Response:
{
  "kpis": KPI[],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### 4.3.2 Endpoint da Matriz de Riscos

```
GET /api/dashboard/risk-matrix
Query Parameters:
- userId: string (obrigatório)
- filters: DashboardFilters (opcional)

Response:
{
  "matrix": RiskMatrixData[][],
  "totalRisks": number,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### 4.3.3 Endpoint de Filtros Disponíveis

```
GET /api/dashboard/available-filters
Query Parameters:
- userId: string (obrigatório)

Response:
{
  "users": User[],
  "areas": Area[],
  "riskTypes": RiskType[],
  "dateRange": {
    "min": "2024-01-01",
    "max": "2024-12-31"
  }
}
```

### 4.4 Integração com Sistema de Autenticação

#### 4.4.1 Middleware de Permissões

```typescript
// Middleware para validar acesso aos dados
const validateDashboardAccess = async (userId: string, requestedData: any) => {
  const userProfile = await getUserProfile(userId);
  const permissions = await getUserPermissions(userId);
  
  return filterDataByPermissions(requestedData, permissions);
};
```

#### 4.4.2 Hook de Permissões

```typescript
const useDashboardPermissions = () => {
  const { user } = useAuth();
  const { data: permissions } = useQuery(
    ['dashboard-permissions', user?.id],
    () => getDashboardPermissions(user?.id)
  );
  
  return {
    canViewAllRisks: permissions?.canViewAllRisks || false,
    allowedAreas: permissions?.allowedAreas || [],
    allowedUsers: permissions?.allowedUsers || [],
    canExportData: permissions?.canExportData || false
  };
};
```

## 5. Considerações de Performance

### 5.1 Otimizações

* **Cache de dados**: KPIs em cache por 5 minutos

* **Lazy loading**: Componentes carregados sob demanda

* **Virtualização**: Para listas grandes de riscos

* **Debounce**: Filtros com delay de 300ms

### 5.2 Métricas de Performance

* **Tempo de carregamento inicial**: < 2 segundos

* **Tempo de aplicação de filtros**: < 500ms

* **Atualização de KPIs**: < 1 segundo

* **Renderização da matriz**: < 800ms

## 6. Considerações de Segurança

### 6.1 Validações

* Validação de permissões no backend para cada requisição

* Sanitização de parâmetros de filtro

* Rate limiting para APIs de dashboard

* Logs de auditoria para acessos aos dados

### 6.2 Proteção de Dados

* Dados sensíveis mascarados conforme perfil

* Criptografia de dados em trânsito

* Validação de integridade dos dados

* Controle de acesso baseado em roles (RBAC)

## 7. Testes

### 7.1 Testes Unitários

* Componentes de KPI

* Lógica de filtragem

* Hooks de dados

* Utilitários de permissão

### 7.2 Testes de Integração

* Fluxo completo de carregamento do dashboard

* Aplicação de filtros com permissões

* Atualização de dados em tempo real

### 7.3 Testes E2E

* Cenários por perfil de usuário

* Navegação entre filtros

* Estados de erro e loading

* Responsividade em diferentes dispositivos

## 8. Critérios de Aceite Técnicos

### 8.1 Funcionalidade

* [ ] Dashboard carrega corretamente para todos os perfis

* [ ] KPIs refletem dados corretos baseados em permissões

* [ ] Matriz de riscos renderiza com cores apropriadas

* [ ] Filtros funcionam sem quebrar regras de permissão

* [ ] Estados vazios são tratados adequadamente

### 8.2 Performance

* [ ] Carregamento inicial < 2 segundos

* [ ] Aplicação de filtros < 500ms

* [ ] Sem vazamentos de memória

* [ ] Responsivo em dispositivos móveis

### 8.3 Segurança

* [ ] Dados filtrados corretamente por permissão

* [ ] Validações no backend funcionando

* [ ] Logs de auditoria registrados

* [ ] Dados sensíveis protegidos

### 8.4 Usabilidade

* [ ] Interface intuitiva e responsiva

* [ ] Feedback visual adequado

* [ ] Mensagens de erro claras

* [ ] Acessibilidade (WCAG 2.1 AA)

## 9. Roadmap de Implementação

### Fase 1: Estrutura Base (Sprint 1)

* Criação da página e componentes base

* Implementação do sistema de permissões

* KPIs básicos funcionando

### Fase 2: Matriz e Filtros (Sprint 2)

* Implementação da matriz de riscos

* Sistema de filtros com permissões

* Estados vazios e tratamento de erros

### Fase 3: Otimização e Testes (Sprint 3)

* Otimizações de performance

* Testes completos

* Ajustes de UX/UI

### Fase 4: Funcionalidades Avançadas (Sprint 4)

* Gráficos complementares

* Exportação de dados

* Notificações em tempo real

