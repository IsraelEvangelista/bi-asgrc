import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Action, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';

interface AllActionsData {
  actions: Action[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAllActionsData = (): AllActionsData => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllActions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar TODOS os dados da tabela 009_acoes sem paginação
      const { data, error: fetchError } = await supabase
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
          updated_at,
          hist_acao:023_hist_acao!fk_hist_acao_acao(
            perc_implementacao,
            justificativa_observacao,
            impacto_atraso_nao_implementacao,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de ações: ${fetchError.message}`);
      }

      // Processar dados relacionados para cada ação
      const actionsWithRelatedData: Action[] = [];
      
      for (const action of data || []) {
        // Obter o histórico mais recente para o percentual de implementação
        const histAcao = Array.isArray(action.hist_acao) ? action.hist_acao : [];
        const latestHist = histAcao.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Buscar sigla_area da tabela 003_areas_gerencias
        let sigla_area = '';
        if (action.area_executora && Array.isArray(action.area_executora) && action.area_executora.length > 0) {
          const { data: areaData } = await supabase
            .from('003_areas_gerencias')
            .select('sigla_area')
            .eq('id', action.area_executora[0])
            .single();
          sigla_area = areaData?.sigla_area || '';
        }

        // Buscar eventos_riscos da tabela 006_matriz_riscos através da relação 016_rel_acoes_riscos
        let eventos_riscos = '';
        const { data: relRiscoData } = await supabase
          .from('016_rel_acoes_riscos')
          .select(`
            006_matriz_riscos!fk_rel_acoes_riscos_risco(
              eventos_riscos
            )
          `)
          .eq('id_acao', action.id)
          .limit(1)
          .single();
        
        if (relRiscoData && relRiscoData['006_matriz_riscos']) {
          eventos_riscos = (relRiscoData['006_matriz_riscos'] as any).eventos_riscos || '';
        }

        // Buscar created_at da tabela 023_hist_acao
        let hist_created_at = '';
        if (latestHist) {
          hist_created_at = latestHist.created_at;
        }

        const processedAction: Action = {
          id: action.id,
          id_ref: action.id_ref,
          desc_acao: action.desc_acao || '',
          area_executora: Array.isArray(action.area_executora) ? action.area_executora : [],
          acao_transversal: action.acao_transversal || false,
          tipo_acao: action.tipo_acao as TipoAcao,
          prazo_implementacao: action.prazo_implementacao,
          novo_prazo: action.novo_prazo,
          status: action.status as StatusAcao,
          justificativa_observacao: latestHist?.justificativa_observacao,
          impacto_atraso_nao_implementacao: latestHist?.impacto_atraso_nao_implementacao,
          desc_evidencia: action.desc_evidencia,
          situacao: action.situacao as SituacaoAcao,
          mitiga_fatores_risco: action.mitiga_fatores_risco,
          url: action.url,
          perc_implementacao: latestHist?.perc_implementacao || 0,
          apuracao: undefined, // Campo não existe na estrutura atual
          created_at: action.created_at,
          updated_at: action.updated_at,
          sigla_area,
          eventos_riscos,
          hist_created_at
        };
        
        actionsWithRelatedData.push(processedAction);
      }

      setActions(actionsWithRelatedData);
    } catch (err) {
      console.error('Erro no useAllActionsData:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchAllActions();
  };

  useEffect(() => {
    fetchAllActions();
  }, []);

  return {
    actions,
    loading,
    error,
    refetch
  };
};