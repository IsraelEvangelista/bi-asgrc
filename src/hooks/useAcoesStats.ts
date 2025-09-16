import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AcoesStats {
  totalAcoes: number;
  loading: boolean;
  error: string | null;
}

export const useAcoesStats = (): AcoesStats => {
  const [totalAcoes, setTotalAcoes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcoesStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar contagem distinta de ações
      const { count, error: fetchError } = await supabase
        .from('009_acoes')
        .select('id', { count: 'exact' });

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de ações: ${fetchError.message}`);
      }

      setTotalAcoes(count || 0);
    } catch (err) {
      console.error('Erro no useAcoesStats:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcoesStats();
  }, []);

  return {
    totalAcoes,
    loading,
    error
  };
};