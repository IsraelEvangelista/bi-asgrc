import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { useRisks, useDeleteRisk } from '../hooks/useRisks';
import { RiskClassification, RiskFilters } from '../types';
import { formatRiskClassification, getSeverityColor, getSeverityText } from '../utils/riskUtils';
import Layout from '../components/Layout';

const RiskList: React.FC = () => {
  const [filters, setFilters] = useState<RiskFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { risks, loading, error, refetch } = useRisks(filters);
  const { deleteRisk, loading: deleting } = useDeleteRisk();

  const handleDelete = async (id: string, eventosRiscos: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o risco "${eventosRiscos}"?`)) {
      const success = await deleteRisk(id);
      if (success) {
        refetch();
      }
    }
  };



  const filteredRisks = risks.filter(risk => 
    risk.eventos_riscos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.responsavel_risco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro ao carregar riscos</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Riscos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os riscos organizacionais da COGERH
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/riscos/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Novo Risco
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por evento de risco ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="-ml-1 mr-2 h-4 w-4" />
            Filtros
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classificação
                </label>
                <select
                  value={filters.classificacao || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    classificacao: e.target.value as RiskClassification || undefined 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="estrategico">Estratégico</option>
                <option value="operacional">Operacional</option>
                <option value="financeiro">Financeiro</option>
                <option value="regulatorio">Regulatório</option>
                <option value="reputacional">Reputacional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidade Mínima
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={filters.severidade_min || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    severidade_min: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidade Máxima
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={filters.severidade_max || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    severidade_max: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {filteredRisks.length} risco{filteredRisks.length !== 1 ? 's' : ''} encontrado{filteredRisks.length !== 1 ? 's' : ''}
      </div>

      {/* Risks Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum risco encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece cadastrando o primeiro risco.'}
            </p>
            {!searchTerm && Object.keys(filters).length === 0 && (
              <div className="mt-6">
                <Link
                  to="/riscos/novo"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Cadastrar Primeiro Risco
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento de Risco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classificação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probabilidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {risk.eventos_riscos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {risk.classificacao ? formatRiskClassification(risk.classificacao) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {risk.probabilidade || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {risk.impacto || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(risk.severidade!)}`}>
                        {risk.severidade} - {getSeverityText(risk.severidade!)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {risk.responsavel_risco}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/riscos/${risk.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="Visualizar detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(risk.id, risk.eventos_riscos)}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                          title="Excluir risco"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default RiskList;