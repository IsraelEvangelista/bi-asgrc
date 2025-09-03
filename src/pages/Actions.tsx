import React, { useState, useMemo } from 'react';
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
  Play,
  Pause
} from 'lucide-react';
import {
  Action,
  ActionFilters,
  TipoAcao,
  StatusAcao,
  SituacaoAcao,
  getActionStatusColor,
  isActionOverdue,
  getActionPriority
} from '../types/action';
import { useOverdueActionAlerts } from '../hooks/useAlerts';
import Layout from '../components/Layout';
import AlertBanner from '../components/AlertBanner';

// Mock data para demonstração
const mockActions: Action[] = [
  {
    id: '1',
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
    desc_acao: 'Implementar monitoramento contínuo de transações',
    area_executora: ['Auditoria', 'TI'],
    acao_transversal: true,
    tipo_acao: TipoAcao.INCLUIDA,
    prazo_implementacao: '2024-03-01',
    status: StatusAcao.ACOES_IMPLEMENTADAS,
    situacao: SituacaoAcao.NO_PRAZO,
    perc_implementacao: 100,
    justificativa_observacao: 'Ação concluída com sucesso',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-28T16:45:00Z'
  }
];

const Actions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ActionFilters>({
    tipo_acao: undefined,
    status: undefined,
    situacao: undefined,
    area_executora: undefined,
    prazo_inicio: undefined,
    prazo_fim: undefined
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredActions = useMemo(() => {
    return mockActions.filter(action => {
      const matchesSearch = !searchTerm || 
        action.desc_acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.area_executora.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        action.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTipo = !filters.tipo_acao || action.tipo_acao === filters.tipo_acao;
      const matchesStatus = !filters.status || action.status === filters.status;
      const matchesSituacao = !filters.situacao || action.situacao === filters.situacao;
      const matchesArea = !filters.area_executora || 
        action.area_executora.some(area => area.toLowerCase().includes(filters.area_executora!.toLowerCase()));

      return matchesSearch && matchesTipo && matchesStatus && matchesSituacao && matchesArea;
    });
  }, [searchTerm, filters]);

  // Alertas de ações atrasadas
  const overdueAlerts = useOverdueActionAlerts(filteredActions);

  const getStatusIcon = (status: StatusAcao) => {
    switch (status) {
      case StatusAcao.NAO_INICIADA:
        return <Clock className="w-4 h-4" />;
      case StatusAcao.EM_IMPLEMENTACAO:
        return <AlertTriangle className="w-4 h-4" />;
      case StatusAcao.ACOES_IMPLEMENTADAS:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressBarColor = (action: Action) => {
    if (action.situacao === SituacaoAcao.ATRASADO) return 'bg-red-500';
    if (action.status === StatusAcao.ACOES_IMPLEMENTADAS) return 'bg-green-500';
    if ((action.perc_implementacao || 0) >= 80) return 'bg-blue-500';
    if ((action.perc_implementacao || 0) >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos de Ação</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe as ações de mitigação de riscos
          </p>
        </div>
        <Link
          to="/acoes/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Ação
        </Link>
      </div>

      {/* Alertas de Ações Atrasadas */}
      {overdueAlerts.hasAlerts && (
        <AlertBanner
          type="danger"
          title="Ações Atrasadas"
          message={`${overdueAlerts.count} ação${overdueAlerts.count > 1 ? 'ões' : ''} está${overdueAlerts.count > 1 ? 'ão' : ''} atrasada${overdueAlerts.count > 1 ? 's' : ''} e requer${overdueAlerts.count > 1 ? 'm' : ''} atenção imediata.`}
          count={overdueAlerts.count}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <option value={StatusAcao.EM_IMPLEMENTACAO}>Em Implementação</option>
                <option value={StatusAcao.ACOES_IMPLEMENTADAS}>Ações Implementadas</option>
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
              <input
                type="text"
                placeholder="Área executora"
                value={filters.area_executora || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  area_executora: e.target.value || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risco
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActions.map((action) => {
                const isOverdue = isActionOverdue(action);
                return (
                  <tr 
                    key={action.id} 
                    className={`hover:bg-gray-50 ${
                      isOverdue ? 'bg-red-50 border-l-4 border-red-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
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
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {action.desc_acao}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {action.tipo_acao === TipoAcao.ORIGINAL ? 'Original' :
                             action.tipo_acao === TipoAcao.ALTERADA ? 'Alterada' :
                             action.tipo_acao === TipoAcao.INCLUIDA ? 'Incluída' :
                             'Não definido'}
                          </p>
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
                    <td className="px-6 py-4">
                      <Link 
                        to={`/riscos/${action.id}`}
                         className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                       >
                         {action.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {action.area_executora.join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${
                          isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'
                        }`}>
                          {new Date(action.prazo_implementacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/acoes/${action.id}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/acoes/${action.id}/editar`}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Exportar relatório"
                        >
                          <Download className="w-4 h-4" />
                        </button>
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
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira ação de mitigação.'
              }
            </p>
            {!searchTerm && !Object.values(filters).some(f => f) && (
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

      {/* Summary Cards */}
      {filteredActions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Ações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredActions.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredActions.filter(a => a.status === StatusAcao.EM_IMPLEMENTACAO).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredActions.filter(a => a.situacao === SituacaoAcao.ATRASADO).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredActions.filter(a => a.status === StatusAcao.ACOES_IMPLEMENTADAS).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;