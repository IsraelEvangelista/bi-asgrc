import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Target,
  User,
  FileText,
  BarChart3
} from 'lucide-react';
import Layout from '../components/Layout';
import {
  Indicator,
  SituacaoIndicador,
  Tolerancia,
  getIndicatorStatusColor,
  getToleranceColor,
  IndicatorHistory
} from '../types';

// Interface local para indicador com histórico
interface IndicatorWithHistory {
  indicator: Indicator;
  history: IndicatorHistory[];
  metrics: {
    average_result: number;
    trend: string;
    months_in_tolerance: number;
    months_out_tolerance: number;
    best_result: number;
    worst_result: number;
    improvement_rate: number;
  };
}

const IndicatorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [indicator, setIndicator] = useState<IndicatorWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analysis'>('overview');

  // Mock data - será substituído pela integração com Supabase
  const mockIndicatorWithHistory: IndicatorWithHistory = useMemo(() => ({
    indicator: {
      id: '1',
      id_risco: 'RISK-001',
      responsavel_risco: 'João Silva',
      indicador_risco: 'Taxa de Conformidade Regulatória',
      situacao_indicador: SituacaoIndicador.IMPLEMENTADO,
      justificativa_observacao: 'Indicador implementado com sucesso após revisão dos processos internos',
      impacto_n_implementacao: 'Baixo impacto - Processos já estão alinhados com as regulamentações',
      meta_desc: 'Manter conformidade regulatória acima de 95% em todas as auditorias',
      tolerancia: Tolerancia.DENTRO_TOLERANCIA,
      limite_tolerancia: '90%',
      tipo_acompanhamento: 'Percentual',
      resultado_mes: 97.5,
      apuracao: 'Dezembro/2024',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    history: [
      {
        id: 'hist-1',
        indicator_id: '1',
        resultado_mes: 97.5,
        tolerancia: Tolerancia.DENTRO_TOLERANCIA,
        apuracao: 'Dezembro/2024',
        observacoes: 'Resultado excelente, mantendo padrão de qualidade',
        recorded_at: '2024-12-31T23:59:59Z',
        recorded_by: 'João Silva'
      },
      {
        id: 'hist-2',
        indicator_id: '1',
        resultado_mes: 96.2,
        tolerancia: Tolerancia.DENTRO_TOLERANCIA,
        apuracao: 'Novembro/2024',
        observacoes: 'Pequena melhoria em relação ao mês anterior',
        recorded_at: '2024-11-30T23:59:59Z',
        recorded_by: 'João Silva'
      },
      {
        id: 'hist-3',
        indicator_id: '1',
        resultado_mes: 94.8,
        tolerancia: Tolerancia.DENTRO_TOLERANCIA,
        apuracao: 'Outubro/2024',
        observacoes: 'Resultado dentro da meta estabelecida',
        recorded_at: '2024-10-31T23:59:59Z',
        recorded_by: 'João Silva'
      },
      {
        id: 'hist-4',
        indicator_id: '1',
        resultado_mes: 88.5,
        tolerancia: Tolerancia.FORA_TOLERANCIA,
        apuracao: 'Setembro/2024',
        observacoes: 'Resultado abaixo da tolerância - ações corretivas implementadas',
        recorded_at: '2024-09-30T23:59:59Z',
        recorded_by: 'João Silva'
      },
      {
        id: 'hist-5',
        indicator_id: '1',
        resultado_mes: 92.1,
        tolerancia: Tolerancia.DENTRO_TOLERANCIA,
        apuracao: 'Agosto/2024',
        observacoes: 'Recuperação após implementação de melhorias',
        recorded_at: '2024-08-31T23:59:59Z',
        recorded_by: 'João Silva'
      }
    ],
    metrics: {
      average_result: 93.82,
      trend: 'positive',
      months_in_tolerance: 4,
      months_out_tolerance: 1,
      best_result: 97.5,
      worst_result: 88.5,
      improvement_rate: 10.2
    }
  }), []);

  useEffect(() => {
    const loadIndicator = async () => {
      if (!id) {
        navigate('/indicadores');
        return;
      }

      setLoading(true);
      // Aqui será implementada a integração com Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (id === '1') {
        setIndicator(mockIndicatorWithHistory);
      } else {
        // Indicador não encontrado
        navigate('/indicadores');
        return;
      }
      
      setLoading(false);
    };

    loadIndicator();
  }, [id, navigate, mockIndicatorWithHistory]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResultVariation = (current: number, previous: number) => {
    const variation = ((current - previous) / previous) * 100;
    const isPositive = variation > 0;
    return {
      value: Math.abs(variation).toFixed(1),
      isPositive,
      icon: isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Indicador não encontrado</div>
        <Link to="/indicadores" className="text-blue-600 hover:text-blue-800">
          Voltar para indicadores
        </Link>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/indicadores')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {indicator.indicator.indicador_risco}
            </h1>
            <p className="text-gray-600 mt-1">
              ID do Risco: {indicator.indicator.id_risco}
            </p>
          </div>
        </div>
        <Link
          to={`/indicadores/${id}/editar`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Editar
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resultado Atual</p>
              <p className="text-2xl font-bold text-gray-900">
                {indicator.indicator.resultado_mes?.toFixed(1) || 'N/A'}
                {indicator.indicator.tipo_acompanhamento === 'Percentual' ? '%' : ''}
              </p>
            </div>
            {getTrendIcon(indicator.metrics.trend)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média Histórica</p>
              <p className="text-2xl font-bold text-gray-900">
                {indicator.metrics.average_result.toFixed(1)}
                {indicator.indicator.tipo_acompanhamento === 'Percentual' ? '%' : ''}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Situação</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                getIndicatorStatusColor(indicator.indicator.situacao_indicador)
              }`}>
                {indicator.indicator.situacao_indicador}
              </span>
            </div>
            <User className="h-5 w-5 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tolerância</p>
              <div className="flex items-center gap-2">
                {indicator.indicator.tolerancia === Tolerancia.FORA_TOLERANCIA && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getToleranceColor(indicator.indicator.tolerancia)
                }`}>
                  {indicator.indicator.tolerancia}
                </span>
              </div>
            </div>
            <Target className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: FileText },
              { id: 'history', label: 'Histórico', icon: Calendar },
              { id: 'analysis', label: 'Análise', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'history' | 'analysis')}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informações Gerais</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Responsável</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.responsavel_risco}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Acompanhamento</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.tipo_acompanhamento}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Limite de Tolerância</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.limite_tolerancia}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Apuração</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.apuracao}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meta e Descrição</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Meta</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.meta_desc}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Justificativa/Observação</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.justificativa_observacao}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Impacto da Não Implementação</label>
                      <p className="text-sm text-gray-900">{indicator.indicator.impacto_n_implementacao}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Histórico de Resultados</h3>
              
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Período
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resultado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tolerância
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observações
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrado por
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {indicator.history.map((record, index) => {
                      const previousRecord = indicator.history[index + 1];
                      const variation = previousRecord ? getResultVariation(record.resultado_mes, previousRecord.resultado_mes) : null;
                      
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.apuracao}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {record.resultado_mes.toFixed(1)}
                              {indicator.indicator.tipo_acompanhamento === 'Percentual' ? '%' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {variation ? (
                              <div className={`flex items-center gap-1 ${variation.color}`}>
                                {variation.icon}
                                <span className="text-sm font-medium">
                                  {variation.value}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getToleranceColor(record.tolerancia)
                            }`}>
                              {record.tolerancia}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 max-w-xs truncate" title={record.observacoes}>
                              {record.observacoes}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.recorded_by}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Análise de Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Melhor Resultado</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {indicator.metrics.best_result.toFixed(1)}
                    {indicator.indicator.tipo_acompanhamento === 'Percentual' ? '%' : ''}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Pior Resultado</span>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {indicator.metrics.worst_result.toFixed(1)}
                    {indicator.indicator.tipo_acompanhamento === 'Percentual' ? '%' : ''}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Taxa de Melhoria</span>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {indicator.metrics.improvement_rate.toFixed(1)}%
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Meses na Tolerância</span>
                    <Target className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {indicator.metrics.months_in_tolerance}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Meses Fora da Tolerância</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {indicator.metrics.months_out_tolerance}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tendência</span>
                    {getTrendIcon(indicator.metrics.trend)}
                  </div>
                  <p className="text-xl font-bold text-gray-900 capitalize">
                    {indicator.metrics.trend === 'positive' ? 'Positiva' : 
                     indicator.metrics.trend === 'negative' ? 'Negativa' : 'Estável'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
    </Layout>
  );
};

export default IndicatorDetails;