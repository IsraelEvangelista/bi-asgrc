import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface IndicatorStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface IndicatorsByStatusResult {
  data: IndicatorStatusData[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook para buscar dados dos indicadores agrupados por status das ações
 * Segue a relação: 008_indicadores → 006_matriz_riscos → 016_rel_acoes_riscos → 009_acoes
 */
export const useIndicatorsByStatus = (): IndicatorsByStatusResult => {
  const [data, setData] = useState<IndicatorStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchIndicatorsByStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados usando consultas diretas do Supabase
        // Primeiro, vamos buscar as ações com status para mapear indicadores
        const { data: acoes, error: acoesError } = await supabase
          .from('009_acoes')
          .select('id, status')
          .not('status', 'is', null);

        if (acoesError) {
          throw new Error(`Erro ao buscar ações: ${acoesError.message}`);
        }

        if (!acoes || acoes.length === 0) {
          console.warn('Nenhuma ação encontrada com status');
          setData([]);
          setTotal(0);
          return;
        }

        // Buscar relações entre ações e riscos
        const acoesIds = acoes.map(acao => acao.id);
        const { data: relAcoesRiscos, error: relError } = await supabase
          .from('016_rel_acoes_riscos')
          .select('id_acao, id_risco')
          .in('id_acao', acoesIds);

        if (relError) {
          throw new Error(`Erro ao buscar relações ações-riscos: ${relError.message}`);
        }

        if (!relAcoesRiscos || relAcoesRiscos.length === 0) {
          console.warn('Nenhuma relação ação-risco encontrada');
          setData([]);
          setTotal(0);
          return;
        }

        // Buscar indicadores relacionados aos riscos
        const riscosIds = [...new Set(relAcoesRiscos.map(rel => rel.id_risco))];
        const { data: indicadores, error: indicadoresError } = await supabase
          .from('008_indicadores')
          .select('id, id_risco')
          .in('id_risco', riscosIds);

        if (indicadoresError) {
          throw new Error(`Erro ao buscar indicadores: ${indicadoresError.message}`);
        }

        if (!indicadores || indicadores.length === 0) {
          console.warn('Nenhum indicador encontrado');
          setData([]);
          setTotal(0);
          return;
        }

        // Verificar se existem históricos para os indicadores
        const indicadoresIds = indicadores.map(ind => ind.id);
        const { data: historicos, error: historicosError } = await supabase
          .from('019_historico_indicadores')
          .select('id_indicador')
          .in('id_indicador', indicadoresIds);

        if (historicosError) {
          throw new Error(`Erro ao buscar histórico de indicadores: ${historicosError.message}`);
        }

        // Mapear indicadores que têm histórico
        const indicadoresComHistorico = new Set(historicos?.map(h => h.id_indicador) || []);
        const indicadoresFiltrados = indicadores.filter(ind => indicadoresComHistorico.has(ind.id));

        if (indicadoresFiltrados.length === 0) {
          console.warn('Nenhum indicador com histórico encontrado');
          setData([]);
          setTotal(0);
          return;
        }

        // Agrupar indicadores por status das ações
        const statusCount: Record<string, Set<number>> = {};
        
        indicadoresFiltrados.forEach(indicador => {
          // Encontrar as ações relacionadas a este indicador através do risco
          const relacoesDoRisco = relAcoesRiscos.filter(rel => rel.id_risco === indicador.id_risco);
          
          relacoesDoRisco.forEach(relacao => {
            const acao = acoes.find(a => a.id === relacao.id_acao);
            if (acao && acao.status) {
              if (!statusCount[acao.status]) {
                statusCount[acao.status] = new Set();
              }
              statusCount[acao.status].add(indicador.id);
            }
          });
        });

        // Converter para array de dados do gráfico
        let totalIndicators = 0;
        const chartData: IndicatorStatusData[] = [];

        Object.entries(statusCount).forEach(([status, indicadorSet]) => {
          const count = indicadorSet.size;
          totalIndicators += count;
        });

        Object.entries(statusCount).forEach(([status, indicadorSet]) => {
          const count = indicadorSet.size;
          chartData.push({
            status: status,
            count: count,
            percentage: totalIndicators > 0 ? Math.round((count / totalIndicators) * 100) : 0
          });
        });

        // Ordenar por quantidade decrescente
        chartData.sort((a, b) => b.count - a.count);

        setTotal(totalIndicators);
        setData(chartData);

      } catch (err) {
        console.error('Erro inesperado ao buscar indicadores:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorsByStatus();
  }, []);

  return { data, loading, error, total };
};