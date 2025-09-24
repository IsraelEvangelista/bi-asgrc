import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface StatusData {
  emImplementacao: number;
  implementada: number;
  naoIniciada: number;
}

interface RiskData {
  riskId: string;
  statusData: StatusData;
}

interface RiskActionsData {
  riskData: RiskData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRiskActionsData = (): RiskActionsData => {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskActionsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados com JOIN entre as tabelas
      const { data, error: fetchError } = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_risco,
          id_acao,
          matriz_riscos:006_matriz_riscos!016_rel_acoes_riscos_id_risco_fkey(
            sigla
          ),
          acoes:009_acoes!016_rel_acoes_riscos_id_acao_fkey(
            status
          )
        `);

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de riscos e ações: ${fetchError.message}`);
      }

      // Filtrar apenas os riscos específicos
      const targetRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];
      
      // Processar os dados
      const riskMap = new Map<string, StatusData>();
      
      // Inicializar todos os riscos alvo com valores zerados
      targetRisks.forEach(risk => {
        riskMap.set(risk, {
          emImplementacao: 0,
          implementada: 0,
          naoIniciada: 0
        });
      });

      // Processar os dados retornados
      (data || []).forEach((item: any) => {
        const sigla = item.matriz_riscos?.sigla;
        const status = item.acoes?.status;
        
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
          }
          
          riskMap.set(sigla, currentData);
        }
      });

      // Converter para array e ordenar pelos riscos alvo
      const processedRiskData: RiskData[] = targetRisks.map(risk => ({
        riskId: risk,
        statusData: riskMap.get(risk)!
      }));

      setRiskData(processedRiskData);
    } catch (err) {
      console.error('Erro no useRiskActionsData:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchRiskActionsData();
  };

  useEffect(() => {
    fetchRiskActionsData();
  }, []);

  return {
    riskData,
    loading,
    error,
    refetch
  };
};