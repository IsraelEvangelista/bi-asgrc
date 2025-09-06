import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, User, Settings, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useProcesses } from '../hooks/useProcesses';
import { useConfig } from '../hooks/useConfig';
import { Macroprocesso, Processo, Subprocesso } from '../types/process';
import { AreaGerencia } from '../types/config';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProcessDetailProps {}

const ProcessDetail: React.FC<ProcessDetailProps> = () => {
  const { macroprocessoId } = useParams<{ macroprocessoId: string }>();
  const navigate = useNavigate();
  const {
    macroprocessos,
    processos,
    fetchMacroprocessos,
    fetchProcessos,
    fetchSubprocessos,
    isLoading,
    error
  } = useProcesses();
  
  const { areas, fetchAreas } = useConfig();
  
  const [selectedMacroprocesso, setSelectedMacroprocesso] = useState<Macroprocesso | null>(null);
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [subprocessos, setSubprocessos] = useState<Subprocesso[]>([]);
  const [areasMap, setAreasMap] = useState<Map<string, AreaGerencia>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (macroprocessoId) {
        console.log('🚀 Iniciando carregamento de dados...');
        // Buscar todos os macroprocessos e filtrar o específico
        const macros = await fetchMacroprocessos();
        
        // Buscar processos relacionados ao macroprocesso
          console.log('🔄 Carregando processos para macroprocesso:', macroprocessoId);
          const processos = await fetchProcessos({ macroprocesso_id: macroprocessoId });
          console.log('📊 Processos carregados:', processos);
        
        // Buscar áreas para mapear responsáveis
        const areas = await fetchAreas();
        console.log('📊 Macroprocessos carregados:', macros);
        console.log('📊 Áreas carregadas:', areas);
      }
    };

    loadData();
  }, [macroprocessoId, fetchMacroprocessos, fetchProcessos, fetchAreas]);

  // Criar mapa de áreas quando os dados carregarem
  useEffect(() => {
    if (areas.length > 0) {
      const map = new Map<string, AreaGerencia>();
      areas.forEach(area => {
        map.set(area.id, area);
      });
      setAreasMap(map);
    }
  }, [areas]);

  useEffect(() => {
    // Encontrar o macroprocesso específico quando os dados carregarem
    if (macroprocessoId && macroprocessos.length > 0) {
      const macro = macroprocessos.find(m => m.id === macroprocessoId);
      setSelectedMacroprocesso(macro || null);
    }
  }, [macroprocessoId, macroprocessos]);

  useEffect(() => {
    // Selecionar o primeiro processo por padrão (seleção obrigatória)
    if (processos.length > 0) {
      setSelectedProcesso(processos[0]);
    }
  }, [processos]);

  // Buscar subprocessos quando processo for selecionado
  useEffect(() => {
    if (selectedProcesso) {
      console.log('🔄 Carregando subprocessos para processo:', selectedProcesso);
      const loadSubprocessos = async () => {
          const data = await fetchSubprocessos({ processo_id: selectedProcesso.id });
          console.log('📊 Subprocessos retornados:', data);
          setSubprocessos(data || []);
        };
      loadSubprocessos();
    } else {
      setSubprocessos([]);
    }
  }, [selectedProcesso, fetchSubprocessos]);
  
  const handleProcessoSelect = (processo: any) => {
    console.log('🎯 Processo selecionado:', processo);
    setSelectedProcesso(processo);
  };
  
  // Função para obter o nome do responsável formatado
  const getResponsavelNome = (responsavelId?: string) => {
    if (!responsavelId || !areasMap.has(responsavelId)) {
      return 'Responsável não definido';
    }
    const area = areasMap.get(responsavelId)!;
    return `${area.gerencia} - ${area.sigla_area}`;
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }
  
  if (error || !selectedMacroprocesso) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center text-red-600">
            {error || 'Macroprocesso não encontrado'}
          </div>
        </div>
      </Layout>
    );
  }

  const handleGoBack = () => {
    navigate('/processos/cadeia-valor');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header com botão voltar e nome do processo */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Voltar para Cadeia de Valor</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
            {selectedMacroprocesso.macroprocesso}
          </h1>
          
          <div className="w-48"></div> {/* Spacer para manter o título centralizado */}
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Processos */}
          <div className="lg:col-span-1">
            <div className="bg-blue-600 rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-white" />
                  <h3 className="font-bold text-white">Processos</h3>
                </div>
              {processos.length > 0 ? (
                <div className="space-y-3">
                  {processos.map((processo) => (
                    <div 
                      key={processo.id} 
                      onClick={() => handleProcessoSelect(processo)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedProcesso?.id === processo.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md text-gray-800' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-100 text-white hover:text-black'
                      }`}
                    >
                      <h4 className={`font-semibold mb-1 ${
                        selectedProcesso?.id === processo.id 
                          ? 'text-gray-800' 
                          : 'text-white'
                      }`}>{processo.processo}</h4>
                      {processo.responsavel_processo && (
                        <p className={`text-sm ${
                          selectedProcesso?.id === processo.id 
                            ? 'text-gray-600' 
                            : 'text-white hover:text-black'
                        }`}>Responsável: {getResponsavelNome(processo.responsavel_processo)}</p>
                      )}
                      {selectedProcesso?.id === processo.id && (
                        <div className="mt-2 flex items-center text-blue-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Selecionado</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white py-8">
                  <Settings className="h-12 w-12 mx-auto mb-2 text-white opacity-50" />
                  <p>Nenhum processo encontrado para este macroprocesso</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita - Resultados e Objetivos */}
          <div className="lg:col-span-2">
            {/* Grid de Resultados e Objetivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Resultados */}
              <div className="bg-blue-600 text-white rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="text-lg font-bold">Resultados</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm leading-relaxed">
                    {selectedProcesso?.entregas_processo || 'Resultados não definidos'}
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div className="bg-blue-600 text-white rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-5 w-5" />
                  <h3 className="text-lg font-bold">Objetivos</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm leading-relaxed">
                    {selectedProcesso?.objetivo_processo || 'Objetivos não definidos'}
                  </div>
                </div>
              </div>
            </div>

            {/* Responsável do Processo */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-gray-800">Responsável do Processo</h3>
              </div>
              <p className="text-gray-700">{selectedProcesso ? getResponsavelNome(selectedProcesso.responsavel_processo) : 'Responsável não definido'}</p>
            </div>

            {/* Subprocessos */}
            {selectedProcesso && (
              <div className="bg-blue-600 rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-white">
                    Subprocessos - {selectedProcesso.processo}
                  </h3>
                </div>
                
                {subprocessos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subprocessos.map((subprocesso) => (
                      <div 
                        key={subprocesso.id}
                        className="border-2 rounded-lg p-4 transition-all border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{subprocesso.subprocesso}</h4>
                        <div className="mt-2 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subprocesso.situacao === 'Ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {subprocesso.situacao}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white mb-2">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-white">Nenhum subprocesso encontrado para este processo</p>
                  </div>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
    </Layout>
  );
};

export default ProcessDetail;