import { memo } from 'react';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import AlertsDashboard from '../components/AlertsDashboard';
import IndicatorsByStatusChart from '../components/IndicatorsByStatusChart';
import { BarChart3, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { IndicatorWithHistory, Tolerancia, SituacaoIndicador } from '../types/indicator';
import { Action, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Mock data com alertas para demonstração
  const mockIndicators: IndicatorWithHistory[] = [
    {
      // Dados da tabela dimensão (008)
      id: '1',
      id_risco: 'RISK-001',
      responsavel_risco: 'João Silva',
      indicador_risco: 'Taxa de Satisfação do Cliente',
      situacao_indicador: SituacaoIndicador.IMPLEMENTADO,
      meta_efetiva: 85,
      tolerancia: Tolerancia.FORA_TOLERANCIA, // Alerta crítico
      limite_tolerancia: '80%',
      tipo_acompanhamento: 'Mensal',
      apuracao: 'Dezembro/2024',
      created_at: '2024-01-10T14:30:00Z',
      updated_at: '2024-01-15T09:15:00Z',
      // Dados da tabela fato (019)
      historico_id: 'hist-1',
      justificativa_observacao: 'Indicador crítico para avaliação da qualidade',
      impacto_n_implementacao: 'Perda de competitividade no mercado',
      resultado_mes: 78.2, // Abaixo da tolerância
      data_apuracao: '2024-12-01T14:30:00Z',
      historico_created_at: '2024-12-01T14:30:00Z',
      historico_updated_at: '2024-12-01T14:30:00Z'
    },
    {
      // Dados da tabela dimensão (008)
      id: '2',
      id_risco: 'RISK-002',
      responsavel_risco: 'Maria Santos',
      indicador_risco: 'Tempo de Resposta do Sistema',
      situacao_indicador: SituacaoIndicador.IMPLEMENTADO,
      meta_efetiva: 2,
      tolerancia: Tolerancia.FORA_TOLERANCIA, // Outro alerta
      limite_tolerancia: '2s',
      tipo_acompanhamento: 'Diário',
      apuracao: 'Dezembro/2024',
      created_at: '2024-01-12T10:00:00Z',
      updated_at: '2024-01-16T14:20:00Z',
      // Dados da tabela fato (019)
      historico_id: 'hist-2',
      justificativa_observacao: 'Monitoramento de performance',
      impacto_n_implementacao: 'Degradação da experiência do usuário',
      resultado_mes: 3.5, // Acima da tolerância
      data_apuracao: '2024-12-01T14:30:00Z',
      historico_created_at: '2024-12-01T14:30:00Z',
      historico_updated_at: '2024-12-01T14:30:00Z'
    }
  ];

  const mockActions: Action[] = [
    {
      id: '1',
      id_ref: 'R001',
      desc_acao: 'Implementar controles de acesso ao sistema financeiro',
      area_executora: ['João Silva'],
      acao_transversal: false,
      tipo_acao: TipoAcao.ORIGINAL,
      prazo_implementacao: '2024-01-15', // Prazo vencido - alerta
      status: StatusAcao.EM_IMPLEMENTACAO,
      situacao: SituacaoAcao.ATRASADO, // Ação atrasada
      perc_implementacao: 45,
      justificativa_observacao: 'Aguardando aprovação da diretoria.',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z'
    },
    {
      id: '2',
      id_ref: 'R002',
      desc_acao: 'Atualizar políticas de segurança da informação',
      area_executora: ['Maria Santos', 'Carlos Lima'],
      acao_transversal: true,
      tipo_acao: TipoAcao.ORIGINAL,
      prazo_implementacao: '2024-01-20', // Prazo vencido
      status: StatusAcao.EM_IMPLEMENTACAO,
      situacao: SituacaoAcao.ATRASADO, // Outra ação atrasada
      perc_implementacao: 30,
      justificativa_observacao: 'Dependência de recursos externos.',
      created_at: '2024-01-08T09:00:00Z',
      updated_at: '2024-01-18T11:45:00Z'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho da Dashboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard - Sistema de Gestão de Riscos
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a), {user?.email}! Aqui você pode acompanhar os indicadores de risco da COGERH.
          </p>
        </div>

        {/* Sistema de Alertas */}
        <AlertsDashboard 
          indicators={mockIndicators} 
          actions={mockActions}
          className="mb-6"
        />

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Riscos</p>
                <p className="text-2xl font-semibold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Riscos Críticos</p>
                <p className="text-2xl font-semibold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ações Implementadas</p>
                <p className="text-2xl font-semibold text-gray-900">--</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Indicadores</p>
                <p className="text-2xl font-semibold text-gray-900">--</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Indicadores por Status de Implementação */}
          <IndicatorsByStatusChart height={320} />

          {/* Matriz de Riscos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Matriz de Riscos
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Matriz será implementada com dados reais</p>
            </div>
          </div>
        </div>

        {/* Ações Recentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Recentes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sistema em desenvolvimento</p>
                <p className="text-sm text-gray-600">Os dados serão carregados quando as funcionalidades estiverem implementadas</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Em progresso
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default memo(Dashboard);