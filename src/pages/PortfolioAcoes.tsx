import React, { useState } from 'react';
import { Briefcase, TrendingUp, Shield, Activity, ChevronRight, ChevronDown, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Layout from '../components/Layout';

// Dados mock seguindo padrão das outras interfaces
const mockData = {
  totalAcoes: 47,
  totalRiscos: 128,
  mediaSeveridade: 14.6,
  severidadeData: [
    { name: 'Muito Alto', value: 12, color: '#ef4444' },
    { name: 'Alto', value: 18, color: '#f97316' },
    { name: 'Moderado', value: 25, color: '#eab308' },
    { name: 'Baixo', value: 34, color: '#22c55e' }
  ],
  acoesSeveridade: [
    { id: 1, acao: 'Implementação de Controles de Liquidez', responsavel: 'João Silva', severidade: 18, status: 'Em Andamento', prazo: '2024-03-15', progresso: 65, risco: 'Risco de Liquidez' },
    { id: 2, acao: 'Revisão de Processos Operacionais', responsavel: 'Maria Santos', severidade: 22, status: 'Concluída', prazo: '2024-02-28', progresso: 100, risco: 'Risco Operacional' },
    { id: 3, acao: 'Atualização de Compliance Regulatório', responsavel: 'Carlos Oliveira', severidade: 8, status: 'Planejada', prazo: '2024-04-30', progresso: 15, risco: 'Risco Regulatório' },
    { id: 4, acao: 'Monitoramento de Crédito', responsavel: 'Ana Costa', severidade: 16, status: 'Em Andamento', prazo: '2024-03-20', progresso: 45, risco: 'Risco de Crédito' },
    { id: 5, acao: 'Segurança da Informação', responsavel: 'Pedro Lima', severidade: 19, status: 'Em Andamento', prazo: '2024-05-10', progresso: 30, risco: 'Risco Operacional' }
  ],
  hierarquiaData: [
    {
      id: 'nivel1-1',
      nome: 'Gerência de Riscos',
      nivel: 1,
      severidade: 18.4,
      totalAcoes: 15,
      expandido: false,
      children: [
        {
          id: 'nivel2-1',
          nome: 'Riscos de Mercado',
          nivel: 2,
          severidade: 20.1,
          totalAcoes: 8,
          expandido: false,
          children: [
            { id: 'nivel3-1', nome: 'Risco de Taxa de Juros', nivel: 3, severidade: 22.5, totalAcoes: 3, expandido: false, children: [] },
            { id: 'nivel3-2', nome: 'Risco de Câmbio', nivel: 3, severidade: 17.8, totalAcoes: 5, expandido: false, children: [] }
          ]
        },
        {
          id: 'nivel2-2',
          nome: 'Riscos Operacionais',
          nivel: 2,
          severidade: 16.2,
          totalAcoes: 7,
          expandido: false,
          children: [
            { id: 'nivel3-3', nome: 'Processos Internos', nivel: 3, severidade: 15.1, totalAcoes: 4, expandido: false, children: [] },
            { id: 'nivel3-4', nome: 'Tecnologia da Informação', nivel: 3, severidade: 18.3, totalAcoes: 3, expandido: false, children: [] }
          ]
        }
      ]
    },
    {
      id: 'nivel1-2',
      nome: 'Gerência de Compliance',
      nivel: 1,
      severidade: 12.7,
      totalAcoes: 12,
      expandido: false,
      children: [
        {
          id: 'nivel2-3',
          nome: 'Conformidade Regulatória',
          nivel: 2,
          severidade: 14.2,
          totalAcoes: 7,
          expandido: false,
          children: [
            { id: 'nivel3-5', nome: 'BACEN', nivel: 3, severidade: 16.1, totalAcoes: 4, expandido: false, children: [] },
            { id: 'nivel3-6', nome: 'CVM', nivel: 3, severidade: 12.3, totalAcoes: 3, expandido: false, children: [] }
          ]
        }
      ]
    }
  ]
};

interface HierarchyNode {
  id: string;
  nome: string;
  nivel: number;
  severidade: number;
  totalAcoes: number;
  expandido: boolean;
  children: HierarchyNode[];
}

const PortfolioAcoes = () => {
  const [activeTab, setActiveTab] = useState<'severidade' | 'hierarquia'>('severidade');
  const [hierarquiaData, setHierarquiaData] = useState<HierarchyNode[]>(mockData.hierarquiaData);

  // Função para calcular classificação de severidade
  const calcularSeveridadePorValor = (severidade: number): string => {
    if (severidade >= 20) return 'Muito Alto';
    if (severidade >= 10 && severidade < 20) return 'Alto';
    if (severidade >= 5 && severidade < 10) return 'Moderado';
    return 'Baixo';
  };

  // Função para obter cor da severidade
  const getSeveridadeColor = (severidade: number): string => {
    if (severidade >= 20) return 'text-red-600 bg-red-50 border-red-200';
    if (severidade >= 10) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (severidade >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Função para expandir/colapsar nós da árvore hierárquica
  const toggleHierarchyNode = (nodeId: string, nodes: HierarchyNode[]): HierarchyNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, expandido: !node.expandido };
      } else if (node.children.length > 0) {
        return { ...node, children: toggleHierarchyNode(nodeId, node.children) };
      }
      return node;
    });
  };

  const handleToggleNode = (nodeId: string) => {
    setHierarquiaData(prevData => toggleHierarchyNode(nodeId, prevData));
  };

  // Componente para renderizar nó da árvore hierárquica
  const HierarchyNode: React.FC<{ node: HierarchyNode; level: number }> = ({ node, level }) => (
    <div className={`${level > 1 ? 'ml-6' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
          level === 1 ? 'border-blue-300 bg-blue-25' : level === 2 ? 'border-green-300 bg-green-25' : 'border-gray-300'
        }`}
        onClick={() => handleToggleNode(node.id)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {node.children.length > 0 ? (
              node.expandido ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
          <span className={`font-medium ${level === 1 ? 'text-lg text-blue-800' : level === 2 ? 'text-base text-green-700' : 'text-sm text-gray-700'}`}>
            {node.nome}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSeveridadeColor(node.severidade)}`}>
            Severidade: {node.severidade.toFixed(1)}
          </span>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {node.totalAcoes} ações
          </span>
        </div>
      </div>
      {node.expandido && node.children.map(child => (
        <HierarchyNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Portfólio de Ações</h1>
          </div>
        </div>

        {/* Linha 1: Cards Centralizados */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* Total de Ações */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Ações</p>
                  <p className="text-3xl font-bold mt-1">{mockData.totalAcoes}</p>
                </div>
                <div className="bg-blue-400/30 p-3 rounded-full">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-100 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% vs mês anterior
              </div>
            </div>

            {/* Total de Riscos */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total de Riscos</p>
                  <p className="text-3xl font-bold mt-1">{mockData.totalRiscos}</p>
                </div>
                <div className="bg-red-400/30 p-3 rounded-full">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-red-100 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5% vs mês anterior
              </div>
            </div>

            {/* Média de Severidade */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Média de Severidade</p>
                  <p className="text-3xl font-bold mt-1">{mockData.mediaSeveridade.toFixed(1)}</p>
                </div>
                <div className="bg-orange-400/30 p-3 rounded-full">
                  <BarChart3 className="w-8 h-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-orange-100 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Nível Alto
              </div>
            </div>
          </div>
        </div>

        {/* Linha 2: Gráfico de Barras Verticais - Diagrama de Severidade */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Diagrama de Severidade</h2>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockData.severidadeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                >
                  {mockData.severidadeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Linha 3: Sistema de Abas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {/* Header das Abas */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 pt-4">
              <button
                onClick={() => setActiveTab('severidade')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'severidade'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Severidade da Ação
              </button>
              <button
                onClick={() => setActiveTab('hierarquia')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'hierarquia'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Severidade por Hierarquia
              </button>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {activeTab === 'severidade' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Severidade da Ação</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider" style={{ width: '75%' }}>
                          Detalhes da Ação
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider" style={{ width: '25%' }}>
                          Severidade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockData.acoesSeveridade.map((acao, index) => (
                        <tr key={acao.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200`}>
                          <td className="px-6 py-4" style={{ width: '75%' }}>
                            <div className="space-y-2">
                              <div className="font-medium text-gray-900">{acao.acao}</div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span><strong>Responsável:</strong> {acao.responsavel}</span>
                                <span><strong>Status:</strong> {acao.status}</span>
                                <span><strong>Progresso:</strong> {acao.progresso}%</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <strong>Risco:</strong> {acao.risco} | <strong>Prazo:</strong> {new Date(acao.prazo).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center" style={{ width: '25%' }}>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeveridadeColor(acao.severidade)}`}>
                              {acao.severidade.toFixed(1)} - {calcularSeveridadePorValor(acao.severidade)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'hierarquia' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Severidade por Hierarquia</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-1">
                    {hierarquiaData.map(node => (
                      <HierarchyNode key={node.id} node={node} level={1} />
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Instruções:</strong> Clique nos itens para expandir a hierarquia e visualizar os detalhes de cada nível organizacional.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PortfolioAcoes;