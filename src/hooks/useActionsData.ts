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

      // Primeiro, buscar o total de registros
      const { count, error: countError } = await supabase
        .from('009_acoes')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Erro ao contar registros: ${countError.message}`);
      }

      const totalRecords = count || 0;
      const calculatedTotalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
      setTotalCount(totalRecords);
      setTotalPages(calculatedTotalPages);

      // Calcular offset para paginação
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Buscar dados da tabela 009_acoes com JOINs para obter dados relacionados
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
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de ações: ${fetchError.message}`);
      }

      // Buscar dados relacionados para cada ação
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
       setCurrentPage(page);
    } catch (err) {
      console.error('Erro no useActionsData:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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