import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, ChevronUp, ChevronDown, Loader2, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Filter, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import Layout from '../components/Layout';
import { useMatrizRiscos } from '../hooks/useMatrizRiscos';
import { useRiscosPorNatureza } from '../hooks/useRiscosPorNatureza';
import { useFilter } from '../contexts/FilterContext';
import { supabase } from '../lib/supabase';
import MatrizRiscoFilterModal from '../components/MatrizRiscoFilterModal';

interface RiscoData {
  id: string;
  eventos_riscos: string;
  probabilidade: number;
  impacto: number;
  severidade: number;
  responsavel_risco: string | null;
  sigla: string | null;
  demais_responsaveis: string | null;
  created_at: string;
  updated_at: string;
}

interface AreaGerencia {
  id: string;
  sigla_area: string;
}

type SortField = 'sigla' | 'eventos_riscos' | 'severidade';
type SortDirection = 'asc' | 'desc';
type TabType = 'severidade' | 'responsaveis';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}



const MatrizRisco = () => {
  const { 
    totalRiscos, 
    mediaSeveridade, 
    coordenadas, 
    severidadeData,
    riscosCompletos,
    loading, 
    error 
  } = useMatrizRiscos();

  const { 
    riscosPorNatureza, 
    loading: loadingNatureza, 
    error: errorNatureza 
  } = useRiscosPorNatureza();

  const { 
    filtroSeveridade, 
    filtroQuadrante, 
    filtroNatureza, 
    segmentoSelecionado,
    secaoBarraSelecionada,
    setFiltroSeveridade, 
    setFiltroQuadrante, 
    setFiltroNatureza,
    setSegmentoSelecionado,
    setSecaoBarraSelecionada
  } = useFilter();

  // Estados para ordenação e abas
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'severidade', direction: 'desc' });
  const [activeTab, setActiveTab] = useState<TabType>('severidade');
  const [areasGerencias, setAreasGerencias] = useState<AreaGerencia[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroSeveridade(null);
    setFiltroQuadrante(null);
    setFiltroNatureza(null);
    setSegmentoSelecionado(null);
    setSecaoBarraSelecionada(null);
  };

  // Buscar áreas/gerências
  useEffect(() => {
    const fetchAreasGerencias = async () => {
      try {
        const { data, error } = await supabase
          .from('003_areas_gerencias')
          .select('id, sigla_area');
        
        if (error) {
          console.error('Erro ao buscar áreas/gerências:', error);
          return;
        }
        
        setAreasGerencias(data || []);
      } catch (err) {
        console.error('Erro ao buscar áreas/gerências:', err);
      }
    };
    
    fetchAreasGerencias();
  }, []);

  // Função para obter contagem de riscos por coordenada (considerando filtros)
  const getRiscoCount = (probabilidade: number, impacto: number): number => {
    return riscosFiltrados.filter(risco => 
      risco.probabilidade === probabilidade && risco.impacto === impacto
    ).length;
  };

  // Função para calcular severidade baseada no valor numérico
  const calcularSeveridadePorValor = (severidade: number): string => {
    if (severidade >= 20) {
      return 'Muito Alto';
    }
    
    if (severidade >= 10 && severidade < 20) {
      return 'Alto';
    }
    
    if (severidade >= 5 && severidade < 10) {
      return 'Moderado';
    }
    
    // severidade <= 4
    return 'Baixo';
  };

  // Função para filtrar riscos por quadrante
  const filtrarPorQuadrante = (riscos: any[], quadrante: string | null) => {
    if (!quadrante) return riscos;
    
    return riscos.filter(risco => {
      if (!risco.probabilidade || !risco.impacto) return false;
      
      const prob = risco.probabilidade;
      const imp = risco.impacto;
      
      switch (quadrante) {
        case 'Baixo Risco':
          return prob <= 2 && imp <= 2;
        case 'Risco Moderado':
          return (prob <= 2 && imp >= 3) || (prob >= 3 && imp <= 2);
        case 'Alto Risco':
          return prob >= 3 && imp >= 3;
        default:
          return true;
      }
    });
  };

  // Filtrar dados reais baseado no filtro de severidade, quadrante e natureza
  const riscosFiltrados = React.useMemo(() => {
    console.log('🔍 FILTRANDO RISCOS COMPLETOS:', {
      total: riscosCompletos.length,
      filtroSeveridade,
      filtroQuadrante,
      filtroNatureza
    });
    
    let filtered = riscosCompletos;
    
    // Filtro por severidade
    if (filtroSeveridade) {
      const antesCount = filtered.length;
      filtered = filtered.filter(risco => {
        const severidadeCalculada = calcularSeveridadePorValor(risco.severidade);
        const match = severidadeCalculada === filtroSeveridade;
        return match;
      });
      console.log(`🎯 Filtro Severidade (${filtroSeveridade}): ${antesCount} → ${filtered.length} riscos`);
    }
    
    // Filtro por quadrante
    if (filtroQuadrante) {
      const antesCount = filtered.length;
      filtered = filtered.filter(risco => 
        risco.impacto === filtroQuadrante.impacto && 
        risco.probabilidade === filtroQuadrante.probabilidade
      );
      console.log(`🎯 Filtro Quadrante: ${antesCount} → ${filtered.length} riscos`);
    }
    
    console.log('📊 RESULTADO FINAL riscosFiltrados:', filtered.length, 'riscos');
    return filtered;
  }, [filtroSeveridade, filtroQuadrante, filtroNatureza, riscosCompletos]);

  // Calcular dados do gráfico baseado nos riscos filtrados
  const dadosGraficoSeveridade = React.useMemo(() => {
    const contadores = {
      'Baixo': 0,
      'Moderado': 0,
      'Alto': 0,
      'Muito Alto': 0
    };
    
    riscosFiltrados.forEach(risco => {
      const severidadeCalculada = calcularSeveridadePorValor(risco.severidade);
      contadores[severidadeCalculada]++;
    });
    
    return [
      { name: 'Baixo', value: contadores['Baixo'], color: '#10b981' },
      { name: 'Moderado', value: contadores['Moderado'], color: '#f59e0b' },
      { name: 'Alto', value: contadores['Alto'], color: '#f97316' },
      { name: 'Muito Alto', value: contadores['Muito Alto'], color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [riscosFiltrados]);

  // Função para ordenar riscos
  const sortedRiscos = React.useMemo(() => {
    const sorted = [...riscosFiltrados].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortConfig.field) {
        case 'sigla':
          aValue = a.sigla || '';
          bValue = b.sigla || '';
          break;
        case 'eventos_riscos':
          aValue = a.eventos_riscos.toLowerCase();
          bValue = b.eventos_riscos.toLowerCase();
          break;
        case 'severidade':
          aValue = a.severidade;
          bValue = b.severidade;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sorted;
  }, [riscosFiltrados, sortConfig]);

  // Função para alterar ordenação
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Função para obter sigla da área
  const getSiglaArea = (responsavelId: string | null): string => {
    if (!responsavelId || !areasGerencias.length) return '';
    const area = areasGerencias.find(area => area.id === responsavelId);
    return area?.sigla_area || '';
  };

  const renderTabButtons = () => (
    <div className="flex space-x-1">
      <button
        onClick={() => setActiveTab('severidade')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          activeTab === 'severidade'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Severidade
      </button>
      <button
        onClick={() => setActiveTab('responsaveis')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          activeTab === 'responsaveis'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Responsáveis
      </button>
    </div>
  );

  const renderResponsaveisTable = () => (
    <table className="min-w-full">
      <thead className="bg-blue-50 sticky top-0">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors duration-150"
              onClick={() => handleSort('sigla')}>
            <div className="flex items-center gap-1">
              ID
              {renderSortIcon('sigla')}
            </div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
            Responsável pelo Risco
          </th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
            Responsabilidade Compartilhada
          </th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
            Demais Responsáveis
          </th>
          <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors duration-150"
              onClick={() => handleSort('severidade')}>
            <div className="flex items-center gap-1">
              Severidade
              {renderSortIcon('severidade')}
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {sortedRiscos.length > 0 ? (
          sortedRiscos.map((risco, index) => (
            <tr key={risco.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="text-sm font-bold text-gray-900">{risco.sigla || '-'}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="text-sm text-gray-900">{getSiglaArea(risco.responsavel_risco) || '-'}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="text-sm text-gray-900">{risco.demais_responsaveis ? 'Sim' : 'Não'}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <div className="text-sm text-gray-900">{risco.demais_responsaveis ? getSiglaArea(risco.demais_responsaveis) || '-' : '-'}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full text-white shadow-sm ${
                  risco.severidade >= 20 ? 'bg-red-600' :
                  risco.severidade >= 10 ? 'bg-orange-500' :
                  risco.severidade >= 5 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}>
                  {risco.severidade >= 20 ? 'Muito Alto' :
                   risco.severidade >= 10 ? 'Alto' :
                   risco.severidade >= 5 ? 'Moderado' : 'Baixo'}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Nenhum risco encontrado</p>
                <p className="text-xs text-gray-400 mt-1">
                  {filtroSeveridade || filtroQuadrante ? 'Nenhum risco encontrado com os filtros aplicados' : 'Nenhum dado disponível'}
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Função para renderizar ícone de ordenação
  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="h-3 w-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-blue-600" />
      : <ChevronDown className="h-3 w-3 text-blue-600" />;
  };

  // Dados reais do gráfico de barras empilhado por natureza
  // Estrutura baseada nas tabelas 018_rel_risco, 010_natureza e segmentação por severidade
  const naturezaDataEmpilhado = React.useMemo(() => {
    console.log('🔄 PROCESSANDO naturezaDataEmpilhado...');
    console.log('🎯 Filtros ativos:', { filtroNatureza, filtroSeveridade, secaoBarraSelecionada });
    
    if (!riscosPorNatureza || riscosPorNatureza.length === 0) {
      console.log('⚠️ Sem dados de riscos por natureza para o gráfico');
      return [];
    }

    console.log('📊 Dados brutos riscosPorNatureza:', riscosPorNatureza);

    const dados = riscosPorNatureza.map(natureza => {
      const dadosProcessados = {
        name: natureza.desc_natureza,
        baixo: natureza.baixo || 0,
        moderado: natureza.moderado || 0,
        alto: natureza.alto || 0,
        muitoAlto: natureza.muitoAlto || 0,
        total: natureza.total || 0
      };
      
      console.log(`📈 Natureza ${natureza.desc_natureza}:`, dadosProcessados);
      return dadosProcessados;
    });
    
    console.log('📈 Dados processados para o gráfico de barras:', dados);
    console.log('🔍 Total de naturezas no gráfico:', dados.length);
    
    return dados;
   }, [riscosPorNatureza, filtroNatureza, filtroSeveridade, secaoBarraSelecionada]);

  // Handler para clique nas seções das barras
  const handleSecaoBarraClick = (natureza: string, severidade: string) => {
    console.log('🔍 CLIQUE NA SEÇÃO:', { natureza, severidade });
    console.log('📊 Estado atual secaoBarraSelecionada:', secaoBarraSelecionada);
    console.log('📊 Dados riscosPorNatureza antes do clique:', riscosPorNatureza.length, 'naturezas');
    console.log('📊 Filtros atuais antes do clique:', { filtroNatureza, filtroSeveridade });
    
    const novaSelecao = { natureza, severidade };
    
    // Se a mesma seção for clicada, desselecionar
    if (secaoBarraSelecionada && 
        secaoBarraSelecionada.natureza === natureza && 
        secaoBarraSelecionada.severidade === severidade) {
      console.log('🔄 DESSELECIONANDO seção - limpando filtros');
      setSecaoBarraSelecionada(null);
      // CORREÇÃO: Atualizar FilterContext global para propagar aos outros componentes
      setFiltroNatureza(null); // Context global
      setFiltroSeveridade(null); // Context global
      console.log('✅ Filtros limpos no contexto global');
    } else {
      // Encontrar o ID da natureza baseado no nome
      const naturezaEncontrada = riscosPorNatureza.find(n => n.desc_natureza === natureza);
      const naturezaId = naturezaEncontrada ? naturezaEncontrada.id_natureza.toString() : null;
      
      console.log('✅ SELECIONANDO nova seção:', { naturezaEncontrada, naturezaId });
      console.log('🎯 Aplicando filtros no contexto global:', { naturezaId, severidade });
      
      // CORREÇÃO: Aplicar AMBOS os filtros no FilterContext global
      setSecaoBarraSelecionada(novaSelecao);
      setFiltroNatureza(naturezaId); // Context global - propaga para outros componentes
      setFiltroSeveridade(severidade); // Context global - propaga para outros componentes
      
      console.log('🎯 FILTROS APLICADOS NO CONTEXTO GLOBAL:', { naturezaId, severidade });
    }
  };

  // Função para verificar se uma seção está selecionada
  const isSecaoSelecionada = (natureza: string, severidade: string): boolean => {
    return secaoBarraSelecionada?.natureza === natureza && 
           secaoBarraSelecionada?.severidade === severidade;
  };

  // Função para calcular opacidade da seção
  const getOpacidadeSecao = (natureza: string, severidade: string): number => {
    if (!secaoBarraSelecionada) return 1; // Nenhuma seleção, todas visíveis
    return isSecaoSelecionada(natureza, severidade) ? 1 : 0.5; // Selecionada: 100%, outras: 50%
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    // Aumentar distância dos rótulos para garantir visibilidade
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="700"
        className="drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Componente customizado para renderizar total no final das barras empilhadas
  const CustomBarLabel = (props: any) => {
    const { payload, x, y, width, height } = props;
    
    if (!payload || typeof payload.total === 'undefined') {
      return null;
    }
    
    // Calcular posição baseada na soma de todas as barras empilhadas
    const totalEmpilhado = payload.baixo + payload.moderado + payload.alto + payload.muitoAlto;
    const barWidth = (totalEmpilhado / Math.max(...naturezaDataEmpilhado.map(d => d.total))) * width;
    
    return (
      <text 
        x={x + barWidth + 8} 
        y={y + height / 2} 
        fill="#374151" 
        textAnchor="start" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="700"
      >
        {payload.total}
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
          
          {/* Botões de Filtro */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            
            {/* Botão Limpar - só aparece quando há filtros ativos */}
            {(filtroSeveridade || filtroQuadrante || filtroNatureza) && (
              <button
                onClick={limparFiltros}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-sm"
              >
                <X className="h-4 w-4" />
                Limpar
              </button>
            )}
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
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <p className="text-2xl font-bold">...</p>
                    </div>
                  ) : error ? (
                    <p className="text-2xl font-bold text-red-200">Erro</p>
                  ) : (
                    <p className="text-4xl font-bold">{riscosFiltrados.length}</p>
                  )}
                </div>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Linha 1, Coluna 2: Média de Severidade */}
          <div className="col-span-1 row-span-1">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Média de Severidade</p>
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <p className="text-2xl font-bold">...</p>
                    </div>
                  ) : error ? (
                    <p className="text-2xl font-bold text-red-200">Erro</p>
                  ) : (
                    <p className="text-3xl font-bold">
                      {riscosFiltrados.length > 0 
                        ? (riscosFiltrados.reduce((acc, risco) => acc + (risco.severidade || 0), 0) / riscosFiltrados.length).toFixed(2)
                        : '0.00'
                      }
                      <span className="text-xl font-normal"> / 25</span>
                    </p>
                  )}
                </div>
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Activity className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3, Linhas 1-2: Riscos por Severidade */}
          <div className="col-span-1 row-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Riscos por Severidade</h3>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGraficoSeveridade}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel as any}
                      outerRadius="70%"
                      innerRadius="30%"
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(data, index) => {
                        const severidade = data.name;
                        if (segmentoSelecionado === severidade) {
                          // Desselecionar se clicar no mesmo segmento
                          setSegmentoSelecionado(null);
                          setFiltroSeveridade(null); // Context global
                        } else {
                          // Selecionar novo segmento
                          setSegmentoSelecionado(severidade);
                          setFiltroSeveridade(severidade); // Context global
                        }
                      }}
                    >
                      {dadosGraficoSeveridade.map((entry, index) => {
                        const isSelected = segmentoSelecionado === entry.name;
                        const opacity = segmentoSelecionado === null || isSelected ? 1 : 0.5;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="#fff" 
                            strokeWidth={2}
                            style={{ opacity, cursor: 'pointer' }}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2 pt-2 border-t border-gray-100">
                {[...severidadeData].reverse().map((item, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna 4, Linhas 1-2: Riscos por Natureza */}
          <div className="col-span-1 row-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Riscos por Natureza</h3>
              {loadingNatureza ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Carregando dados...</span>
                </div>
              ) : errorNatureza ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 text-sm">Erro ao carregar dados</p>
                  </div>
                </div>
              ) : naturezaDataEmpilhado.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
                </div>
              ) : naturezaDataEmpilhado.every(natureza => natureza.total === 0) ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm mb-2">Nenhum risco encontrado com os filtros aplicados</p>
                    <p className="text-gray-400 text-xs mb-4">Tente ajustar os filtros ou limpar a seleção</p>
                    {secaoBarraSelecionada && (
                      <button
                        onClick={() => {
                          setSecaoBarraSelecionada(null);
                          setFiltroNatureza(null);
                          setFiltroSeveridade(null);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 px-2">
                  {naturezaDataEmpilhado.map((natureza, index) => {
                    const total = natureza.total;
                    // CORREÇÃO CRÍTICA: Não remover naturezas com total zero, apenas exibir diferentemente
                    // if (total === 0) return null; // <- Esta linha causava o desaparecimento do gráfico
                    
                    // Calcular percentuais (proteger contra divisão por zero)
                    const percentBaixo = total > 0 ? (natureza.baixo / total) * 100 : 0;
                    const percentModerado = total > 0 ? (natureza.moderado / total) * 100 : 0;
                    const percentAlto = total > 0 ? (natureza.alto / total) * 100 : 0;
                    const percentMuitoAlto = total > 0 ? (natureza.muitoAlto / total) * 100 : 0;
                    
                    return (
                      <div key={index} className="mb-4">
                        {/* Label da categoria */}
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]" title={natureza.name}>
                            {natureza.name}
                          </span>
                          <span className={`text-xs font-bold ml-2 ${
                            total === 0 ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {total}
                          </span>
                        </div>
                        
                        {/* Barra horizontal empilhada */}
                        <div className={`relative w-full h-6 rounded-md overflow-hidden flex ${
                          total === 0 ? 'bg-gray-200 border border-dashed border-gray-300' : 'bg-gray-100'
                        }`}>
                          {/* Segmento Baixo */}
                           {natureza.baixo > 0 && (
                             <div 
                               className="h-full flex items-center justify-center text-white text-xs font-medium relative group cursor-pointer transition-opacity duration-200"
                               style={{ 
                                 width: `${percentBaixo}%`, 
                                 backgroundColor: '#28a745',
                                 opacity: getOpacidadeSecao(natureza.name, 'Baixo')
                               }}
                               title={`Baixo: ${natureza.baixo} riscos (${percentBaixo.toFixed(1)}%)`}
                               onClick={() => handleSecaoBarraClick(natureza.name, 'Baixo')}
                             >
                               {percentBaixo >= 8 && natureza.baixo}
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                 Baixo: {natureza.baixo} riscos ({percentBaixo.toFixed(1)}%)
                               </div>
                             </div>
                           )}
                           
                           {/* Mensagem para naturezas sem dados filtrados */}
                           {total === 0 && (
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs text-gray-400 italic">
                                 Sem dados com filtros aplicados
                               </span>
                             </div>
                           )}
                           
                           {/* Segmento Moderado */}
                           {natureza.moderado > 0 && (
                             <div 
                               className="h-full flex items-center justify-center text-black text-xs font-medium relative group cursor-pointer transition-opacity duration-200"
                               style={{ 
                                 width: `${percentModerado}%`, 
                                 backgroundColor: '#ffc107',
                                 opacity: getOpacidadeSecao(natureza.name, 'Moderado')
                               }}
                               title={`Moderado: ${natureza.moderado} riscos (${percentModerado.toFixed(1)}%)`}
                               onClick={() => handleSecaoBarraClick(natureza.name, 'Moderado')}
                             >
                               {percentModerado >= 8 && natureza.moderado}
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                 Moderado: {natureza.moderado} riscos ({percentModerado.toFixed(1)}%)
                               </div>
                             </div>
                           )}
                           
                           {/* Segmento Alto */}
                           {natureza.alto > 0 && (
                             <div 
                               className="h-full flex items-center justify-center text-white text-xs font-medium relative group cursor-pointer transition-opacity duration-200"
                               style={{ 
                                 width: `${percentAlto}%`, 
                                 backgroundColor: '#fd7e14',
                                 opacity: getOpacidadeSecao(natureza.name, 'Alto')
                               }}
                               title={`Alto: ${natureza.alto} riscos (${percentAlto.toFixed(1)}%)`}
                               onClick={() => handleSecaoBarraClick(natureza.name, 'Alto')}
                             >
                               {percentAlto >= 8 && natureza.alto}
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                 Alto: {natureza.alto} riscos ({percentAlto.toFixed(1)}%)
                               </div>
                             </div>
                           )}
                           
                           {/* Segmento Muito Alto */}
                           {natureza.muitoAlto > 0 && (
                             <div 
                               className="h-full flex items-center justify-center text-white text-xs font-medium relative group cursor-pointer transition-opacity duration-200"
                               style={{ 
                                 width: `${percentMuitoAlto}%`, 
                                 backgroundColor: '#dc3545',
                                 opacity: getOpacidadeSecao(natureza.name, 'Muito Alto')
                               }}
                               title={`Muito Alto: ${natureza.muitoAlto} riscos (${percentMuitoAlto.toFixed(1)}%)`}
                               onClick={() => handleSecaoBarraClick(natureza.name, 'Muito Alto')}
                             >
                               {percentMuitoAlto >= 8 && natureza.muitoAlto}
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                 Muito Alto: {natureza.muitoAlto} riscos ({percentMuitoAlto.toFixed(1)}%)
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Legenda das severidades - sempre na parte inferior */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#28a745' }}></div>
                    <span className="text-gray-600 font-medium">Baixo</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#ffc107' }}></div>
                    <span className="text-gray-600 font-medium">Moderado</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#fd7e14' }}></div>
                    <span className="text-gray-600 font-medium">Alto</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#dc3545' }}></div>
                    <span className="text-gray-600 font-medium">Muito Alto</span>
                  </div>
                </div>
              </div>
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
        <div className="flex gap-6 h-[600px]">
          {/* Matriz de Risco */}
          <div style={{flex: '1.6'}}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Matriz de Risco</h3>
              
              <div className="flex-1 flex items-center justify-center relative px-4">
                <div className="flex items-start gap-1 w-full max-w-full">
                  {/* Título IMPACTO */}
                  <div className="flex items-center flex-shrink-0" style={{height: '280px', width: '40px'}}>
                    <div className="transform -rotate-90 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-700">IMPACTO</span>
                    </div>
                  </div>

                  {/* Rótulos do eixo Y (IMPACTO) - Centralizados nos quadrantes */}
                  <div className="relative items-end mr-1 flex-shrink-0" style={{height: '280px', width: '110px'}}>
                    {[5, 4, 3, 2, 1].map((value, index) => {
                      // Calcular posição considerando altura do quadrante (56px) + gaps (4px entre cada)
                      const topPosition = index * (56 + 4) + 28 - 12; // -12 para ajuste visual da linha de texto
                      return (
                        <div 
                          key={value} 
                          className="absolute text-xs text-gray-600 text-right flex items-center justify-end w-full whitespace-nowrap" 
                          style={{ top: `${topPosition}px` }}
                        >
                          {value} - {value === 5 ? 'Muito Alta' : value === 4 ? 'Alta' : value === 3 ? 'Moderada' : value === 2 ? 'Baixa' : 'Muito Baixa'}
                        </div>
                      );
                    })}
                  </div>

                  {/* Matriz de risco */}
                  <div className="flex flex-col flex-1">
                    <div className="grid grid-cols-5 gap-1 flex-1">
                      {/* Linhas da matriz (de 5 para 1, de cima para baixo) */}
                      {[5, 4, 3, 2, 1].map(impacto => (
                        <React.Fragment key={impacto}>
                          {/* Células da linha */}
                          {[1, 2, 3, 4, 5].map(probabilidade => {
                            const riscoCount = getRiscoCount(probabilidade, impacto);
                            let bgColor = '';
                            let textColor = 'text-gray-800';
                            
                            // Classificação baseada nas coordenadas específicas
                            // Baixo: (1,1), (1,2), (1,3), (1,4), (2,1), (2,2), (3,1), (4,1)
                            if ((probabilidade === 1 && impacto === 1) ||
                                (probabilidade === 1 && impacto === 2) ||
                                (probabilidade === 1 && impacto === 3) ||
                                (probabilidade === 1 && impacto === 4) ||
                                (probabilidade === 2 && impacto === 1) ||
                                (probabilidade === 2 && impacto === 2) ||
                                (probabilidade === 3 && impacto === 1) ||
                                (probabilidade === 4 && impacto === 1)) {
                              bgColor = 'bg-green-400';
                              textColor = 'text-gray-800';
                            }
                            // Moderado: (1,5), (2,4), (2,3), (3,3), (3,2), (4,2), (5,1)
                            else if ((probabilidade === 1 && impacto === 5) ||
                                     (probabilidade === 2 && impacto === 4) ||
                                     (probabilidade === 2 && impacto === 3) ||
                                     (probabilidade === 3 && impacto === 3) ||
                                     (probabilidade === 3 && impacto === 2) ||
                                     (probabilidade === 4 && impacto === 2) ||
                                     (probabilidade === 5 && impacto === 1)) {
                              bgColor = 'bg-yellow-400';
                              textColor = 'text-gray-800';
                            }
                            // Alto: (2,5), (3,5), (3,4), (4,4), (4,3), (5,2), (5,3)
                            else if ((probabilidade === 2 && impacto === 5) ||
                                     (probabilidade === 3 && impacto === 5) ||
                                     (probabilidade === 3 && impacto === 4) ||
                                     (probabilidade === 4 && impacto === 4) ||
                                     (probabilidade === 4 && impacto === 3) ||
                                     (probabilidade === 5 && impacto === 2) ||
                                     (probabilidade === 5 && impacto === 3)) {
                              bgColor = 'bg-orange-500';
                              textColor = 'text-white';
                            }
                            // Muito Alto: (4,5), (5,5), (5,4)
                            else if ((probabilidade === 4 && impacto === 5) ||
                                     (probabilidade === 5 && impacto === 5) ||
                                     (probabilidade === 5 && impacto === 4)) {
                              bgColor = 'bg-red-600';
                              textColor = 'text-white';
                            }
                            // Fallback para qualquer coordenada não mapeada
                            else {
                              bgColor = 'bg-gray-300';
                              textColor = 'text-gray-700';
                            }
                            
                            const isSelected = filtroQuadrante?.impacto === impacto && filtroQuadrante?.probabilidade === probabilidade;
                            
                            return (
                              <div
                                key={probabilidade}
                                className={`${bgColor} ${textColor} text-center text-xs font-bold border-2 flex items-center justify-center rounded-sm shadow-sm hover:shadow-md transition-all duration-200 relative cursor-pointer ${
                                  isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{width: '100%', height: '56px', minWidth: '70px'}}
                                onClick={() => {
                                  if (isSelected) {
                                    setFiltroQuadrante(null);
                                  } else {
                                    setFiltroQuadrante({ impacto, probabilidade });
                                  }
                                }}
                              >
                                {/* Contagem de riscos - esfera preta pequena com número branco */}
                                {riscoCount > 0 && (
                                  <div className="bg-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                    <span className="text-white text-xs font-bold">{riscoCount}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    {/* Rótulos do eixo X (PROBABILIDADE) */}
                    <div className="flex flex-col items-center">
                      <div className="grid grid-cols-5 gap-1 mt-2 text-xs font-medium text-gray-700" style={{width: '100%'}}>
                        <div className="flex items-center justify-center text-center" style={{minWidth: '70px'}}>
                          <span>1 - Muito Baixa</span>
                        </div>
                        <div className="flex items-center justify-center text-center" style={{minWidth: '70px'}}>
                          <span>2 - Baixa</span>
                        </div>
                        <div className="flex items-center justify-center text-center" style={{minWidth: '70px'}}>
                          <span>3 - Moderada</span>
                        </div>
                        <div className="flex items-center justify-center text-center" style={{minWidth: '70px'}}>
                          <span>4 - Alta</span>
                        </div>
                        <div className="flex items-center justify-center text-center" style={{minWidth: '70px'}}>
                          <span>5 - Muito Alta</span>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <span className="text-sm font-semibold text-gray-700">PROBABILIDADE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legenda interativa com filtros - ordem invertida */}
              <div className="mt-auto pt-2 flex justify-center">
                <div className="flex justify-center w-full">
                  {/* Legenda expandida com botões de filtro - ordem corrigida */}
                  <div className="flex gap-0 text-sm w-full max-w-lg">
                    {/* Baixo */}
                    <button 
                      onClick={() => setFiltroSeveridade(filtroSeveridade === 'Baixo' ? null : 'Baixo')}
                      className={`flex items-center justify-center px-5 py-2 rounded-l flex-1 shadow-lg hover:shadow-xl transition-all duration-200 ${
                        filtroSeveridade === 'Baixo' ? 'ring-4 ring-blue-300 scale-105' : ''
                      }`}
                      style={{
                        background: filtroSeveridade === 'Baixo' 
                          ? 'linear-gradient(145deg, #6ee7b7, #34d399)' 
                          : 'linear-gradient(145deg, #4ade80, #22c55e)', 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                        color: '#1f2937'
                      }}
                    >
                      <span className="font-semibold drop-shadow-sm">Baixo</span>
                    </button>
                    
                    {/* Moderado */}
                    <button 
                      onClick={() => setFiltroSeveridade(filtroSeveridade === 'Moderado' ? null : 'Moderado')}
                      className={`flex items-center justify-center px-5 py-2 flex-1 shadow-lg hover:shadow-xl transition-all duration-200 ${
                        filtroSeveridade === 'Moderado' ? 'ring-4 ring-blue-300 scale-105' : ''
                      }`}
                      style={{
                        background: filtroSeveridade === 'Moderado' 
                          ? 'linear-gradient(145deg, #fbbf24, #f59e0b)' 
                          : 'linear-gradient(145deg, #eab308, #ca8a04)', 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                        color: '#1f2937'
                      }}
                    >
                      <span className="font-semibold drop-shadow-sm">Moderado</span>
                    </button>
                    
                    {/* Alto */}
                    <button 
                      onClick={() => setFiltroSeveridade(filtroSeveridade === 'Alto' ? null : 'Alto')}
                      className={`flex items-center justify-center px-5 py-2 flex-1 shadow-lg hover:shadow-xl transition-all duration-200 ${
                        filtroSeveridade === 'Alto' ? 'ring-4 ring-blue-300 scale-105' : ''
                      }`}
                      style={{
                        background: filtroSeveridade === 'Alto' 
                          ? 'linear-gradient(145deg, #fb923c, #f97316)' 
                          : 'linear-gradient(145deg, #f97316, #ea580c)', 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      <span className="font-semibold drop-shadow-sm">Alto</span>
                    </button>
                    
                    {/* Muito Alto */}
                    <button 
                      onClick={() => setFiltroSeveridade(filtroSeveridade === 'Muito Alto' ? null : 'Muito Alto')}
                      className={`flex items-center justify-center px-5 py-2 rounded-r flex-1 shadow-lg hover:shadow-xl transition-all duration-200 ${
                        filtroSeveridade === 'Muito Alto' ? 'ring-4 ring-blue-300 scale-105' : ''
                      }`}
                      style={{
                        background: filtroSeveridade === 'Muito Alto' 
                          ? 'linear-gradient(145deg, #f87171, #ef4444)' 
                          : 'linear-gradient(145deg, #ef4444, #dc2626)', 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      <span className="font-semibold drop-shadow-sm">Muito Alto</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Tabela de Evento de Risco */}
          <div style={{flex: '2.4'}}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Tabela de Evento de Risco</h3>
                {renderTabButtons()}
              </div>
              

              
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'severidade' ? (
                  <div className="flex-1 overflow-auto px-6">
                <table className="min-w-full">
                  <thead className="bg-blue-50 sticky top-0">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors duration-150"
                        onClick={() => handleSort('sigla')}
                      >
                        <div className="flex items-center gap-1">
                          ID
                          {renderSortIcon('sigla')}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors duration-150"
                        onClick={() => handleSort('eventos_riscos')}
                      >
                        <div className="flex items-center gap-1">
                          Evento de Risco
                          {renderSortIcon('eventos_riscos')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200">
                        Classificação
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors duration-150"
                        onClick={() => handleSort('severidade')}
                      >
                        <div className="flex items-center gap-1">
                          Severidade
                          {renderSortIcon('severidade')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sortedRiscos.length > 0 ? (
                      sortedRiscos.map((risco, index) => (
                        <tr 
                          key={risco.id} 
                          className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="text-sm font-bold text-gray-900">{risco.sigla || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="text-sm text-gray-900 font-medium">{risco.eventos_riscos || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            {risco.severidade ? (
                              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full text-white shadow-sm ${
                                calcularSeveridadePorValor(risco.severidade) === 'Muito Alto' ? 'bg-red-600' :
                                calcularSeveridadePorValor(risco.severidade) === 'Alto' ? 'bg-orange-500' :
                                calcularSeveridadePorValor(risco.severidade) === 'Moderado' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}>
                                {calcularSeveridadePorValor(risco.severidade)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="text-sm font-bold text-gray-900">{risco.severidade || '-'}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <AlertTriangle className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">Nenhum risco encontrado</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {filtroSeveridade ? `Não há riscos com severidade "${filtroSeveridade}"` : 'Nenhum dado disponível'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto px-6">
                    {renderResponsaveisTable()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Filtros */}
      <MatrizRiscoFilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </Layout>
  );
};

export default MatrizRisco;