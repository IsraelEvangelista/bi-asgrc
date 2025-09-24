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
  
  const ITEMS_PER_PAGE = 50; // Aumentar para reduzir número de páginas

  const fetchActions = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando busca simplificada de ações...');

      // Primeiro, contar sem select específico
      let totalRecords = 0;
      try {
        const { count, error: countError } = await supabase
          .from('009_acoes')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.warn('⚠️ Erro na contagem, usando contagem alternativa:', countError.message);
          // Fallback: buscar todos e contar
          const { data: allData } = await supabase
            .from('009_acoes')
            .select('id');
          totalRecords = allData?.length || 0;
        } else {
          totalRecords = count || 0;
        }
      } catch (countErr) {
        console.warn('⚠️ Erro na contagem, estimando...', countErr);
        totalRecords = 200; // Estimativa baseada no teste anterior
      }

      const calculatedTotalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
      setTotalCount(totalRecords);
      setTotalPages(calculatedTotalPages);

      console.log('📊 Total de registros:', totalRecords);

      // Calcular offset para paginação
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Buscar dados básicos - query super simples
      const { data: actionsData, error: fetchError } = await supabase
        .from('009_acoes')
        .select('*')
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

      // Processar dados básicos
      const basicActions: Action[] = actionsData.map(action => ({
        id: action.id,
        id_ref: action.id_ref,
        desc_acao: action.desc_acao || '',
        area_executora: Array.isArray(action.area_executora) ? action.area_executora : [],
        acao_transversal: action.acao_transversal || false,
        tipo_acao: action.tipo_acao as TipoAcao,
        prazo_implementacao: action.prazo_implementacao,
        novo_prazo: action.novo_prazo,
        status: action.status as StatusAcao,
        justificativa_observacao: undefined,
        impacto_atraso_nao_implementacao: undefined,
        desc_evidencia: action.desc_evidencia,
        situacao: action.situacao as SituacaoAcao,
        mitiga_fatores_risco: action.mitiga_fatores_risco,
        url: action.url,
        perc_implementacao: 0,
        apuracao: undefined,
        created_at: action.created_at,
        updated_at: action.updated_at,
        sigla_area: '', // Will be populated later
        eventos_riscos: '', // Will be populated later
        hist_created_at: ''
      }));

      // Buscar dados relacionados imediatamente, mas com manejo de erro
      try {
        await enrichActionsData(basicActions);
      } catch (enrichError) {
        console.warn('⚠️ Erro ao enriquecer dados (continuando com dados básicos):', enrichError);
      }

      console.log('✅ Ações básicas processadas:', basicActions.length);
      setActions(basicActions);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ Erro no useActionsData:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar ações';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const enrichActionsData = async (actions: Action[]) => {
    const actionIds = actions.map(action => action.id);
    
    // Usar Promise.allSettled para que uma falha não interrompa as outras
    const enrichmentPromises = [
      // 1. Buscar siglas das áreas
      (async () => {
        try {
          const areaIds = actions
            .filter(action => action.area_executora && action.area_executora.length > 0)
            .map(action => action.area_executora[0])
            .filter(Boolean);

          if (areaIds.length === 0) return;

          const { data: areasData, error } = await supabase
            .from('003_areas_gerencias')
            .select('id, sigla_area')
            .in('id', areaIds);

          if (error) throw error;

          if (areasData) {
            const areasMap = new Map(areasData.map(area => [area.id, area.sigla_area]));
            actions.forEach(action => {
              if (action.area_executora && action.area_executora.length > 0) {
                action.sigla_area = areasMap.get(action.area_executora[0]) || '';
              }
            });
          }
        } catch (err) {
          console.warn('⚠️ Erro ao buscar áreas:', err);
        }
      })(),
      
      // 2. Buscar riscos relacionados
      (async () => {
        try {
          const { data: riskRelData, error } = await supabase
            .from('016_rel_acoes_riscos')
            .select(`
              id_acao,
              006_matriz_riscos (
                eventos_riscos
              )
            `)
            .in('id_acao', actionIds)
            .limit(1000); // Adicionar limite para evitar sobrecarga

          if (error) throw error;

          if (riskRelData) {
            const riskMap = new Map<string, string[]>();
            riskRelData.forEach((rel: any) => {
              const matrizRiscos = rel['006_matriz_riscos'];
              if (matrizRiscos && typeof matrizRiscos === 'object' && matrizRiscos.eventos_riscos) {
                const existingRisks = riskMap.get(rel.id_acao) || [];
                existingRisks.push(matrizRiscos.eventos_riscos);
                riskMap.set(rel.id_acao, existingRisks);
              }
            });

            actions.forEach(action => {
              if (riskMap.has(action.id)) {
                const risks = riskMap.get(action.id)!;
                action.eventos_riscos = risks.join(', ');
              }
            });
          }
        } catch (err) {
          console.warn('⚠️ Erro ao buscar riscos:', err);
        }
      })(),
      
      // 3. Buscar percentuais de implementação
      (async () => {
        try {
          const { data: histData, error } = await supabase
            .from('023_hist_acao')
            .select('id_acao, perc_implementacao, created_at')
            .in('id_acao', actionIds)
            .order('created_at', { ascending: false })
            .limit(1000); // Adicionar limite

          if (error) throw error;

          if (histData) {
            const histMap = new Map();
            histData.forEach(hist => {
              if (!histMap.has(hist.id_acao)) {
                histMap.set(hist.id_acao, hist.perc_implementacao || 0);
              }
            });

            actions.forEach(action => {
              if (histMap.has(action.id)) {
                action.perc_implementacao = histMap.get(action.id);
              }
            });
          }
        } catch (err) {
          console.warn('⚠️ Erro ao buscar histórico:', err);
        }
      })()
    ];

    // Esperar todas as promessas terminarem, independentemente de falhas
    await Promise.allSettled(enrichmentPromises);
    console.log('✅ Processo de enriquecimento concluído');
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