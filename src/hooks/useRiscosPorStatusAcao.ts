import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscoPorStatusAcao {
  status_acao: string;
  total_acoes: number;
}

interface RiscosPorStatusAcaoData {
  dados: RiscoPorStatusAcao[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const useRiscosPorStatusAcao = (): RiscosPorStatusAcaoData => {
  const [data, setData] = useState<RiscosPorStatusAcaoData>({
    dados: [],
    total: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchRiscosPorStatusAcao = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: acoes, error } = await supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_acao_controle, inicio_planejado, fim_planejado, inicio_realizado, fim_realizado')
          .not('id_acao_controle', 'is', null);

        if (error) {
          console.error('Erro ao buscar riscos por status de ação:', error);
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Erro ao carregar dados de status das ações'
          }));
          return;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data

        // Calcular status baseado nas datas
        const acoesComStatus = acoes?.map(acao => {
          const inicioRealizado = acao.inicio_realizado ? new Date(acao.inicio_realizado) : null;
          const fimRealizado = acao.fim_realizado ? new Date(acao.fim_realizado) : null;
          const inicioPlanejado = acao.inicio_planejado ? new Date(acao.inicio_planejado) : null;
          const fimPlanejado = acao.fim_planejado ? new Date(acao.fim_planejado) : null;

          let status = 'Não iniciada';

          // Concluído: fim_realizado não é null
          if (fimRealizado) {
            status = 'Concluído';
          }
          // Em andamento: inicio_realizado não é null e fim_realizado é null
          else if (inicioRealizado && !fimRealizado) {
            // Verificar se está atrasado
            if (fimPlanejado && hoje > fimPlanejado) {
              status = 'Atrasado';
            } else {
              status = 'Em andamento';
            }
          }
          // Não iniciada: inicio_realizado é null
          else if (!inicioRealizado) {
            // Verificar se deveria ter começado (atrasado para iniciar)
            if (inicioPlanejado && hoje > inicioPlanejado) {
              status = 'Atrasado';
            } else {
              status = 'Não iniciada';
            }
          }

          return {
            ...acao,
            status_acao: status
          };
        }) || [];

        // Agrupar por status e contar
        const agrupados = acoesComStatus.reduce((acc, item) => {
          const status = item.status_acao;
          if (!acc[status]) {
            acc[status] = 0;
          }
          acc[status]++;
          return acc;
        }, {} as Record<string, number>);

        // Converter para array com contagem
        const dadosProcessados = Object.entries(agrupados).map(([status, count]) => ({
          status_acao: status,
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
        console.error('Erro geral ao buscar riscos por status de ação:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Erro inesperado ao carregar dados'
        }));
      }
    };

    fetchRiscosPorStatusAcao();
  }, []);

  return data;
};