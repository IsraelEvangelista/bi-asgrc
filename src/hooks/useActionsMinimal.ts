import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Action, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';

interface MinimalActionsData {
  actions: Action[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

export const useActionsMinimal = (): MinimalActionsData => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Teste: Hook minimal iniciando...');

      // Buscar todos os registros com campos adicionais para tabela
      const { data: actionsData, error: fetchError } = await supabase
        .from('009_acoes')
        .select('id, desc_acao, status, situacao, created_at, area_executora, id_ref, tipo_acao, prazo_implementacao, novo_prazo')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Erro na consulta minimal:', fetchError);
        throw new Error(`Erro: ${fetchError.message}`);
      }

      console.log('✅ Consulta minimal OK:', actionsData?.length);

      if (!actionsData) {
        setActions([]);
        setTotalCount(0);
        return;
      }

      // Processar dados mantendo nulos como estão (para contabilização correta nos gráficos)
      const processedActions: Action[] = actionsData.map(action => {
        return {
          id: action.id,
          desc_acao: action.desc_acao || 'Sem descrição',
          status: action.status as StatusAcao,
          situacao: action.situacao as SituacaoAcao,
          created_at: action.created_at,
          updated_at: action.created_at,
          
          // Usar dados reais
          area_executora: Array.isArray(action.area_executora) ? action.area_executora : [],
          id_ref: action.id_ref,
          tipo_acao: action.tipo_acao as TipoAcao,
          prazo_implementacao: action.prazo_implementacao,
          novo_prazo: action.novo_prazo,
          acao_transversal: false,
          perc_implementacao: 0,
          justificativa_observacao: undefined,
          impacto_atraso_nao_implementacao: undefined,
          desc_evidencia: undefined,
          mitiga_fatores_risco: undefined,
          url: undefined,
          apuracao: undefined,
          sigla_area: 'N/A',
          eventos_riscos: 'N/A',
          hist_created_at: ''
        };
      });

      setActions(processedActions);
      setTotalCount(processedActions.length);
      console.log('✅ Processamento inicial concluído:', processedActions.length);
      
      // Buscar dados relacionados de forma assíncrona
      setTimeout(async () => {
        try {
          await enrichWithRelatedData(processedActions);
          setActions([...processedActions]); // Force re-render
          console.log('✅ Enriquecimento concluído');
        } catch (enrichError) {
          console.warn('⚠️ Erro ao enriquecer dados relacionados:', enrichError);
        }
      }, 100);

    } catch (err) {
      console.error('❌ Erro no hook minimal:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const enrichWithRelatedData = async (actions: Action[]) => {
    const actionIds = actions.map(a => a.id);
    
    // Buscar dados em paralelo usando Promise.allSettled
    const enrichmentPromises = [
      // 1. Buscar siglas das áreas
      (async () => {
        try {
          const areaIds = actions
            .filter(action => action.area_executora && action.area_executora.length > 0)
            .map(action => action.area_executora[0])
            .filter(Boolean);

          if (areaIds.length > 0) {
            const { data: areasData } = await supabase
              .from('003_areas_gerencias')
              .select('id, sigla_area')
              .in('id', areaIds);

            if (areasData) {
              const areasMap = new Map(areasData.map(area => [area.id, area.sigla_area]));
              actions.forEach(action => {
                if (action.area_executora && action.area_executora.length > 0) {
                  action.sigla_area = areasMap.get(action.area_executora[0]) || 'N/A';
                }
              });
            }
          }
        } catch (err) {
          console.warn('⚠️ Erro ao buscar áreas:', err);
        }
      })(),
      
      // 2. Buscar eventos de risco
      (async () => {
        try {
          const { data: riskRelData } = await supabase
            .from('016_rel_acoes_riscos')
            .select(`
              id_acao,
              006_matriz_riscos (
                eventos_riscos,
                sigla
              )
            `)
            .in('id_acao', actionIds)
            .limit(500);

          if (riskRelData) {
            const riskMap = new Map<string, string[]>();
            const siglaMap = new Map<string, string>();
            
            riskRelData.forEach((rel: any) => {
              const matrizRiscos = rel['006_matriz_riscos'];
              if (matrizRiscos && typeof matrizRiscos === 'object') {
                
                // Armazenar eventos_riscos
                if (matrizRiscos.eventos_riscos) {
                  const existingRisks = riskMap.get(rel.id_acao) || [];
                  existingRisks.push(matrizRiscos.eventos_riscos);
                  riskMap.set(rel.id_acao, existingRisks);
                }
                
                // Armazenar sigla (assumindo uma ação por sigla - pegar a primeira)
                if (matrizRiscos.sigla && !siglaMap.has(rel.id_acao)) {
                  siglaMap.set(rel.id_acao, matrizRiscos.sigla);
                }
              }
            });

            actions.forEach(action => {
              // Definir eventos_riscos
              if (riskMap.has(action.id)) {
                const risks = riskMap.get(action.id)!;
                action.eventos_riscos = risks.join(', ');
                // Definir id_ref com eventos_riscos ao invés de sigla
                action.id_ref = risks.join(', ');
              }
              
              // Manter sigla disponível se necessário para outras funcionalidades
              if (siglaMap.has(action.id)) {
                // Não sobrescrever id_ref se já foi definido com eventos_riscos
                if (!action.id_ref) {
                  action.id_ref = siglaMap.get(action.id)!;
                }
              }
            });
          }
        } catch (err) {
          console.warn('⚠️ Erro ao buscar riscos:', err);
        }
      })(),
      
      // 3. Buscar percentuais de implementação e data de referência
      (async () => {
        try {
          const { data: histData } = await supabase
            .from('023_hist_acao')
            .select('id_acao, perc_implementacao, created_at')
            .in('id_acao', actionIds)
            .order('created_at', { ascending: false })
            .limit(500);

          if (histData) {
            const histMap = new Map();
            const dateMap = new Map();
            
            histData.forEach(hist => {
              if (!histMap.has(hist.id_acao)) {
                histMap.set(hist.id_acao, hist.perc_implementacao || 0);
                dateMap.set(hist.id_acao, hist.created_at);
              }
            });

            actions.forEach(action => {
              if (histMap.has(action.id)) {
                action.perc_implementacao = histMap.get(action.id);
                action.hist_created_at = dateMap.get(action.id) || '';
              }
            });
          }
        } catch (err) {
          console.warn('⚠️ Erro ao buscar histórico:', err);
        }
      })()
    ];

    await Promise.allSettled(enrichmentPromises);
  };

  const refetch = async () => {
    await fetchActions();
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return {
    actions,
    loading,
    error,
    refetch,
    totalCount
  };
};