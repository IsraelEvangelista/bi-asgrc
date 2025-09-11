# TRAE - Documentação Técnica

## Implementação de Filtragem Dinâmica Entre Visuais

### Visão Geral
Este documento descreve como implementar filtragem dinâmica sincronizada entre múltiplos componentes visuais (gráficos, tabelas, cards) em uma interface React.

### Arquitetura da Solução

#### 1. Context Global de Filtros (`FilterContext`)

**Localização:** `src/contexts/FilterContext.tsx`

```typescript
interface FilterContextType {
  filtroSeveridade: string | null;
  filtroQuadrante: { impacto: number; probabilidade: number } | null;
  filtroNatureza: string | null;
  setFiltroSeveridade: (filtro: string | null) => void;
  setFiltroQuadrante: (filtro: { impacto: number; probabilidade: number } | null) => void;
  setFiltroNatureza: (filtro: string | null) => void;
}
```

**Características:**
- Estado global compartilhado entre todos os componentes
- Múltiplos tipos de filtros (severidade, quadrante, natureza)
- Setters individuais para cada tipo de filtro
- Provider que envolve a aplicação

#### 2. Hooks de Dados Integrados

**Hooks Principais:**
- `useMatrizRiscos`: Busca dados da matriz de riscos
- `useRiscosPorNatureza`: Busca dados agrupados por natureza

**Padrão de Implementação:**
```typescript
export const useMatrizRiscos = (): MatrizRiscosStats => {
  // Estados locais para dados
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // IMPORTANTE: Usar FilterContext global
  const { filtroSeveridade, filtroQuadrante, filtroNatureza } = useFilter();
  
  const fetchData = async () => {
    // Query base com joins necessários
    let query = supabase
      .from('tabela_principal')
      .select(`
        campos_principais,
        tabela_relacionada!inner(
          campos_relacionados
        )
      `);
    
    // Aplicar filtros condicionalmente
    if (filtroSeveridade) {
      // Lógica específica do filtro de severidade
      query = query.gte('severidade', min).lte('severidade', max);
    }
    
    if (filtroNatureza) {
      query = query.eq('tabela_relacionada.id_natureza', filtroNatureza);
    }
    
    if (filtroQuadrante) {
      query = query.eq('probabilidade', filtroQuadrante.probabilidade)
                   .eq('impacto', filtroQuadrante.impacto);
    }
  };
  
  // IMPORTANTE: useEffect reativo a mudanças nos filtros
  useEffect(() => {
    fetchData();
  }, [filtroSeveridade, filtroQuadrante, filtroNatureza]);
};
```

#### 3. Componentes Visuais Sincronizados

**Padrão de Implementação em Componentes:**
```typescript
const ComponenteVisual = () => {
  // Usar hooks que já integram com FilterContext
  const { dados, loading } = useMatrizRiscos();
  const { filtroSeveridade, setFiltroSeveridade } = useFilter();
  
  // Handler para interação do usuário
  const handleClick = (novoFiltro) => {
    // Atualizar contexto global - propaga para todos os componentes
    setFiltroSeveridade(novoFiltro);
  };
  
  // Renderização baseada nos dados já filtrados
  return (
    <GraficoComponent 
      data={dados} 
      onClick={handleClick}
    />
  );
};
```

### Fluxo de Funcionamento

1. **Interação do Usuário:** Clique em elemento visual (barra, setor, célula)
2. **Atualização do Context:** Handler atualiza estado global via setters
3. **Propagação Automática:** Todos os hooks subscrevem às mudanças do context
4. **Recarregamento de Dados:** useEffect dispara novas queries com filtros
5. **Atualização Visual:** Componentes re-renderizam com dados filtrados

### Exemplo Prático: Gráfico de Barras Empilhadas

```typescript
const handleSecaoBarraClick = (natureza: string, severidade: string) => {
  console.log('🔍 CLIQUE NA SEÇÃO:', { natureza, severidade });
  
  const naturezaId = naturezaMap[natureza];
  
  if (secaoBarraSelecionada?.natureza === natureza && 
      secaoBarraSelecionada?.severidade === severidade) {
    // Limpar filtros
    setSecaoBarraSelecionada(null);
    setFiltroNatureza(null);     // Context global
    setFiltroSeveridade(null);   // Context global
    console.log('🧹 FILTROS LIMPOS NO CONTEXTO GLOBAL');
  } else {
    // Aplicar filtros
    const novaSelecao = { natureza, severidade };
    setSecaoBarraSelecionada(novaSelecao);
    setFiltroNatureza(naturezaId);   // Context global
    setFiltroSeveridade(severidade); // Context global
    console.log('🎯 FILTROS APLICADOS NO CONTEXTO GLOBAL:', { naturezaId, severidade });
  }
};
```

### Logs de Debug

**Padrão de Logging:**
```typescript
// No início dos hooks
console.log('🔍 Hook - Filtros do contexto:', { filtroSeveridade, filtroQuadrante, filtroNatureza });

// Ao aplicar filtros
console.log('🔍 Aplicando filtro de severidade:', filtroSeveridade);
console.log('🔍 Aplicando filtro de natureza:', filtroNatureza);

// No useEffect
console.log('🔄 Hook - Recarregando dados devido a mudança nos filtros');

// Nos handlers
console.log('🎯 FILTROS APLICADOS NO CONTEXTO GLOBAL:', { filtros });
console.log('🧹 FILTROS LIMPOS NO CONTEXTO GLOBAL');
```

### Boas Práticas

1. **Context Único:** Use um único context para todos os filtros relacionados
2. **Hooks Reativos:** Sempre inclua filtros nas dependências do useEffect
3. **Queries Otimizadas:** Use joins e filtros no nível da query, não no frontend
4. **Estados Locais Mínimos:** Evite duplicar filtros em estados locais
5. **Logs Consistentes:** Use emojis e padrões consistentes para debug
6. **Tipagem Forte:** Defina interfaces claras para filtros e dados

### Estrutura de Arquivos

```
src/
├── contexts/
│   └── FilterContext.tsx          # Context global de filtros
├── hooks/
│   ├── useMatrizRiscos.ts         # Hook integrado com filtros
│   └── useRiscosPorNatureza.ts    # Hook integrado com filtros
└── pages/
    └── MatrizRisco.tsx            # Página com múltiplos visuais
```

### Considerações de Performance

- **Memoização:** Use useMemo para cálculos pesados baseados em filtros
- **Debounce:** Para filtros de texto, considere debounce
- **Queries Eficientes:** Aplique filtros no banco, não no frontend
- **Re-renders:** Minimize re-renders desnecessários com useCallback

---

**Implementado por:** TRAE SOLO  
**Data:** Janeiro 2025  
**Versão:** 1.0