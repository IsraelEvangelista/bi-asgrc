# Sistema de Filtros - Planos de Ação

## ✅ Filtros Implementados e Funcionais

### 1. **Filtros do Bloco Expansível**
- ✅ **Tipo de Ação**: Original, Alterada, Incluída
- ✅ **Status**: Não Iniciada, Em Implementação, Implementada
- ✅ **Situação**: No Prazo, Atrasado
- ✅ **Área Executora**: Busca por texto livre

### 2. **Filtros Dinâmicos via Gráficos**
- ✅ **Status (Gráfico Rosca)**: Clique nos segmentos filtra por status
- ✅ **Prazo (Gráfico Rosca)**: Clique nos segmentos filtra por situação de prazo
- ✅ **Mapeamento correto**: Segmentos mapeados para valores de filtro

### 3. **Busca Global**
- ✅ **Campos incluídos**:
  - Descrição da ação
  - Área executora (array ou string)
  - ID da ação
  - Sigla da área
  - Eventos de riscos
  - ID de referência

### 4. **Aplicação em Todos os Visuais**
- ✅ **Gráfico de Status**: Usa dados filtrados
- ✅ **Gráfico de Prazo**: Usa dados filtrados  
- ✅ **Gráfico de Riscos**: Mostra apenas riscos específicos (R01, R02, R03, R04, R05, R09, R17, R35) usando sigla, processa dados filtrados dinamicamente
- ✅ **Cards de Status**: Usa dados filtrados
- ✅ **Tabela de Ações**: Usa dados filtrados com paginação
- ✅ **Alertas de Ações Atrasadas**: Usa dados filtrados

### 5. **Indicadores Visuais**
- ✅ **Badges de Filtros Ativos**: Mostra quais filtros estão aplicados
- ✅ **Remoção Individual**: Cada badge permite remoção individual
- ✅ **Contador de Resultados**: Mostra X de Y ações
- ✅ **Botão Limpar Tudo**: Remove todos os filtros de uma vez

### 6. **Ordenação**
- ✅ **Campos ordenáveis**:
  - Descrição da ação
  - ID/Risco
  - Área executora
  - Data de referência (`hist_created_at`)
  - Status
  - Percentual de implementação
- ✅ **Direções**: Ascendente e descendente
- ✅ **Indicadores visuais**: Setas mostram direção atual

### 7. **Paginação**
- ✅ **Baseada em dados filtrados**: Pagina apenas resultados da busca
- ✅ **Reset automático**: Volta para página 1 quando filtros mudam
- ✅ **50 itens por página**: Padrão para performance

### 8. **Sincronização Completa**
- ✅ **Todos os componentes sincronizados**: Gráficos, tabela, cards e alertas
- ✅ **Reatividade**: useMemo com dependências corretas
- ✅ **Performance**: Processamento otimizado

## 🔧 Funcionalidades Técnicas

### Estados de Filtro
```typescript
// Filtros do bloco expansível
const [filters, setFilters] = useState<{
  tipo_acao?: TipoAcao;
  status?: StatusAcao;
  situacao?: SituacaoAcao;
  area_executora?: string;
}>({});

// Filtros dinâmicos (gráficos)
const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
const [selectedPrazo, setSelectedPrazo] = useState<string | null>(null);

// Busca global
const [searchTerm, setSearchTerm] = useState('');
```

### Lógica de Filtragem
```typescript
const filteredActions = useMemo(() => {
  let filtered = actionsForCharts.filter(action => {
    // Busca em múltiplos campos
    const matchesSearch = !searchTerm || [
      action.desc_acao,
      action.sigla_area,
      action.eventos_riscos,
      action.id_ref,
      // ... outros campos
    ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtros estruturados
    const matchesTipo = !filters.tipo_acao || action.tipo_acao === filters.tipo_acao;
    const matchesStatus = !filters.status || action.status === filters.status;
    // ... outros filtros

    // Filtros dinâmicos dos gráficos
    const matchesDynamicStatus = !selectedStatus || action.status === selectedStatus;
    const matchesDynamicPrazo = !selectedPrazo || 
      (selectedPrazo === 'no_prazo' && action.situacao === SituacaoAcao.NO_PRAZO) ||
      (selectedPrazo === 'atrasado' && action.situacao === SituacaoAcao.ATRASADO);

    return matchesSearch && matchesTipo && matchesStatus && 
           matchesSituacao && matchesArea && matchesDynamicStatus && matchesDynamicPrazo;
  });

  // Aplicar ordenação se definida
  if (sortField) {
    filtered.sort(/* lógica de ordenação */);
  }

  return filtered;
}, [searchTerm, filters, selectedStatus, selectedPrazo, sortField, sortDirection, actionsForCharts]);
```

### Atualização dos Gráficos
Todos os gráficos agora usam `filteredActions` em vez de `actionsForCharts`:

```typescript
const statusData = useMemo(() => {
  const naoIniciada = filteredActions.filter(a => a.status === StatusAcao.NAO_INICIADA).length;
  const emImplementacao = filteredActions.filter(a => a.status === StatusAcao.EM_IMPLEMENTACAO).length;
  const implementada = filteredActions.filter(a => a.status === StatusAcao.IMPLEMENTADA).length;
  
  return [
    { name: 'Não Iniciada', value: naoIniciada, color: '#F59E0B' },
    { name: 'Em implementação', value: emImplementacao, color: '#3B82F6' },
    { name: 'Implementada', value: implementada, color: '#10B981' }
  ];
}, [filteredActions]);
```

## 🎯 Resultado Final

✅ **Sistema totalmente integrado** - Todos os filtros funcionam em conjunto
✅ **Interface intuitiva** - Indicadores visuais claros dos filtros ativos
✅ **Performance otimizada** - Processamento eficiente com useMemo
✅ **Experiência consistente** - Todos os visuais refletem os mesmos dados filtrados
✅ **Facilidade de uso** - Filtros podem ser aplicados e removidos individualmente

## 🎯 Correções Específicas do Gráfico de Riscos

### Riscos Permitidos
Apenas os seguintes riscos aparecem no gráfico de barras horizontais:
- **R01, R02, R03, R04, R05, R09, R17, R35**

### Campo Exibido
- ✅ **Sigla do risco** (`id_ref`) em vez da descrição (`eventos_riscos`)
- ✅ **Busca aprimorada** inclui sigla do risco na consulta
- ✅ **Tabela sincronizada** mostra sigla na coluna "Risco"
- ✅ **Ordenação corrigida** ordena por `id_ref` (sigla)

### Integração com Dados Filtrados
```typescript
// Inicializar apenas riscos permitidos
const allowedRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];

// Processar apenas ações dos riscos permitidos
filteredActions.forEach(action => {
  let riskId = action.id_ref; // Sigla do risco
  
  if (riskId && allowedRisks.includes(riskId)) {
    // Contar por status...
  }
});
```

---

O sistema agora oferece uma experiência completa e integrada de filtragem, onde todos os componentes da interface (gráficos, tabela, cards e alertas) refletem consistentemente os filtros aplicados pelo usuário.
