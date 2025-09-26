import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Eye,
  Edit,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import Layout from '../components/Layout';
import {
  Action,
  ActionFilters,
  TipoAcao,
  StatusAcao,
  SituacaoAcao,
  getActionStatusColor,
  isActionOverdue
} from '../types/action';
import { useOverdueActionAlerts } from '../hooks/useAlerts';
import { useActionsMinimal as useActionsData } from '../hooks/useActionsMinimal';
import { useRiskBarChart } from '../hooks/useRiskBarChart';
import { useRiskActionsData } from '../hooks/useRiskActionsData';
import { useAreasExecutoras } from '../hooks/useAreasExecutoras';
import AlertBanner from '../components/AlertBanner';
import StatusCards from '../components/StatusCards';
import HorizontalBarChart from '../components/HorizontalBarChart';
import { useActionsChartData } from '../hooks/useActionsChartData';

// Mock data para demonstração
const mockActions: Action[] = [
  {
    id: '1',
    id_ref: 'R01',
    desc_acao: 'Implementar controles de acesso ao sistema financeiro',
    area_executora: ['TI', 'Segurança'],
    acao_transversal: true,
    tipo_acao: TipoAcao.ORIGINAL,
    prazo_implementacao: '2024-02-15',
    status: StatusAcao.EM_IMPLEMENTACAO,
    situacao: SituacaoAcao.NO_PRAZO,
    perc_implementacao: 65,
    justificativa_observacao: 'Aguardando aprovação da diretoria para próxima fase',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    id_ref: 'R02',
    desc_acao: 'Corrigir vulnerabilidades identificadas no sistema',
    area_executora: ['TI'],
    acao_transversal: false,
    tipo_acao: TipoAcao.ALTERADA,
    prazo_implementacao: '2024-01-30',
    status: StatusAcao.EM_IMPLEMENTACAO,
    situacao: SituacaoAcao.ATRASADO,
    perc_implementacao: 30,
    justificativa_observacao: 'Necessário recursos adicionais para conclusão',
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-25T11:20:00Z'
  },
  {
    id: '3',
    id_ref: 'R03',
    desc_acao: 'Implementar monitoramento contínuo de transações',
    area_executora: ['Auditoria', 'TI'],
    acao_transversal: true,
    tipo_acao: TipoAcao.INCLUIDA,
    prazo_implementacao: '2024-03-01',
    status: StatusAcao.IMPLEMENTADA,
    situacao: SituacaoAcao.NO_PRAZO,
    perc_implementacao: 100,
    justificativa_observacao: 'Ação concluída com sucesso',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-28T16:45:00Z'
  }
];

