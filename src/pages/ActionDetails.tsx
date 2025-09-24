import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Upload,
  Activity
} from 'lucide-react';
import { Action, ActionTimeline, ActionEvidence, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';
import { isActionOverdue, getActionStatusColor } from "../types/action";
import Layout from '../components/Layout';

const mockAction: Action = {
  id: '1',
  id_ref: 'R001',
  desc_acao: 'Implementar controles de acesso baseados em função para sistemas críticos',
  prazo_implementacao: '2024-03-15',
  area_executora: ['TI', 'Segurança'],
  status: StatusAcao.EM_IMPLEMENTACAO,
  situacao: SituacaoAcao.NO_PRAZO,
  perc_implementacao: 65,
  tipo_acao: TipoAcao.ORIGINAL,
  acao_transversal: false,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-02-01T14:30:00Z'
};

const mockTimeline: ActionTimeline[] = [
  {
    id: '1',
    desc_acao: 'Ação criada no sistema',
    prazo_implementacao: '2024-03-15',
    status: StatusAcao.NAO_INICIADA,
    perc_implementacao: 0,
    situacao: SituacaoAcao.NO_PRAZO,
    area_executora: ['TI', 'Segurança'],
    is_overdue: false,
    days_until_deadline: 30
  },
  {
    id: '2',
    desc_acao: 'Progresso atualizado para 30%',
    prazo_implementacao: '2024-03-15',
    status: StatusAcao.EM_IMPLEMENTACAO,
    perc_implementacao: 30,
    situacao: SituacaoAcao.NO_PRAZO,
    area_executora: ['TI', 'Segurança'],
    is_overdue: false,
    days_until_deadline: 25
  },
  {
    id: '3',
    desc_acao: 'Comentário adicionado',
    prazo_implementacao: '2024-03-15',
    status: StatusAcao.EM_IMPLEMENTACAO,
    perc_implementacao: 30,
    situacao: SituacaoAcao.NO_PRAZO,
    area_executora: ['TI', 'Segurança'],
    is_overdue: false,
    days_until_deadline: 20
  },
  {
    id: '4',
    desc_acao: 'Progresso atualizado para 65%',
    prazo_implementacao: '2024-03-15',
    status: StatusAcao.EM_IMPLEMENTACAO,
    perc_implementacao: 65,
    situacao: SituacaoAcao.NO_PRAZO,
    area_executora: ['TI', 'Segurança'],
    is_overdue: false,
    days_until_deadline: 15
  },
  {
    id: '5',
    desc_acao: 'Evidência adicionada: politica_acesso_v1.pdf',
    prazo_implementacao: '2024-03-15',
    status: StatusAcao.EM_IMPLEMENTACAO,
    perc_implementacao: 65,
    situacao: SituacaoAcao.NO_PRAZO,
    area_executora: ['TI', 'Segurança'],
    is_overdue: false,
    days_until_deadline: 15
  }
];

const mockEvidences: ActionEvidence[] = [
  {
    id: '1',
    action_id: '1',
    file_name: 'politica_acesso_v1.pdf',
    file_url: '/files/politica_acesso_v1.pdf',
    file_type: 'application/pdf',
    file_size: 2048576,
    description: 'Documento com as políticas de acesso definidas',
    uploaded_at: '2024-01-20T10:30:00Z',
    uploaded_by: 'João Silva'
  },
  {
    id: '2',
    action_id: '1',
    file_name: 'teste_controles.xlsx',
    file_url: '/files/teste_controles.xlsx',
    file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size: 1024000,
    description: 'Planilha com resultados dos testes dos controles',
    uploaded_at: '2024-01-25T17:00:00Z',
    uploaded_by: 'João Silva'
  }
];

const ActionDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidences'>('overview');
  const [isLoading] = useState(false);

  // Simular carregamento
  const action = mockAction;
  const timeline = mockTimeline;
  const evidences = mockEvidences;

  const isOverdue = isActionOverdue(action);
  const daysUntilDeadline = Math.ceil(
    (new Date(action.prazo_implementacao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTimelineIcon = (status: StatusAcao) => {
    switch (status) {
      case StatusAcao.NAO_INICIADA:
        return <FileText className="w-4 h-4" />;
      case StatusAcao.EM_IMPLEMENTACAO:
        return <TrendingUp className="w-4 h-4" />;
      case StatusAcao.IMPLEMENTADA:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressColor = () => {
    if (action.situacao === SituacaoAcao.ATRASADO) return 'bg-red-500';
    if (action.status === StatusAcao.IMPLEMENTADA) return 'bg-green-500';
    if (action.perc_implementacao >= 80) return 'bg-blue-500';
    if (action.perc_implementacao >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/acoes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Detalhes da Ação
            </h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              action.tipo_acao === TipoAcao.ORIGINAL ? 'bg-blue-100 text-blue-700' :
              action.tipo_acao === TipoAcao.ALTERADA ? 'bg-yellow-100 text-yellow-700' :
              action.tipo_acao === TipoAcao.INCLUIDA ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {action.tipo_acao === TipoAcao.ORIGINAL ? 'Original' :
               action.tipo_acao === TipoAcao.ALTERADA ? 'Alterada' :
               action.tipo_acao === TipoAcao.INCLUIDA ? 'Incluída' :
               'Não definido'}
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Atrasada</span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Risco: <Link to={`/riscos/${action.id_ref}`} className="text-blue-600 hover:text-blue-800 font-medium">{action.id_ref}</Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/acoes/${action.id}/editar`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${
                getActionStatusColor(action.status).includes('text-red') ? 'text-red-700' :
                getActionStatusColor(action.status).includes('text-green') ? 'text-green-700' :
                getActionStatusColor(action.status).includes('text-yellow') ? 'text-yellow-700' :
                'text-gray-700'
              }`}>
                {action.status === StatusAcao.NAO_INICIADA ? 'Não Iniciada' :
                 action.status === StatusAcao.EM_IMPLEMENTACAO ? 'Em implementação' :
                 action.status === StatusAcao.IMPLEMENTADA ? 'Implementada' :
                 'Não definido'}
              </p>
            </div>
            <div className={getActionStatusColor(action.status)}>
              {action.status === StatusAcao.IMPLEMENTADA ? <CheckCircle className="w-6 h-6" /> :
               action.situacao === SituacaoAcao.ATRASADO ? <AlertTriangle className="w-6 h-6" /> :
               <Clock className="w-6 h-6" />}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progresso</p>
              <p className="text-lg font-semibold text-gray-900">
                {action.perc_implementacao}%
              </p>
            </div>
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${action.perc_implementacao}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prazo</p>
              <p className={`text-lg font-semibold ${
                isOverdue ? 'text-red-700' : daysUntilDeadline <= 7 ? 'text-yellow-700' : 'text-gray-900'
              }`}>
                {new Date(action.prazo_implementacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Calendar className={`w-6 h-6 ${
              isOverdue ? 'text-red-500' : daysUntilDeadline <= 7 ? 'text-yellow-500' : 'text-gray-400'
            }`} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isOverdue ? `${Math.abs(daysUntilDeadline)} dias em atraso` :
             daysUntilDeadline <= 0 ? 'Vence hoje' :
             `${daysUntilDeadline} dias restantes`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Responsável</p>
              <p className="text-lg font-semibold text-gray-900">
                {action.area_executora.join(', ')}
              </p>
            </div>
            <User className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('evidences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evidences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Evidências ({evidences.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Descrição da Ação</h3>
                <p className="text-gray-700 leading-relaxed">
                  {action.desc_acao}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Informações Gerais</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">ID da Ação:</dt>
                      <dd className="text-sm font-medium text-gray-900">{action.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Risco Relacionado:</dt>
                      <dd className="text-sm font-medium text-blue-600">
                        <Link to={`/riscos/${action.id_ref}`} className="hover:text-blue-800">
                          {action.id_ref}
                        </Link>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Tipo de Ação:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {action.tipo_acao === TipoAcao.ORIGINAL ? 'Original' :
                         action.tipo_acao === TipoAcao.ALTERADA ? 'Alterada' :
                         action.tipo_acao === TipoAcao.INCLUIDA ? 'Incluída' :
                         'Não definido'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Data de Criação:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(action.created_at).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Execução</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Área Executora:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {action.area_executora.join(', ')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Prazo:</dt>
                      <dd className={`text-sm font-medium ${
                        isOverdue ? 'text-red-700' : daysUntilDeadline <= 7 ? 'text-yellow-700' : 'text-gray-900'
                      }`}>
                        {new Date(action.prazo_implementacao).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Progresso:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {action.perc_implementacao}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Última Atualização:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(action.updated_at).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico da Ação</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {timeline.map((item, itemIdx) => (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {itemIdx !== timeline.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            {getTimelineIcon(item.status)}
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.desc_acao}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Progresso: {item.perc_implementacao}% - {item.area_executora.join(', ')}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              <div>{item.prazo_implementacao ? new Date(item.prazo_implementacao).toLocaleDateString('pt-BR') : 'Sem prazo'}</div>
                              <div className="text-xs">{item.situacao === SituacaoAcao.NO_PRAZO ? 'No Prazo' : 'Atrasado'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'evidences' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Evidências</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Adicionar Evidência
                </button>
              </div>
              
              {evidences.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma evidência adicionada ainda</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Adicione documentos, imagens ou outros arquivos como evidência da implementação desta ação.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evidences.map((evidence) => (
                    <div key={evidence.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {evidence.file_name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(evidence.file_size)}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      
                      {evidence.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {evidence.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{evidence.uploaded_by}</span>
                        <span>{new Date(evidence.uploaded_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-100 transition-colors">
                          Visualizar
                        </button>
                        <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-100 transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default ActionDetails;