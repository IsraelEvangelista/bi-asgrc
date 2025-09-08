import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Risk, CreateRiskInput, UpdateRiskInput, RiskFilters } from '../types';
import { toast } from 'sonner';

export function useRisks(filters?: RiskFilters) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize filters to prevent unnecessary re-renders
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('risks')
        .select(`
          *,
          macroprocess:macroprocesses(id, name),
          process:processes(id, name),
          subprocess:subprocesses(id, name),
          category:risk_categories(id, name),
          subcategory:risk_subcategories(id, name),
          nature:risk_natures(id, name)
        `);

      // Apply filters
      if (stableFilters?.classificacao) {
        query = query.eq('classificacao', stableFilters.classificacao);
      }
      if (stableFilters?.responsavel_risco) {
        query = query.eq('responsavel_risco', stableFilters.responsavel_risco);
      }
      if (stableFilters?.severidade_min) {
        query = query.gte('severidade', stableFilters.severidade_min);
      }
      if (stableFilters?.severidade_max) {
        query = query.lte('severidade', stableFilters.severidade_max);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (err) {
      console.error('Error fetching risks:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar riscos');
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  return {
    risks,
    loading,
    error,
    refetch: fetchRisks
  };
}

export function useRisk(id: string) {
  const [risk, setRisk] = useState<Risk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRisk = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('risks')
        .select(`
          *,
          macroprocess:macroprocesses(id, name),
          process:processes(id, name),
          subprocess:subprocesses(id, name),
          category:risk_categories(id, name),
          subcategory:risk_subcategories(id, name),
          nature:risk_natures(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRisk(data);
    } catch (err) {
      console.error('Error fetching risk:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar risco');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRisk();
  }, [fetchRisk]);

  return {
    risk,
    loading,
    error,
    refetch: fetchRisk
  };
}

export function useCreateRisk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRisk = useCallback(async (riskData: CreateRiskInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('risks')
        .insert([riskData])
        .select()
        .single();

      if (error) throw error;
      toast.success('Risco criado com sucesso!');
      return data;
    } catch (err) {
      console.error('Error creating risk:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar risco';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createRisk,
    loading,
    error
  };
}

export function useUpdateRisk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRisk = useCallback(async (id: string, riskData: UpdateRiskInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('risks')
        .update(riskData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Risco atualizado com sucesso!');
      return data;
    } catch (err) {
      console.error('Error updating risk:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar risco';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateRisk,
    loading,
    error
  };
}

export function useDeleteRisk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRisk = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('risks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Risco excluído com sucesso!');
    } catch (err) {
      console.error('Error deleting risk:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir risco';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteRisk,
    loading,
    error
  };
}