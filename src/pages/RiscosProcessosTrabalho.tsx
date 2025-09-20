import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import RiscosProcessosFilterSection from '../components/RiscosProcessosFilterSection';
import { AlertTriangle, Filter, Workflow, Users, TrendingUp, PieChart, Plus, Edit, Trash2, ChevronUp, ChevronDown, Settings, CheckCircle, FileText, Shield, X } from 'lucide-react';

// import { useRiscosCards } from '../hooks/useRiscosCards';
// Removidos hooks agregados; usaremos agregação local a partir da tabela base
import { useRiscosProcessosTrabalhoData } from '../hooks/useRiscosProcessosTrabalhoData';

// Componente interno que usa o contexto de filtros
const RiscosProcessosTrabalhoContent: React.FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);

  // Estado de filtros gerais (bloco de filtros)
  const [filtrosGerais, setFiltrosGerais] = useState<{
    macroprocessoId: string;
    processoId: string;
    subprocessoId: string;
    responsavelId: string;
    acaoId: string;
    situacaoRisco: string;
  }>({ macroprocessoId: '', processoId: '', subprocessoId: '', responsavelId: '', acaoId: '', situacaoRisco: '' });
  
  // Estados para filtragem dinâmica por clique
  const [filtroNivelRiscoSelecionado, setFiltroNivelRiscoSelecionado] = useState<string | null>(null);
  const [filtroSituacaoRiscoSelecionado, setFiltroSituacaoRiscoSelecionado] = useState<string | null>(null);
  const [filtroPlanoRespostaSelecionado, setFiltroPlanoRespostaSelecionado] = useState<string | null>(null);
  const [filtroStatusAcaoSelecionado, setFiltroStatusAcaoSelecionado] = useState<string | null>(null);
  const [linhaTabelaSelecionada, setLinhaTabelaSelecionada] = useState<string | null>(null);
  
  // Estados para filtros dinâmicos por linha da tabela
  const [filtrosLinhaDinamica, setFiltrosLinhaDinamica] = useState<{
    processo: string | null;
    risco: string | null;
    acao: string | null;
    responsavel_risco: string | null;
    nivel_risco: string | null;
    nivel_risco_tratado: string | null;
    resposta_risco: string | null;
  } | null>(null);

  // Função para limpar todos os filtros
  const limparTodosFiltros = () => {
    // Resetar filtros gerais
    setFiltrosGerais({
      macroprocessoId: '',
      processoId: '',
      subprocessoId: '',
      responsavelId: '',
      acaoId: '',
      situacaoRisco: ''
    });
    
    // Resetar filtros dinâmicos
    setFiltroNivelRiscoSelecionado(null);
    setFiltroSituacaoRiscoSelecionado(null);
    setFiltroPlanoRespostaSelecionado(null);
    setFiltroStatusAcaoSelecionado(null);
    setLinhaTabelaSelecionada(null);
    setFiltrosLinhaDinamica(null);
    
    // Ativar reset nos filtros do componente
    setResetFilters(true);
    setTimeout(() => setResetFilters(false), 100);
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const handleApplyFiltrosGerais = (payload: {
    macroprocessoId: string;
    processoId: string;
    subprocessoId: string;
    responsavelId: string;
    acaoId: string;
    situacaoRisco: string;
  }) => {
    setFiltrosGerais(payload);
    setIsFilterExpanded(false);
  };
  
  // Função para aplicar filtro por clique em segmento
  const aplicarFiltroPorSegmento = (tipo: string, valor: string, graficoId: string) => {
    switch (tipo) {
      case 'nivel_risco':
        if (filtroNivelRiscoSelecionado === valor) {
          setFiltroNivelRiscoSelecionado(null);
        } else {
          setFiltroNivelRiscoSelecionado(valor);
        }
        break;
        
      case 'situacao_risco':
        if (filtroSituacaoRiscoSelecionado === valor) {
          setFiltroSituacaoRiscoSelecionado(null);
        } else {
          setFiltroSituacaoRiscoSelecionado(valor);
        }
        break;
        
      case 'plano_resposta':
        if (filtroPlanoRespostaSelecionado === valor) {
          setFiltroPlanoRespostaSelecionado(null);
        } else {
          setFiltroPlanoRespostaSelecionado(valor);
        }
        break;
        
      case 'status_acao':
        if (filtroStatusAcaoSelecionado === valor) {
          setFiltroStatusAcaoSelecionado(null);
        } else {
          setFiltroStatusAcaoSelecionado(valor);
        }
        break;
    }
  };
  
  // Função para aplicar filtro por clique em linha da tabela
  const aplicarFiltroPorLinha = (identificadorLinha: string, dadosLinha: any) => {
    if (linhaTabelaSelecionada === identificadorLinha) {
      // Remover todos os filtros
      setLinhaTabelaSelecionada(null);
      setFiltrosLinhaDinamica(null);
      setFiltroNivelRiscoSelecionado(null);
      setFiltroSituacaoRiscoSelecionado(null);
      setFiltroPlanoRespostaSelecionado(null);
    } else {
      // Aplicar filtros de todos os campos da linha
      setLinhaTabelaSelecionada(identificadorLinha);
      setFiltrosLinhaDinamica({
        processo: dadosLinha.processo || null,
        risco: dadosLinha.risco || null,
        acao: dadosLinha.acao || null,
        responsavel_risco: dadosLinha.responsavel_risco || null,
        nivel_risco: dadosLinha.nivel_risco || null,
        nivel_risco_tratado: dadosLinha.nivel_risco_tratado || null,
        resposta_risco: dadosLinha.resposta_risco || null
      });
      
      // Sincronizar com filtros dinâmicos dos gráficos
      setFiltroNivelRiscoSelecionado(dadosLinha.nivel_risco || null);
      setFiltroSituacaoRiscoSelecionado(dadosLinha.situacao_risco || null);
      setFiltroPlanoRespostaSelecionado(dadosLinha.resposta_risco || null);
    }
  };


  // Base de dados da tabela
  const { dados: dadosTabela, loading: loadingTabela, error: errorTabela } = useRiscosProcessosTrabalhoData();
  

  // Aplicar filtros gerais (bloco de filtros) - VERSÃO CORRIGIDA COM COMPARAÇÃO DE STRINGS
  const baseGeral = useMemo(() => {
    let arr = [...dadosTabela];
    const { macroprocessoId, processoId, subprocessoId, responsavelId, acaoId, situacaoRisco } = filtrosGerais;
    
    // Aplicar cada filtro apenas se não estiver vazio - usando String() para comparações
    if (macroprocessoId) {
      arr = arr.filter(i => String(i.id_macroprocesso) === String(macroprocessoId));
    }
    if (processoId) {
      arr = arr.filter(i => String(i.id_processo) === String(processoId));
    }
    if (subprocessoId) {
      arr = arr.filter(i => String(i.id_subprocesso) === String(subprocessoId));
    }
    if (responsavelId) {
      arr = arr.filter(i => String(i.responsavel_processo_id) === String(responsavelId));
    }
    if (acaoId) {
      arr = arr.filter(i => String(i.id_acao_controle) === String(acaoId));
    }
    if (situacaoRisco) {
      arr = arr.filter(i => (i.situacao_risco || '').toLowerCase() === situacaoRisco.toLowerCase());
    }
    
    return arr;
  }, [dadosTabela, filtrosGerais]);

  // Combinar filtros dinâmicos (complementares aos gerais)
  const baseFiltrada = useMemo(() => {
    let arr = [...baseGeral];
    
    // Filtros dinâmicos por linha da tabela têm prioridade
    if (filtrosLinhaDinamica) {
      if (filtrosLinhaDinamica.processo) {
        arr = arr.filter(i => (i.processo || '').toLowerCase() === filtrosLinhaDinamica.processo!.toLowerCase());
      }
      if (filtrosLinhaDinamica.risco) {
        arr = arr.filter(i => (i.risco || '').toLowerCase() === filtrosLinhaDinamica.risco!.toLowerCase());
      }
      if (filtrosLinhaDinamica.acao) {
        arr = arr.filter(i => (i.acao || '').toLowerCase() === filtrosLinhaDinamica.acao!.toLowerCase());
      }
      if (filtrosLinhaDinamica.responsavel_risco) {
        arr = arr.filter(i => (i.responsavel_risco || '').toLowerCase() === filtrosLinhaDinamica.responsavel_risco!.toLowerCase());
      }
      if (filtrosLinhaDinamica.nivel_risco) {
        arr = arr.filter(i => (i.nivel_risco || '').toLowerCase() === filtrosLinhaDinamica.nivel_risco!.toLowerCase());
      }
      if (filtrosLinhaDinamica.nivel_risco_tratado) {
        arr = arr.filter(i => (i.nivel_risco_tratado || '').toLowerCase() === filtrosLinhaDinamica.nivel_risco_tratado!.toLowerCase());
      }
      if (filtrosLinhaDinamica.resposta_risco) {
        arr = arr.filter(i => (i.resposta_risco || '').toLowerCase() === filtrosLinhaDinamica.resposta_risco!.toLowerCase());
      }
    } else {
      // Filtros dinâmicos individuais dos gráficos
      if (filtroNivelRiscoSelecionado) {
        arr = arr.filter(i => (i.nivel_risco || '').toLowerCase() === filtroNivelRiscoSelecionado.toLowerCase());
      }
      if (filtroSituacaoRiscoSelecionado) {
        arr = arr.filter(i => (i.situacao_risco || '').toLowerCase() === filtroSituacaoRiscoSelecionado.toLowerCase());
      }
      if (filtroPlanoRespostaSelecionado) {
        arr = arr.filter(i => (i.plano_resposta_risco || i.resposta_risco || '').toLowerCase() === filtroPlanoRespostaSelecionado.toLowerCase());
      }
    }
    
    return arr;
  }, [baseGeral, filtrosLinhaDinamica, filtroNivelRiscoSelecionado, filtroSituacaoRiscoSelecionado, filtroPlanoRespostaSelecionado]);

  // Contadores locais afetados por TODOS os filtros (gerais + dinâmicos)
  const { quantidadeProcessos, quantidadeRiscos, quantidadeAcoes } = useMemo(() => {
    const fonte = baseFiltrada; // já inclui filtros gerais + dinâmicos
    const processos = new Set<string>();
    const riscos = new Set<string>();
    const acoes = new Set<string>();
    fonte.forEach(i => {
      if (i.id_processo) processos.add(String(i.id_processo));
      if (i.id_risco) riscos.add(String(i.id_risco));
      if (i.id_acao_controle) acoes.add(String(i.id_acao_controle));
    });
    return {
      quantidadeProcessos: processos.size,
      quantidadeRiscos: riscos.size,
      quantidadeAcoes: acoes.size
    };
  }, [baseFiltrada]);

  // Utilitários de deduplicação
  const distinctByRisk = (rows: any[]) => {
    const map = new Map<string, any>();
    for (const r of rows) {
      const k = r.id_risco ? String(r.id_risco) : '';
      if (!k) continue;
      const prev = map.get(k);
      if (!prev) {
        map.set(k, r);
      } else if (!prev.situacao_risco && r.situacao_risco) {
        map.set(k, r);
      }
    }
    return Array.from(map.values());
  };

  const distinctByAction = (rows: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const r of rows) {
      const k = r.id_acao_controle ? String(r.id_acao_controle) : '';
      if (!k) continue;
      if (!seen.has(k)) { seen.add(k); out.push(r); }
    }
    return out;
  };

  const dedupeTableRows = (rows: any[]) => {
    const keyOf = (r: any) => [
      r.processo || '',
      r.risco || '',
      r.acao || '',
      r.responsavel_risco || '',
      r.nivel_risco || '',
      r.nivel_risco_tratado || '',
      r.resposta_risco || ''
    ].map((v: string) => v.trim().toLowerCase()).join('|');
    const seen = new Set<string>();
    const out: any[] = [];
    for (const r of rows) {
      const k = keyOf(r);
      if (!seen.has(k)) { seen.add(k); out.push(r); }
    }
    return out;
  };

  // Agregações corrigidas com deduplicação
  const nivelAgg = useMemo(() => {
    const base = distinctByRisk(baseFiltrada);
    const cont: Record<string, number> = {};
    base.forEach(item => {
      const key = item.nivel_risco || 'Não informado';
      cont[key] = (cont[key] || 0) + 1;
    });
    const total = Object.values(cont).reduce((a, b) => a + b, 0) || 0;
    return Object.entries(cont).map(([nivel, quantidade]) => ({
      nivel_risco: nivel,
      quantidade,
      percentual: total > 0 ? Math.round((quantidade / total) * 100) : 0,
    })).sort((a,b) => b.quantidade - a.quantidade);
  }, [baseFiltrada]);

  const situacaoAgg = useMemo(() => {
    const base = distinctByRisk(baseFiltrada);
    const cont: Record<string, number> = {};
    base.forEach(item => {
      const key = item.situacao_risco || 'Não informado';
      cont[key] = (cont[key] || 0) + 1;
    });
    const total = Object.values(cont).reduce((a, b) => a + b, 0) || 0;
    return Object.entries(cont).map(([situacao_risco, quantidade]) => ({
      situacao_risco,
      quantidade,
      percentual: total > 0 ? Math.round((quantidade / total) * 100) : 0,
    })).sort((a,b) => b.quantidade - a.quantidade);
  }, [baseFiltrada]);

  const planoAgg = useMemo(() => {
    const base = distinctByAction(baseFiltrada);
    const cont: Record<string, number> = {};
    base.forEach(item => {
      const key = item.plano_resposta_risco || item.resposta_risco || 'Não informado';
      cont[key] = (cont[key] || 0) + 1;
    });
    const total = Object.values(cont).reduce((a, b) => a + b, 0) || 0;
    return Object.entries(cont).map(([plano_resposta_risco, total_acoes]) => ({
      plano_resposta_risco,
      total_acoes,
      percentual: total > 0 ? Math.round((total_acoes / total) * 100) : 0,
    })).sort((a,b) => b.total_acoes - a.total_acoes);
  }, [baseFiltrada]);

  // Base deduplicada para a tabela
  const baseTabelaDedupe = useMemo(() => dedupeTableRows(baseFiltrada), [baseFiltrada]);

  // Função para lidar com cliques fora dos elementos interativos
