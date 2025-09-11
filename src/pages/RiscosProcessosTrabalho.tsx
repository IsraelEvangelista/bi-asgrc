import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AlertTriangle, Filter, Workflow, Users, TrendingUp, PieChart, Plus, Edit, Trash2, ChevronUp, ChevronDown, Settings, CheckCircle, FileText, Shield } from 'lucide-react';

import { useRiscosCards } from '../hooks/useRiscosCards';
import { useRiscosPorCategoria } from '../hooks/useRiscosPorCategoria';
import { useRiscosPorSituacao } from '../hooks/useRiscosPorSituacao';
import { useRiscosPorPlanoResposta } from '../hooks/useRiscosPorPlanoResposta';
import { useRiscosPorStatusAcao } from '../hooks/useRiscosPorStatusAcao';
import { useRiscosProcessosTrabalhoData } from '../hooks/useRiscosProcessosTrabalhoData';

// Componente interno que usa o contexto de filtros
const RiscosProcessosTrabalhoContent: React.FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Dados simulados para os gráficos
  const dadosNivelRiscoOriginal = [
    { label: 'Alto', value: 15, color: '#ef4444' },
    { label: 'Médio', value: 25, color: '#f59e0b' },
    { label: 'Baixo', value: 10, color: '#10b981' }
  ];

  const dadosSituacaoRiscoOriginal = [
    { label: 'Identificado', value: 20, color: '#3b82f6' },
    { label: 'Em Análise', value: 15, color: '#f59e0b' },
    { label: 'Tratado', value: 15, color: '#10b981' }
  ];

  const dadosPlanoRespostaOriginal = [
    { label: 'Aceitar', value: 8, color: '#10b981' },
    { label: 'Mitigar', value: 30, color: '#f59e0b' },
    { label: 'Transferir', value: 7, color: '#3b82f6' },
    { label: 'Evitar', value: 5, color: '#ef4444' }
  ];

  // Aplicar filtragem cruzada nos dados dos gráficos
  const dadosNivelRisco = dadosNivelRiscoOriginal;
  const dadosSituacaoRisco = dadosSituacaoRiscoOriginal;
  const { quantidadeProcessos, quantidadeRiscos, quantidadeAcoes, loading, error } = useRiscosCards();

  // Função para lidar com cliques fora dos elementos interativos
  const handleContainerClick = (e: React.MouseEvent) => {
    // Verificar se o clique foi em um elemento interativo (gráfico ou tabela)
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('[data-interactive="true"]') || 
                                target.closest('path') || 
                                target.closest('tr[data-interactive="true"]');
    
    // Se não foi em um elemento interativo e há filtro ativo, limpar filtro
    if (!isInteractiveElement && false) {
      // clearFilter();
    }
  };
  const { dados: dadosCategoria, total: totalCategoria, loading: loadingCategoria } = useRiscosPorCategoria();
  const { dados: dadosSituacao, total: totalSituacao, loading: loadingSituacao } = useRiscosPorSituacao();
  const { dados: dadosPlanoResposta, total: totalPlanoResposta, loading: loadingPlanoResposta } = useRiscosPorPlanoResposta();
  const { dados: dadosStatusAcao, total: totalStatusAcao, loading: loadingStatusAcao } = useRiscosPorStatusAcao();
  const { dados: dadosTabela, loading: loadingTabela, error: errorTabela } = useRiscosProcessosTrabalhoData();
  
  // Aplicar filtragem nos dados após sua declaração
  const dadosStatusAcaoFiltrados = dadosStatusAcao;
  const dadosCategoriaFiltrados = dadosCategoria;
  const dadosSituacaoFiltrados = dadosSituacao;
  const dadosPlanoRespostaFiltrados = dadosPlanoResposta;

  return (
    <Layout>
      <div 
        className="p-6 space-y-8"
        onClick={handleContainerClick}
      >
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
            <button 
              onClick={() => setFilterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {/* Linha 2 - 4 colunas iguais */}
        <div className="grid grid-cols-4 gap-6">
          {/* Coluna 1 - 3 cards verticais */}
          <div className="h-full flex flex-col justify-between space-y-3">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative z-10 flex-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110">
                    <Workflow className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quantidade de Processos Estruturados</h3>
                    <p className="text-2xl font-bold text-blue-600">{loading ? '...' : quantidadeProcessos}</p>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative z-10 flex-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quantidade de Riscos de Trabalho</h3>
                    <p className="text-2xl font-bold text-blue-600">{loading ? '...' : quantidadeRiscos}</p>
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative z-10 flex-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quantidade de Ações de Controle</h3>
                    <p className="text-2xl font-bold text-blue-600">{loading ? '...' : quantidadeAcoes}</p>
                  </div>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
                </div>
            </div>
          </div>

          {/* Coluna 2 - Gráfico de pizza 1 */}
          <div className="relative z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nível do Risco Inerente</h3>
              <div className="flex items-center justify-center h-64 overflow-visible">
                <div className="relative w-72 h-72 overflow-visible">
                  {!loadingCategoria && dadosCategoria.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          let cumulativePercentage = 0;
                          const coresPorNivel: { [key: string]: string } = {
                            'Muito Alto': '#FF6961',
                            'Alto': '#FFA500', 
                            'Moderado': '#FFD700',
                            'Baixo': '#77DD77'
                          };
                          
                          return dadosCategoriaFiltrados.map((item, index) => {
                            const percentage = item.percentual;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
                            
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            
                            // Aumentando o raio para restaurar a espessura original
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const x1Outer = 140 + outerRadius * Math.cos(startAngleRad);
                            const y1Outer = 140 + outerRadius * Math.sin(startAngleRad);
                            const x2Outer = 140 + outerRadius * Math.cos(endAngleRad);
                            const y2Outer = 140 + outerRadius * Math.sin(endAngleRad);
                            
                            const x1Inner = 140 + innerRadius * Math.cos(startAngleRad);
                            const y1Inner = 140 + innerRadius * Math.sin(startAngleRad);
                            const x2Inner = 140 + innerRadius * Math.cos(endAngleRad);
                            const y2Inner = 140 + innerRadius * Math.sin(endAngleRad);
                            
                            const pathData = [
                              `M ${x1Inner} ${y1Inner}`,
                              `L ${x1Outer} ${y1Outer}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                              `L ${x2Inner} ${y2Inner}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
                              'Z'
                            ].join(' ');
                            
                            cumulativePercentage += percentage;
                            
                            const isCurrentFiltered = false;
                            const isOtherFiltered = false;
                            
                            return (
                              <path
                                key={item.nivel_risco}
                                d={pathData}
                                fill={coresPorNivel[item.nivel_risco] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                  isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                } hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // toggleFilter('chart', 'nivel_risco', item.nivel_risco, 'grafico-nivel-risco');
                                }}
                                data-interactive="true"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          let cumulativePercentage = 0;
                          
                          return dadosCategoriaFiltrados.map((item, index) => {
                            const percentage = item.percentual;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                            
                            // Posição externa às seções (sem linhas de conexão)
                            const labelRadius = 125;
                            const labelX = 140 + labelRadius * Math.cos(midAngleRad);
                            const labelY = 140 + labelRadius * Math.sin(midAngleRad);
                            
                            cumulativePercentage += percentage;
                            
                            return (
                              <text
                                key={`label-${item.nivel_risco}`}
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {percentage}%
                              </text>
                            );
                          });
                        })()
                        }
                      </svg>
                      
                      {/* Centro com somatório */}
                      <div className="absolute" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'white', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15}}>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{dadosCategoriaFiltrados.reduce((acc, item) => acc + item.quantidade, 0)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loadingCategoria ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : dadosCategoriaFiltrados.length > 0 ? (
                  dadosCategoriaFiltrados.map((item, index) => {
                    // Cores específicas por nível de risco
                    const coresPorNivel: { [key: string]: string } = {
                      'Muito Alto': '#FF6961',
                      'Alto': '#FFA500',
                      'Moderado': '#FFD700',
                      'Baixo': '#77DD77'
                    };
                    const corClasse = coresPorNivel[item.nivel_risco] || '#FF6961';
                    
                    return (
                      <div key={item.nivel_risco} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: corClasse}}></div>
                          <span className="text-sm text-gray-700">{item.nivel_risco}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.quantidade} ({item.percentual}%)</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                )}
              </div>
            </div>

          {/* Coluna 3 - Gráfico de pizza 2 */}
          <div className="relative z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Situação do Risco</h3>
              <div className="flex items-center justify-center h-64 overflow-visible">
                <div className="relative w-72 h-72 overflow-visible">
                  {!loadingSituacao && dadosSituacaoFiltrados.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          const coresPorSituacao: { [key: string]: string } = {
                            'Em Análise': '#1E40AF',
                            'Aprovado': '#3B82F6', 
                            'Rejeitado': '#60A5FA',
                            'Pendente': '#93C5FD',
                            'Controlado': '#DBEAFE',
                            'Avaliado': '#1E3A8A'
                          };
                          
                          // Se há apenas um item (100%), renderizar um círculo completo
                          if (dadosSituacaoFiltrados.length === 1) {
                            const item = dadosSituacaoFiltrados[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const isCurrentFiltered = false;
                            const isOtherFiltered = false;
                            
                            return (
                              <g key={item.situacao_risco}>
                                {/* Círculo externo */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={coresPorSituacao[item.situacao_risco] || '#3B82F6'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                    isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                  } hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // toggleFilter('chart', 'situacao_risco', item.situacao_risco, 'grafico-situacao-risco');
                                  }}
                                  data-interactive="true"
                                />
                                {/* Círculo interno (buraco) */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={innerRadius}
                                  fill="white"
                                />
                              </g>
                            );
                          }
                          
                          // Para múltiplos itens, usar a lógica original
                          let cumulativePercentage = 0;
                          
                          return dadosSituacaoFiltrados.map((item, index) => {
                            const percentage = item.percentual;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
                            
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const x1Outer = 140 + outerRadius * Math.cos(startAngleRad);
                            const y1Outer = 140 + outerRadius * Math.sin(startAngleRad);
                            const x2Outer = 140 + outerRadius * Math.cos(endAngleRad);
                            const y2Outer = 140 + outerRadius * Math.sin(endAngleRad);
                            
                            const x1Inner = 140 + innerRadius * Math.cos(startAngleRad);
                            const y1Inner = 140 + innerRadius * Math.sin(startAngleRad);
                            const x2Inner = 140 + innerRadius * Math.cos(endAngleRad);
                            const y2Inner = 140 + innerRadius * Math.sin(endAngleRad);
                            
                            const pathData = [
                              `M ${x1Inner} ${y1Inner}`,
                              `L ${x1Outer} ${y1Outer}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                              `L ${x2Inner} ${y2Inner}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
                              'Z'
                            ].join(' ');
                            
                            cumulativePercentage += percentage;
                            
                            const isCurrentFiltered = false;
                            const isOtherFiltered = false;
                            
                            return (
                              <path
                                key={item.situacao_risco}
                                d={pathData}
                                fill={coresPorSituacao[item.situacao_risco] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                  isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                } hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // toggleFilter('chart', 'situacao_risco', item.situacao_risco, 'grafico-situacao-risco');
                                }}
                                data-interactive="true"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          // Para um único item, posicionar o rótulo no topo
                          if (dadosSituacao.length === 1) {
                            const item = dadosSituacao[0];
                            return (
                              <text
                                key={`label-${item.situacao_risco}`}
                                x="140"
                                y="15"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {item.percentual}%
                              </text>
                            );
                          }
                          
                          // Para múltiplos itens, usar a lógica original
                          let cumulativePercentage = 0;
                          
                          return dadosSituacaoFiltrados.map((item, index) => {
                            const percentage = item.percentual;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                            
                            const labelRadius = 125;
                            const labelX = 140 + labelRadius * Math.cos(midAngleRad);
                            const labelY = 140 + labelRadius * Math.sin(midAngleRad);
                            
                            cumulativePercentage += percentage;
                            
                            return (
                              <text
                                key={`label-${item.situacao_risco}`}
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {percentage}%
                              </text>
                            );
                          });
                        })()
                        }
                      </svg>
                      
                      {/* Centro com somatório */}
                      <div className="absolute" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'white', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15}}>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{dadosSituacaoFiltrados.reduce((acc, item) => acc + item.quantidade, 0)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loadingSituacao ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : dadosSituacaoFiltrados.length > 0 ? (
                  dadosSituacaoFiltrados.map((item, index) => {
                    const coresPorSituacao: { [key: string]: string } = {
                      'Em Análise': 'bg-blue-800',
                      'Aprovado': 'bg-blue-600', 
                      'Rejeitado': 'bg-blue-400',
                      'Pendente': 'bg-blue-300',
                      'Controlado': 'bg-blue-100',
                      'Avaliado': 'bg-blue-900'
                    };
                    const corClasse = coresPorSituacao[item.situacao_risco] || 'bg-gray-500';
                    
                    return (
                      <div key={item.situacao_risco} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 ${corClasse} rounded-full shadow-sm`}></div>
                          <span className="text-sm text-gray-700">{item.situacao_risco}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.quantidade} ({item.percentual}%)</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                )}
              </div>
            </div>

          {/* Coluna 4 - Gráfico de pizza 3 */}
          <div className="relative z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plano de Resposta do Risco</h3>
              <div className="flex items-center justify-center h-64 overflow-visible">
                <div className="relative w-72 h-72 overflow-visible">
                  {!loadingStatusAcao && dadosStatusAcaoFiltrados.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          const coresPorStatus: { [key: string]: string } = {
                            'Não iniciada': '#60A5FA',
                            'Concluído': '#10B981', 
                            'Em andamento': '#FDE047',
                            'Atrasado': '#EF4444'
                          };
                          
                          // Se há apenas um item (100%), renderizar um círculo completo
                          if (dadosStatusAcaoFiltrados.length === 1) {
                            const item = dadosStatusAcaoFiltrados[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const isCurrentFiltered = false;
                            const isOtherFiltered = false;
                            
                            return (
                              <g key={item.status_acao}>
                                {/* Círculo externo */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={coresPorStatus[item.status_acao] || '#60A5FA'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                    isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                  } hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // toggleFilter('chart', 'status_acao', item.status_acao, 'grafico-status-acao');
                                  }}
                                  data-interactive="true"
                                />
                                {/* Círculo interno (buraco) */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={innerRadius}
                                  fill="white"
                                />
                              </g>
                            );
                          }
                          
                          // Para múltiplos itens, usar a lógica original
                          let cumulativePercentage = 0;
                          
                          return dadosStatusAcaoFiltrados.map((item, index) => {
                            const totalFiltrado = dadosStatusAcaoFiltrados.reduce((acc, item) => acc + item.total_acoes, 0);
                            const percentage = totalFiltrado > 0 ? (item.total_acoes / totalFiltrado) * 100 : 0;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            
                            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
                            
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const x1Outer = 140 + outerRadius * Math.cos(startAngleRad);
                            const y1Outer = 140 + outerRadius * Math.sin(startAngleRad);
                            const x2Outer = 140 + outerRadius * Math.cos(endAngleRad);
                            const y2Outer = 140 + outerRadius * Math.sin(endAngleRad);
                            
                            const x1Inner = 140 + innerRadius * Math.cos(startAngleRad);
                            const y1Inner = 140 + innerRadius * Math.sin(startAngleRad);
                            const x2Inner = 140 + innerRadius * Math.cos(endAngleRad);
                            const y2Inner = 140 + innerRadius * Math.sin(endAngleRad);
                            
                            const pathData = [
                              `M ${x1Inner} ${y1Inner}`,
                              `L ${x1Outer} ${y1Outer}`,
                              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                              `L ${x2Inner} ${y2Inner}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
                              'Z'
                            ].join(' ');
                            
                            cumulativePercentage += percentage;
                            
                            const isCurrentFiltered = false;
                            const isOtherFiltered = false;
                            
                            return (
                              <path
                                key={item.status_acao}
                                d={pathData}
                                fill={coresPorStatus[item.status_acao] || '#60A5FA'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                  isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                } hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // toggleFilter('chart', 'status_acao', item.status_acao, 'grafico-status-acao');
                                }}
                                data-interactive="true"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          // Para um único item, posicionar o rótulo no topo
                          if (dadosStatusAcaoFiltrados.length === 1) {
                            const item = dadosStatusAcaoFiltrados[0];
                            const totalFiltrado = dadosStatusAcaoFiltrados.reduce((acc, item) => acc + item.total_acoes, 0);
                            const percentage = totalFiltrado > 0 ? (item.total_acoes / totalFiltrado) * 100 : 0;
                            return (
                              <text
                                key={`label-${item.status_acao}`}
                                x="140"
                                y="15"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {Math.round(percentage)}%
                              </text>
                            );
                          }
                          
                          // Para múltiplos itens, usar a lógica original
                          let cumulativePercentage = 0;
                          
                          return dadosStatusAcaoFiltrados.map((item, index) => {
                            const totalFiltrado = dadosStatusAcaoFiltrados.reduce((acc, item) => acc + item.total_acoes, 0);
                            const percentage = totalFiltrado > 0 ? (item.total_acoes / totalFiltrado) * 100 : 0;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                            
                            const labelRadius = 125;
                            const labelX = 140 + labelRadius * Math.cos(midAngleRad);
                            const labelY = 140 + labelRadius * Math.sin(midAngleRad);
                            
                            cumulativePercentage += percentage;
                            
                            return (
                              <text
                                key={`label-${item.status_acao}`}
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-xs font-bold"
                                fill="#000000"
                                style={{zIndex: 20, fontSize: '12px'}}
                              >
                                {Math.round(percentage)}%
                              </text>
                            );
                          });
                        })()
                        }
                      </svg>
                      
                      {/* Centro com somatório */}
                      <div className="absolute" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'white', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15}}>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{dadosStatusAcaoFiltrados.reduce((acc, item) => acc + item.total_acoes, 0)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loadingStatusAcao ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : dadosStatusAcaoFiltrados.length > 0 ? (
                  dadosStatusAcaoFiltrados.map((item, index) => {
                    const coresPorStatus: { [key: string]: string } = {
                      'Não iniciada': '#60A5FA',
                      'Concluído': '#10B981', 
                      'Em andamento': '#FDE047',
                      'Atrasado': '#EF4444'
                    };
                    const corClasse = coresPorStatus[item.status_acao] || '#60A5FA';
                    const percentage = totalStatusAcao > 0 ? Math.round((item.total_acoes / totalStatusAcao) * 100) : 0;
                    
                    return (
                      <div key={item.status_acao} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: corClasse}}></div>
                          <span className="text-sm text-gray-700">{item.status_acao}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.total_acoes} ({percentage}%)</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                )}
              </div>
            </div>




        </div>

        {/* Linha 3 - Tabela */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 relative z-10">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h3 className="text-lg font-semibold text-white">Detalhamento de Riscos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Processo</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Risco</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Ação</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Responsável pelo Risco</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Nível do Risco</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Nível do Risco Tratado</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span className="break-words">Resposta ao Risco</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingTabela ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Carregando dados...
                    </td>
                  </tr>
                ) : errorTabela ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-red-500">
                      Erro ao carregar dados: {errorTabela}
                    </td>
                  </tr>
                ) : dadosTabela && dadosTabela.length > 0 ? (
                  dadosTabela.map((item, index) => {
                    // Função para determinar a cor do badge baseado no nível de risco
                    const getCorNivelRisco = (nivel: string) => {
                      switch (nivel?.toLowerCase()) {
                        case 'muito alto':
                          return 'bg-red-100 text-red-800';
                        case 'alto':
                          return 'bg-orange-100 text-orange-800';
                        case 'moderado':
                        case 'médio':
                          return 'bg-yellow-100 text-yellow-800';
                        case 'baixo':
                          return 'bg-green-100 text-green-800';
                        default:
                          return 'bg-gray-100 text-gray-800';
                      }
                    };

                    // Encontrar o índice original do item na tabela completa
                    const originalIndex = dadosTabela.findIndex(originalItem => originalItem === item);
                    
                    // Verificar se esta linha está filtrada
                    const isCurrentRowFiltered = false;
                    const isOtherRowFiltered = false;
                    
                    return (
                      <tr 
                        key={index} 
                        className={`cursor-pointer transition-all duration-200 ${
                          isOtherRowFiltered ? 'opacity-50' : 'opacity-100'
                        } hover:bg-gray-50`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // toggleFilter('table', 'table_row', originalIndex.toString(), 'tabela-riscos');
                        }}
                        data-interactive="true"
                      >
                        <td className="px-3 py-2">
                          <div className="text-xs font-medium text-gray-900 break-words max-w-32">{item.processo || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs font-medium text-gray-900 break-words max-w-40">{item.risco || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs text-gray-900 break-words max-w-40">{item.acao || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs text-gray-900 break-words max-w-32">{item.responsavel_risco || 'N/A'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-1 py-1 inline-flex text-xs leading-4 font-semibold rounded-full shadow-sm ${getCorNivelRisco(item.nivel_risco)}`}>
                            {item.nivel_risco || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-1 py-1 inline-flex text-xs leading-4 font-semibold rounded-full shadow-sm ${getCorNivelRisco(item.nivel_risco_tratado)}`}>
                            {item.nivel_risco_tratado || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-xs text-gray-900 break-words max-w-32">{item.resposta_risco || 'N/A'}</div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-2 text-center text-gray-500 text-xs">
                      Nenhum dado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Componente principal
const RiscosProcessosTrabalho: React.FC = () => {
  return (
    <RiscosProcessosTrabalhoContent />
  );
};

export default RiscosProcessosTrabalho;