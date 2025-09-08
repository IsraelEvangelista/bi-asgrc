import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Indicator,
  IndicatorFilters,
  SituacaoIndicador,
  Tolerancia,
  getIndicatorStatusColor,
  getToleranceColor,
  SITUACAO_INDICADOR_OPTIONS,
  TOLERANCIA_OPTIONS
} from '../types';
import { useToleranceAlerts } from '../hooks/useAlerts';
import AlertBanner from '../components/AlertBanner';
import Layout from '../components/Layout';

const Indicators: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<IndicatorFilters>({
    situacao_indicador: undefined,
    tolerancia: undefined
  });

  // Mock data - será substituído pela integração com Supabase
  const mockIndicators: Indicator[] = useMemo(() => [
    {
      id: '1',
      id_risco: 'RISK-001',
      responsavel_risco: 'João Silva',
      indicador_risco: 'Taxa de Conformidade Regulatória',
      situacao_indicador: SituacaoIndicador.IMPLEMENTADO,
      justificativa_observacao: 'Indicador implementado com sucesso',
      impacto_n_implementacao: 'Baixo impacto',
      meta_desc: 'Manter conformidade acima de 95%',
      tolerancia: Tolerancia.DENTRO_TOLERANCIA,
      limite_tolerancia: '90%',
      tipo_acompanhamento: 'Mensal',
      resultado_mes: 97.5,
      apuracao: 'Dezembro/2024',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      id_risco: 'RISK-002',
      responsavel_risco: 'Maria Santos',
      indicador_risco: 'Índice de Satisfação do Cliente',
      situacao_indicador: SituacaoIndicador.EM_IMPLEMENTACAO,
      justificativa_observacao: 'Em fase de coleta de dados',
      impacto_n_implementacao: 'Médio impacto',
      meta_desc: 'Manter satisfação acima de 85%',
      tolerancia: Tolerancia.FORA_TOLERANCIA,
      limite_tolerancia: '80%',
      tipo_acompanhamento: 'Mensal',
      resultado_mes: 78.2,
      apuracao: 'Dezembro/2024',
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      id_risco: 'RISK-003',
      responsavel_risco: 'Carlos Oliveira',
      indicador_risco: 'Tempo Médio de Resposta',
      situacao_indicador: SituacaoIndicador.NAO_INICIADO,
      justificativa_observacao: 'Aguardando aprovação do orçamento',
      impacto_n_implementacao: 'Alto impacto',
      meta_desc: 'Manter tempo de resposta abaixo de 2 horas',
      tolerancia: Tolerancia.DENTRO_TOLERANCIA,
      limite_tolerancia: '3 horas',
      tipo_acompanhamento: 'Semanal',
      resultado_mes: 1.8,
      apuracao: 'Dezembro/2024',
      created_at: '2024-01-05T16:45:00Z',
      updated_at: '2024-01-12T11:20:00Z'
    }
  ], []);

  const loadIndicators = useCallback(async () => {
    setLoading(true);
    // Aqui será implementada a integração com Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIndicators(mockIndicators);
    setLoading(false);
  }, [mockIndicators]);

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  const filteredIndicators = indicators.filter(indicator => {
    const matchesSearch = !searchTerm || 
      indicator.indicador_risco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.responsavel_risco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.id_risco.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSituacao = !filters.situacao_indicador || 
      indicator.situacao_indicador === filters.situacao_indicador;
    
    const matchesTolerancia = !filters.tolerancia || 
      indicator.tolerancia === filters.tolerancia;

    return matchesSearch && matchesSituacao && matchesTolerancia;
  });

  // Alertas de tolerância
  const toleranceAlerts = useToleranceAlerts(filteredIndicators);

  const handleFilterChange = (key: keyof IndicatorFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      situacao_indicador: undefined,
      tolerancia: undefined
    });
    setSearchTerm('');
  };

  const getResultIcon = (resultado: number, tolerancia: Tolerancia) => {
    if (tolerancia === Tolerancia.FORA_TOLERANCIA) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indicadores de Risco</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e monitore os indicadores de risco da organização
          </p>
        </div>
        <Link
          to="/indicadores/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Indicador
        </Link>
      </div>

      {/* Alertas de Tolerância */}
      {toleranceAlerts.hasAlerts && (
        <AlertBanner
          type="warning"
          title="Indicadores Fora da Tolerância"
          message={`${toleranceAlerts.count} indicador${toleranceAlerts.count > 1 ? 'es' : ''} está${toleranceAlerts.count > 1 ? 'ão' : ''} fora da tolerância estabelecida e requer${toleranceAlerts.count > 1 ? 'm' : ''} atenção imediata.`}
          count={toleranceAlerts.count}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por indicador, responsável ou ID do risco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação
                </label>
                <select
                  value={filters.situacao_indicador || ''}
                  onChange={(e) => handleFilterChange('situacao_indicador', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as situações</option>
                  {SITUACAO_INDICADOR_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerância
                </label>
                <select
                  value={filters.tolerancia || ''}
                  onChange={(e) => handleFilterChange('tolerancia', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as tolerâncias</option>
                  {TOLERANCIA_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredIndicators.length} indicador(es) encontrado(s)
          </span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded-full"></div>
              <span className="text-gray-600">
                {filteredIndicators.filter(i => i.tolerancia === Tolerancia.FORA_TOLERANCIA).length} fora da tolerância
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
              <span className="text-gray-600">
                {filteredIndicators.filter(i => i.situacao_indicador === SituacaoIndicador.EM_IMPLEMENTACAO).length} em implementação
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tolerância
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apuração
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIndicators.map((indicator) => (
                <tr key={indicator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {indicator.indicador_risco}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID Risco: {indicator.id_risco}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{indicator.responsavel_risco}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getIndicatorStatusColor(indicator.situacao_indicador)
                    }`}>
                      {indicator.situacao_indicador}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getResultIcon(indicator.resultado_mes || 0, indicator.tolerancia)}
                      <span className="text-sm font-medium text-gray-900">
                        {indicator.resultado_mes?.toFixed(1) || 'N/A'}
                        {indicator.tipo_acompanhamento === 'Percentual' ? '%' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {indicator.tolerancia === Tolerancia.FORA_TOLERANCIA && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getToleranceColor(indicator.tolerancia)
                      }`}>
                        {indicator.tolerancia}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{indicator.apuracao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/indicadores/${indicator.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Ver Detalhes
                    </Link>
                    <Link
                      to={`/indicadores/${indicator.id}/editar`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredIndicators.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">Nenhum indicador encontrado</div>
            <p className="text-gray-400">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro indicador de risco'
              }
            </p>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Indicators;