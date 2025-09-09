import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscoPorPlanoResposta {
  plano_resposta_risco: string;
  total_acoes: number;
}

interface RiscosPorPlanoRespostaData {
  dados: RiscoPorPlanoResposta[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const useRiscosPorPlanoResposta = (): RiscosPorPlanoRespostaData => {
  const [data, setData] = useState<RiscosPorPlanoRespostaData>({
    dados: [],
    total: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchRiscosPorPlanoResposta = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: acoes, error } = await supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_acao_controle, plano_resposta_risco')
          .not('plano_resposta_risco', 'is', null)
          .not('plano_resposta_risco', 'eq', '')
          .not('id_acao_controle', 'is', null);

        if (error) {
          console.error('Erro ao buscar riscos por plano de resposta:', error);
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Erro ao carregar dados de plano de resposta do risco'
          }));
          return;
        }

        // Agrupar por plano_resposta_risco e contar todos os registros (não distinta)
        const agrupados = acoes?.reduce((acc, item) => {
          const plano = item.plano_resposta_risco;
          if (!acc[plano]) {
            acc[plano] = 0;
          }
          acc[plano]++;
          return acc;
        }, {} as Record<string, number>) || {};

        // Converter para array com contagem
        const dadosProcessados = Object.entries(agrupados).map(([plano, count]) => ({
          plano_resposta_risco: plano,
          total_acoes: count
        }));

        const totalAcoes = dadosProcessados.reduce((sum, item) => sum + item.total_acoes, 0);

        setData({
          dados: dadosProcessados,
          total: totalAcoes,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro geral ao buscar riscos por plano de resposta:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Erro inesperado ao carregar dados'
        }));
      }
    };

    fetchRiscosPorPlanoResposta();
  }, []);

  return data;
};