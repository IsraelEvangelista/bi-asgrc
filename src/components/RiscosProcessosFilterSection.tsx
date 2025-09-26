import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface RiscosProcessosFilterSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  embedded?: boolean;
  resetFilters?: boolean;
  onApply?: (filters: {
    macroprocesso: string | null;
    processo: string | null;
    subprocesso: string | null;
    responsavel: string | null;
    acaoControle: string | null;
    situacaoRisco: string | null;
  }) => void;
}

// Interfaces para os dados das tabelas
interface MacroprocessoData {
  id: string;
  macroprocesso: string;
}

interface ProcessoData {
  id: string;
  processo: string;
  id_macroprocesso: string;
}

interface SubprocessoData {
  id: string;
  subprocesso: string;
  id_processo: string;
}

const RiscosProcessosFilterSection: React.FC<RiscosProcessosFilterSectionProps> = ({
  isExpanded,
  onToggle,
  embedded = false,
  resetFilters = false,
  onApply,
}) => {
  // Estados dos dados originais completos (para referência hierárquica)
  const [macroprocessosOriginais, setMacroprocessosOriginais] = useState<MacroprocessoData[]>([]);
  const [processosOriginais, setProcessosOriginais] = useState<ProcessoData[]>([]);
  const [subprocessosOriginais, setSubprocessosOriginais] = useState<SubprocessoData[]>([]);

  // Estados das opções filtradas (que aparecem nos selects)
  const [macroprocessosDisponiveis, setMacroprocessosDisponiveis] = useState<FilterOption[]>([]);
  const [processosDisponiveis, setProcessosDisponiveis] = useState<FilterOption[]>([]);
  const [subprocessosDisponiveis, setSubprocessosDisponiveis] = useState<FilterOption[]>([]);
  const [responsaveis, setResponsaveis] = useState<FilterOption[]>([]);
  const [acoesControle, setAcoesControle] = useState<FilterOption[]>([]);
  const [situacoesRisco, setSituacoesRisco] = useState<FilterOption[]>([]);

  // Estados dos filtros selecionados (estado interno)
  const [filtroMacroprocesso, setFiltroMacroprocesso] = useState<string>('');
  const [filtroProcesso, setFiltroProcesso] = useState<string>('');
  const [filtroSubprocesso, setFiltroSubprocesso] = useState<string>('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');
  const [acaoControleSelecionada, setAcaoControleSelecionada] = useState<string>('');
  const [situacaoRiscoSelecionada, setSituacaoRiscoSelecionada] = useState<string>('');

  // Estados de carregamento
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Flag para evitar loops infinitos
  const [isUpdatingHierarchy, setIsUpdatingHierarchy] = useState(false);

  // Função centralizada para atualizar filtros hierárquicos
  const atualizarFiltrosHierarquicos = async (
    novoMacroprocesso: string,
    novoProcesso: string,
    novoSubprocesso: string,
    origem: 'macroprocesso' | 'processo' | 'subprocesso'
  ) => {
    if (isUpdatingHierarchy) return;
    
    setIsUpdatingHierarchy(true);
    
    try {
      console.log(`🔄 Atualizando hierarquia a partir de: ${origem}`, {
        macroprocesso: novoMacroprocesso,
        processo: novoProcesso,
        subprocesso: novoSubprocesso
      });

      let finalMacroprocesso = novoMacroprocesso;
      let finalProcesso = novoProcesso;
      let finalSubprocesso = novoSubprocesso;

      // Lógica baseada na origem da mudança
      if (origem === 'subprocesso' && novoSubprocesso) {
        // Buscar processo e macroprocesso do subprocesso
        const subprocessoData = subprocessosOriginais.find(sub => sub.id === novoSubprocesso);
        if (subprocessoData) {
          finalProcesso = subprocessoData.id_processo;
          
          const processoData = processosOriginais.find(proc => proc.id === finalProcesso);
          if (processoData) {
            finalMacroprocesso = processoData.id_macroprocesso;
          }
        }
      } else if (origem === 'processo' && novoProcesso) {
        // Buscar macroprocesso do processo e limpar subprocesso se não for compatível
        const processoData = processosOriginais.find(proc => proc.id === novoProcesso);
        if (processoData) {
          finalMacroprocesso = processoData.id_macroprocesso;
          
          // Verificar se o subprocesso atual é compatível
          if (novoSubprocesso) {
            const subprocessoData = subprocessosOriginais.find(sub => sub.id === novoSubprocesso);
            if (!subprocessoData || subprocessoData.id_processo !== novoProcesso) {
              finalSubprocesso = '';
            }
          }
        }
      } else if (origem === 'macroprocesso') {
        // Limpar processo e subprocesso se não forem compatíveis
        if (novoProcesso) {
          const processoData = processosOriginais.find(proc => proc.id === novoProcesso);
          if (!processoData || processoData.id_macroprocesso !== novoMacroprocesso) {
            finalProcesso = '';
            finalSubprocesso = '';
          } else if (novoSubprocesso) {
            const subprocessoData = subprocessosOriginais.find(sub => sub.id === novoSubprocesso);
            if (!subprocessoData || subprocessoData.id_processo !== finalProcesso) {
              finalSubprocesso = '';
            }
          }
        } else {
          finalSubprocesso = '';
        }
      }

      // Atualizar estados
      setFiltroMacroprocesso(finalMacroprocesso);
      setFiltroProcesso(finalProcesso);
      setFiltroSubprocesso(finalSubprocesso);

      // Atualizar opções disponíveis
      await atualizarOpcoesDisponiveis(finalMacroprocesso, finalProcesso, finalSubprocesso);

    } finally {
      setIsUpdatingHierarchy(false);
    }
  };

  // Função para atualizar opções disponíveis baseado nos filtros atuais e dados reais
  const atualizarOpcoesDisponiveis = async (macroprocessoId: string, processoId: string, subprocessoId: string) => {
    try {
      console.log('🔄 Atualizando opções disponíveis baseado em filtros:', { macroprocessoId, processoId, subprocessoId });

      // Construir query dinâmica baseada nos filtros atuais
      let query = supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id_processo,
          responsavel_acao,
          responsavel_processo,
          situacao_risco,
          id_acao_controle
        `);

      // Aplicar filtros para obter apenas dados relevantes
      if (macroprocessoId) {
        // Buscar processos do macroprocesso
        const processosDoMacro = processosOriginais.filter(p => p.id_macroprocesso === macroprocessoId);
        const idsProcessosDoMacro = processosDoMacro.map(p => p.id);
        if (idsProcessosDoMacro.length > 0) {
          query = query.in('id_processo', idsProcessosDoMacro);
        }
      }
      
      if (processoId) {
        query = query.eq('id_processo', processoId);
      }

      const { data: dadosFiltrados, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar dados filtrados:', error);
        return;
      }

      const dadosValidos = dadosFiltrados || [];
      console.log('📊 Dados filtrados encontrados:', dadosValidos.length);

      // Extrair IDs únicos dos dados filtrados
      const processosDisponiveis = [...new Set(dadosValidos.map(item => item.id_processo).filter(Boolean))];
      
      // Atualizar macroprocessos baseado nos processos disponíveis
      const macroprocessosDisponiveis = [...new Set(
        processosOriginais
          .filter(p => processosDisponiveis.includes(p.id))
          .map(p => p.id_macroprocesso)
          .filter(Boolean)
      )];

      const macroprocessosOptions = macroprocessosOriginais
        .filter(m => macroprocessosDisponiveis.includes(m.id))
        .map(item => ({
          value: item.id,
          label: item.macroprocesso
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setMacroprocessosDisponiveis(macroprocessosOptions);

      // Atualizar processos baseado no filtro de macroprocesso
      let processosParaExibir = processosOriginais.filter(p => processosDisponiveis.includes(p.id));
      if (macroprocessoId) {
        processosParaExibir = processosParaExibir.filter(proc => proc.id_macroprocesso === macroprocessoId);
      }
      
      const processosOptions = processosParaExibir.map(item => ({
        value: item.id,
        label: item.processo
      })).sort((a, b) => a.label.localeCompare(b.label));
      setProcessosDisponiveis(processosOptions);

      // Atualizar subprocessos baseado nos dados filtrados e hierarquia
      let subprocessosParaExibir = subprocessosOriginais;
      
      // Filtrar subprocessos baseado nos processos que têm dados nos filtros atuais
      const processosComDadosFiltrados = processosParaExibir.map(p => p.id);
      subprocessosParaExibir = subprocessosOriginais.filter(sub => 
        processosComDadosFiltrados.includes(sub.id_processo)
      );
      
      // Aplicar filtro específico de processo se selecionado
      if (processoId) {
        subprocessosParaExibir = subprocessosParaExibir.filter(sub => sub.id_processo === processoId);
      }
      
      const subprocessosOptions = subprocessosParaExibir.map(item => ({
        value: item.id,
        label: item.subprocesso
      })).sort((a, b) => a.label.localeCompare(b.label));
      setSubprocessosDisponiveis(subprocessosOptions);

      console.log('✅ Opções atualizadas:', {
        macroprocessos: macroprocessosOptions.length,
        processos: processosOptions.length,
        subprocessos: subprocessosOptions.length
      });

    } catch (error) {
      console.error('💥 Erro ao atualizar opções disponíveis:', error);
    }
  };

  // Função para carregar dados dos filtros baseado nos dados reais da tabela de riscos
  const carregarDadosFiltros = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando carregamento de dados dos filtros baseado em dados reais...');

      // 1. PRIMEIRO: Carregar dados da tabela de riscos para saber quais processos têm dados
      const { data: dadosRiscos, error: errorRiscos } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id_processo,
          responsavel_acao,
          responsavel_processo,
          situacao_risco,
          id_acao_controle
        `);

      if (errorRiscos) {
        console.error('❌ Erro ao carregar dados de riscos:', errorRiscos);
        throw new Error('Erro ao carregar dados de riscos');
      }

      const dadosRiscosValidos = dadosRiscos || [];
      console.log('✅ Dados de riscos carregados:', dadosRiscosValidos.length);

      // 2. Extrair IDs únicos que realmente têm dados
      const processosComDados = [...new Set(dadosRiscosValidos.map(item => item.id_processo).filter(Boolean))];
      const responsaveisComDadosIds = [...new Set([
        ...dadosRiscosValidos.map(item => item.responsavel_acao).filter(Boolean),
        ...dadosRiscosValidos.map(item => item.responsavel_processo).filter(Boolean)
      ])];
      const acoesComDadosIds = [...new Set(dadosRiscosValidos.map(item => item.id_acao_controle).filter(Boolean))];
      const situacoesComDados = [...new Set(dadosRiscosValidos.map(item => item.situacao_risco).filter(Boolean))];

      console.log('📊 IDs com dados reais:', {
        processos: processosComDados.length,
        responsaveis: responsaveisComDadosIds.length,
        acoes: acoesComDadosIds.length,
        situacoes: situacoesComDados.length
      });

      // 3. Carregar APENAS os processos que têm dados
      const { data: processosData, error: errorProcessos } = await supabase
        .from('005_processos')
        .select('id, processo, id_macroprocesso')
        .in('id', processosComDados);

      if (errorProcessos) {
        console.error('❌ Erro ao carregar processos:', errorProcessos);
        throw new Error('Erro ao carregar processos');
      }

      const processosValidados = processosData || [];
      setProcessosOriginais(processosValidados);
      console.log('✅ Processos com dados carregados:', processosValidados.length);

      // 4. Carregar APENAS os macroprocessos que têm processos com dados
      const macroprocessosComDados = [...new Set(processosValidados.map(p => p.id_macroprocesso).filter(Boolean))];
      const { data: macroprocessosData, error: errorMacroprocessos } = await supabase
        .from('004_macroprocessos')
        .select('id, macroprocesso')
        .in('id', macroprocessosComDados);

      if (errorMacroprocessos) {
        console.error('❌ Erro ao carregar macroprocessos:', errorMacroprocessos);
        throw new Error('Erro ao carregar macroprocessos');
      }

      const macroprocessosOriginaisData = macroprocessosData || [];
      setMacroprocessosOriginais(macroprocessosOriginaisData);
      console.log('✅ Macroprocessos com dados carregados:', macroprocessosOriginaisData.length);

      // 5. Carregar APENAS os subprocessos que têm processos com dados na tabela de riscos
      const { data: subprocessosData, error: errorSubprocessos } = await supabase
        .from('013_subprocessos')
        .select('id, subprocesso, id_processo')
        .in('id_processo', processosComDados);

      if (errorSubprocessos) {
        console.error('❌ Erro ao carregar subprocessos:', errorSubprocessos);
        throw new Error('Erro ao carregar subprocessos');
      }

      const subprocessosValidados = subprocessosData || [];
      setSubprocessosOriginais(subprocessosValidados);
      console.log('✅ Subprocessos com dados carregados:', subprocessosValidados.length);

      // 6. Inicializar opções disponíveis com APENAS dados que existem
      const macroprocessosOptions = macroprocessosOriginaisData.map(item => ({
        value: item.id,
        label: item.macroprocesso
      })).sort((a, b) => a.label.localeCompare(b.label));

      const processosOptions = processosValidados.map(item => ({
        value: item.id,
        label: item.processo
      })).sort((a, b) => a.label.localeCompare(b.label));

      const subprocessosOptions = subprocessosValidados.map(item => ({
        value: item.id,
        label: item.subprocesso
      })).sort((a, b) => a.label.localeCompare(b.label));

      setMacroprocessosDisponiveis(macroprocessosOptions);
      setProcessosDisponiveis(processosOptions);
      setSubprocessosDisponiveis(subprocessosOptions);

      // 5. Carregar responsáveis dos riscos
      const { data: responsaveisRiscos, error: errorResponsaveisRiscos } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          responsavel_acao,
          responsavel:003_areas_gerencias!responsavel_acao(id, sigla_area, gerencia)
        `);

      if (errorResponsaveisRiscos) {
        console.error('❌ Erro ao carregar responsáveis:', errorResponsaveisRiscos);
        throw new Error('Erro ao carregar responsáveis');
      }

      const responsaveisUnicos = new Map<string, string>();
      responsaveisRiscos?.forEach((item: any) => {
        const resp = item.responsavel;
        if (resp?.id && resp?.sigla_area) {
          responsaveisUnicos.set(resp.id, resp.sigla_area);
        }
      });

      const responsaveisOptions = Array.from(responsaveisUnicos.entries()).map(([id, nome]) => ({
        value: id,
        label: nome
      })).sort((a, b) => a.label.localeCompare(b.label));

      setResponsaveis(responsaveisOptions);
      console.log('✅ Responsáveis carregados:', responsaveisOptions.length);

      // 6. Carregar ações de controle dos riscos
      const { data: acoesRiscos, error: errorAcoesRiscos } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id_acao_controle,
          acao:014_acoes_controle_proc_trab(id, acao)
        `);

      if (errorAcoesRiscos) {
        console.error('❌ Erro ao carregar ações:', errorAcoesRiscos);
        throw new Error('Erro ao carregar ações');
      }

      const acoesUnicas = new Map<string, string>();
      acoesRiscos?.forEach((item: any) => {
        const acao = item.acao;
        if (acao?.id && acao?.acao) {
          acoesUnicas.set(acao.id, acao.acao);
        }
      });

      const acoesOptions = Array.from(acoesUnicas.entries()).map(([id, nome]) => ({
        value: id,
        label: nome
      })).sort((a, b) => a.label.localeCompare(b.label));

      setAcoesControle(acoesOptions);
      console.log('✅ Ações de controle carregadas:', acoesOptions.length);

      // 7. Carregar situações de risco
      const { data: situacoesData, error: errorSituacoes } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select('situacao_risco')
        .not('situacao_risco', 'is', null)
        .order('situacao_risco');

      if (errorSituacoes) {
        console.error('❌ Erro ao carregar situações:', errorSituacoes);
        throw new Error('Erro ao carregar situações');
      }

      const situacoesUnicas = Array.from(new Set(
        situacoesData?.map(item => item.situacao_risco).filter(Boolean) || []
      )).map(situacao => ({
        value: situacao,
        label: situacao
      }));

      setSituacoesRisco(situacoesUnicas);
      console.log('✅ Situações de risco carregadas:', situacoesUnicas.length);

      setDataLoaded(true);
      console.log('🎉 Carregamento de dados concluído com sucesso!');

    } catch (err) {
      console.error('💥 Erro ao carregar dados dos filtros:', err);
      setError('Erro ao carregar opções de filtros');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados dos filtros apenas na primeira expansão
  useEffect(() => {
    if (isExpanded && !dataLoaded) {
      carregarDadosFiltros();
    }
  }, [isExpanded, dataLoaded]);
  
  // Resetar filtros quando resetFilters for true
  useEffect(() => {
    if (resetFilters) {
      setFiltroMacroprocesso('');
      setFiltroProcesso('');
      setFiltroSubprocesso('');
      setResponsavelSelecionado('');
      setAcaoControleSelecionada('');
      setSituacaoRiscoSelecionada('');
      
      // Resetar opções para mostrar todas
      if (dataLoaded) {
        atualizarOpcoesDisponiveis('', '', '');
      }
    }
  }, [resetFilters, dataLoaded]);

  // useEffect único para inicializar opções quando dados são carregados
  useEffect(() => {
    if (dataLoaded && !isUpdatingHierarchy) {
      console.log('🔄 Inicializando opções de filtro...');
      atualizarOpcoesDisponiveis(filtroMacroprocesso, filtroProcesso, filtroSubprocesso);
    }
  }, [dataLoaded, macroprocessosOriginais, processosOriginais, subprocessosOriginais]);

  // Função para limpar todos os filtros
  const limparFiltros = async () => {
    console.log('🧹 Limpando todos os filtros');
    
    // Resetar filtros selecionados
    setFiltroMacroprocesso('');
    setFiltroProcesso('');
    setFiltroSubprocesso('');
    setResponsavelSelecionado('');
    setAcaoControleSelecionada('');
    setSituacaoRiscoSelecionada('');
    
    // Usar função centralizada para resetar opções
    await atualizarOpcoesDisponiveis('', '', '');
  };

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    const payload = {
      macroprocesso: filtroMacroprocesso || null,
      processo: filtroProcesso || null,
      subprocesso: filtroSubprocesso || null,
      responsavel: responsavelSelecionado || null,
      acaoControle: acaoControleSelecionada || null,
      situacaoRisco: situacaoRiscoSelecionada || null
    };
    
    console.log('📤 Aplicando filtros:', payload);
    if (onApply) onApply(payload);
    onToggle();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="text-red-700 text-sm">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    );
  }

  // Renderização do conteúdo dos filtros (sem header)
  const renderContent = (withPadding: boolean) => (
    <div className={withPadding ? 'border-t border-gray-200 p-6' : ''}>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Carregando filtros...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Macroprocesso</label>
              <select
                value={filtroMacroprocesso}
                onChange={async (e) => {
                  const valor = e.target.value;
                  console.log('🔄 Mudança de macroprocesso:', valor);
                  await atualizarFiltrosHierarquicos(valor, filtroProcesso, filtroSubprocesso, 'macroprocesso');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os macroprocessos</option>
                {macroprocessosDisponiveis.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Processo</label>
              <select
                value={filtroProcesso}
                onChange={async (e) => {
                  const valor = e.target.value;
                  console.log('🔄 Mudança de processo:', valor);
                  await atualizarFiltrosHierarquicos(filtroMacroprocesso, valor, filtroSubprocesso, 'processo');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os processos</option>
                {processosDisponiveis.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Subprocesso</label>
              <select
                value={filtroSubprocesso}
                onChange={async (e) => {
                  const valor = e.target.value;
                  console.log('🔄 Mudança de subprocesso:', valor);
                  await atualizarFiltrosHierarquicos(filtroMacroprocesso, filtroProcesso, valor, 'subprocesso');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os subprocessos</option>
                {subprocessosDisponiveis.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Responsável pelo Processo</label>
              <select
                value={responsavelSelecionado}
                onChange={(e) => setResponsavelSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os responsáveis</option>
                {responsaveis.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ação de Controle</label>
              <select
                value={acaoControleSelecionada}
                onChange={(e) => setAcaoControleSelecionada(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas as ações</option>
                {acoesControle.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Situação do Risco</label>
              <select
                value={situacaoRiscoSelecionada}
                onChange={(e) => setSituacaoRiscoSelecionada(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todas as situações</option>
                {situacoesRisco.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button onClick={() => limparFiltros()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">Limpar Filtros</button>
            <button onClick={aplicarFiltros} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">Aplicar Filtros</button>
          </div>
        </>
      )}
    </div>
  );

  // Modo embutido: renderiza apenas o conteúdo sem header
  if (embedded) {
    if (!isExpanded) return null;
    return renderContent(false);
  }

  // Modo painel completo com header
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros - Riscos de Processos de Trabalho</h3>
        </div>
        <div className="flex items-center space-x-2">
          {(filtroMacroprocesso || filtroProcesso || filtroSubprocesso ||
            responsavelSelecionado || acaoControleSelecionada || situacaoRiscoSelecionada) && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Filtros ativos</span>
          )}
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </div>
      </div>
      {isExpanded && renderContent(true)}
    </div>
  );
};

export default RiscosProcessosFilterSection;
