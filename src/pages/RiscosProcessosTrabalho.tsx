import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AlertTriangle, Shield, TrendingUp, Users, Cog, FileText, Eye, Plus } from 'lucide-react';

interface RiscoProcesso {
  id: string;
  processo: string;
  risco: string;
  probabilidade: number;
  impacto: number;
  severidade: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  status: 'Identificado' | 'Em Análise' | 'Mitigado' | 'Monitorado';
  responsavel: string;
  prazo: string;
}

const RiscosProcessosTrabalho: React.FC = () => {
  const [filtroProcesso, setFiltroProcesso] = useState<string>('todos');
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todos');

  const riscosExemplo: RiscoProcesso[] = [
    {
      id: '1',
      processo: 'Gestão de Recursos Hídricos',
      risco: 'Falha no sistema de monitoramento hidrológico',
      probabilidade: 3,
      impacto: 4,
      severidade: 'Alto',
      status: 'Em Análise',
      responsavel: 'João Silva',
      prazo: '2024-03-15'
    },
    {
      id: '2',
      processo: 'Operação e Manutenção',
      risco: 'Indisponibilidade de equipamentos críticos',
      probabilidade: 2,
      impacto: 5,
      severidade: 'Alto',
      status: 'Identificado',
      responsavel: 'Maria Santos',
      prazo: '2024-02-28'
    },
    {
      id: '3',
      processo: 'Gestão de Pessoas',
      risco: 'Perda de conhecimento por aposentadoria',
      probabilidade: 4,
      impacto: 3,
      severidade: 'Alto',
      status: 'Mitigado',
      responsavel: 'Carlos Oliveira',
      prazo: '2024-04-10'
    },
    {
      id: '4',
      processo: 'Gestão Financeira',
      risco: 'Atraso na liberação de recursos orçamentários',
      probabilidade: 3,
      impacto: 3,
      severidade: 'Médio',
      status: 'Monitorado',
      responsavel: 'Ana Costa',
      prazo: '2024-03-30'
    }
  ];

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'Crítico': return 'bg-red-600 text-white';
      case 'Alto': return 'bg-red-500 text-white';
      case 'Médio': return 'bg-yellow-500 text-white';
      case 'Baixo': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado': return 'bg-blue-100 text-blue-800';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
      case 'Mitigado': return 'bg-green-100 text-green-800';
      case 'Monitorado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const processos = ['Gestão de Recursos Hídricos', 'Operação e Manutenção', 'Gestão de Pessoas', 'Gestão Financeira'];
  const severidades = ['Baixo', 'Médio', 'Alto', 'Crítico'];

  const riscosFiltrados = riscosExemplo.filter(risco => {
    const matchProcesso = filtroProcesso === 'todos' || risco.processo === filtroProcesso;
    const matchSeveridade = filtroSeveridade === 'todos' || risco.severidade === filtroSeveridade;
    return matchProcesso && matchSeveridade;
  });

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Riscos de Processos de Trabalho</h1>
                <p className="text-gray-600 mt-1">
                  Identificação, análise e monitoramento de riscos nos processos organizacionais
                </p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Risco
            </button>
          </div>
        </div>

        {/* Métricas Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Riscos</p>
                <p className="text-2xl font-bold text-gray-900">{riscosExemplo.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Riscos Altos/Críticos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riscosExemplo.filter(r => r.severidade === 'Alto' || r.severidade === 'Crítico').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riscosExemplo.filter(r => r.status === 'Em Análise').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mitigados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riscosExemplo.filter(r => r.status === 'Mitigado').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processo</label>
              <select 
                value={filtroProcesso} 
                onChange={(e) => setFiltroProcesso(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Processos</option>
                {processos.map(processo => (
                  <option key={processo} value={processo}>{processo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severidade</label>
              <select 
                value={filtroSeveridade} 
                onChange={(e) => setFiltroSeveridade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas as Severidades</option>
                {severidades.map(severidade => (
                  <option key={severidade} value={severidade}>{severidade}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Riscos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Riscos Identificados</h2>
            <p className="text-sm text-gray-600">
              {riscosFiltrados.length} risco{riscosFiltrados.length !== 1 ? 's' : ''} encontrado{riscosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição do Risco
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riscosFiltrados.map((risco) => (
                  <tr key={risco.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {risco.processo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {risco.risco}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{risco.probabilidade}/5</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(risco.probabilidade / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{risco.impacto}/5</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${(risco.impacto / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(risco.severidade)}`}>
                        {risco.severidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(risco.status)}`}>
                        {risco.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {risco.responsavel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(risco.prazo).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RiscosProcessosTrabalho;