const handleContainerClick = (e: React.MouseEvent) => {
    // Verificar se o clique foi em um elemento interativo (gráfico ou tabela)
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('[data-interactive="true"]') || 
                                target.closest('path') || 
                                target.closest('tr[data-interactive="true"]');
    
    // Se não foi em um elemento interativo e há filtro ativo, limpar todos os filtros
    if (!isInteractiveElement && (filtroNivelRiscoSelecionado || filtroSituacaoRiscoSelecionado || 
        filtroPlanoRespostaSelecionado || filtroStatusAcaoSelecionado || linhaTabelaSelecionada || filtrosLinhaDinamica)) {
      setFiltroNivelRiscoSelecionado(null);
      setFiltroSituacaoRiscoSelecionado(null);
      setFiltroPlanoRespostaSelecionado(null);
      setFiltroStatusAcaoSelecionado(null);
      setLinhaTabelaSelecionada(null);
      setFiltrosLinhaDinamica(null);
    }
  };
  // Removidos hooks agregados e memos baseados neles; usaremos nivelAgg, situacaoAgg e planoAgg
  
  
  // Filtrar dados da tabela baseado na linha selecionada
  const dadosTabelaFiltrados = React.useMemo(() => {
    const fonte = baseTabelaDedupe;
    if (!linhaTabelaSelecionada) return fonte;
    const linhaSelecionada = fonte.find((_, index) => {
      const identificadorLinha = `${_.processo || 'N/A'}-${_.risco || 'N/A'}-${index}`;
      return identificadorLinha === linhaTabelaSelecionada;
    });
    if (!linhaSelecionada) return fonte;
    return fonte.filter(item => 
      item.processo === linhaSelecionada.processo ||
      item.risco === linhaSelecionada.risco ||
      item.nivel_risco === linhaSelecionada.nivel_risco
    );
  }, [baseTabelaDedupe, linhaTabelaSelecionada]);

  return (
    <Layout>
      <div 
        className="p-6 space-y-8"
        onClick={handleContainerClick}
      >

        {/* Header + Filtros embutidos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Riscos de Processos de Trabalho</h1>
              <p className="text-gray-600">Identificação, análise e monitoramento de riscos nos processos organizacionais</p>
            </div>
            
            {/* Botões de Filtro */}
            <div className="flex items-center gap-2">
              {/* Verificar se há filtros ativos */}
              {(filtrosGerais.macroprocessoId || filtrosGerais.processoId || filtrosGerais.subprocessoId ||
                filtrosGerais.responsavelId || filtrosGerais.acaoId || filtrosGerais.situacaoRisco) && (
                <button
                  onClick={() => {
                    limparTodosFiltros();
                    setIsFilterExpanded(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-sm"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </button>
              )}
              <button
                onClick={toggleFilterExpansion}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm text-sm ${
                  isFilterExpanded 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {isFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {/* Seção de filtros expansível */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isFilterExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-6 bg-white">
              <RiscosProcessosFilterSection
                isExpanded={true}
                onToggle={toggleFilterExpansion}
                embedded
                resetFilters={resetFilters}
                onApply={handleApplyFiltrosGerais}
              />
            </div>
          </div>
        </div>

        {/* Linha 2 - 4 colunas iguais */}
        <div className="grid grid-cols-4 gap-6">
          {/* Coluna 1 - 3 cards verticais */}
          <div className="h-full flex flex-col justify-between space-y-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg border border-blue-300 p-4 relative z-10 flex-1 text-white">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 backdrop-blur-sm">
                    <Workflow className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Quantidade de Processos Estruturados</h3>
                    <p className="text-2xl font-bold text-white">{loadingTabela ? '...' : quantidadeProcessos}</p>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-white" />
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg border border-blue-300 p-4 relative z-10 flex-1 text-white">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 backdrop-blur-sm">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Quantidade de Riscos de Trabalho</h3>
                    <p className="text-2xl font-bold text-white">{loadingTabela ? '...' : quantidadeRiscos}</p>
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-white" />
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg border border-blue-300 p-4 relative z-10 flex-1 text-white">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Quantidade de Ações de Controle</h3>
                    <p className="text-2xl font-bold text-white">{loadingTabela ? '...' : quantidadeAcoes}</p>
                  </div>
                </div>
                <Shield className="h-8 w-8 text-white" />
                </div>
            </div>
          </div>

          {/* Linha 2 - 4 colunas iguais */}
          {/* Coluna 2 - Gráfico de pizza 1 */}
          <div className="relative z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nível do Risco Inerente</h3>
              <div className="flex items-center justify-center h-64 overflow-visible">
                <div className="relative w-72 h-72 overflow-visible">
                  {loadingTabela ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  ) : nivelAgg.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                          const coresPorNivel: { [key: string]: string } = {
                            'Muito Alto': '#FF6961',
                            'Alto': '#FFA500', 
                            'Moderado': '#FFD700',
                            'Baixo': '#77DD77'
                          };

                          // Caso 100%: renderizar donut completo
                          if (nivelAgg.length === 1) {
                            const item = nivelAgg[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            const isOtherFiltered = filtroNivelRiscoSelecionado !== null && filtroNivelRiscoSelecionado !== item.nivel_risco;
                            return (
                              <g key={item.nivel_risco}>
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={coresPorNivel[item.nivel_risco] || '#9CA3AF'}
                                  stroke="white"
                                  strokeWidth="2"
                                  className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${isOtherFiltered ? 'opacity-50' : 'opacity-100'} hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    aplicarFiltroPorSegmento('nivel_risco', item.nivel_risco, 'grafico-nivel-risco');
                                  }}
                                  data-interactive="true"
                                />
                                <circle cx="140" cy="140" r={innerRadius} fill="white" />
                              </g>
                            );
                          }

                          let cumulativePercentage = 0;
                          return nivelAgg.map((item, index) => {
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
                            const isOtherFiltered = filtroNivelRiscoSelecionado !== null && filtroNivelRiscoSelecionado !== item.nivel_risco;
                            return (
                              <path
                                key={item.nivel_risco}
                                d={pathData}
                                fill={coresPorNivel[item.nivel_risco] || '#9CA3AF'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${isOtherFiltered ? 'opacity-50' : 'opacity-100'} hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  aplicarFiltroPorSegmento('nivel_risco', item.nivel_risco, 'grafico-nivel-risco');
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
                          return nivelAgg.map((item, index) => {
                            const percentage = item.percentual;
                            const midAngle = ((cumulativePercentage + percentage / 2) / 100) * 360;
                            const midAngleRad = (midAngle - 90) * (Math.PI / 180);
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
                          <p className="text-2xl font-bold text-gray-900">{nivelAgg.reduce((acc, item) => acc + item.quantidade, 0)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loadingTabela ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : nivelAgg.length > 0 ? (
                  nivelAgg.map((item, index) => {
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
                  {loadingTabela ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  ) : situacaoAgg.length > 0 ? (
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
                          if (situacaoAgg.length === 1) {
                            const item = situacaoAgg[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const isCurrentFiltered = filtroSituacaoRiscoSelecionado === item.situacao_risco;
                            const isOtherFiltered = filtroSituacaoRiscoSelecionado !== null && filtroSituacaoRiscoSelecionado !== item.situacao_risco;
                            
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
                                    aplicarFiltroPorSegmento('situacao_risco', item.situacao_risco, 'grafico-situacao-risco');
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
                          
                          return situacaoAgg.map((item, index) => {
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
                            
                            const isCurrentFiltered = filtroSituacaoRiscoSelecionado === item.situacao_risco;
                            const isOtherFiltered = filtroSituacaoRiscoSelecionado !== null && filtroSituacaoRiscoSelecionado !== item.situacao_risco;
                            
                            return (
                              <path
                                key={item.situacao_risco}
                                d={pathData}
                                fill={coresPorSituacao[item.situacao_risco] || '#3B82F6'}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                  isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                } hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  aplicarFiltroPorSegmento('situacao_risco', item.situacao_risco, 'grafico-situacao-risco');
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
                          if (situacaoAgg.length === 1) {
                            const item = situacaoAgg[0];
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
                          
                          return situacaoAgg.map((item, index) => {
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
                          <p className="text-2xl font-bold text-gray-900">{situacaoAgg.reduce((acc, item) => acc + item.quantidade, 0)}</p>
                          <p className="text-sm text-gray-600">Total</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center text-gray-500">Nenhum dado encontrado</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {loadingTabela ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : situacaoAgg.length > 0 ? (
                  situacaoAgg.map((item, index) => {
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
                  {loadingTabela ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    </div>
                  ) : planoAgg.length > 0 ? (
                    <>
                      {/* Gráfico de pizza dinâmico baseado nos dados reais */}
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 280 280" style={{zIndex: 10}}>
                        {(() => {
                    const normalize = (s: string) => (s || 'Não informado').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const colorForPlano = (label: string) => {
                      const k = normalize(label);
                      const map: { [key: string]: string } = {
                        'nao iniciada': '#9CA3AF',
                        'em andamento': '#F59E0B',
                        'atrasado': '#DC2626',
                        'concluido': '#059669',
                        'concluida': '#059669',
                        'aceitar': '#10B981',
                        'mitigar': '#F59E0B',
                        'transferir': '#3B82F6',
                        'evitar': '#EF4444',
                        'nao informado': '#9CA3AF'
                      };
                      return map[k] || '#9CA3AF';
                    };
                          // Se há apenas um item (100%), renderizar um círculo completo
                          if (planoAgg.length === 1) {
                            const item = planoAgg[0];
                            const outerRadius = 90;
                            const innerRadius = 30;
                            
                            const isCurrentFiltered = filtroPlanoRespostaSelecionado === item.plano_resposta_risco;
                            const isOtherFiltered = filtroPlanoRespostaSelecionado !== null && filtroPlanoRespostaSelecionado !== item.plano_resposta_risco;
                            
                            return (
                              <g key={item.plano_resposta_risco}>
                                {/* Círculo externo */}
                                <circle
                                  cx="140"
                                  cy="140"
                                  r={outerRadius}
                                  fill={colorForPlano(item.plano_resposta_risco)}
                                  stroke="white"
                                  strokeWidth="2"
                                  className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                    isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                  } hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    aplicarFiltroPorSegmento('plano_resposta', item.plano_resposta_risco, 'grafico-plano-resposta');
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
                          
                          return planoAgg.map((item, index) => {
                            const totalFiltrado = planoAgg.reduce((acc, item) => acc + item.total_acoes, 0);
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
                            
                            const isCurrentFiltered = filtroPlanoRespostaSelecionado === item.plano_resposta_risco;
                            const isOtherFiltered = filtroPlanoRespostaSelecionado !== null && filtroPlanoRespostaSelecionado !== item.plano_resposta_risco;
                            
                            return (
                              <path
                                key={item.plano_resposta_risco}
                                d={pathData}
                                fill={colorForPlano(item.plano_resposta_risco)}
                                stroke="white"
                                strokeWidth="2"
                                className={`drop-shadow-lg cursor-pointer transition-opacity duration-200 ${
                                  isOtherFiltered ? 'opacity-50' : 'opacity-100'
                                } hover:opacity-80`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  aplicarFiltroPorSegmento('plano_resposta', item.plano_resposta_risco, 'grafico-plano-resposta');
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
                          if (planoAgg.length === 1) {
                            const item = planoAgg[0];
                            const totalFiltrado = planoAgg.reduce((acc, item) => acc + item.total_acoes, 0);
                            const percentage = totalFiltrado > 0 ? (item.total_acoes / totalFiltrado) * 100 : 0;
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
                          
                          return planoAgg.map((item, index) => {
                            const totalFiltrado = planoAgg.reduce((acc, item) => acc + item.total_acoes, 0);
                            const percentage = totalFiltrado > 0 ? (item.total_acoes / totalFiltrado) * 100 : 0;
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
                          <p className="text-2xl font-bold text-gray-900">{planoAgg.reduce((acc, item) => acc + item.total_acoes, 0)}</p>
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
                {loadingTabela ? (
                  <div className="text-center text-gray-500">Carregando...</div>
                ) : planoAgg.length > 0 ? (
                  planoAgg.map((item, index) => {
                    const normalizeLegend = (s: string) => (s || 'Não informado').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const mapLegend: { [key: string]: string } = {
                      'nao iniciada': '#9CA3AF',
                      'em andamento': '#F59E0B',
                      'atrasado': '#DC2626',
                      'concluido': '#059669',
                      'concluida': '#059669',
                      'aceitar': '#10B981',
                      'mitigar': '#F59E0B',
                      'transferir': '#3B82F6',
                      'evitar': '#EF4444',
                      'nao informado': '#9CA3AF'
                    };
                    const corClasse = mapLegend[normalizeLegend(item.plano_resposta_risco)] || '#9CA3AF';
                    const percentage = planoAgg.reduce((acc, it) => acc + it.total_acoes, 0) > 0 ? Math.round((item.total_acoes / planoAgg.reduce((acc, it) => acc + it.total_acoes, 0)) * 100) : 0;
                    
                    return (
                      <div key={item.plano_resposta_risco} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: corClasse}}></div>
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
                ) : dadosTabelaFiltrados && dadosTabelaFiltrados.length > 0 ? (
                  dadosTabelaFiltrados.map((item, index) => {
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

                    // Criar identificador único para a linha usando processo + risco
                    const identificadorLinha = `${item.processo || 'N/A'}-${item.risco || 'N/A'}-${index}`;
                    
                    // Verificar se esta linha está filtrada
                    const isCurrentRowFiltered = linhaTabelaSelecionada === identificadorLinha;
                    const isOtherRowFiltered = linhaTabelaSelecionada !== null && linhaTabelaSelecionada !== identificadorLinha;
                    
                    return (
                      <tr 
                        key={index} 
                        className={`cursor-pointer transition-all duration-200 ${
                          isOtherRowFiltered ? 'opacity-50' : 'opacity-100'
                        } hover:bg-gray-50 ${
                          isCurrentRowFiltered ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          aplicarFiltroPorLinha(identificadorLinha, item);
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
                          <div className="text-xs text-gray-900 break-words max-w-40">{(item.acao && item.acao.trim()) ? item.acao : 'N/A'}</div>
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