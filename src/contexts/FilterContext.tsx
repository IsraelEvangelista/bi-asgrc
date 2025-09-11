import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  filtroSeveridade: string | null;
  filtroQuadrante: { impacto: number; probabilidade: number } | null;
  filtroNatureza: string | null;
  filtroEventoRisco: string | null;
  filtroResponsavelRisco: string | null;
  segmentoSelecionado: string | null;
  secaoBarraSelecionada: {natureza: string, severidade: string} | null;
  setFiltroSeveridade: (filtro: string | null) => void;
  setFiltroQuadrante: (filtro: { impacto: number; probabilidade: number } | null) => void;
  setFiltroNatureza: (filtro: string | null) => void;
  setFiltroEventoRisco: (filtro: string | null) => void;
  setFiltroResponsavelRisco: (filtro: string | null) => void;
  setSegmentoSelecionado: (segmento: string | null) => void;
  setSecaoBarraSelecionada: (secao: {natureza: string, severidade: string} | null) => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filtroSeveridade, setFiltroSeveridade] = useState<string | null>(null);
  const [filtroQuadrante, setFiltroQuadrante] = useState<{ impacto: number; probabilidade: number } | null>(null);
  const [filtroNatureza, setFiltroNatureza] = useState<string | null>(null);
  const [filtroEventoRisco, setFiltroEventoRisco] = useState<string | null>(null);
  const [filtroResponsavelRisco, setFiltroResponsavelRisco] = useState<string | null>(null);
  const [segmentoSelecionado, setSegmentoSelecionado] = useState<string | null>(null);
  const [secaoBarraSelecionada, setSecaoBarraSelecionada] = useState<{natureza: string, severidade: string} | null>(null);

  const clearAllFilters = () => {
    setFiltroSeveridade(null);
    setFiltroQuadrante(null);
    setFiltroNatureza(null);
    setFiltroEventoRisco(null);
    setFiltroResponsavelRisco(null);
    setSegmentoSelecionado(null);
    setSecaoBarraSelecionada(null);
  };

  return (
    <FilterContext.Provider
      value={{
        filtroSeveridade,
        filtroQuadrante,
        filtroNatureza,
        filtroEventoRisco,
        filtroResponsavelRisco,
        segmentoSelecionado,
        secaoBarraSelecionada,
        setFiltroSeveridade,
        setFiltroQuadrante,
        setFiltroNatureza,
        setFiltroEventoRisco,
        setFiltroResponsavelRisco,
        setSegmentoSelecionado,
        setSecaoBarraSelecionada,
        clearAllFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};