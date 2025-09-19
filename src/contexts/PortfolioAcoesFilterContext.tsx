import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface PortfolioAcoesFilterContextType {
  filtroSeveridade: string | null;
  filtroAcao: string | null;
  filtroNatureza: string | null;
  filtroCategoria: string | null;
  filtroSubcategoria: string | null;
  setFiltroSeveridade: (filtro: string | null) => void;
  setFiltroAcao: (filtro: string | null) => void;
  setFiltroNatureza: (filtro: string | null) => void;
  setFiltroCategoria: (filtro: string | null) => void;
  setFiltroSubcategoria: (filtro: string | null) => void;
  clearAllFilters: () => void;
  filters: {
    severidade: string[];
    acao: string[];
    natureza: string[];
    categoria: string[];
    subcategoria: string[];
  };
}

const PortfolioAcoesFilterContext = createContext<PortfolioAcoesFilterContextType | undefined>(undefined);

export const usePortfolioAcoesFilter = () => {
  const context = useContext(PortfolioAcoesFilterContext);
  if (context === undefined) {
    throw new Error('usePortfolioAcoesFilter must be used within a PortfolioAcoesFilterProvider');
  }
  return context;
};

interface PortfolioAcoesFilterProviderProps {
  children: ReactNode;
}

export const PortfolioAcoesFilterProvider: React.FC<PortfolioAcoesFilterProviderProps> = ({ children }) => {
  const [filtroSeveridade, setFiltroSeveridade] = useState<string | null>(null);
  const [filtroAcao, setFiltroAcao] = useState<string | null>(null);
  const [filtroNatureza, setFiltroNatureza] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string | null>(null);

  const clearAllFilters = () => {
    setFiltroSeveridade(null);
    setFiltroAcao(null);
    setFiltroNatureza(null);
    setFiltroCategoria(null);
    setFiltroSubcategoria(null);
  };

  // Computed filters object that converts individual string values to arrays
  const filters = useMemo(() => {
    const severidadeArray = filtroSeveridade !== null ? [filtroSeveridade] : [];
    const acaoArray = filtroAcao !== null ? [filtroAcao] : [];
    const naturezaArray = filtroNatureza !== null ? [filtroNatureza] : [];
    const categoriaArray = filtroCategoria !== null ? [filtroCategoria] : [];
    const subcategoriaArray = filtroSubcategoria !== null ? [filtroSubcategoria] : [];

    return {
      severidade: severidadeArray,
      acao: acaoArray,
      natureza: naturezaArray,
      categoria: categoriaArray,
      subcategoria: subcategoriaArray,
    };
  }, [filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  return (
    <PortfolioAcoesFilterContext.Provider
      value={{
        filtroSeveridade,
        filtroAcao,
        filtroNatureza,
        filtroCategoria,
        filtroSubcategoria,
        setFiltroSeveridade,
        setFiltroAcao,
        setFiltroNatureza,
        setFiltroCategoria,
        setFiltroSubcategoria,
        clearAllFilters,
        filters,
      }}
    >
      {children}
    </PortfolioAcoesFilterContext.Provider>
  );
};
