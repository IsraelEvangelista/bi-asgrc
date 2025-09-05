import Layout from '../components/Layout';
import { BarChart3, Shield, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Home() {
  const stats = [
    {
      title: 'Riscos Identificados',
      value: '127',
      change: '+12%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Ações Implementadas',
      value: '89',
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Indicadores Ativos',
      value: '45',
      change: '+5%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      title: 'Usuários Ativos',
      value: '23',
      change: '+2%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestão de Riscos - COGERH
              </h1>
              <p className="text-gray-600">
                Assessoria de Risco e Compliance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs mês anterior
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Shield className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Novo Risco</h3>
              <p className="text-sm text-gray-600">Cadastrar novo risco identificado</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Nova Ação</h3>
              <p className="text-sm text-gray-600">Registrar ação de mitigação</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Relatórios</h3>
              <p className="text-sm text-gray-600">Visualizar relatórios e métricas</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Atividades Recentes
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Novo risco identificado: Falha no sistema de backup
                </p>
                <p className="text-xs text-gray-500">Há 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Ação implementada: Atualização de políticas de segurança
                </p>
                <p className="text-xs text-gray-500">Há 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Relatório mensal de indicadores gerado
                </p>
                <p className="text-xs text-gray-500">Ontem</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}