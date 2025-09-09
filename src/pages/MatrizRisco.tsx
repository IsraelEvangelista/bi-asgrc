import React from 'react';
import { AlertTriangle, Activity, TrendingUp, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Layout from '../components/Layout';

interface Risco {
  id: number;
  nome: string;
  categoria: string;
  probabilidade: number;
  impacto: number;
  nivel: 'Muito Baixo' | 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto';
  responsavel: string;
  natureza: string;
  classificacao: string;
  severidade: number;
}

const mockRiscos: Risco[] = [
  {
    id: 1,
    nome: 'Falha no sistema de backup',
    categoria: 'Tecnológico',
    probabilidade: 3,
    impacto: 5,
    nivel: 'Alto',
    responsavel: 'TI',
    natureza: 'Operacional',
    classificacao: 'Muito Alto',
    severidade: 25
  },
  {
    id: 2,
    nome: 'Perda de dados críticos',
    categoria: 'Operacional',
    probabilidade: 2,
    impacto: 5,
    nivel: 'Alto',
    responsavel: 'Segurança',
    natureza: 'Estratégico',
    classificacao: 'Muito Alto',
    severidade: 25
  },
  {
    id: 3,
    nome: 'Violação de compliance',
    categoria: 'Regulatório',
    probabilidade: 2,
    impacto: 4,
    nivel: 'Moderado',
    responsavel: 'Compliance',
    natureza: 'Financeiro',
    classificacao: 'Alto',
    severidade: 20
  },
  {
    id: 4,
    nome: 'Fraude financeira',
    categoria: 'Financeiro',
    probabilidade: 1,
    impacto: 5,
    nivel: 'Moderado',
    responsavel: 'Auditoria',
    natureza: 'Integridade',
    classificacao: 'Alto',
    severidade: 20
  },
  {
    id: 5,
    nome: 'Falha de comunicação',
    categoria: 'Operacional',
    probabilidade: 3,
    impacto: 2,
    nivel: 'Baixo',
    responsavel: 'Comunicação',
    natureza: 'Meio Ambiente',
    classificacao: 'Moderado',
    severidade: 15
  },
  {
    id: 6,
    nome: 'Risco de liquidez',
    categoria: 'Financeiro',
    probabilidade: 2,
    impacto: 3,
    nivel: 'Moderado',
    responsavel: 'Financeiro',
    natureza: 'Pessoal',
    classificacao: 'Moderado',
    severidade: 15
  }
];

const MatrizRisco = () => {
  const severidadeData = [
    { name: 'Muito Alto', value: 8, color: '#ef4444' },
    { name: 'Alto', value: 25, color: '#f97316' },
    { name: 'Moderado', value: 2, color: '#eab308' },
    { name: 'Baixo', value: 0, color: '#3b82f6' }
  ];

  const naturezaData = [
    { name: 'Operacional', value: 23, color: '#ef4444' },
    { name: 'Estratégico', value: 12, color: '#f97316' },
    { name: 'Financeiro', value: 8, color: '#eab308' },
    { name: 'Integridade', value: 6, color: '#06b6d4' },
    { name: 'Meio Ambiente', value: 4, color: '#84cc16' },
    { name: 'Pessoal', value: 3, color: '#8b5cf6' }
  ];

  const totalRiscos = mockRiscos.length;
  const mediaSeveridade = (mockRiscos.reduce((acc, risco) => acc + risco.severidade, 0) / totalRiscos).toFixed(2);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Matriz de Risco</h1>
            <p className="text-gray-600">Análise e visualização dos riscos organizacionais</p>
          </div>
        </div>

        {/* Grid Principal - 4 colunas e 3 linhas */}
        <div className="grid gap-6 mb-8" style={{gridTemplateColumns: '0.8fr 0.8fr 1fr 1.4fr'}}>
          {/* Linha 1, Coluna 1: Total de Riscos */}
          <div className="col-span-1 row-span-1">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total de Riscos</p>
                  <p className="text-4xl font-bold">{totalRiscos}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Linha 1, Coluna 2: Média de Severidade */}
          <div className="col-span-1 row-span-1">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Média de Severidade</p>
                  <p className="text-4xl font-bold">{mediaSeveridade}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Activity className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3, Linhas 1-2: Riscos por Severidade */}
          <div className="col-span-1 row-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Riscos por Severidade</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={severidadeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={75}
                    innerRadius={25}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severidadeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {severidadeData.map((item, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna 4, Linhas 1-2: Riscos por Natureza */}
          <div className="col-span-1 row-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Riscos por Natureza</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={naturezaData} layout="horizontal" margin={{ top: 20, right: 30, left: 90, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]}
                    fill="#3b82f6"
                  >
                    {naturezaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Linha 2, Colunas 1-2: Imagem */}
          <div className="col-span-2 row-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 border border-gray-200 flex items-center justify-center h-full">
              <img 
                src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757425775317.png" 
                alt="Sistema de Gestão de Riscos" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Linha 3: Matriz de Risco e Tabela de Eventos */}
        <div className="flex gap-6">
          {/* Matriz de Risco */}
          <div style={{flex: '1.6'}}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100" style={{minHeight: '500px'}}>
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Matriz de Risco</h3>
              
              <div className="flex items-center justify-center">
                <div className="flex items-start gap-2">
                  {/* Título IMPACTO */}
                  <div className="flex items-center" style={{height: '200px', width: '50px'}}>
                    <div className="transform -rotate-90 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-700">IMPACTO</span>
                    </div>
                  </div>

                  {/* Rótulos do eixo Y (IMPACTO) */}
                  <div className="flex flex-col items-end mr-2" style={{height: '200px'}}>
                    <div className="flex flex-col justify-between h-full">
                      {[5, 4, 3, 2, 1].map((value) => (
                        <div key={value} className="text-xs text-gray-600 text-right flex items-center justify-end" style={{ height: '50px' }}>
                          {value} - {value === 5 ? 'Muito Alta' : value === 4 ? 'Alta' : value === 3 ? 'Moderada' : value === 2 ? 'Baixa' : 'Muito Baixa'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matriz de risco */}
                  <div className="flex flex-col">
                    <div className="grid grid-cols-5 gap-1">
                      {/* Linhas da matriz (de 5 para 1, de cima para baixo) */}
                      {[5, 4, 3, 2, 1].map(impacto => (
                        <React.Fragment key={impacto}>
                          {/* Células da linha */}
                          {[1, 2, 3, 4, 5].map(probabilidade => {
                            const valor = probabilidade * impacto;
                            let bgColor = '';
                            let textColor = 'text-gray-800';
                            
                            if (valor >= 20) {
                              bgColor = 'bg-red-600';
                              textColor = 'text-white';
                            } else if (valor >= 15) {
                              bgColor = 'bg-red-500';
                              textColor = 'text-white';
                            } else if (valor >= 10) {
                              bgColor = 'bg-orange-500';
                              textColor = 'text-white';
                            } else if (valor >= 6) {
                              bgColor = 'bg-yellow-400';
                            } else if (valor >= 3) {
                              bgColor = 'bg-green-400';
                            } else {
                              bgColor = 'bg-green-300';
                            }
                            
                            return (
                              <div
                                key={probabilidade}
                                className={`${bgColor} ${textColor} text-center text-xs font-bold border border-gray-300 flex items-center justify-center rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200`}
                                style={{width: '80px', height: '50px'}}
                              >
                                {valor}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    {/* Rótulos do eixo X (PROBABILIDADE) */}
                    <div className="flex flex-col items-center">
                      <div className="grid grid-cols-5 gap-1 mt-2 text-xs font-medium text-gray-700">
                        <span className="text-center">1 - Muito Baixa</span>
                        <span className="text-center">2 - Baixa</span>
                        <span className="text-center">3 - Moderada</span>
                        <span className="text-center">4 - Alta</span>
                        <span className="text-center">5 - Muito Alta</span>
                      </div>
                      
                      <div className="text-center mt-4">
                        <span className="text-sm font-semibold text-gray-700">PROBABILIDADE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legenda horizontal conforme imagem */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-start gap-2">
                  {/* Espaçador para centralizar melhor */}
                  <div style={{width: '20px'}}></div>
                  
                  {/* Legenda expandida com efeito 3D */}
                  <div className="flex gap-0 text-sm" style={{width: '450px'}}>
                    <div className="flex items-center justify-center bg-red-600 text-white px-5 py-2 rounded-l flex-1 shadow-lg hover:shadow-xl transition-all duration-200" 
                         style={{
                           background: 'linear-gradient(145deg, #ef4444, #dc2626)', 
                           boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                         }}>
                      <span className="font-semibold drop-shadow-sm">Muito Alto</span>
                    </div>
                    <div className="flex items-center justify-center bg-orange-500 text-white px-5 py-2 flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                         style={{
                           background: 'linear-gradient(145deg, #f97316, #ea580c)', 
                           boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                         }}>
                      <span className="font-semibold drop-shadow-sm">Alto</span>
                    </div>
                    <div className="flex items-center justify-center bg-yellow-400 text-gray-800 px-5 py-2 flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                         style={{
                           background: 'linear-gradient(145deg, #eab308, #ca8a04)', 
                           boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                         }}>
                      <span className="font-semibold drop-shadow-sm">Moderado</span>
                    </div>
                    <div className="flex items-center justify-center bg-green-400 text-gray-800 px-5 py-2 rounded-r flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                         style={{
                           background: 'linear-gradient(145deg, #4ade80, #22c55e)', 
                           boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                         }}>
                      <span className="font-semibold drop-shadow-sm">Baixo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Evento de Risco */}
          <div style={{flex: '2.4'}}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" style={{minHeight: '500px'}}>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Tabela de Evento de Risco</h3>
              </div>
              
              <div className="overflow-x-auto" style={{maxHeight: '400px'}}>
                <table className="min-w-full">
                  <thead className="bg-blue-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
                        Evento de Risco
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
                        Classificação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
                        Severidade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {mockRiscos.map((risco, index) => (
                      <tr 
                        key={risco.id} 
                        className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">R{risco.id.toString().padStart(2, '0')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 font-medium">{risco.nome}</div>
                          <div className="text-xs text-gray-500">{risco.categoria}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full text-white shadow-sm ${
                            risco.classificacao === 'Muito Alto' ? 'bg-red-600' :
                            risco.classificacao === 'Alto' ? 'bg-orange-500' :
                            risco.classificacao === 'Moderado' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}>
                            {risco.classificacao}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{risco.severidade}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatrizRisco;