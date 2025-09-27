import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface IndicatorByRiskData {
  risk: string; // sigla do risco (R01, R02, etc.)
  'Dentro da Tolerância': number;
  'Fora da Tolerância': number;
  total: number;
}

export interface IndicatorsByRiskResult {
  data: IndicatorByRiskData[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para buscar dados dos indicadores agrupados por risco prioritário
 * Segue a estrutura: 019_historico_indicadores → 008_indicadores → 006_matriz_riscos
 * Filtra apenas os riscos: R01, R02, R03, R04, R05, R09, R17, R35
 * Agrupa por tolerância dos indicadores
 */
export const useIndicatorsByRisk = (): IndicatorsByRiskResult => {
  const [data, setData] = useState<IndicatorByRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicatorsByRisk = async () => {
      try {
        setLoading(true);
        setError(null);

        // Definir os riscos prioritários
        const priorityRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];

        // Buscar riscos prioritários
        const { data: riscos, error: riscosError } = await supabase
          .from('006_matriz_riscos')
          .select('id, sigla')
          .in('sigla', priorityRisks);

        if (riscosError) {
          throw new Error(`Erro ao buscar riscos: ${riscosError.message}`);
        }

        if (!riscos || riscos.length === 0) {
          console.warn('Nenhum risco prioritário encontrado');
          setData([]);
          return;
        }

        // Buscar indicadores relacionados aos riscos prioritários
        const riscosIds = riscos.map(r => r.id);
        const { data: indicadores, error: indicadoresError } = await supabase
          .from('008_indicadores')
          .select('id, id_risco, tolerancia')
          .in('id_risco', riscosIds)
          .not('tolerancia', 'is', null);

        if (indicadoresError) {
          throw new Error(`Erro ao buscar indicadores: ${indicadoresError.message}`);
        }

        if (!indicadores || indicadores.length === 0) {
          console.warn('Nenhum indicador encontrado para os riscos prioritários');
          setData([]);
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
          console.warn('Nenhum indicador com histórico encontrado');
          setData([]);
          return;
        }

        // Criar estrutura de dados para o gráfico
        const riskData: Record<string, { dentro: number; fora: number }> = {};
        
        // Inicializar todos os riscos prioritários
        priorityRisks.forEach(sigla => {
          riskData[sigla] = { dentro: 0, fora: 0 };
        });

        // Agrupar indicadores por risco e tolerância
        indicadoresFiltrados.forEach(indicador => {
          const risco = riscos.find(r => r.id === indicador.id_risco);
          if (risco && risco.sigla) {
            if (indicador.tolerancia === 'Dentro da Tolerância') {
              riskData[risco.sigla].dentro++;
            } else if (indicador.tolerancia === 'Fora da Tolerância') {
              riskData[risco.sigla].fora++;
            }
          }
        });

        // Converter para formato do gráfico
        const chartData: IndicatorByRiskData[] = priorityRisks.map(sigla => ({
          risk: sigla,
          'Dentro da Tolerância': riskData[sigla].dentro,
          'Fora da Tolerância': riskData[sigla].fora,
          total: riskData[sigla].dentro + riskData[sigla].fora
        }));

        setData(chartData);

      } catch (err) {
        console.error('Erro inesperado ao buscar indicadores por risco:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorsByRisk();
  }, []);

  return { data, loading, error };
};