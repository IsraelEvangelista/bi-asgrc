import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface IndicatorToleranceData {
  status: string;
  count: number;
  percentage: number;
}

export interface IndicatorsByToleranceResult {
  data: IndicatorToleranceData[];
  loading: boolean;
  error: string | null;
  total: number;
}

/**
 * Hook para buscar dados dos indicadores agrupados por tolerância
 * Conta indicadores com tolerancia não nula da tabela 008_indicadores
 */
export const useIndicatorsByTolerance = (): IndicatorsByToleranceResult => {
  const [data, setData] = useState<IndicatorToleranceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchIndicatorsByTolerance = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar indicadores com tolerancia não nula
        const { data: indicadores, error: indicadoresError } = await supabase
          .from('008_indicadores')
          .select('id, tolerancia')
          .not('tolerancia', 'is', null);

        if (indicadoresError) {
          throw new Error(`Erro ao buscar indicadores: ${indicadoresError.message}`);
        }

        if (!indicadores || indicadores.length === 0) {
          console.warn('Nenhum indicador encontrado com tolerância');
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

        // Filtrar apenas indicadores que têm histórico
        const indicadoresComHistorico = new Set(historicos?.map(h => h.id_indicador) || []);
        const indicadoresFiltrados = indicadores.filter(ind => indicadoresComHistorico.has(ind.id));

        if (indicadoresFiltrados.length === 0) {
          console.warn('Nenhum indicador com histórico e tolerância encontrado');
          setData([]);
          setTotal(0);
          return;
        }

        // Agrupar indicadores por tolerância
        const toleranceCount: Record<string, number> = {};
        
        indicadoresFiltrados.forEach(indicador => {
          if (indicador.tolerancia) {
            if (!toleranceCount[indicador.tolerancia]) {
              toleranceCount[indicador.tolerancia] = 0;
            }
            toleranceCount[indicador.tolerancia]++;
          }
        });

        // Converter para array de dados do gráfico
        let totalIndicators = 0;
        const chartData: IndicatorToleranceData[] = [];

        Object.values(toleranceCount).forEach(count => {
          totalIndicators += count;
        });

        Object.entries(toleranceCount).forEach(([tolerancia, count]) => {
          chartData.push({
            status: tolerancia,
            count: count,
            percentage: totalIndicators > 0 ? Math.round((count / totalIndicators) * 100) : 0
          });
        });

        // Ordenar por quantidade decrescente
        chartData.sort((a, b) => b.count - a.count);

        setTotal(totalIndicators);
        setData(chartData);

      } catch (err) {
        console.error('Erro inesperado ao buscar indicadores por tolerância:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorsByTolerance();
  }, []);

  return { data, loading, error, total };
};