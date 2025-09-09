import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ProcessStats {
  publishedCount: number;
  unpublishedCount: number;
  total: number;
  loading: boolean;
  error: string | null;
}

export const useProcessStats = () => {
  const [stats, setStats] = useState<ProcessStats>({
    publishedCount: 0,
    unpublishedCount: 0,
    total: 0,
    loading: true,
    error: null
  });

  const fetchProcessStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Buscar todos os processos com o campo 'publicado'
      const { data: processos, error } = await supabase
        .from('005_processos')
        .select('id, publicado')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const processosData = processos || [];
      const total = processosData.length;
      
      // Contar processos publicados e não publicados
      const publishedCount = processosData.filter(p => p.publicado === true).length;
      const unpublishedCount = processosData.filter(p => p.publicado === false || p.publicado === null).length;

      setStats({
        publishedCount,
        unpublishedCount,
        total,
        loading: false,
        error: null
      });

    } catch (error: unknown) {
      console.error('Erro ao buscar estatísticas de processos:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: (error as Error)?.message || 'Erro ao carregar estatísticas'
      }));
    }
  };

  useEffect(() => {
    fetchProcessStats();
  }, []);

  return {
    ...stats,
    refetch: fetchProcessStats
  };
};