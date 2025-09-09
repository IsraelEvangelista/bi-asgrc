import React, { useState, useEffect, useRef } from 'react';
import { X, Filter, Check, ChevronDown, Search } from 'lucide-react';
import type { Macroprocesso, Processo, Subprocesso } from '../types/process';

interface ProcessFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProcessFilters;
  onFiltersChange: (filters: ProcessFilters) => void;
  macroprocessos: Macroprocesso[];
  processos: Processo[];
  subprocessos: Subprocesso[];
}

export interface ProcessFilters {
  macroprocessos: string[];
  processos: string[];
  subprocessos: string[];
  responsaveis: string[];
  publicado: string[];
}

interface DropdownProps {
  label: string;
  options: { id: string; name: string }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado no termo de pesquisa
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSelectAll(selectedValues.length === filteredOptions.length && filteredOptions.length > 0);
  }, [selectedValues, filteredOptions]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focar no campo de pesquisa quando abrir
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = (optionId: string) => {
    const newSelection = selectedValues.includes(optionId)
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Desmarcar apenas as opções filtradas
      const filteredIds = filteredOptions.map(option => option.id);
      const newSelection = selectedValues.filter(id => !filteredIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Selecionar todas as opções filtradas
      const filteredIds = filteredOptions.map(option => option.id);
      const newSelection = [...new Set([...selectedValues, ...filteredIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.id === selectedValues[0]);
      return option?.name || placeholder;
    }
    return `${selectedValues.length} selecionados`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={handleDropdownToggle}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <div className="flex-1 text-left">
            {selectedValues.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <div className="flex flex-col">
                <span className="text-gray-700 font-medium">
                  {selectedValues.length} {selectedValues.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
                {selectedValues.length <= 3 && (
                  <span className="text-xs text-gray-500 truncate">
                    {options
                      .filter(opt => selectedValues.includes(opt.id))
                      .map(opt => opt.name)
                      .join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-2 ${
            isOpen ? 'transform rotate-180' : ''
          }`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Campo de Pesquisa */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Pesquisar..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            {/* Botão Selecionar/Desmarcar Todos */}
            {filteredOptions.length > 0 && (
              <div className="border-b border-gray-200 p-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                    selectAll ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    {selectAll && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-medium">
                    {selectAll ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </span>
                  <span className="text-gray-500 ml-auto">
                    ({filteredOptions.length} {filteredOptions.length === 1 ? 'item' : 'itens'})
                  </span>
                </button>
              </div>
            )}
            
            {/* Lista de Opções */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma opção disponível'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggleOption(option.id)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors group"
                    title={option.name} // Tooltip nativo do browser
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                      selectedValues.includes(option.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {selectedValues.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="truncate text-left flex-1 relative">
                      {option.name}
                      {/* Tooltip customizado para textos longos */}
                      {option.name.length > 30 && (
                        <div className="absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 z-[10000] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                          {option.name}
                        </div>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProcessFilterModal: React.FC<ProcessFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  macroprocessos,
  processos,
  subprocessos
}) => {
  const [localFilters, setLocalFilters] = useState<ProcessFilters>(filters);

  // Controle completo de scroll da interface principal
  useEffect(() => {
    if (isOpen) {
      // Salvar o scroll atual
      const scrollY = window.scrollY;
      
      // Encontrar o main-content-wrapper
      const mainContentWrapper = document.querySelector('.main-content-wrapper') as HTMLElement;
      
      // Aplicar estilos para travar completamente o scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Bloquear scroll do main-content-wrapper com !important para sobrescrever CSS
      if (mainContentWrapper) {
        mainContentWrapper.style.setProperty('overflow', 'hidden', 'important');
        mainContentWrapper.style.setProperty('overflow-y', 'hidden', 'important');
      }

      // Event blocking como fallback - impede scroll via JavaScript
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const preventKeyboardScroll = (e: KeyboardEvent) => {
        // Bloqueia teclas que causam scroll
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Adicionar event listeners como backup
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('keydown', preventKeyboardScroll, { passive: false });
      
      return () => {
        // Remover event listeners
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('keydown', preventKeyboardScroll);
        
        // Restaurar estilos originais
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Restaurar estilo do main-content-wrapper com !important
        if (mainContentWrapper) {
          mainContentWrapper.style.setProperty('overflow-y', 'auto', 'important');
          mainContentWrapper.style.setProperty('overflow', '', 'important');
        }
        
        // Restaurar posição do scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Atualizar filtros locais quando os filtros atuais mudarem
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Preparar opções para os dropdowns
  const macroprocessoOptions = macroprocessos.map(macro => ({
    id: macro.id,
    name: macro.macroprocesso
  }));

  const processoOptions = processos.map(processo => ({
    id: processo.id,
    name: processo.processo
  }));

  const subprocessoOptions = subprocessos.map(subprocesso => ({
    id: subprocesso.id,
    name: subprocesso.subprocesso
  }));

  // Extrair responsáveis únicos usando sigla_area
  const responsaveisUnicos = Array.from(new Set([
    ...processos.map(p => p.responsavel_area?.sigla_area).filter(Boolean),
    ...subprocessos.map(s => s.responsavel_area?.sigla_area).filter(Boolean)
  ])).sort();

  const responsavelOptions = responsaveisUnicos.map(responsavel => ({
    id: responsavel,
    name: responsavel
  }));

  const publicadoOptions = [
    { id: 'true', name: 'Publicado' },
    { id: 'false', name: 'Não Publicado' }
  ];

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const emptyFilters: ProcessFilters = {
      macroprocessos: [],
      processos: [],
      subprocessos: [],
      responsaveis: [],
      publicado: []
    };
    setLocalFilters(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(filter => filter.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex justify-center pt-8 pb-8">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-[1200px] h-[80vh] max-h-[800px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Filter className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Filtros de Processos
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Configure os filtros para refinar a visualização dos processos
          </p>
        </div>
          
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Dropdown
                label="Macroprocesso"
                options={macroprocessoOptions}
                selectedValues={localFilters.macroprocessos}
                onSelectionChange={(values) => setLocalFilters(prev => ({ ...prev, macroprocessos: values }))}
                placeholder="Selecione macroprocessos"
              />
              
              <Dropdown
                label="Processo"
                options={processoOptions}
                selectedValues={localFilters.processos}
                onSelectionChange={(values) => setLocalFilters(prev => ({ ...prev, processos: values }))}
                placeholder="Selecione processos"
              />
              
              <Dropdown
                label="Subprocesso"
                options={subprocessoOptions}
                selectedValues={localFilters.subprocessos}
                onSelectionChange={(values) => setLocalFilters(prev => ({ ...prev, subprocessos: values }))}
                placeholder="Selecione subprocessos"
              />
              
              <Dropdown
                label="Responsável pelo Processo"
                options={responsavelOptions}
                selectedValues={localFilters.responsaveis}
                onSelectionChange={(values) => setLocalFilters(prev => ({ ...prev, responsaveis: values }))}
                placeholder="Selecione responsáveis"
              />
              
              <Dropdown
                label="Publicado"
                options={publicadoOptions}
                selectedValues={localFilters.publicado}
                onSelectionChange={(values) => setLocalFilters(prev => ({ ...prev, publicado: values }))}
                placeholder="Selecione status"
              />
            </div>
        </div>
          
        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessFilterModal;