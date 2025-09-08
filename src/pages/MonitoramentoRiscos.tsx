import React from 'react';
import { Monitor, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Layout from '../components/Layout';

const MonitoramentoRiscos = () => {
  // Mock data para demonstração
  const indicadores = [
    {
      id: 1,
      nome: 'Índice de Liquidez',
      categoria: 'Risco de Liquidez',
      valorAtual: 1.25,
      valorAnterior: 1.18,
      limite: 1.0,
      status: 'Normal',
      tendencia: 'up',
      ultimaAtualizacao: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Taxa de Falhas Operacionais',
      categoria: 'Risco Operacional',
      valorAtual: 0.03,
      valorAnterior: 0.02,
      limite: 0.05,
      status: 'Atenção',
      tendencia: 'up',
      ultimaAtualizacao: '2024-01-15'
    },
    {
      id: 3,
      nome: 'Conformidade Regulatória',
      categoria: 'Risco Regulatório',
      valorAtual: 98.5,
      valorAnterior: 97.8,
      limite: 95.0,
      status: 'Normal',
      tendencia: 'up',
      ultimaAtualizacao: '2024-01-14'
    },
    {
      id: 4,
      nome: 'Exposição de Crédito',
      categoria: 'Risco de Crédito',
      valorAtual: 85.2,
      valorAnterior: 82.1,
      limite: 90.0,
      status: 'Crítico',
      tendencia: 'up',
      ultimaAtualizacao: '2024-01-15'
    }
  ];

  const alertas = [
    {
      id: 1,
      tipo: 'Crítico',
      mensagem: 'Exposição de Crédito próxima ao limite máximo',
      timestamp: '2024-01-15 14:30'
    },
    {
      id: 2,
      tipo: 'Atenção',
      mensagem: 'Aumento na Taxa de Falhas Operacionais',
      timestamp: '2024-01-15 10:15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Atenção':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Crítico':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Normal':
        return <CheckCircle className="h-4 w-4" />;
      case 'Atenção':
        return <Clock className="h-4 w-4" />;
      case 'Crítico':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    return tendencia === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const formatarValor = (valor: number, categoria: string) => {
    if (categoria.includes('Taxa') || categoria.includes('Conformidade')) {
      return `${valor.toFixed(2)}%`;
    }
    return valor.toFixed(2);
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Monitor className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Monitoramento de Riscos</h1>
          </div>

          {/* Alertas Recentes */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Alertas Recentes</h2>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div key={alerta.id} className={`p-4 rounded-lg border ${
                  alerta.tipo === 'Crítico' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alerta.tipo === 'Crítico' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          alerta.tipo === 'Crítico' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alerta.tipo}
                        </span>
                        <span className="text-sm text-gray-500">{alerta.timestamp}</span>
                      </div>
                      <p className="text-gray-900 mt-1">{alerta.mensagem}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de Risco */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Indicadores de Risco</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {indicadores.map((indicador) => (
                <div key={indicador.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{indicador.nome}</h3>
                      <p className="text-sm text-gray-600">{indicador.categoria}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(indicador.status)}`}>
                      {getStatusIcon(indicador.status)}
                      <span className="ml-1">{indicador.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valor Atual</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatarValor(indicador.valorAtual, indicador.categoria)}
                        </span>
                        {getTendenciaIcon(indicador.tendencia)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valor Anterior</span>
                      <span className="text-sm text-gray-900">
                        {formatarValor(indicador.valorAnterior, indicador.categoria)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Limite</span>
                      <span className="text-sm text-gray-900">
                        {formatarValor(indicador.limite, indicador.categoria)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Última Atualização</span>
                        <span className="text-xs text-gray-500">
                          {new Date(indicador.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso em relação ao limite */}
                    <div className="w-full">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            indicador.status === 'Crítico' 
                              ? 'bg-red-600' 
                              : indicador.status === 'Atenção'
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                          }`}
                          style={{ 
                            width: `${Math.min((indicador.valorAtual / indicador.limite) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Normal</p>
                  <p className="text-2xl font-bold text-green-900">2</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Atenção</p>
                  <p className="text-2xl font-bold text-yellow-900">1</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Crítico</p>
                  <p className="text-2xl font-bold text-red-900">1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MonitoramentoRiscos;