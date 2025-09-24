import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Action, StatusAcao, SituacaoAcao, TipoAcao } from '../types/action';

interface ActionsDataSimple {
  actions: Action[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCount: number;
}

export const useActionsDataSimple = (): ActionsDataSimple => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando busca simplificada de ações...');

      // Buscar APENAS os dados básicos da tabela 009_acoes
      const { data, error: fetchError, count } = await supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da consulta:', { 
        dataLength: data?.length, 
        count, 
        error: fetchError 
      });

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de ações: ${fetchError.message}`);
      }

      setTotalCount(count || 0);

      // Processar dados básicos sem consultas relacionadas
      const processedActions: Action[] = (data || []).map(action => ({
        id: action.id,
        id_ref: action.id_ref,
        desc_acao: action.desc_acao || '',
        area_executora: Array.isArray(action.area_executora) ? action.area_executora : [],
        acao_transversal: action.acao_transversal || false,
        tipo_acao: action.tipo_acao as TipoAcao,
        prazo_implementacao: action.prazo_implementacao,
        novo_prazo: action.novo_prazo,
        status: action.status as StatusAcao,
        justificativa_observacao: undefined, // Será buscado depois se necessário
        impacto_atraso_nao_implementacao: undefined,
        desc_evidencia: action.desc_evidencia,
        situacao: action.situacao as SituacaoAcao,
        mitiga_fatores_risco: action.mitiga_fatores_risco,
        url: action.url,
        perc_implementacao: 0, // Valor padrão
        apuracao: undefined,
        created_at: action.created_at,
        updated_at: action.updated_at,
        sigla_area: '', // Será buscado depois se necessário
        eventos_riscos: '', // Será buscado depois se necessário
        hist_created_at: ''
      }));

      console.log('✅ Ações processadas:', processedActions.length);
      setActions(processedActions);
    } catch (err) {
      console.error('❌ Erro no useActionsDataSimple:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
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