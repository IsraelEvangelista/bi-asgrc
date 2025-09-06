import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export interface Conceito {
  id: string;
  conceitos: string;
  descricao: string;
  created_at: string;
  updated_at: string;
}

export const useConceitos = () => {
  const [conceitos, setConceitos] = useState<Conceito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []); // Estabilizada sem dependências

  // Buscar todos os conceitos
  const fetchConceitos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear error directly instead of using clearError
      
      const { data, error } = await supabase
        .from('020_conceitos')
        .select('*')
        .order('conceitos', { ascending: true });
      
      if (error) throw error;
      
      setConceitos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar conceitos';
      setError(errorMessage);
      console.error('Erro ao buscar conceitos:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Remove clearError dependency to prevent infinite loop

  // Buscar conceito por ID
  const fetchConceitoById = useCallback(async (id: string): Promise<Conceito | null> => {
    try {
      setLoading(true);
      setError(null); // Clear error directly instead of using clearError
      
      const { data, error } = await supabase
        .from('020_conceitos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar conceito';
      setError(errorMessage);
      console.error('Erro ao buscar conceito:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // Remove clearError dependency to prevent infinite loop

  // Fixed: Remove fetch function dependency to prevent infinite loops
  // Carregar conceitos automaticamente
  useEffect(() => {
    fetchConceitos();
  }, []); // Fixed: empty dependency array to prevent infinite loops

  return {
    conceitos,
    loading,
    error,
    fetchConceitos,
    fetchConceitoById,
    clearError
  };
};