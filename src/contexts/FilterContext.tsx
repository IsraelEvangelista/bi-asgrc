import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Tipos para o sistema de filtros
export type FilterType = 'table' | 'chart' | 'nivel_risco' | 'situacao_risco' | 'resposta_risco' | 'table_row';

export interface FilterState {
  activeFilter: {
    type: FilterType;
    field: string;
    value: string;
    sourceComponent: string;
  } | null;
}

export interface FilterAction {
  type: 'SET_FILTER' | 'CLEAR_FILTER' | 'TOGGLE_FILTER';
  payload?: {
    filterType: 'chart' | 'table';
    field: string;
    value: string;
    sourceComponent: string;
  };
}

interface FilterContextType {
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
  applyFilter: (filterType: 'chart' | 'table', field: string, value: string, sourceComponent: string) => void;
  clearFilter: () => void;
  toggleFilter: (filterType: 'chart' | 'table', field: string, value: string, sourceComponent: string) => void;
  isFiltered: (field: string, value: string) => boolean;
  isFilterActive: () => boolean;
}

const initialState: FilterState = {
  activeFilter: null,
};

// Reducer para gerenciar as ações de filtro
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FILTER':
      if (!action.payload) return state;
      return {
        ...state,
        activeFilter: {
          type: action.payload.filterType,
          field: action.payload.field,
          value: action.payload.value,
          sourceComponent: action.payload.sourceComponent,
        },
      };
    
    case 'CLEAR_FILTER':
      return {
        ...state,
        activeFilter: null,
      };
    
    case 'TOGGLE_FILTER':
      if (!action.payload) return state;
      
      // Se o mesmo filtro está ativo, limpar
      if (
        state.activeFilter &&
        state.activeFilter.field === action.payload.field &&
        state.activeFilter.value === action.payload.value &&
        state.activeFilter.sourceComponent === action.payload.sourceComponent
      ) {
        return {
          ...state,
          activeFilter: null,
        };
      }
      
      // Caso contrário, aplicar o novo filtro
      return {
        ...state,
        activeFilter: {
          type: action.payload.filterType,
          field: action.payload.field,
          value: action.payload.value,
          sourceComponent: action.payload.sourceComponent,
        },
      };
    
    default:
      return state;
  }
}

// Criação do contexto
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider do contexto
export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  // Função para aplicar filtro
  const applyFilter = (filterType: 'chart' | 'table', field: string, value: string, sourceComponent: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filterType, field, value, sourceComponent },
    });
  };

  // Função para limpar filtro
  const clearFilter = () => {
    dispatch({ type: 'CLEAR_FILTER' });
  };

  // Função para alternar filtro (aplicar se não existe, limpar se existe)
  const toggleFilter = (filterType: 'chart' | 'table', field: string, value: string, sourceComponent: string) => {
    dispatch({
      type: 'TOGGLE_FILTER',
      payload: { filterType, field, value, sourceComponent },
    });
  };

  // Função para verificar se um item específico está filtrado
  const isFiltered = (field: string, value: string) => {
    return state.activeFilter && state.activeFilter.field === field && state.activeFilter.value === value;
  };

  // Função para verificar se há algum filtro ativo
  const isFilterActive = () => {
    return state.activeFilter !== null && state.activeFilter.type !== null;
  };

  const value: FilterContextType = {
    state,
    dispatch,
    applyFilter,
    clearFilter,
    toggleFilter,
    isFiltered,
    isFilterActive,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

// Hook para usar o contexto
export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}

// Função para filtrar dados baseado no filtro ativo
export const filterData = (data: any[], sourceComponent: string, filterState: FilterState) => {
  // Se não há filtro ativo, retorna todos os dados
  if (!filterState.activeFilter || !filterState.activeFilter.type) {
    return data;
  }

  // Aplicar filtro real em todos os componentes, exceto para filtros de linha da tabela
  const { type, value, field } = filterState.activeFilter;
  
  // Para filtros de linha da tabela, apenas o componente origem mantém todos os dados
  if (type === 'table_row' && filterState.activeFilter.sourceComponent !== sourceComponent) {
    return data;
  }
  
  // Para outros tipos de filtro, aplicar em todos os componentes
  return data.filter(item => {
    switch (type) {
      case 'nivel_risco':
        return item.nivel_risco === value || item.nivel_risco_tratado === value;
      case 'situacao_risco':
        return item.situacao_risco === value;
      case 'resposta_risco':
        return item.resposta_risco === value || item.plano_resposta === value;
      case 'table_row':
        // Para filtro de linha da tabela, retornar todos os dados (filtro apenas visual)
        return true;
      default:
        return true;
    }
  });
};