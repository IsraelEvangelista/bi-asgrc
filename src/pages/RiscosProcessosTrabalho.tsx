import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AlertTriangle, Filter, Workflow, Users, TrendingUp, PieChart, Plus, Edit, Trash2, ChevronUp, ChevronDown, Settings, CheckCircle, FileText, Shield } from 'lucide-react';
import { useRiscosCards } from '../hooks/useRiscosCards';
import { useRiscosPorCategoria } from '../hooks/useRiscosPorCategoria';
import { useRiscosPorSituacao } from '../hooks/useRiscosPorSituacao';
import { useRiscosPorPlanoResposta } from '../hooks/useRiscosPorPlanoResposta';

const RiscosProcessosTrabalho: React.FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const { quantidadeProcessos, quantidadeRiscos, quantidadeAcoes, loading, error } = useRiscosCards();
  const { dados: dadosCategoria, total: totalCategoria, loading: loadingCategoria } = useRiscosPorCategoria();
  const { dados: dadosSituacao, total: totalSituacao, loading: loadingSituacao } = useRiscosPorSituacao();
  const { dados: dadosPlanoResposta, total: totalPlanoResposta, loading: loadingPlanoResposta } = useRiscosPorPlanoResposta();

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
                          
                          return dadosCategoria.map((item, index) => {
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
                            
                            return (
                              <path
                                key={item.nivel_risco}
                                d={pathData}
                                fill={coresPorNivel[item.nivel_risco] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className="drop-shadow-lg"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          let cumulativePercentage = 0;
                          
                          return dadosCategoria.map((item, index) => {
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
                          <p className="text-2xl font-bold text-gray-900">{totalCategoria}</p>
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
                ) : dadosCategoria.length > 0 ? (
                  dadosCategoria.map((item, index) => {
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
                  {!loadingSituacao && dadosSituacao.length > 0 ? (
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
                          if (dadosSituacao.length === 1) {
                            const item = dadosSituacao[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
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
                                  className="drop-shadow-lg"
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
                          
                          return dadosSituacao.map((item, index) => {
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
                            
                            return (
                              <path
                                key={item.situacao_risco}
                                d={pathData}
                                fill={coresPorSituacao[item.situacao_risco] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className="drop-shadow-lg"
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
                          
                          return dadosSituacao.map((item, index) => {
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
                          <p className="text-2xl font-bold text-gray-900">{totalSituacao}</p>
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
                ) : dadosSituacao.length > 0 ? (
                  dadosSituacao.map((item, index) => {
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
                  {!loadingPlanoResposta && dadosPlanoResposta.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          const coresPorPlano: { [key: string]: string } = {
                            'Aceitar': '#10B981',
                            'Mitigar': '#EAB308', 
                            'Transferir': '#84CC16',
                            'Evitar': '#059669',
                            'Monitorar': '#F59E0B',
                            'Reduzir': '#0D9488'
                          };
                          
                          // Se há apenas um item (100%), renderizar um círculo completo
                          if (dadosPlanoResposta.length === 1) {
                            const item = dadosPlanoResposta[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            return (
                              <g key={item.plano_resposta_risco}>
                                {/* Círculo externo */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={coresPorPlano[item.plano_resposta_risco] || '#10B981'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className="drop-shadow-lg"
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
                          
                          return dadosPlanoResposta.map((item, index) => {
                            const percentage = (item.total_acoes / totalPlanoResposta) * 100;
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
                            
                            return (
                              <path
                                key={item.plano_resposta_risco}
                                d={pathData}
                                fill={coresPorPlano[item.plano_resposta_risco] || '#10B981'}
                                stroke="white"
                                strokeWidth="2"
                                className="drop-shadow-lg"
                              />
                            );
                          });
                        })()
                        }
                        
                        {/* Rótulos percentuais externos às seções */}
                        {(() => {
                          // Para um único item, posicionar o rótulo no topo
                          if (dadosPlanoResposta.length === 1) {
                            const item = dadosPlanoResposta[0];
                            const percentage = (item.total_acoes / totalPlanoResposta) * 100;
                            return (
                              <text
                                key={`label-${item.plano_resposta_risco}`}
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
                          
                          return dadosPlanoResposta.map((item, index) => {
                            const percentage = (item.total_acoes / totalPlanoResposta) * 100;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
                            
                            const labelRadius = 125;
                            const labelX = 140 + labelRadius * Math.cos(midAngleRad);
                            const labelY = 140 + labelRadius * Math.sin(midAngleRad);
                            
                            cumulativePercentage += percentage;
                            
                            return (
                              <text
                                key={`label-${item.plano_resposta_risco}`}
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
                          <p className="text-2xl font-bold text-gray-900">{totalPlanoResposta}</p>
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
                {loadingPlanoResposta ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : dadosPlanoResposta.length > 0 ? (
                  dadosPlanoResposta.map((item, index) => {
                    const coresPorPlano: { [key: string]: string } = {
                      'Aceitar': '#10B981',
                      'Mitigar': '#EAB308', 
                      'Transferir': '#84CC16',
                      'Evitar': '#059669',
                      'Monitorar': '#F59E0B',
                      'Reduzir': '#0D9488'
                    };
                    const corClasse = coresPorPlano[item.plano_resposta_risco] || '#10B981';
                    const percentage = Math.round((item.total_acoes / totalPlanoResposta) * 100);
                    
                    return (
                      <div key={item.plano_resposta_risco} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 ${corClasse} rounded-full shadow-sm`}></div>
                          <span className="text-sm text-gray-700">{item.plano_resposta_risco}</span>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Risco</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Categoria</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Setor</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Probabilidade</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Impacto</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Nível</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors duration-200">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ChevronUp className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors duration-200 transform hover:scale-[1.01] hover:shadow-md">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Falha em Equipamento</div>
                    <div className="text-sm text-gray-500">Parada não programada</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 shadow-sm">
                      Operacional
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Produção</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Alta</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Crítico</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 shadow-sm">
                      Crítico
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 shadow-sm">
                      Em Análise
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transform hover:scale-110 transition-transform duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-transform duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors duration-200 transform hover:scale-[1.01] hover:shadow-md">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Atraso na Entrega</div>
                    <div className="text-sm text-gray-500">Fornecedor externo</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 shadow-sm">
                      Logístico
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Logística</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Média</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Moderado</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 shadow-sm">
                      Moderado
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 shadow-sm">
                      Monitorado
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transform hover:scale-110 transition-transform duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-transform duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors duration-200 transform hover:scale-[1.01] hover:shadow-md">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Não Conformidade</div>
                    <div className="text-sm text-gray-500">Auditoria interna</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm">
                      Compliance
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Administrativo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Baixa</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Baixo</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm">
                      Baixo
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm">
                      Controlado
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transform hover:scale-110 transition-transform duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 transform hover:scale-110 transition-transform duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RiscosProcessosTrabalho;