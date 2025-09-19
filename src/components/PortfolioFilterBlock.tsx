import React, { useState, useEffect, useRef } from 'react';
import { X, Filter, Search, ChevronDown, RotateCcw, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface PortfolioFilterBlockProps {
  onApplyFilters: (filters: PortfolioFilters) => void;
  currentFilters: PortfolioFilters;
}

export interface PortfolioFilters {
  severidade?: string[];
  acao?: string[];
  natureza?: string[];
  categoria?: string[];
  subcategoria?: string[];
  responsavel?: string[];
  statusAcao?: string[];
  dataInicio?: string;
  dataFim?: string;
}

const PortfolioFilterBlock: React.FC<PortfolioFilterBlockProps> = ({
  onApplyFilters,
  currentFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<PortfolioFilters>(currentFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState<{[key: string]: string}>({});

  // Estados para dados dos dropdowns
  const [acoes, setAcoes] = useState<FilterOption[]>([]);
  const [naturezas, setNaturezas] = useState<FilterOption[]>([]);
  const [categorias, setCategorias] = useState<FilterOption[]>([]);
  const [subcategorias, setSubcategorias] = useState<FilterOption[]>([]);
  const [responsaveis, setResponsaveis] = useState<FilterOption[]>([]);
  const [statusAcoes, setStatusAcoes] = useState<FilterOption[]>([]);

  // Opções estáticas de severidade
  const severidadeOptions: FilterOption[] = [
    { id: 'baixo', label: 'Baixo (0-4)', count: 0 },
    { id: 'moderado', label: 'Moderado (5-9)', count: 0 },
    { id: 'alto', label: 'Alto (10-19)', count: 0 },
    { id: 'muito-alto', label: 'Muito Alto (20+)', count: 0 }
  ];

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadFilterData();
  }, []);

  // Sincronizar filtros locais com props
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const loadFilterData = async () => {
    setIsLoading(true);
    try {
      // Carregar ações
      const { data: acoesData } = await supabase
        .from('019_acao')
        .select('id, sigla_acao, desc_acao')
        .order('sigla_acao');

      if (acoesData) {
        setAcoes(acoesData.map(acao => ({
          id: acao.id,
          label: `${acao.sigla_acao} - ${acao.desc_acao}`
        })));
      }

      // Carregar naturezas
      const { data: naturezasData } = await supabase
        .from('001_natureza')
        .select('id, desc_natureza')
        .order('desc_natureza');

      if (naturezasData) {
        setNaturezas(naturezasData.map(natureza => ({
          id: natureza.id,
          label: natureza.desc_natureza
        })));
      }

      // Carregar categorias
      const { data: categoriasData } = await supabase
        .from('002_categoria')
        .select('id, desc_categoria, id_natureza')
        .order('desc_categoria');

      if (categoriasData) {
        setCategorias(categoriasData.map(categoria => ({
          id: categoria.id,
          label: categoria.desc_categoria
        })));
      }

      // Carregar subcategorias
      const { data: subcategoriasData } = await supabase
        .from('003_subcategoria')
        .select('id, desc_subcategoria, id_categoria')
        .order('desc_subcategoria');

      if (subcategoriasData) {
        setSubcategorias(subcategoriasData.map(subcategoria => ({
          id: subcategoria.id,
          label: subcategoria.desc_subcategoria
        })));
      }

      // Carregar responsáveis (áreas)
      const { data: responsaveisData } = await supabase
        .from('003_areas_gerencias')
        .select('id, sigla_area, nome_area')
        .order('sigla_area');

      if (responsaveisData) {
        setResponsaveis(responsaveisData.map(responsavel => ({
          id: responsavel.id,
          label: `${responsavel.sigla_area} - ${responsavel.nome_area}`
        })));
      }

      // Status das ações (estático)
      setStatusAcoes([
        { id: 'planejada', label: 'Planejada' },
        { id: 'em-andamento', label: 'Em Andamento' },
        { id: 'concluida', label: 'Concluída' },
        { id: 'cancelada', label: 'Cancelada' },
        { id: 'pausada', label: 'Pausada' }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados dos filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterKey: keyof PortfolioFilters, values: string | string[]) => {
    if (filterKey === 'dataInicio' || filterKey === 'dataFim') {
      // Para campos de data, manter como string simples
      setFilters(prev => ({
        ...prev,
        [filterKey]: values as string
      }));
    } else {
      // Para outros campos, manter como array
      setFilters(prev => ({
        ...prev,
        [filterKey]: Array.isArray(values) ? values : [values]
      }));
    }
  };

  const handleMultiSelectToggle = (filterKey: keyof PortfolioFilters, value: string) => {
    const currentValues = (filters[filterKey] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setFilters(prev => ({
      ...prev,
      [filterKey]: newValues
    }));
  };

  const handleApplyFilters = () => {
    // Validar datas se ambas estão preenchidas
    if (filters.dataInicio && filters.dataFim) {
      const dataInicio = new Date(filters.dataInicio);
      const dataFim = new Date(filters.dataFim);

      if (dataInicio > dataFim) {
        alert('A data de início não pode ser posterior à data de fim.');
        return;
      }
    }

    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: PortfolioFilters = {};
    setFilters(clearedFilters);
    setSearchTerms({});
    onApplyFilters(clearedFilters);
  };

  const filterOptions = (options: FilterOption[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSelectedCount = (filterKey: keyof PortfolioFilters) => {
    const values = filters[filterKey] as string[];
    return values ? values.length : 0;
  };

  // Calcular total de filtros ativos
  const getTotalActiveFilters = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        count += value.length;
      } else if (typeof value === 'string' && value.trim() !== '') {
        count += 1;
      }
    });
    return count;
  };

  const totalActiveFilters = getTotalActiveFilters();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header do Bloco de Filtro */}
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-colors ${
              totalActiveFilters > 0
                ? 'bg-orange-100 text-orange-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Filtros do Portfólio</h3>
              <p className="text-sm text-gray-600">
                {totalActiveFilters > 0
                  ? `${totalActiveFilters} filtro(s) ativo(s)`
                  : 'Clique para expandir e configurar filtros'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {totalActiveFilters > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                {totalActiveFilters}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando opções de filtro...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Primeira linha: Severidade, Ações, Natureza */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Filtro de Severidade */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Severidade
                      {getSelectedCount('severidade') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('severidade')} selecionados
                        </span>
                      )}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {severidadeOptions.map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.severidade as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('severidade', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Ações */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Ações
                      {getSelectedCount('acao') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('acao')} selecionadas
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar ações..."
                        value={searchTerms.acao || ''}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, acao: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {filterOptions(acoes, searchTerms.acao || '').map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.acao as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('acao', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Natureza */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Natureza
                      {getSelectedCount('natureza') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('natureza')} selecionadas
                        </span>
                      )}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {naturezas.map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.natureza as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('natureza', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Segunda linha: Categoria, Subcategoria, Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Filtro de Categoria */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Categoria
                      {getSelectedCount('categoria') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('categoria')} selecionadas
                        </span>
                      )}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {categorias.map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.categoria as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('categoria', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Subcategoria */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Subcategoria
                      {getSelectedCount('subcategoria') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('subcategoria')} selecionadas
                        </span>
                      )}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {subcategorias.map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.subcategoria as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('subcategoria', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Responsável */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Responsável
                      {getSelectedCount('responsavel') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('responsavel')} selecionados
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar responsáveis..."
                        value={searchTerms.responsavel || ''}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, responsavel: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {filterOptions(responsaveis, searchTerms.responsavel || '').map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.responsavel as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('responsavel', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terceira linha: Status da Ação e Período */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Filtro de Status da Ação */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Status da Ação
                      {getSelectedCount('statusAcao') > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          {getSelectedCount('statusAcao')} selecionados
                        </span>
                      )}
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {statusAcoes.map(option => (
                        <label key={option.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={((filters.statusAcao as string[]) || []).includes(option.id)}
                            onChange={() => handleMultiSelectToggle('statusAcao', option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Data */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Período</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Data de Início</label>
                        <input
                          type="date"
                          value={filters.dataInicio || ''}
                          onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Data de Fim</label>
                        <input
                          type="date"
                          value={filters.dataFim || ''}
                          onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Limpar Filtros</span>
                  </button>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="px-8 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioFilterBlock;