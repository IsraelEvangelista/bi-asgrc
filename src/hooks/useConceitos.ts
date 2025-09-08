import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Conceito } from '../types/config';

export const useConceitos = () => {
  const [conceitos, setConceitos] = useState<Conceito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchConceitos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('020_conceitos')
        .select('*')
        .order('conceitos', { ascending: true });

      if (error) throw error;
      
      // Mapear os dados da tabela para o tipo Conceito
      const conceitosFormatados = (data || []).map(item => ({
        id: item.id,
        termo: item.conceitos,
        definicao: item.descricao,
        fonte: '', // Campo não existe na tabela atual
        categoria_conceito: '', // Campo não existe na tabela atual
        ativo: true, // Campo não existe na tabela atual, assumir ativo
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setConceitos(conceitosFormatados);
    } catch (err) {
      console.error('Erro ao buscar conceitos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar conceitos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConceitoById = useCallback(async (id: string): Promise<Conceito | null> => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('020_conceitos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Mapear os dados da tabela para o tipo Conceito
      if (data) {
        return {
          id: data.id,
          termo: data.conceitos,
          definicao: data.descricao,
          fonte: '', // Campo não existe na tabela atual
          categoria_conceito: '', // Campo não existe na tabela atual
          ativo: true, // Campo não existe na tabela atual, assumir ativo
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao buscar conceito:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar conceito');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchConceitos();
  }, [fetchConceitos]);

  // Memoize the return object to prevent unnecessary re-renders
  const memoizedReturn = useMemo(() => ({
    conceitos,
    loading,
    error,
    fetchConceitos,
    fetchConceitoById,
    clearError
  }), [conceitos, loading, error, fetchConceitos, fetchConceitoById, clearError]);

  return memoizedReturn;
};