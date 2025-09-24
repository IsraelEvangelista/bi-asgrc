import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Action, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';

interface OptimizedActionsData {
  actions: Action[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
  hasMore: boolean;
}

// Cache simples em memória
const actionsCache = new Map<string, { data: Action[]; timestamp: number; totalCount: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useActionsOptimized = (
  page: number = 1,
  limit: number = 50,
  filters?: Record<string, any>
): OptimizedActionsData => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Criar chave de cache baseada em parâmetros
  const cacheKey = useMemo(() => {
    return `actions_${page}_${limit}_${JSON.stringify(filters || {})}`;
  }, [page, limit, filters]);

  const fetchActions = useCallback(async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache primeiro
      if (useCache) {
        const cached = actionsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          console.log('🚀 Dados carregados do cache');
          setActions(cached.data);
          setTotalCount(cached.totalCount);
          setHasMore(cached.data.length === limit);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Buscando dados otimizados...');

      // Query otimizada com JOIN e paginação no servidor
      const { data: actionsData, error: fetchError, count } = await supabase
        .from('009_acoes')
        .select(`
          id, 
          desc_acao, 
          status, 
          situacao, 
          created_at, 
          area_executora, 
          id_ref, 
          tipo_acao, 
          prazo_implementacao, 
          novo_prazo,
          perc_implementacao,
          justificativa_observacao
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (fetchError) {
        console.error('❌ Erro na consulta otimizada:', fetchError);
        throw new Error(`Erro: ${fetchError.message}`);
      }

      if (!actionsData) {
        setActions([]);
        setTotalCount(0);
        setHasMore(false);
        return;
      }

      // Processar dados de forma otimizada
      const processedActions: Action[] = actionsData.map(action => ({
        id: action.id,
        desc_acao: action.desc_acao || 'Sem descrição',
        status: action.status as StatusAcao,
        situacao: action.situacao as SituacaoAcao,
        created_at: action.created_at,
        updated_at: action.created_at,
        area_executora: Array.isArray(action.area_executora) ? action.area_executora : [],
        id_ref: action.id_ref,
        tipo_acao: action.tipo_acao as TipoAcao,
        prazo_implementacao: action.prazo_implementacao,
        novo_prazo: action.novo_prazo,
        acao_transversal: false,
        perc_implementacao: action.perc_implementacao || 0,
        justificativa_observacao: action.justificativa_observacao,
        // Valores default para campos opcionais
        impacto_atraso_nao_implementacao: undefined,
        desc_evidencia: undefined,
        mitiga_fatores_risco: undefined,
        url: undefined,
        apuracao: undefined,
        sigla_area: 'N/A',
        eventos_riscos: 'N/A',
        hist_created_at: ''
      }));

      // Buscar dados relacionados em lote (otimizado)
      await enrichActionsData(processedActions);

      // Atualizar cache
      actionsCache.set(cacheKey, {
        data: processedActions,
        timestamp: Date.now(),
        totalCount: count || 0
      });

      setActions(processedActions);
      setTotalCount(count || 0);
      setHasMore(processedActions.length === limit);

      console.log('✅ Dados otimizados carregados:', processedActions.length);

    } catch (err) {
      console.error('❌ Erro no hook otimizado:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [cacheKey, page, limit]);

  // Função otimizada para enriquecimento de dados
  const enrichActionsData = async (actions: Action[]) => {
    if (actions.length === 0) return;

    const actionIds = actions.map(a => a.id);
    
    try {
      // Buscar todos os dados relacionados em uma única query usando CTEs
      const { data: enrichmentData } = await supabase.rpc('get_actions_enriched_data', {
        action_ids: actionIds
      });

      if (enrichmentData) {
        // Processar dados enriched de forma otimizada
        const areasMap = new Map();
        const risksMap = new Map();
        const histMap = new Map();

        enrichmentData.forEach((item: any) => {
          if (item.area_data) areasMap.set(item.id_acao, item.area_data);
          if (item.risk_data) risksMap.set(item.id_acao, item.risk_data);
          if (item.hist_data) histMap.set(item.id_acao, item.hist_data);
        });

        // Aplicar dados enriquecidos
        actions.forEach(action => {
          const areaData = areasMap.get(action.id);
          const riskData = risksMap.get(action.id);
          const histData = histMap.get(action.id);

          if (areaData) action.sigla_area = areaData.sigla_area;
          if (riskData) {
            action.eventos_riscos = riskData.eventos_riscos;
            action.id_ref = riskData.sigla;
          }
          if (histData) {
            action.perc_implementacao = histData.perc_implementacao || action.perc_implementacao;
            action.hist_created_at = histData.created_at;
          }
        });
      }
    } catch (err) {
      console.warn('⚠️ Erro ao enriquecer dados (modo fallback):', err);
      // Fallback para método original se RPC não existir
      await enrichActionsDataFallback(actions);
    }
  };

  // Método fallback para enriquecimento (compatibilidade)
  const enrichActionsDataFallback = async (actions: Action[]) => {
    const actionIds = actions.map(a => a.id);
    
    // Buscar em paralelo mas com menos queries
    const [areasRes, risksRes, histRes] = await Promise.allSettled([
      supabase
        .from('003_areas_gerencias')
        .select('id, sigla_area')
        .in('id', actions.flatMap(a => a.area_executora).filter(Boolean)),
      
      supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_acao,
          006_matriz_riscos (eventos_riscos, sigla)
        `)
        .in('id_acao', actionIds),
      
      supabase
        .from('023_hist_acao')
        .select('id_acao, perc_implementacao, created_at')
        .in('id_acao', actionIds)
        .order('created_at', { ascending: false })
    ]);

    // Processar resultados
    if (areasRes.status === 'fulfilled' && areasRes.value.data) {
      const areasMap = new Map(areasRes.value.data.map(area => [area.id, area.sigla_area]));
      actions.forEach(action => {
        if (action.area_executora?.length > 0) {
          action.sigla_area = areasMap.get(action.area_executora[0]) || 'N/A';
        }
      });
    }

    if (risksRes.status === 'fulfilled' && risksRes.value.data) {
      const riskMap = new Map();
      risksRes.value.data.forEach((rel: any) => {
        if (rel['006_matriz_riscos']) {
          const risk = rel['006_matriz_riscos'];
          riskMap.set(rel.id_acao, {
            eventos_riscos: risk.eventos_riscos,
            sigla: risk.sigla
          });
        }
      });
      
      actions.forEach(action => {
        const riskData = riskMap.get(action.id);
        if (riskData) {
          action.eventos_riscos = riskData.eventos_riscos;
          action.id_ref = riskData.sigla;
        }
      });
    }

    if (histRes.status === 'fulfilled' && histRes.value.data) {
      const histMap = new Map();
      histRes.value.data.forEach(hist => {
        if (!histMap.has(hist.id_acao)) {
          histMap.set(hist.id_acao, hist);
        }
      });
      
      actions.forEach(action => {
        const histData = histMap.get(action.id);
        if (histData) {
          action.perc_implementacao = histData.perc_implementacao || action.perc_implementacao;
          action.hist_created_at = histData.created_at;
        }
      });
    }
  };

  const refetch = useCallback(async () => {
    // Forçar busca sem cache
    await fetchActions(false);
  }, [fetchActions]);

  // Limpar cache quando necessário
  const clearCache = useCallback(() => {
    actionsCache.clear();
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  return {
    actions,
    loading,
    error,
    refetch,
    totalCount,
    hasMore
  };
};

// Hook para limpar cache (export adicional)
export const useClearActionsCache = () => {
  return useCallback(() => {
    actionsCache.clear();
    console.log('🗑️ Cache de ações limpo');
  }, []);
};