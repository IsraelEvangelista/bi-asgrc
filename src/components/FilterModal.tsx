import React, { useState, useEffect } from 'react';
import { X, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

export interface FilterValues {
  macroprocesso?: string;
  processo?: string;
  subprocesso?: string;
  responsavel?: string;
  publicado?: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<FilterValues>(currentFilters);
  const [macroprocessos, setMacroprocessos] = useState<FilterOption[]>([]);
  const [processos, setProcessos] = useState<FilterOption[]>([]);
  const [subprocessos, setSubprocessos] = useState<FilterOption[]>([]);
  const [responsaveis, setResponsaveis] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados dos dropdowns
  useEffect(() => {
    if (isOpen) {
      loadFilterData();
    }
  }, [isOpen]);

  // Controle completo de scroll da interface principal
  useEffect(() => {
    if (isOpen) {
      // Salvar o scroll atual
      const scrollY = window.scrollY;
      
      // Salvar estilos originais
      const originalBodyStyle = {
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        overflow: document.body.style.overflow
      };
      
      const originalHtmlStyle = {
        overflow: document.documentElement.style.overflow
      };
      
      // Encontrar e salvar estilo do main-content-wrapper
      const mainContentWrapper = document.querySelector('.main-content-wrapper') as HTMLElement;
      const originalMainContentStyle = mainContentWrapper ? {
        overflow: mainContentWrapper.style.overflow,
        overflowY: mainContentWrapper.style.overflowY
      } : null;
      
      // Aplicar estilos para travar o scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Bloquear scroll do main-content-wrapper também
      if (mainContentWrapper) {
        mainContentWrapper.style.overflow = 'hidden';
        mainContentWrapper.style.overflowY = 'hidden';
      }
      
      return () => {
        // Restaurar estilos originais
        document.body.style.position = originalBodyStyle.position;
        document.body.style.top = originalBodyStyle.top;
        document.body.style.width = originalBodyStyle.width;
        document.body.style.overflow = originalBodyStyle.overflow;
        document.documentElement.style.overflow = originalHtmlStyle.overflow;
        
        // Restaurar estilo do main-content-wrapper
        if (mainContentWrapper && originalMainContentStyle) {
          mainContentWrapper.style.overflow = originalMainContentStyle.overflow;
          mainContentWrapper.style.overflowY = originalMainContentStyle.overflowY;
        }
        
        // Restaurar posição do scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const loadFilterData = async () => {
    setIsLoading(true);
    try {
      // Carregar macroprocessos
      const { data: macroData } = await supabase
        .from('004_macroprocessos')
        .select('id, nome_macroprocesso')
        .order('nome_macroprocesso');

      if (macroData) {
        setMacroprocessos(macroData.map(item => ({
          value: item.id.toString(),
          label: item.nome_macroprocesso
        })));
      }

      // Carregar processos
      const { data: processData } = await supabase
        .from('005_processos')
        .select('id, nome_processo')
        .order('nome_processo');

      if (processData) {
        setProcessos(processData.map(item => ({
          value: item.id.toString(),
          label: item.nome_processo
        })));
      }

      // Carregar subprocessos
      const { data: subprocessData } = await supabase
        .from('013_subprocessos')
        .select('id, nome_subprocesso')
        .order('nome_subprocesso');

      if (subprocessData) {
        setSubprocessos(subprocessData.map(item => ({
          value: item.id.toString(),
          label: item.nome_subprocesso
        })));
      }

      // Carregar responsáveis (áreas)
      const { data: areaData } = await supabase
        .from('003_areas_gerencias')
        .select('id, sigla_area')
        .order('sigla_area');

      if (areaData) {
        setResponsaveis(areaData.map(item => ({
          value: item.id.toString(),
          label: item.sigla_area
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {};
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  const handleFilterChange = (key: keyof FilterValues, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-screen h-screen z-[9998] bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="fixed top-[50vh] left-[50vw] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-[9999] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros Avançados</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando opções...</span>
            </div>
          ) : (
            <>
              {/* Macroprocesso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Macroprocesso
                </label>
                <select
                  value={filters.macroprocesso || ''}
                  onChange={(e) => handleFilterChange('macroprocesso', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os macroprocessos</option>
                  {macroprocessos.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Processo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processo
                </label>
                <select
                  value={filters.processo || ''}
                  onChange={(e) => handleFilterChange('processo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os processos</option>
                  {processos.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subprocesso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subprocesso
                </label>
                <select
                  value={filters.subprocesso || ''}
                  onChange={(e) => handleFilterChange('subprocesso', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os subprocessos</option>
                  {subprocessos.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável pelo Processo
                </label>
                <select
                  value={filters.responsavel || ''}
                  onChange={(e) => handleFilterChange('responsavel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os responsáveis</option>
                  {responsaveis.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Publicado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publicado
                </label>
                <select
                  value={filters.publicado === undefined ? '' : filters.publicado.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleFilterChange('publicado', undefined);
                    } else {
                      handleFilterChange('publicado', value === 'true');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="true">Publicados</option>
                  <option value="false">Não publicados</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-8 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;