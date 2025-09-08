import React from 'react';
import { Briefcase, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

const PortfolioAcoes = () => {
  // Mock data para demonstração
  const acoes = [
    {
      id: 1,
      titulo: 'Implementação de Controles de Liquidez',
      descricao: 'Desenvolver e implementar controles adicionais para monitoramento de liquidez',
      risco: 'Risco de Liquidez',
      responsavel: 'João Silva',
      prazo: '2024-03-15',
      status: 'Em Andamento',
      progresso: 65
    },
    {
      id: 2,
      titulo: 'Revisão de Processos Operacionais',
      descricao: 'Análise e otimização dos processos operacionais críticos',
      risco: 'Risco Operacional',
      responsavel: 'Maria Santos',
      prazo: '2024-02-28',
      status: 'Concluída',
      progresso: 100
    },
    {
      id: 3,
      titulo: 'Atualização de Compliance Regulatório',
      descricao: 'Adequação às novas regulamentações do setor',
      risco: 'Risco Regulatório',
      responsavel: 'Carlos Oliveira',
      prazo: '2024-04-30',
      status: 'Planejada',
      progresso: 15
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planejada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Atrasada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída':
        return <CheckCircle className="h-4 w-4" />;
      case 'Em Andamento':
        return <Clock className="h-4 w-4" />;
      case 'Planejada':
        return <Calendar className="h-4 w-4" />;
      case 'Atrasada':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Portfólio de Ações</h1>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-900">1</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-900">1</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Planejadas</p>
                  <p className="text-2xl font-bold text-yellow-900">1</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Ações */}
          <div className="space-y-4">
            {acoes.map((acao) => (
              <div key={acao.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{acao.titulo}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(acao.status)}`}>
                        {getStatusIcon(acao.status)}
                        <span className="ml-1">{acao.status}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{acao.descricao}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Risco:</span> {acao.risco}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Responsável:</span> {acao.responsavel}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Prazo:</span> {new Date(acao.prazo).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progresso</span>
                        <span className="text-sm text-gray-600">{acao.progresso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            acao.progresso === 100 
                              ? 'bg-green-600' 
                              : acao.progresso >= 50 
                                ? 'bg-blue-600' 
                                : 'bg-yellow-600'
                          }`}
                          style={{ width: `${acao.progresso}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo por Status */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo por Status</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Distribuição de Ações</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Concluídas</span>
                      <span className="text-sm font-medium text-green-600">33.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Em Andamento</span>
                      <span className="text-sm font-medium text-blue-600">33.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Planejadas</span>
                      <span className="text-sm font-medium text-yellow-600">33.3%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Progresso Médio</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Geral</span>
                      <span className="text-sm font-medium text-gray-900">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PortfolioAcoes;