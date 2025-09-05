import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';
import { ReportFilters as ReportFiltersType, FilterPeriod } from '../types/report';
import { supabase } from '../lib/supabase';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: ReportFiltersType) => void;
  reportType?: string;
  className?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  reportType,
  className = ''
}) => {
  const [responsaveisOptions, setResponsaveisOptions] = useState<FilterOption[]>([]);
  const [processosOptions, setProcessosOptions] = useState<FilterOption[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load filter options from database
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        // Load responsáveis (areas/gerências)
        const { data: areas } = await supabase
          .from('003_areas_gerencias')
          .select('id, gerencia, sigla_area')
          .eq('ativa', true)
          .order('gerencia');

        if (areas) {
          setResponsaveisOptions(
            areas.map(area => ({
              value: area.id,
              label: `${area.gerencia} (${area.sigla_area})`
            }))
          );
        }

        // Load processos
        const { data: processos } = await supabase
          .from('005_processos')
          .select(`
            id,
            processo,
            macroprocessos:id_macro(macroprocesso)
          `)
          .order('processo');

        if (processos) {
          setProcessosOptions(
            processos.map(processo => ({
              value: processo.id,
              label: `${processo.processo} (${(processo.macroprocessos as { macroprocesso?: string })?.macroprocesso || 'N/A'})`
            }))
          );
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const updateFilters = (updates: Partial<ReportFiltersType>) => {
    onChange({ ...filters, ...updates });
  };

  const updatePeriod = (updates: Partial<FilterPeriod>) => {
    updateFilters({
      period: { ...filters.period, ...updates }
    });
  };

  const applyPeriodPreset = (preset: FilterPeriod['preset']) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (preset) {
      case 'last_month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'last_quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'last_year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    
    updatePeriod({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      preset
    });
  };

  const clearFilter = (filterKey: keyof ReportFiltersType) => {
    const clearedFilters = { ...filters };
    
    switch (filterKey) {
      case 'responsaveis':
        clearedFilters.responsaveis = [];
        break;
      case 'tiposRisco':
        clearedFilters.tiposRisco = [];
        break;
      case 'processos':
        clearedFilters.processos = [];
        break;
      case 'statusIndicadores':
        clearedFilters.statusIndicadores = [];
        break;
      case 'statusAcoes':
        clearedFilters.statusAcoes = [];
        break;
      case 'severidadeMin':
        clearedFilters.severidadeMin = undefined;
        break;
      case 'severidadeMax':
        clearedFilters.severidadeMax = undefined;
        break;
      case 'incluirHistorico':
        clearedFilters.incluirHistorico = false;
        break;
    }
    
    onChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.responsaveis?.length) count++;
    if (filters.tiposRisco?.length) count++;
    if (filters.processos?.length) count++;
    if (filters.statusIndicadores?.length) count++;
    if (filters.statusAcoes?.length) count++;
    if (filters.severidadeMin !== undefined) count++;
    if (filters.severidadeMax !== undefined) count++;
    if (filters.incluirHistorico) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? 'Recolher' : 'Expandir'}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Period Filter - Always Visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.period.startDate}
              onChange={(e) => updatePeriod({ startDate: e.target.value, preset: 'custom' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data Final
            </label>
            <input
              type="date"
              value={filters.period.endDate}
              onChange={(e) => updatePeriod({ endDate: e.target.value, preset: 'custom' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Period Presets */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'last_month', label: 'Último Mês' },
              { value: 'last_quarter', label: 'Último Trimestre' },
              { value: 'last_year', label: 'Último Ano' },
              { value: 'ytd', label: 'Ano Atual' }
            ].map(preset => (
              <button
                key={preset.value}
                onClick={() => applyPeriodPreset(preset.value as FilterPeriod['preset'])}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filters.period.preset === preset.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Responsáveis Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Responsáveis
              </label>
              {filters.responsaveis?.length > 0 && (
                <button
                  onClick={() => clearFilter('responsaveis')}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>
            <select
              multiple
              value={filters.responsaveis || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                updateFilters({ responsaveis: values });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              size={4}
              disabled={isLoading}
            >
              {responsaveisOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Segure Ctrl/Cmd para selecionar múltiplos
            </p>
          </div>

          {/* Tipos de Risco Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipos de Risco
              </label>
              {filters.tiposRisco?.length > 0 && (
                <button
                  onClick={() => clearFilter('tiposRisco')}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                'estrategico',
                'operacional',
                'financeiro',
                'regulatorio',
                'reputacional',
                'tecnologico'
              ].map(tipo => (
                <label key={tipo} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.tiposRisco?.includes(tipo) || false}
                    onChange={(e) => {
                      const currentTypes = filters.tiposRisco || [];
                      const newTypes = e.target.checked
                        ? [...currentTypes, tipo]
                        : currentTypes.filter(t => t !== tipo);
                      updateFilters({ tiposRisco: newTypes });
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Processos Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Processos
              </label>
              {filters.processos?.length > 0 && (
                <button
                  onClick={() => clearFilter('processos')}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpar
                </button>
              )}
            </div>
            <select
              multiple
              value={filters.processos || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                updateFilters({ processos: values });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              size={4}
              disabled={isLoading}
            >
              {processosOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severidade Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Severidade Mínima
                </label>
                {filters.severidadeMin !== undefined && (
                  <button
                    onClick={() => clearFilter('severidadeMin')}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="25"
                value={filters.severidadeMin || ''}
                onChange={(e) => updateFilters({ severidadeMin: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1-25"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Severidade Máxima
                </label>
                {filters.severidadeMax !== undefined && (
                  <button
                    onClick={() => clearFilter('severidadeMax')}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="25"
                value={filters.severidadeMax || ''}
                onChange={(e) => updateFilters({ severidadeMax: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1-25"
              />
            </div>
          </div>

          {/* Status Filters - Conditional based on report type */}
          {(reportType === 'indicadores_performance' || reportType === 'auditoria_completa') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status dos Indicadores
                </label>
                {filters.statusIndicadores?.length > 0 && (
                  <button
                    onClick={() => clearFilter('statusIndicadores')}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Não Iniciado',
                  'Em implementação',
                  'Implementado'
                ].map(status => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.statusIndicadores?.includes(status) || false}
                      onChange={(e) => {
                        const currentStatus = filters.statusIndicadores || [];
                        const newStatus = e.target.checked
                          ? [...currentStatus, status]
                          : currentStatus.filter(s => s !== status);
                        updateFilters({ statusIndicadores: newStatus });
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(reportType === 'acoes_mitigacao' || reportType === 'auditoria_completa') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status das Ações
                </label>
                {filters.statusAcoes?.length > 0 && (
                  <button
                    onClick={() => clearFilter('statusAcoes')}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Não iniciada',
                  'Em implementação',
                  'Ações implementadas'
                ].map(status => (
                  <label key={status} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.statusAcoes?.includes(status) || false}
                      onChange={(e) => {
                        const currentStatus = filters.statusAcoes || [];
                        const newStatus = e.target.checked
                          ? [...currentStatus, status]
                          : currentStatus.filter(s => s !== status);
                        updateFilters({ statusAcoes: newStatus });
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Include Historical Data */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.incluirHistorico || false}
                onChange={(e) => updateFilters({ incluirHistorico: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Incluir dados históricos</span>
                <p className="text-xs text-gray-500">Incluir registros de versões anteriores e alterações</p>
              </div>
            </label>
          </div>

          {/* Clear All Filters */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => onChange({
                  period: filters.period, // Keep period
                  responsaveis: [],
                  tiposRisco: [],
                  processos: [],
                  statusIndicadores: [],
                  statusAcoes: [],
                  severidadeMin: undefined,
                  severidadeMax: undefined,
                  incluirHistorico: false
                })}
                className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;