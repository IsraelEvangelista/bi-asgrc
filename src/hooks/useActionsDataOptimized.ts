import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Action, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';

interface ActionsData {
  actions: Action[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export const useActionsData = (): ActionsData => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  const ITEMS_PER_PAGE = 25;

  const fetchActions = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando busca otimizada de ações (versão corrigida)...');

      // Primeiro, buscar o total de registros - versão correta
      const { count, error: countError } = await supabase
        .from('009_acoes')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Erro ao contar registros:', countError);
        throw new Error(`Erro ao contar registros: ${countError.message}`);
      }

      const totalRecords = count || 0;
      const calculatedTotalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
      setTotalCount(totalRecords);
      setTotalPages(calculatedTotalPages);

      console.log('📊 Total de registros:', totalRecords);

      // Calcular offset para paginação
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Buscar dados básicos da tabela 009_acoes com query simplificada
      const { data: actionsData, error: fetchError } = await supabase
        .from('009_acoes')
        .select(`
          id,
          desc_acao,
          status,
          situacao,
          prazo_implementacao,
          novo_prazo,
          area_executora,
          tipo_acao,
          id_ref,
          acao_transversal,
          desc_evidencia,
          mitiga_fatores_risco,
          url,
          created_at,
          updated_at
        `)
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Erro ao buscar dados de ações:', fetchError);
        throw new Error(`Erro ao buscar dados de ações: ${fetchError.message}`);
      }

      console.log('📋 Ações buscadas:', actionsData?.length);

      if (!actionsData || actionsData.length === 0) {
        setActions([]);
        return;
      }

      // Processar dados básicos sem consultas relacionadas complexas
      const processedActions: Action[] = actionsData.map(action => {
        return {
          id: action.id,
          id_ref: action.id_ref,
          desc_acao: action.desc_acao || '',
          area_executora: Array.isArray(action.area_executora) ? action.area_executora : [],
          acao_transversal: action.acao_transversal || false,
          tipo_acao: action.tipo_acao as TipoAcao,
          prazo_implementacao: action.prazo_implementacao,
          novo_prazo: action.novo_prazo,
          status: action.status as StatusAcao,
          justificativa_observacao: undefined, // Será buscado em uma consulta separada se necessário
          impacto_atraso_nao_implementacao: undefined,
          desc_evidencia: action.desc_evidencia,
          situacao: action.situacao as SituacaoAcao,
          mitiga_fatores_risco: action.mitiga_fatores_risco,
          url: action.url,
          perc_implementacao: 0, // Valor padrão, será atualizado pela busca do histórico
          apuracao: undefined,
          created_at: action.created_at,
          updated_at: action.updated_at,
          sigla_area: '', // Será preenchido posteriormente se necessário
          eventos_riscos: '',
          hist_created_at: ''
        };
      });

      // Buscar dados relacionados em consultas separadas (com tratamento de erro)
      try {
        const actionIds = actionsData.map(action => action.id);
        
        // 1. Buscar históricos de forma segura
        const { data: histData } = await supabase
          .from('023_hist_acao')
          .select('id_acao, perc_implementacao, created_at')
          .in('id_acao', actionIds)
          .order('created_at', { ascending: false });

        if (histData) {
          console.log('📈 Históricos buscados:', histData.length);
          
          // Atualizar percentuais de implementação
          const histMap = new Map();
          histData.forEach(hist => {
            if (!histMap.has(hist.id_acao)) {
              histMap.set(hist.id_acao, hist.perc_implementacao || 0);
            }
          });

          processedActions.forEach(action => {
            if (histMap.has(action.id)) {
              action.perc_implementacao = histMap.get(action.id);
            }
          });
        }

        // 2. Buscar siglas das áreas executoras
        const areaIds = actionsData
          .filter(action => action.area_executora && Array.isArray(action.area_executora) && action.area_executora.length > 0)
          .map(action => action.area_executora[0])
          .filter(Boolean);

        if (areaIds.length > 0) {
          const { data: areasData } = await supabase
            .from('003_areas_gerencias')
            .select('id, sigla_area')
            .in('id', areaIds);

          if (areasData) {
            console.log('🏢 Áreas buscadas:', areasData.length);
            
            const areasMap = new Map();
            areasData.forEach(area => {
              areasMap.set(area.id, area.sigla_area);
            });

            processedActions.forEach(action => {
              if (action.area_executora && Array.isArray(action.area_executora) && action.area_executora.length > 0) {
                action.sigla_area = areasMap.get(action.area_executora[0]) || '';
              }
            });
          }
        }

        // 3. Buscar riscos relacionados através da tabela de relação 016_rel_acoes_riscos - TEMPORARIAMENTE DESABILITADO
        // TODO: Reabilitar após descobrir estrutura correta da tabela de riscos
        /*
        const { data: riskRelData, error: riskError } = await supabase
          .from('016_rel_acoes_riscos')
          .select('id_acao, id_risco')
          .in('id_acao', actionIds);

        if (riskRelData) {
          console.log('⚠️ Relações de risco buscadas:', riskRelData.length);
          processedActions.forEach(action => {
            action.eventos_riscos = 'Risco em análise'; // Placeholder temporário
          });
        }
        */
        
      } catch (relatedDataError) {
        console.warn('⚠️ Erro ao buscar dados relacionados (continuando com dados básicos):', relatedDataError);
        // Continuar com os dados básicos
      }

      console.log('✅ Ações processadas:', processedActions.length);
      setActions(processedActions);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ Erro no useActionsDataOptimized (versão corrigida):', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar ações';
      setError(errorMessage);
      
      // Tentar carregar apenas dados básicos como fallback
      try {
        console.log('🔄 Tentando fallback com consulta mais simples...');
        const { data: fallbackData } = await supabase
          .from('009_acoes')
          .select('id, desc_acao, status, situacao')
          .limit(10);
        
        if (fallbackData) {
          const fallbackActions: Action[] = fallbackData.map(action => ({
            id: action.id,
            desc_acao: action.desc_acao || '',
            status: action.status as StatusAcao,
            situacao: action.situacao as SituacaoAcao,
            area_executora: [],
            acao_transversal: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            perc_implementacao: 0
          }));
          setActions(fallbackActions);
          console.log('✅ Fallback executado com sucesso');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchActions(currentPage);
  };

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchActions(page);
    }
  };

  useEffect(() => {
    fetchActions(1);
  }, []);

  return {
    actions,
    loading,
    error,
    refetch,
    totalCount,
    currentPage,
    totalPages,
    setPage
  };
};