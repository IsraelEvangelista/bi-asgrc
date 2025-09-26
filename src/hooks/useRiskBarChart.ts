import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiskStatusData {
  emImplementacao: number;
  implementada: number;
  naoIniciada: number;
}

interface RiskBarData {
  riskId: string;
  statusData: RiskStatusData;
}

interface RiskBarChartData {
  data: RiskBarData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Removidos dados mock - agora usando apenas dados reais do Supabase

export const useRiskBarChart = (): RiskBarChartData => {
  const [data, setData] = useState<RiskBarData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskBarData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Buscando dados para gráfico de barras horizontais...');

      // Buscar relacionamentos: 009_acoes -> 016_rel_acoes_riscos -> 006_matriz_riscos
      const { data: relationData, error: relationError } = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_acao,
          id_risco,
          009_acoes!016_rel_acoes_riscos_id_acao_fkey (
            status
          ),
          006_matriz_riscos!016_rel_acoes_riscos_id_risco_fkey (
            sigla
          )
        `);

      if (relationError) {
        console.error('❌ Erro ao buscar relacionamentos:', relationError);
        throw new Error(`Erro nos relacionamentos: ${relationError.message}`);
      }

      console.log('✅ Relacionamentos obtidos:', relationData?.length);

      // Filtrar apenas os riscos específicos R01, R02, R03, R04, R05, R09, R17, R35
      const targetRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];
      
      // Inicializar contadores para cada risco
      const riskMap = new Map<string, RiskStatusData>();
      targetRisks.forEach(risk => {
        riskMap.set(risk, {
          emImplementacao: 0,
          implementada: 0,
          naoIniciada: 0
        });
      });

      // Processar os dados de relacionamento
      if (relationData) {
        relationData.forEach((relation: any) => {
          const sigla = relation['006_matriz_riscos']?.sigla;
          const status = relation['009_acoes']?.status;
          
          // Verificar se é um dos riscos alvo
          if (sigla && targetRisks.includes(sigla) && status) {
            const currentData = riskMap.get(sigla)!;
            
            switch (status) {
              case 'Em implementação':
                currentData.emImplementacao++;
                break;
              case 'Implementada':
                currentData.implementada++;
                break;
              case 'Não iniciada':
                currentData.naoIniciada++;
                break;
              // Ignorar status nulos/indefinidos
            }
            
            riskMap.set(sigla, currentData);
          }
        });
      }

      // Converter para array e ordenar pelos riscos alvo
      const processedData: RiskBarData[] = targetRisks.map(risk => ({
        riskId: risk,
        statusData: riskMap.get(risk)!
      }));

      // Ordenar por total de ações (maior para menor)
      processedData.sort((a, b) => {
        const totalA = a.statusData.emImplementacao + a.statusData.implementada + a.statusData.naoIniciada;
        const totalB = b.statusData.emImplementacao + b.statusData.implementada + b.statusData.naoIniciada;
        return totalB - totalA;
      });

      console.log('✅ Dados do gráfico processados:', processedData);
      setData(processedData);

    } catch (err) {
      console.error('❌ Erro no useRiskBarChart:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchRiskBarData();
  };

  useEffect(() => {
    fetchRiskBarData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch
  };
};