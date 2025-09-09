import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search, ExternalLink } from 'lucide-react';
import { useDetalhamentoTable, SortField, DetalhamentoTableFilters } from '../hooks/useDetalhamentoTable';

interface DetalhamentoTableProps {
  className?: string;
}

const DetalhamentoTable: React.FC<DetalhamentoTableProps> = ({ className = '' }) => {
  const { data, isLoading, error, sortConfig, fetchDetalhamentoData, updateSort, clearError } = useDetalhamentoTable();
  const [filters, setFilters] = useState<DetalhamentoTableFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar dados iniciais
  useEffect(() => {
    fetchDetalhamentoData();
  }, [fetchDetalhamentoData]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDetalhamentoData(filters);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [filters, fetchDetalhamentoData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value || undefined }));
  };

  const handleSort = (field: SortField) => {
    updateSort(field);
  };



  const getResponsavelColor = (responsavel: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200'
    ];
    
    // Gerar hash consistente baseado no nome
    let hash = 0;
    for (let i = 0; i < responsavel.length; i++) {
      const char = responsavel.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="w-4 h-4 text-white opacity-60" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-white" /> : 
      <ChevronDown className="w-4 h-4 text-white" />;
  };

  const renderLinkButton = (url: string | undefined, icon: React.ReactNode, label: string) => {
    if (!url) return null;
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
        title={label}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </a>
    );
  };



  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">Erro ao carregar dados</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            Tentar novamente
          </button>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header com busca */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Detalhamento de Processos</h3>
            <p className="text-sm text-gray-600 mt-1">
              {data.length} {data.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </p>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por macroprocesso, processo ou subprocesso..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white" style={{
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            transform: 'perspective(1000px) rotateX(1deg)'
          }}>
            <tr>
              <th className="px-4 py-3 text-left border-b-2 border-blue-700">
                <button
                  onClick={() => handleSort('macroprocesso')}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-100 transition-colors"
                >
                  Macroprocesso
                  {getSortIcon('macroprocesso')}
                </button>
              </th>
              <th className="px-4 py-3 text-left border-b-2 border-blue-700">
                <button
                  onClick={() => handleSort('processo')}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-100 transition-colors"
                >
                  Processo
                  {getSortIcon('processo')}
                </button>
              </th>
              <th className="px-4 py-3 text-left border-b-2 border-blue-700">
                <button
                  onClick={() => handleSort('subprocesso')}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-100 transition-colors"
                >
                  Subprocesso
                  {getSortIcon('subprocesso')}
                </button>
              </th>
              <th className="px-4 py-3 text-left border-b-2 border-blue-700">
                <button
                  onClick={() => handleSort('responsavel_processo')}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-100 transition-colors"
                >
                  Responsável
                  {getSortIcon('responsavel_processo')}
                </button>
              </th>
              <th className="px-4 py-3 text-left border-b-2 border-blue-700">
                <span className="text-sm font-medium text-white">Link Manual</span>
              </th>
              <th className="px-4 py-3 text-left border-b-2 border-blue-700">
                <span className="text-sm font-medium text-white">Última Atualização</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Carregando dados...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Nenhum registro encontrado</p>
                    {searchTerm && (
                      <p className="text-xs text-gray-400 mt-1">
                        Tente ajustar os filtros de busca
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{row.macroprocesso}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{row.processo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{row.subprocesso}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getResponsavelColor(row.responsavel_processo)}`}>
                      {row.responsavel_processo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.link_manual ? (
                      <a
                        href={row.link_manual}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        title="Abrir Manual"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden sm:inline">Manual</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {row.updated_at ? new Date(row.updated_at).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer com informações */}
      {!isLoading && data.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Exibindo {data.length} {data.length === 1 ? 'registro' : 'registros'}
            </span>
            <span className="text-xs">
              Ordenado por: {sortConfig.field} ({sortConfig.direction === 'asc' ? 'crescente' : 'decrescente'})
            </span>
          </div>
        </div>
      )}


    </div>
  );
};

export default DetalhamentoTable;