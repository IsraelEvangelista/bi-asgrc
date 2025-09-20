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
    macroprocessoId: string;
    processoId: string;
    subprocessoId: string;
    responsavelId: string;
    acaoId: string;
    situacaoRisco: string;
  }) => void;
}

const RiscosProcessosFilterSection: React.FC<RiscosProcessosFilterSectionProps> = ({
  isExpanded,
  onToggle,
  embedded = false,
  resetFilters = false,
  onApply,
}) => {
  // Estados para as opções de filtros
  const [macroprocessos, setMacroprocessos] = useState<FilterOption[]>([]);
  const [processos, setProcessos] = useState<FilterOption[]>([]);
  const [subprocessos, setSubprocessos] = useState<FilterOption[]>([]);
  const [responsaveis, setResponsaveis] = useState<FilterOption[]>([]);
  const [acoesControle, setAcoesControle] = useState<FilterOption[]>([]);
  const [situacoesRisco, setSituacoesRisco] = useState<FilterOption[]>([]);

  // Estados dos filtros selecionados
  const [macroprocessoSelecionado, setMacroprocessoSelecionado] = useState<string>('');
  const [processoSelecionado, setProcessoSelecionado] = useState<string>('');
  const [subprocessoSelecionado, setSubprocessoSelecionado] = useState<string>('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');
  const [acaoControleSelecionada, setAcaoControleSelecionada] = useState<string>('');
  const [situacaoRiscoSelecionada, setSituacaoRiscoSelecionada] = useState<string>('');

  // Estados de carregamento
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Função para carregar dados dos filtros
  const carregarDadosFiltros = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar macroprocessos que realmente existem nos dados de riscos (via 015 -> 005 -> 004)
      const { data: processosComRiscos, error: errorProcessosRiscos } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id_processo,
          processo:005_processos(
            id, 
            processo,
            id_macroprocesso,
            macroprocesso:004_macroprocessos(id, macroprocesso)
          )
        `);

      if (errorProcessosRiscos) {
        throw new Error('Erro ao carregar filtros');
      }

      // Extrair macroprocessos únicos que têm dados reais
      const macroprocessosUnicos = new Map<string, string>();
      processosComRiscos?.forEach((item: any) => {
        const macro = item.processo?.macroprocesso;
        if (macro?.id && macro?.macroprocesso) {
          macroprocessosUnicos.set(macro.id, macro.macroprocesso);
        }
      });

      const macroprocessosData = Array.from(macroprocessosUnicos.entries()).map(([id, nome]) => ({
        id,
        macroprocesso: nome
      }));

      // Processar macroprocessos únicos que realmente existem nos dados
      const macroprocessosComDados = macroprocessosData.map((item: any) => ({
        value: item.id,
        label: item.macroprocesso
      })).sort((a, b) => a.label.localeCompare(b.label));

      setMacroprocessos(macroprocessosComDados);

      // Buscar processos que realmente existem nos dados de riscos
      const processosUnicos = new Map<string, string>();
      processosComRiscos?.forEach((item: any) => {
        const proc = item.processo;
        if (proc?.id && proc?.processo) {
          processosUnicos.set(proc.id, proc.processo);
        }
      });

      const processosComDados = Array.from(processosUnicos.entries()).map(([id, nome]) => ({
        value: id,
        label: nome
      })).sort((a, b) => a.label.localeCompare(b.label));

      setProcessos(processosComDados);

      // Buscar subprocessos únicos (013_subprocessos referencia 005_processos)
      const { data: subprocessosData, error: errorSubprocessos } = await supabase
        .from('013_subprocessos')
        .select('id, subprocesso, id_processo')
        .not('subprocesso', 'is', null)
        .order('subprocesso');

      if (errorSubprocessos) {
        console.error('Erro ao buscar subprocessos:', errorSubprocessos);
        throw errorSubprocessos;
      }

      const subprocessosUnicos = (subprocessosData || []).map((item: any) => ({
        value: item.id,
        label: item.subprocesso
      }));

      setSubprocessos(subprocessosUnicos);

      // Buscar responsáveis que realmente existem nos dados de riscos (responsavel_acao da 015)
      const { data: responsaveisRiscos, error: errorResponsaveisRiscos } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          responsavel_acao,
          responsavel:003_areas_gerencias!responsavel_acao(id, sigla_area, gerencia)
        `);

      if (errorResponsaveisRiscos) {
        throw new Error('Erro ao carregar responsáveis');
      }

      const responsaveisUnicos = new Map<string, string>();
      responsaveisRiscos?.forEach((item: any) => {
        const resp = item.responsavel;
        if (resp?.id && resp?.sigla_area) {
          responsaveisUnicos.set(resp.id, resp.sigla_area);
        }
      });

      const responsaveisComDados = Array.from(responsaveisUnicos.entries()).map(([id, nome]) => ({
        value: id,
        label: nome
      })).sort((a, b) => a.label.localeCompare(b.label));

      setResponsaveis(responsaveisComDados);

      // Buscar ações de controle que realmente existem nos dados de riscos
      const { data: acoesRiscos, error: errorAcoesRiscos } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id_acao_controle,
          acao:014_acoes_controle_proc_trab(id, acao)
        `);

      if (errorAcoesRiscos) {
        throw new Error('Erro ao carregar ações');
      }

      const acoesUnicas = new Map<string, string>();
      acoesRiscos?.forEach((item: any) => {
        const acao = item.acao;
        if (acao?.id && acao?.acao) {
          acoesUnicas.set(acao.id, acao.acao);
        }
      });

      const acoesComDados = Array.from(acoesUnicas.entries()).map(([id, nome]) => ({
        value: id,
        label: nome
      })).sort((a, b) => a.label.localeCompare(b.label));

      setAcoesControle(acoesComDados);

      // Buscar situações de risco únicas da tabela de relacionamento
      const { data: situacoesData, error: errorSituacoes } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select('situacao_risco')
        .not('situacao_risco', 'is', null)
        .order('situacao_risco');

      if (errorSituacoes) {
        throw new Error('Erro ao carregar situações');
      }

      const situacoesUnicas = Array.from(new Set(
        situacoesData?.map(item => item.situacao_risco).filter(Boolean) || []
      )).map(situacao => ({
        value: situacao,
        label: situacao
      }));

      setSituacoesRisco(situacoesUnicas);
      setDataLoaded(true);

    } catch (err) {
      console.error('Erro ao carregar dados dos filtros:', err);
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
      setMacroprocessoSelecionado('');
      setProcessoSelecionado('');
      setSubprocessoSelecionado('');
      setResponsavelSelecionado('');
      setAcaoControleSelecionada('');
      setSituacaoRiscoSelecionada('');
    }
  }, [resetFilters]);

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setMacroprocessoSelecionado('');
    setProcessoSelecionado('');
    setSubprocessoSelecionado('');
    setResponsavelSelecionado('');
    setAcaoControleSelecionada('');
    setSituacaoRiscoSelecionada('');
  };

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    const payload = {
      macroprocessoId: macroprocessoSelecionado,
      processoId: processoSelecionado,
      subprocessoId: subprocessoSelecionado,
      responsavelId: responsavelSelecionado,
      acaoId: acaoControleSelecionada,
      situacaoRisco: situacaoRiscoSelecionada,
    };
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
                value={macroprocessoSelecionado}
                onChange={(e) => setMacroprocessoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os macroprocessos</option>
                {macroprocessos.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Processo</label>
              <select
                value={processoSelecionado}
                onChange={(e) => setProcessoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os processos</option>
                {processos.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Subprocesso</label>
              <select
                value={subprocessoSelecionado}
                onChange={(e) => setSubprocessoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Todos os subprocessos</option>
                {subprocessos.map((option) => (
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
            <button onClick={limparFiltros} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">Limpar Filtros</button>
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
          {(macroprocessoSelecionado || processoSelecionado || subprocessoSelecionado ||
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
