import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscosStats {
  totalRiscos: number;
  mediaSeveridade: number;
  loading: boolean;
  error: string | null;
}

export const useRiscosStats = (): RiscosStats => {
  const [totalRiscos, setTotalRiscos] = useState<number>(0);
  const [mediaSeveridade, setMediaSeveridade] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiscosStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar contagem distinta de riscos e calcular média de severidade
      const { data: riscos, error: fetchError } = await supabase
        .from('006_matriz_riscos')
        .select('id, severidade')
        .is('deleted_at', null);

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de riscos: ${fetchError.message}`);
      }

      if (!riscos) {
        setTotalRiscos(0);
        setMediaSeveridade(0);
        return;
      }

      // Calcular total de riscos
      setTotalRiscos(riscos.length);

      // Calcular média de severidade
      const riscosComSeveridade = riscos.filter(risco => risco.severidade !== null && risco.severidade !== undefined);
      
      if (riscosComSeveridade.length > 0) {
        const somaSeveridade = riscosComSeveridade.reduce((acc, risco) => acc + risco.severidade, 0);
        const media = somaSeveridade / riscosComSeveridade.length;
        setMediaSeveridade(Number(media.toFixed(2)));
      } else {
        setMediaSeveridade(0);
      }
    } catch (err) {
      console.error('Erro no useRiscosStats:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiscosStats();
  }, []);

  return {
    totalRiscos,
    mediaSeveridade,
    loading,
    error
  };
};