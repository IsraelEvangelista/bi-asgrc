import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { Network, Target, Settings, GitBranch, Loader2, ChevronDown, ChevronRight, Expand, Minimize2, Check, PieChart, ExternalLink, FileText, Filter, X } from 'lucide-react';
import { useProcesses } from '../hooks/useProcesses';
import { useProcessStats } from '../hooks/useProcessStats';
import ProcessChartModal from '../components/ProcessChartModal';
import DetalhamentoTable from '../components/DetalhamentoTable';
import ProcessFilterModal from '../components/ProcessFilterModal';

const ArquiteturaProcessos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'grafica' | 'tabela'>('grafica');
  
  // Estados para controle de expansão dos cards de Macroprocessos
  const [expandedMacroprocessos, setExpandedMacroprocessos] = useState<Set<string>>(new Set());
  const [allProcessosExpanded, setAllProcessosExpanded] = useState(false);
  
  // Estados para controle de expansão dos cards de Subprocessos
  const [expandedProcessos, setExpandedProcessos] = useState<Set<string>>(new Set());
  const [allSubprocessosExpanded, setAllSubprocessosExpanded] = useState(false);
  const [showProcessChart, setShowProcessChart] = useState(false);
  
  // Estados para seleção de macroprocessos
  const [selectedMacroprocessos, setSelectedMacroprocessos] = useState<Set<string>>(new Set());
  const [selectAllMacroprocessos, setSelectAllMacroprocessos] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    macroprocessos: [],
    processos: [],
    subprocessos: [],
    responsaveis: [],
    publicado: []
  });
  const { 
    macroprocessos, 
    processos, 
    subprocessos, 
    isLoading, 
    error, 
    fetchMacroprocessos, 
    fetchProcessos, 
    fetchSubprocessos 
  } = useProcesses();
  const { publishedCount, unpublishedCount, loading: statsLoading } = useProcessStats();

  // Aplicar filtros avançados
  const applyAdvancedFilters = useMemo(() => {
    let filteredMacros = macroprocessos;
    let filteredProcs = processos;
    let filteredSubs = subprocessos;

    // Filtrar por macroprocessos selecionados na hierarquia
    if (selectedMacroprocessos.size > 0) {
      filteredMacros = macroprocessos.filter(macro => selectedMacroprocessos.has(macro.id));
      filteredProcs = processos.filter(processo => selectedMacroprocessos.has(processo.id_macroprocesso));
      filteredSubs = subprocessos.filter(subprocesso => {
        const processo = processos.find(p => p.id === subprocesso.id_processo);
        return processo && selectedMacroprocessos.has(processo.id_macroprocesso);
      });
    }

    // Aplicar filtros do modal
    if (activeFilters.macroprocessos.length > 0) {
      filteredMacros = filteredMacros.filter(macro => activeFilters.macroprocessos.includes(macro.id.toString()));
      filteredProcs = filteredProcs.filter(processo => activeFilters.macroprocessos.includes(processo.id_macroprocesso.toString()));
    }

    if (activeFilters.processos && activeFilters.processos.length > 0) {
      filteredProcs = filteredProcs.filter(processo => activeFilters.processos.includes(processo.id.toString()));
    }

    if (activeFilters.subprocessos && activeFilters.subprocessos.length > 0) {
      filteredSubs = filteredSubs.filter(subprocesso => activeFilters.subprocessos.includes(subprocesso.id.toString()));
    }

    if (activeFilters.responsaveis && activeFilters.responsaveis.length > 0) {
      filteredProcs = filteredProcs.filter(processo => 
        activeFilters.responsaveis.includes(processo.responsavel_processo)
      );
    }

    if (activeFilters.publicado && activeFilters.publicado.length > 0) {
      filteredProcs = filteredProcs.filter(processo => {
        const isPublished = Boolean(processo.publicado);
        return activeFilters.publicado.includes(isPublished ? 'true' : 'false');
      });
      filteredSubs = filteredSubs.filter(subprocesso => {
        const isPublished = Boolean(subprocesso.publicado);
        return activeFilters.publicado.includes(isPublished ? 'true' : 'false');
      });
    }

    return { filteredMacros, filteredProcs, filteredSubs };
  }, [macroprocessos, processos, subprocessos, selectedMacroprocessos, activeFilters]);

  const { filteredMacros: filteredMacroprocessos, filteredProcs: filteredProcessos, filteredSubs: filteredSubprocessos } = applyAdvancedFilters;

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchMacroprocessos(),
        fetchProcessos(),
        fetchSubprocessos()
      ]);
    };
    loadData();
  }, [fetchMacroprocessos, fetchProcessos, fetchSubprocessos]);

  // Funções para seleção de macroprocessos
  const toggleMacroprocessoSelection = (id: string) => {
    setSelectedMacroprocessos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      // Atualizar estado do "Selecionar Todos"
      setSelectAllMacroprocessos(newSet.size === macroprocessos.length);
      
      return newSet;
    });
  };

  const toggleSelectAllMacroprocessos = () => {
    if (selectAllMacroprocessos) {
      setSelectedMacroprocessos(new Set());
      setSelectAllMacroprocessos(false);
    } else {
      setSelectedMacroprocessos(new Set(macroprocessos.map(m => m.id)));
      setSelectAllMacroprocessos(true);
    }
  };

  // Funções para controle de expansão dos Processos
  const toggleMacroprocesso = (macroId: string) => {
    const newExpanded = new Set(expandedMacroprocessos);
    if (newExpanded.has(macroId)) {
      newExpanded.delete(macroId);
    } else {
      newExpanded.add(macroId);
    }
    setExpandedMacroprocessos(newExpanded);
  };

  const toggleAllProcessos = () => {
    if (allProcessosExpanded) {
      setExpandedMacroprocessos(new Set());
      setAllProcessosExpanded(false);
    } else {
      const allMacroIds = new Set(macroprocessos.map(m => m.id));
      setExpandedMacroprocessos(allMacroIds);
      setAllProcessosExpanded(true);
    }
  };

  // Funções para controle de expansão dos Subprocessos
  const toggleProcesso = (processoId: string) => {
    const newExpanded = new Set(expandedProcessos);
    if (newExpanded.has(processoId)) {
      newExpanded.delete(processoId);
    } else {
      newExpanded.add(processoId);
    }
    setExpandedProcessos(newExpanded);
  };

  const toggleAllSubprocessos = () => {
    if (allSubprocessosExpanded) {
      setExpandedProcessos(new Set());
      setAllSubprocessosExpanded(false);
    } else {
      const allProcessoIds = new Set(processos.map(p => p.id));
      setExpandedProcessos(allProcessoIds);
      setAllSubprocessosExpanded(true);
    }
  };



  return (
    <Layout>
      <div className="p-6">
        {/* Navegação por Abas com Header Integrado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header integrado */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center space-x-3 mb-4">
              <Network className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Arquitetura de Processos</h1>
            </div>
            <p className="text-gray-600">
              Visualização da estrutura organizacional dos processos da COGERH, 
              mostrando a hierarquia e relacionamentos entre macroprocessos, processos e subprocessos.
            </p>
          </div>
          
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('grafica')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'grafica'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hierarquia de Processos
                </button>
                <button
                  onClick={() => setActiveTab('tabela')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tabela'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Detalhamento
                </button>
              </nav>
              
              {/* Botão de Filtro */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {(activeFilters.macroprocessos.length > 0 || 
                    activeFilters.processos.length > 0 || 
                    activeFilters.subprocessos.length > 0 || 
                    activeFilters.responsaveis.length > 0 || 
                    activeFilters.publicado.length > 0) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Ativo
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'grafica' && (
              <div className="space-y-8">
                {/* Cards dos Níveis Hierárquicos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                  {/* Nível 1 - Macroprocessos */}
                  <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg shadow-lg p-6 text-white flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-lg font-bold">Nível 1</h3>
                      <div className="bg-white bg-opacity-80 rounded-full p-2">
                        <img src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757336109786.png" alt="Macroprocessos" className="w-6 h-6" />
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold mb-2">Macroprocessos</h4>
                    <div className="text-2xl font-bold text-white mb-2">
                      {macroprocessos.length}
                    </div>
                    <p className="text-yellow-100 text-sm mb-2">
                      Processos estratégicos de alto nível que definem a direção organizacional
                    </p>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={toggleSelectAllMacroprocessos}
                        className={`flex items-center space-x-1 rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
                          selectAllMacroprocessos 
                            ? 'bg-white bg-opacity-30 hover:bg-opacity-40' 
                            : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                        }`}
                        title={selectAllMacroprocessos ? "Desmarcar Todos" : "Selecionar Todos"}
                      >
                        <div className={`w-3 h-3 border rounded flex items-center justify-center ${
                          selectAllMacroprocessos 
                            ? 'bg-white border-white' 
                            : 'border-yellow-200 bg-transparent'
                        }`}>
                          {selectAllMacroprocessos && <Check size={10} className="text-yellow-600" />}
                        </div>
                        <span>{selectAllMacroprocessos ? "Desmarcar" : "Selecionar"}</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {macroprocessos.map((macro) => (
                        <div 
                          key={macro.id} 
                          className={`bg-white rounded p-2 cursor-pointer transition-all duration-200 hover:bg-opacity-20 ${
                            selectedMacroprocessos.has(macro.id) 
                              ? 'bg-opacity-20 border border-white border-opacity-30' 
                              : 'bg-opacity-10'
                          }`}
                          onClick={() => toggleMacroprocessoSelection(macro.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{macro.macroprocesso}</span>
                              <div className="text-xs text-yellow-200 mt-1">
                                {macro.tipo_macroprocesso}
                              </div>
                              <div className="text-xs text-yellow-300 mt-1">
                                {macro.total_processos || 0} processos • {macro.total_subprocessos || 0} subprocessos
                              </div>
                            </div>
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ml-2 flex-shrink-0 ${
                              selectedMacroprocessos.has(macro.id)
                                ? 'bg-white border-white'
                                : 'border-yellow-200 bg-transparent'
                            }`}>
                              {selectedMacroprocessos.has(macro.id) && (
                                <Check size={12} className="text-yellow-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nível 2 - Processos */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-lg font-bold">Nível 2</h3>
                      <div className="bg-white bg-opacity-80 rounded-full p-2">
                        <img src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757336132004.png" alt="Processos" className="w-6 h-6" />
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold mb-2">Processos</h4>
                    <div className="text-2xl font-bold text-white mb-2">
                      {filteredProcessos.length}
                      {selectedMacroprocessos.size > 0 && (
                        <span className="text-lg font-normal text-green-200 ml-2">
                          (filtrado)
                        </span>
                      )}
                    </div>
                    <p className="text-green-100 text-sm mb-2">
                      Processos operacionais que executam as atividades principais da organização
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => setShowProcessChart(true)}
                        className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-1 text-xs font-medium transition-all duration-200"
                        title="Ver Gráfico de Processos Publicados"
                      >
                        <PieChart size={14} />
                        <span>Visualização de Publicação</span>
                      </button>
                      <button
                        onClick={toggleAllProcessos}
                        className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-1 text-xs font-medium transition-all duration-200"
                        title={allProcessosExpanded ? "Recolher Tudo" : "Expandir Tudo"}
                      >
                        {allProcessosExpanded ? <Minimize2 size={14} /> : <Expand size={14} />}
                        <span>{allProcessosExpanded ? "Recolher" : "Expandir"}</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {macroprocessos.map((macro) => {
                        const processosDoMacro = filteredProcessos.filter(p => p.id_macroprocesso === macro.id);
                        if (processosDoMacro.length === 0) return null;
                        
                        const isExpanded = expandedMacroprocessos.has(macro.id);
                        
                        return (
                          <div key={macro.id} className="mb-4">
                            <div 
                              className="font-medium text-green-200 text-sm mb-2 border-b border-green-300 pb-1 cursor-pointer hover:text-green-100 transition-colors duration-200 flex items-center justify-between"
                              onClick={() => toggleMacroprocesso(macro.id)}
                            >
                              <span>{macro.macroprocesso} ({processosDoMacro.length})</span>
                              {isExpanded ? 
                                <ChevronDown size={16} className="text-green-300" /> : 
                                <ChevronRight size={16} className="text-green-300" />
                              }
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                              <div className="space-y-2 ml-2 pt-2">
                                {processosDoMacro.map((processo) => (
                                  <div key={processo.id} className="bg-white bg-opacity-10 rounded p-2 transform transition-all duration-200 hover:bg-opacity-20">
                                    <div className="text-xs font-medium text-green-100">
                                      {processo.processo}
                                    </div>
                                    {processo.responsavel_processo && (
                                      <div className="text-xs text-green-200 mt-1">
                                        Resp: {processo.responsavel_processo}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nível 3 - Subprocessos */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white flex flex-col">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h3 className="text-lg font-bold">Nível 3</h3>
                      <div className="bg-white bg-opacity-80 rounded-full p-2">
                        <img src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757336149614.png" alt="Subprocessos" className="w-6 h-6" />
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold mb-2">Subprocessos</h4>
                    <div className="text-2xl font-bold text-white mb-2">
                      {filteredSubprocessos.length}
                      {selectedMacroprocessos.size > 0 && (
                        <span className="text-lg font-normal text-blue-200 ml-2">
                          (filtrado)
                        </span>
                      )}
                    </div>
                    <p className="text-blue-100 text-sm mb-2">
                      Atividades específicas que compõem os processos principais
                    </p>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={toggleAllSubprocessos}
                        className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-1 text-xs font-medium transition-all duration-200"
                        title={allSubprocessosExpanded ? "Recolher Tudo" : "Expandir Tudo"}
                      >
                        {allSubprocessosExpanded ? <Minimize2 size={14} /> : <Expand size={14} />}
                        <span>{allSubprocessosExpanded ? "Recolher" : "Expandir"}</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {filteredProcessos.map((processo) => {
                        const subprocessosDoProcesso = filteredSubprocessos.filter(s => s.id_processo === processo.id);
                        if (subprocessosDoProcesso.length === 0) return null;
                        
                        const isExpanded = expandedProcessos.has(processo.id);
                        
                        return (
                          <div key={processo.id} className="mb-4">
                            <div 
                              className="font-medium text-blue-200 text-sm mb-2 border-b border-blue-300 pb-1 cursor-pointer hover:text-blue-100 transition-colors duration-200 flex items-center justify-between"
                              onClick={() => toggleProcesso(processo.id)}
                            >
                              <span>{processo.processo} ({subprocessosDoProcesso.length})</span>
                              {isExpanded ? 
                                <ChevronDown size={16} className="text-blue-300" /> : 
                                <ChevronRight size={16} className="text-blue-300" />
                              }
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                              <div className="space-y-2 ml-2 pt-2">
                                {subprocessosDoProcesso.map((subprocesso) => (
                                  <div key={subprocesso.id} className="bg-white bg-opacity-10 rounded p-2 transform transition-all duration-200 hover:bg-opacity-20">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="text-xs font-medium text-blue-100">
                                          {subprocesso.subprocesso}
                                        </div>
                                        {subprocesso.responsavel_subprocesso && (
                                          <div className="text-xs text-blue-200 mt-1">
                                            Resp: {subprocesso.responsavel_subprocesso}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-1 ml-2">
                                        {subprocesso.link_subprocesso && (
                                          <button
                                            onClick={() => window.open(subprocesso.link_subprocesso, '_blank', 'noopener,noreferrer')}
                                            className="text-blue-200 hover:text-white transition-colors p-1"
                                            title="Subprocesso"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                          </button>
                                        )}
                                        {subprocesso.link_manual && (
                                          <button
                                            onClick={() => window.open(subprocesso.link_manual, '_blank', 'noopener,noreferrer')}
                                            className="text-blue-200 hover:text-white transition-colors p-1"
                                            title="Manual"
                                          >
                                            <FileText className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            {activeTab === 'tabela' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <DetalhamentoTable />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal do Gráfico de Processos */}
      <ProcessChartModal 
        isOpen={showProcessChart}
        onClose={() => setShowProcessChart(false)}
        publishedCount={publishedCount}
         unpublishedCount={unpublishedCount}
      />
      
      {/* Modal de Filtros */}
      <ProcessFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
        macroprocessos={macroprocessos}
        processos={processos}
        subprocessos={subprocessos}
      />
      

    </Layout>
  );
};

export default ArquiteturaProcessos;