const Actions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filters, setFilters] = useState<{
    tipo_acao?: TipoAcao;
    status?: StatusAcao;
    situacao?: SituacaoAcao;
    area_executora?: string;
  }>({});

  // Estados para filtros dinâmicos
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPrazo, setSelectedPrazo] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar dados com hook minimal para teste
  const { 
    actions: realActions, 
    loading, 
    error,
    totalCount 
  } = useActionsData();
  
  // Mock setPage para manter compatibilidade
  const setPage = (page: number) => {
    console.log('Página solicitada:', page, '(funcionalidade desabilitada no modo teste)');
  };
  
  // Hook para gráfico de barras horizontais (dados reais)
  const { data: riskBarData, loading: riskBarLoading, error: riskBarError } = useRiskBarChart();
  
  // Hook para buscar áreas executoras disponíveis
  const { areas: areasExecutoras, loading: areasLoading } = useAreasExecutoras();
  
  // Função para resolver IDs de área para sigla_area (para exibição)
  const resolveAreaExecutora = useCallback((area_executora: any) => {
    if (!area_executora || areasExecutoras.length === 0) {
      return '';
    }
    
    if (Array.isArray(area_executora)) {
      const siglas = area_executora.map(areaId => {
        if (areaId != null) {
          const area = areasExecutoras.find(a => a.id === String(areaId));
          return area ? area.sigla_area : `ID:${areaId}`;
        }
        return null;
      }).filter(Boolean);
      return siglas.join(', ');
    }
    
    if (area_executora != null) {
      const area = areasExecutoras.find(a => a.id === String(area_executora));
      return area ? area.sigla_area : `ID:${area_executora}`;
    }
    
    return '';
  }, [areasExecutoras]);
  
  // Hook específico para dados filtrados do gráfico de barras horizontais - OTIMIZADO
  const { 
    riskData: filteredRiskData, 
    loading: filteredRiskLoading, 
    error: filteredRiskError 
  } = useRiskActionsData({
    searchTerm,
    tipo_acao: filters.tipo_acao,
    status: filters.status,
    situacao: filters.situacao,
    area_executora: filters.area_executora,
    selectedStatus,
    selectedPrazo
  });
  
  // Hook simplificado comentado temporariamente para teste
  // const { 
  //   actions: realActions, 
  //   loading, 
  //   error, 
  //   refetch,
  //   totalCount 
  // } = useActionsDataSimple();
  
  // Hook original comentado temporariamente para teste
  // const { 
  //   actions: realActions, 
  //   loading, 
  //   error, 
  //   setPage 
  // } = useActionsData();
  
  // Removed hooks that were causing API overload

  // Usar dados reais ou fallback para mockados durante loading/erro
  const actions = realActions.length > 0 ? realActions : mockActions;
  const actionsForCharts = realActions.length > 0 ? realActions : mockActions;
  
  // Função para lidar com cliques fora dos elementos interativos
  const handleContainerClick = (e: React.MouseEvent) => {
    // Verificar se o clique foi em um elemento interativo (gráfico ou tabela)
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('[data-interactive="true"]') || 
                                target.closest('path') || 
                                target.closest('tr[data-interactive="true"]');
    
    // Se não foi em um elemento interativo e há filtro ativo, limpar todos os filtros
    if (!isInteractiveElement && (selectedStatus || selectedPrazo)) {
      setSelectedStatus(null);
      setSelectedPrazo(null);
    }
  };

  const filteredActions = useMemo(() => {
    let filtered = actionsForCharts.filter(action => {
      const matchesSearch = !searchTerm ||
        (action.desc_acao && action.desc_acao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (action.id && action.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (action.id_ref && action.id_ref.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTipo = !filters.tipo_acao || action.tipo_acao === filters.tipo_acao;
      const matchesStatus = !filters.status || action.status === filters.status;
      const matchesSituacao = !filters.situacao || action.situacao === filters.situacao;
      // Filtrar por sigla_area: converter IDs de area_executora para siglas e comparar
      const matchesArea = !filters.area_executora || (
        Array.isArray(action.area_executora) && 
        action.area_executora.some(areaId => {
          const area = areasExecutoras.find(a => a.id === areaId.toString());
          return area && area.sigla_area === filters.area_executora;
        })
      );

      // Aplicar filtros dinâmicos
      const matchesDynamicStatus = !selectedStatus || action.status === selectedStatus;
      const matchesDynamicPrazo = !selectedPrazo || 
        (selectedPrazo === 'no_prazo' && action.situacao === SituacaoAcao.NO_PRAZO) ||
        (selectedPrazo === 'atrasado' && action.situacao === SituacaoAcao.ATRASADO);

      return matchesSearch && matchesTipo && matchesStatus && matchesSituacao && matchesArea && matchesDynamicStatus && matchesDynamicPrazo;
    });

    // Aplicar ordenação
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'desc_acao':
            aValue = (a.desc_acao || '').toLowerCase();
            bValue = (b.desc_acao || '').toLowerCase();
            break;
          case 'id':
            aValue = a.id || '';
            bValue = b.id || '';
            break;
          case 'id_ref':
            aValue = a.id_ref || '';
            bValue = b.id_ref || '';
            break;
          case 'area_executora':
            // Resolver IDs das áreas para siglas para ordenação
            aValue = resolveAreaExecutora(a.area_executora).toLowerCase();
            bValue = resolveAreaExecutora(b.area_executora).toLowerCase();
            break;
          case 'prazo_implementacao':
            aValue = a.prazo_implementacao ? new Date(a.prazo_implementacao) : new Date(0);
            bValue = b.prazo_implementacao ? new Date(b.prazo_implementacao) : new Date(0);
            break;
          case 'status':
            aValue = (a.status || '').toLowerCase();
            bValue = (b.status || '').toLowerCase();
            break;
          case 'perc_implementacao':
            aValue = a.perc_implementacao || 0;
            bValue = b.perc_implementacao || 0;
            break;
          case 'hist_created_at':
            aValue = a.hist_created_at ? new Date(a.hist_created_at) : new Date(0);
            bValue = b.hist_created_at ? new Date(b.hist_created_at) : new Date(0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, filters, selectedStatus, selectedPrazo, sortField, sortDirection, actionsForCharts]);

  // Aplicar paginação aos dados filtrados
  const paginatedActions = useMemo(() => {
    const startIndex = (currentPage - 1) * 50;
    const endIndex = startIndex + 50;
    return filteredActions.slice(startIndex, endIndex);
  }, [filteredActions, currentPage]);

  // Calcular total de páginas baseado nos dados filtrados
  const filteredTotalPages = Math.ceil(filteredActions.length / 50);
  const filteredTotalCount = filteredActions.length;

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPrazo, filters]);

  // Detectar se há filtros aplicados
  const hasFiltersApplied = !!(
    searchTerm ||
    selectedStatus ||
    selectedPrazo ||
    Object.values(filters).some(f => f)
  );

  // Alertas de ações atrasadas
  const overdueAlerts = useOverdueActionAlerts(filteredActions);

  // Usar hooks corrigidos para dados dos gráficos
  // Para o gráfico de barras horizontais, priorizar dados filtrados mas usar dados base como fallback
  const riscoDataToUse = useMemo(() => {
    console.log('🔄 Processando dados para gráfico de barras horizontais...');
    console.log('📊 filteredRiskData:', filteredRiskData);
    console.log('📊 riskBarData:', riskBarData);
    
    // Priorizar filteredRiskData se disponível, senão usar riskBarData
    let data = [];
    
    if (filteredRiskData && Array.isArray(filteredRiskData) && filteredRiskData.length > 0) {
      console.log('✅ Usando filteredRiskData');
      data = filteredRiskData;
    } else if (riskBarData && Array.isArray(riskBarData) && riskBarData.length > 0) {
      console.log('✅ Usando riskBarData como fallback');
      data = riskBarData;
    } else {
      console.log('⚠️ Nenhum dado disponível');
      return [];
    }
    
    // Transformar dados para formato compatível com HorizontalBarChart
    const processedData = data.filter(item => item && typeof item === 'object').map((item: any) => {
      if (item.statusData && typeof item.statusData === 'object') {
        // Formato do useRiskActionsData - já está no formato correto
        const statusData = {
          emImplementacao: item.statusData.emImplementacao || 0,
          implementada: item.statusData.implementada || 0,
          naoIniciada: item.statusData.naoIniciada || 0
        };
        return {
          riskId: item.riskId || 'Desconhecido',
          statusData,
          total: statusData.naoIniciada + statusData.emImplementacao + statusData.implementada
        };
      } else {
        // Formato do useRiskBarChart - precisa ser convertido
        return {
          riskId: item.risk || item.riskId || 'Desconhecido',
          statusData: {
            emImplementacao: item['Em implementação'] || item.emImplementacao || 0,
            implementada: item['Implementada'] || item.implementada || 0,
            naoIniciada: item['Não Iniciada'] || item.naoIniciada || 0
          },
          total: (item['Não Iniciada'] || item.naoIniciada || 0) + (item['Em implementação'] || item.emImplementacao || 0) + (item['Implementada'] || item.implementada || 0)
        };
      }
    }).filter(item => item && item.riskId && item.statusData); // Filtrar apenas itens válidos
    
    // Garantir que apenas os riscos específicos sejam exibidos
    const targetRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];
    const filteredByTargetRisks = processedData.filter(item => targetRisks.includes(item.riskId));
    
    // Ordenar por total do maior para o menor
    const finalData = filteredByTargetRisks.sort((a, b) => b.total - a.total);
    
    console.log('🎯 Dados finais para o gráfico:', finalData);
    console.log('📈 Total de riscos a exibir:', finalData.length);
    
    return finalData;
  }, [filteredRiskData, riskBarData]);
  
  const { statusData, prazoData, statusCardsData } = useActionsChartData(
    filteredActions,
    riskBarData,
    hasFiltersApplied
  );


  const toggleFilterExpansion = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const limparTodosFiltros = () => {
    setFilters({});
    setSelectedStatus(null);
    setSelectedPrazo(null);
    setSearchTerm('');
    setIsFilterExpanded(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusIcon = (status: StatusAcao) => {
    switch (status) {
      case StatusAcao.NAO_INICIADA:
        return <Clock className="w-4 h-4" />;
      case StatusAcao.EM_IMPLEMENTACAO:
        return <AlertTriangle className="w-4 h-4" />;
      case StatusAcao.IMPLEMENTADA:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressBarColor = (action: Action) => {
    if (action.situacao === SituacaoAcao.ATRASADO) return 'bg-red-500';
    if (action.status === StatusAcao.IMPLEMENTADA) return 'bg-green-500';
    if ((action.perc_implementacao || 0) >= 80) return 'bg-blue-500';
    if ((action.perc_implementacao || 0) >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Layout>
      <div 
        className="p-6 space-y-6 bg-white rounded-lg shadow-sm border border-gray-200"
        onClick={handleContainerClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planos de Ação</h1>
              <p className="text-gray-600 mt-1">
                Gerencie e acompanhe as ações de mitigação de riscos
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {(Object.values(filters).some(f => f) || selectedStatus || selectedPrazo || searchTerm) && (
              <button
                onClick={limparTodosFiltros}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-sm"
              >
                <X className="h-4 w-4" />
                Limpar
              </button>
            )}
            <button
              onClick={toggleFilterExpansion}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm text-sm ${
                isFilterExpanded
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {isFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Indicadores de filtros ativos */}
        {(Object.values(filters).some(f => f) || selectedStatus || selectedPrazo || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600 font-medium mr-2">Filtros ativos:</span>
            
            {searchTerm && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Search className="w-3 h-3" />
                <span>Busca: "{searchTerm}"</span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {selectedStatus && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <span>Status: {selectedStatus}</span>
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {selectedPrazo && (
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <span>Prazo: {selectedPrazo === 'no_prazo' ? 'No Prazo' : 'Atrasado'}</span>
                <button 
                  onClick={() => setSelectedPrazo(null)}
                  className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filters.tipo_acao && (
              <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <span>Tipo: {filters.tipo_acao}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, tipo_acao: undefined }))}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filters.status && (
              <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                <span>Status: {filters.status}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
                  className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filters.situacao && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                <span>Situação: {filters.situacao}</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, situacao: undefined }))}
                  className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filters.area_executora && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                <span>Área: "{filters.area_executora}"</span>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, area_executora: undefined }))}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <div className="text-sm text-gray-500 ml-2">
              ({filteredTotalCount} de {totalCount} ações)
            </div>
          </div>
        )}

        {/* Seção de filtros expansível */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFilterExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ação
                </label>
                <select
                  value={filters.tipo_acao || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    tipo_acao: e.target.value as TipoAcao || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os tipos</option>
                  <option value={TipoAcao.ORIGINAL}>Original</option>
                  <option value={TipoAcao.ALTERADA}>Alterada</option>
                  <option value={TipoAcao.INCLUIDA}>Incluída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value as StatusAcao || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os status</option>
                  <option value={StatusAcao.NAO_INICIADA}>Não Iniciada</option>
                  <option value={StatusAcao.EM_IMPLEMENTACAO}>Em implementação</option>
                  <option value={StatusAcao.IMPLEMENTADA}>Implementada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação
                </label>
                <select
                  value={filters.situacao || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    situacao: e.target.value as SituacaoAcao || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as situações</option>
                  <option value={SituacaoAcao.NO_PRAZO}>No Prazo</option>
                  <option value={SituacaoAcao.ATRASADO}>Atrasado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área Executora
                </label>
                <select
                  value={filters.area_executora || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    area_executora: e.target.value || undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={areasLoading}
                >
                  <option value="">Todas as áreas</option>
                  {areasExecutoras.map((area) => (
                    <option key={area.id} value={area.sigla_area}>
                      {area.sigla_area}
                    </option>
                  ))}
                  {areasLoading && (
                    <option disabled>Carregando áreas...</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de Loading e Error */}
        {loading && (
          <AlertBanner
            type="info"
            title="Carregando"
            message="Carregando dados das ações..."
          />
        )}
        
        {error && (
          <AlertBanner
            type="danger"
            title="Erro"
            message="Erro ao carregar dados das ações. Usando dados de demonstração."
          />
        )}
        
        {/* Removed risk loading/error alerts - hook removed to fix API overload */}

        {/* Alertas de Ações Atrasadas */}
        {overdueAlerts.hasAlerts && (
          <AlertBanner
            type="danger"
            title="Ações Atrasadas"
            message={`${overdueAlerts.count} ação${overdueAlerts.count > 1 ? 'ões' : ''} está${overdueAlerts.count > 1 ? 'ão' : ''} atrasada${overdueAlerts.count > 1 ? 's' : ''} e requer${overdueAlerts.count > 1 ? 'm' : ''} atenção imediata.`}
            count={overdueAlerts.count}
          />
        )}

        {/* Grid Principal 3x7 */}
        <div className="grid grid-cols-7 gap-6">
          {/* Linha 1-3, Coluna 1-2: Gráfico de rosca - Quantitativo Percentual por Status */}
          <div className="col-span-2 row-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quantitativo Percentual por Status</h3>
              <div className="flex items-center justify-center h-64 overflow-visible flex-1">
                <div className="relative w-72 h-72 overflow-visible">
                  {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  ) : statusData.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          const coresPorStatus: { [key: string]: string } = {
                            'Não Iniciada': '#F59E0B',
                            'Em implementação': '#3B82F6', 
                            'Implementada': '#10B981'
                          };

                          const total = statusData.reduce((acc, item) => acc + item.value, 0);
                          
                          // Filtrar apenas itens com valor > 0 para renderização
                          const validItems = statusData.filter(item => item.value > 0);

                          // Caso de item único: renderizar donut completo
                          if (validItems.length === 1) {
                            const item = validItems[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            const isOtherFiltered = selectedStatus !== null && selectedStatus !== ({
                              'Não Iniciada': StatusAcao.NAO_INICIADA,
                              'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                              'Implementada': StatusAcao.IMPLEMENTADA
                            })[item.name];
                            return (
                              <g key={item.name}>
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={coresPorStatus[item.name] || '#9CA3AF'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${isOtherFiltered ? 'opacity-50' : 'opacity-100'} hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const statusValue = ({
                                      'Não Iniciada': StatusAcao.NAO_INICIADA,
                                      'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                                      'Implementada': StatusAcao.IMPLEMENTADA
                                    })[item.name];
                                    if (selectedStatus === statusValue) {
                                      setSelectedStatus(null);
                                    } else {
                                      setSelectedStatus(statusValue);
                                    }
                                  }}
                                  data-interactive="true"
                                />
                                <circle cx="140" cy="140" r={innerRadius} fill="white" />
                              </g>
                            );
                          }

                          // Para múltiplos itens: renderizar segmentos
                          let cumulativePercentage = 0;
                          return validItems.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            const outerRadius = 90;
                            const innerRadius = 30;
                            const x1Outer = 140 + outerRadius * Math.cos(startAngleRad);
                            const y1Outer = 140 + outerRadius * Math.sin(startAngleRad);
                            const x2Outer = 140 + outerRadius * Math.cos(endAngleRad);
                            const y2Outer = 140 + outerRadius * Math.sin(endAngleRad);
                            const x1Inner = 140 + innerRadius * Math.cos(startAngleRad);
                            const y1Inner = 140 + innerRadius * Math.sin(startAngleRad);
                            const x2Inner = 140 + innerRadius * Math.cos(endAngleRad);
                            const y2Inner = 140 + innerRadius * Math.sin(endAngleRad);
                            const pathData = [
                              `M ${x1Inner} ${y1Inner}`,
                              `L ${x1Outer} ${y1Outer}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                              `L ${x2Inner} ${y2Inner}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
                              'Z'
                            ].join(' ');
                            cumulativePercentage += percentage;
                            const isOtherFiltered = selectedStatus !== null && selectedStatus !== ({
                              'Não Iniciada': StatusAcao.NAO_INICIADA,
                              'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                              'Implementada': StatusAcao.IMPLEMENTADA
                            })[item.name];
                            return (
                              <path
                                key={item.name}
                                d={pathData}
                                fill={coresPorStatus[item.name] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${isOtherFiltered ? 'opacity-50' : 'opacity-100'} hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const statusValue = ({
                                    'Não Iniciada': StatusAcao.NAO_INICIADA,
                                    'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                                    'Implementada': StatusAcao.IMPLEMENTADA
                                  })[item.name];
                                  if (selectedStatus === statusValue) {
                                    setSelectedStatus(null);
                                  } else {
                                    setSelectedStatus(statusValue);
                                  }
                                }}
                                data-interactive="true"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          const total = statusData.reduce((acc, item) => acc + item.value, 0);
                          
                          // Filtrar apenas itens com valor > 0 para rótulos
                          const validItems = statusData.filter(item => item.value > 0);
                          
                          // Para um único item válido, posicionar o rótulo no topo
                          if (validItems.length === 1) {
                            const item = validItems[0];
                            const percentage = (item.value / total) * 100;
                            return (
                              <text
                                key={`label-${item.name}`}
                                x="140"
                                y="15"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {percentage.toFixed(1)}%
                              </text>
                            );
                          }
                          
                          // Para múltiplos itens válidos, usar a lógica original
                          let cumulativePercentage = 0;
                          return validItems.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                            const labelRadius = 125;
                            const labelX = 140 + labelRadius * Math.cos(midAngleRad);
                            const labelY = 140 + labelRadius * Math.sin(midAngleRad);
                            cumulativePercentage += percentage;
                          return (
                              <text
                                key={`label-${item.name}`}
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {percentage.toFixed(1)}%
                              </text>
                            );
                          });
                        })()
                        }
                      </svg>
                      
                      {/* Centro com somatório */}
                      <div className="absolute" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'white', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15}}>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{statusData.reduce((acc, item) => acc + item.value, 0)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loading ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : statusData.length > 0 ? (
                  statusData.map((item, index) => {
                    // Cores específicas por status
                    const coresPorStatus: { [key: string]: string } = {
                      'Não Iniciada': '#F59E0B',
                      'Em implementação': '#3B82F6',
                      'Implementada': '#10B981'
                    };
                    const corClasse = coresPorStatus[item.name] || '#9CA3AF';
                    const total = statusData.reduce((acc, item) => acc + item.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: corClasse}}></div>
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.value} ({percentage}%)</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                )}
              </div>
            </div>
          </div>

          {/* Linha 1, Coluna 3-5: Cards de Status */}
          <div className="col-span-3 row-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <StatusCards data={statusCardsData} />
            </div>
          </div>

          {/* Linha 1-3, Coluna 6-7: Gráfico de rosca - Quantitativo de Ações não Iniciadas por Prazo */}
          <div className="col-span-2 row-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quantitativo de Ações não Iniciadas por Prazo</h3>
              <div className="flex items-center justify-center h-64 overflow-visible flex-1">
                <div className="relative w-72 h-72 overflow-visible">
                  {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  ) : prazoData.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          const coresPorPrazo: { [key: string]: string } = {
                            'No Prazo': '#10B981',
                            'Atrasado': '#EF4444'
                          };

                          const total = prazoData.reduce((acc, item) => acc + item.value, 0);
                          
                          // Filtrar apenas itens com valor > 0 para renderização
                          const validItems = prazoData.filter(item => item.value > 0);

                          // Caso de item único: renderizar donut completo
                          if (validItems.length === 1) {
                            const item = validItems[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            const isOtherFiltered = selectedPrazo !== null && selectedPrazo !== ({
                              'No Prazo': 'no_prazo',
                              'Atrasado': 'atrasado'
                            })[item.name];
                            return (
                              <g key={item.name}>
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={coresPorPrazo[item.name] || '#9CA3AF'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${isOtherFiltered ? 'opacity-50' : 'opacity-100'} hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const prazoValue = ({
                                      'No Prazo': 'no_prazo',
                                      'Atrasado': 'atrasado'
                                    })[item.name];
                                    if (selectedPrazo === prazoValue) {
                                      setSelectedPrazo(null);
                                    } else {
                                      setSelectedPrazo(prazoValue);
                                    }
                                  }}
                                  data-interactive="true"
                                />
                                <circle cx="140" cy="140" r={innerRadius} fill="white" />
                              </g>
                            );
                          }

                          // Para múltiplos itens: renderizar segmentos
                          let cumulativePercentage = 0;
                          return validItems.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            const outerRadius = 90;
                            const innerRadius = 30;
                            const x1Outer = 140 + outerRadius * Math.cos(startAngleRad);
                            const y1Outer = 140 + outerRadius * Math.sin(startAngleRad);
                            const x2Outer = 140 + outerRadius * Math.cos(endAngleRad);
                            const y2Outer = 140 + outerRadius * Math.sin(endAngleRad);
                            const x1Inner = 140 + innerRadius * Math.cos(startAngleRad);
                            const y1Inner = 140 + innerRadius * Math.sin(startAngleRad);
                            const x2Inner = 140 + innerRadius * Math.cos(endAngleRad);
                            const y2Inner = 140 + innerRadius * Math.sin(endAngleRad);
                            const pathData = [
                              `M ${x1Inner} ${y1Inner}`,
                              `L ${x1Outer} ${y1Outer}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                              `L ${x2Inner} ${y2Inner}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
                              'Z'
                            ].join(' ');
                            cumulativePercentage += percentage;
                            const isOtherFiltered = selectedPrazo !== null && selectedPrazo !== ({
                              'No Prazo': 'no_prazo',
                              'Atrasado': 'atrasado'
                            })[item.name];
                            return (
                              <path
                                key={item.name}
                                d={pathData}
                                fill={coresPorPrazo[item.name] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${isOtherFiltered ? 'opacity-50' : 'opacity-100'} hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prazoValue = ({
                                    'No Prazo': 'no_prazo',
                                    'Atrasado': 'atrasado'
                                  })[item.name];
                                  if (selectedPrazo === prazoValue) {
                                    setSelectedPrazo(null);
                                  } else {
                                    setSelectedPrazo(prazoValue);
                                  }
                                }}
                                data-interactive="true"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          const total = prazoData.reduce((acc, item) => acc + item.value, 0);
                          
                          // Filtrar apenas itens com valor > 0 para rótulos
                          const validItems = prazoData.filter(item => item.value > 0);
                          
                          // Para um único item válido, posicionar o rótulo no topo
                          if (validItems.length === 1) {
                            const item = validItems[0];
                            const percentage = (item.value / total) * 100;
                            return (
                              <text
                                key={`label-${item.name}`}
                                x="140"
                                y="15"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {percentage.toFixed(1)}%
                              </text>
                            );
                          }
                          
                          // Para múltiplos itens válidos, usar a lógica original
                          let cumulativePercentage = 0;
                          return validItems.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                            const labelRadius = 125;
                            const labelX = 140 + labelRadius * Math.cos(midAngleRad);
                            const labelY = 140 + labelRadius * Math.sin(midAngleRad);
                            cumulativePercentage += percentage;
                          return (
                              <text
                                key={`label-${item.name}`}
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {percentage.toFixed(1)}%
                              </text>
                            );
                          });
                        })()
                        }
                      </svg>
                      
                      {/* Centro com somatório */}
                      <div className="absolute" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'white', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15}}>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{prazoData.reduce((acc, item) => acc + item.value, 0)}</p>
                          <p className="text-xs text-gray-600 leading-tight">Ações Não Iniciadas e Em Implementação</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loading ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : prazoData.length > 0 ? (
                  prazoData.map((item, index) => {
                    // Cores específicas por prazo
                    const coresPorPrazo: { [key: string]: string } = {
                      'No Prazo': '#10B981',
                      'Atrasado': '#EF4444'
                    };
                    const corClasse = coresPorPrazo[item.name] || '#9CA3AF';
                    const total = prazoData.reduce((acc, item) => acc + item.value, 0);
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: corClasse}}></div>
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.value} ({percentage}%)</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                )}
              </div>
            </div>
          </div>

          {/* Linha 2-3, Coluna 3-5: Gráfico de barras horizontais */}
          <div className="col-span-3 row-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <HorizontalBarChart
                data={riscoDataToUse}
                showTotal={true}
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por descrição, responsável ou ID do risco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Paginação */}
        {filteredTotalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(filteredTotalPages, currentPage + 1))}
                  disabled={currentPage === filteredTotalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{((currentPage - 1) * 50) + 1}</span>
                    {' '}até{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 50, filteredTotalCount)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{filteredTotalCount}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Números das páginas */}
                    {Array.from({ length: Math.min(5, filteredTotalPages) }, (_, i) => {
                      let pageNumber;
                      if (filteredTotalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= filteredTotalPages - 2) {
                        pageNumber = filteredTotalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(filteredTotalPages, currentPage + 1))}
                      disabled={currentPage === filteredTotalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <colgroup><col className="w-2/5" /><col className="w-20" /><col className="w-32" /><col className="w-28" /><col className="w-32" /><col className="w-24" /></colgroup>
              <thead className="bg-blue-600 border-b border-blue-700">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleSort('desc_acao')}>
                    <div className="flex items-center gap-1">
                      Ação
                      {sortField === 'desc_acao' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 opacity-50" />
                          <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleSort('id_ref')}>
                    <div className="flex items-center justify-center gap-1">
                      Risco
                      {sortField === 'id_ref' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 opacity-50" />
                          <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleSort('area_executora')}>
                    <div className="flex items-center justify-center gap-1">
                      Responsável
                      {sortField === 'area_executora' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 opacity-50" />
                          <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleSort('hist_created_at')}>
                    <div className="flex items-center justify-center gap-1">
                      Referência
                      {sortField === 'hist_created_at' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 opacity-50" />
                          <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center justify-center gap-1">
                      Status
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 opacity-50" />
                          <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-center text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => handleSort('perc_implementacao')}>
                    <div className="flex items-center justify-center gap-1">
                      Progresso
                      {sortField === 'perc_implementacao' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <div className="flex flex-col">
                          <ChevronUp className="w-3 h-3 opacity-50" />
                          <ChevronDown className="w-3 h-3 opacity-50 -mt-1" />
                        </div>
                      )}
                    </div>
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedActions.map((action) => {
                  const isOverdue = isActionOverdue(action);
                  return (
                    <tr
                      key={action.id}
                      className={`hover:bg-gray-50 ${
                        isOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''
                      }`}
                      data-interactive="true"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            action.tipo_acao === TipoAcao.ORIGINAL ? 'bg-blue-100 text-blue-600' :
                            action.tipo_acao === TipoAcao.ALTERADA ? 'bg-yellow-100 text-yellow-600' :
                            action.tipo_acao === TipoAcao.INCLUIDA ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words leading-relaxed">
                              {action.desc_acao}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">
                                {action.tipo_acao === TipoAcao.ORIGINAL ? 'Original' :
                                 action.tipo_acao === TipoAcao.ALTERADA ? 'Alterada' :
                                 action.tipo_acao === TipoAcao.INCLUIDA ? 'Incluída' :
                                 'Não definido'}
                              </p>
                              <div className="text-xs text-gray-600 font-medium">
                                Prazo: {action.novo_prazo ? 
                                  new Date(action.novo_prazo).toLocaleDateString('pt-BR') : 
                                  new Date(action.prazo_implementacao).toLocaleDateString('pt-BR')
                                }
                              </div>
                            </div>
                            {isOverdue && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-red-600 font-medium">
                                  Ação Atrasada
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <span className="text-sm text-blue-600 font-medium">
                          {action.id_ref || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 break-words leading-relaxed">
                            {resolveAreaExecutora(action.area_executora)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {action.hist_created_at ? 
                              new Date(action.hist_created_at).toLocaleDateString('pt-BR') : 
                              'N/A'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`${getActionStatusColor(action.status)}`}>
                            {getStatusIcon(action.status)}
                          </div>
                          <span className={`text-sm font-medium ${
                            getActionStatusColor(action.status).includes('text-red') ? 'text-red-700' :
                            getActionStatusColor(action.status).includes('text-green') ? 'text-green-700' :
                            getActionStatusColor(action.status).includes('text-yellow') ? 'text-yellow-700' :
                            'text-gray-700'
                          }`}
                          >
                            {action.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              {action.perc_implementacao}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getProgressBarColor(action)
                              }`}
                              style={{ width: `${action.perc_implementacao}%` }}
                            />
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma ação encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.values(filters).some(f => f) || selectedStatus || selectedPrazo
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira ação de mitigação.'
                }
              </p>
              {!searchTerm && !Object.values(filters).some(f => f) && !selectedStatus && !selectedPrazo && (
                <Link
                  to="/acoes/nova"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Ação
                </Link>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Actions;