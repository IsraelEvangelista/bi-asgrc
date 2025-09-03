import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Risk, CreateRiskInput, UpdateRiskInput, RiskFilters } from '../types';

export function useRisks(filters?: RiskFilters) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('006_matriz_riscos')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Aplicar filtros se fornecidos
      if (filters?.classificacao) {
        query = query.eq('classificacao', filters.classificacao);
      }
      if (filters?.responsavel_risco) {
        query = query.ilike('responsavel_risco', `%${filters.responsavel_risco}%`);
      }
      if (filters?.severidade_min) {
        query = query.gte('severidade', filters.severidade_min);
      }
      if (filters?.severidade_max) {
        query = query.lte('severidade', filters.severidade_max);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRisks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar riscos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRisks();
  }, [filters, fetchRisks]);

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
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('006_matriz_riscos')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      setRisk(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar risco');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRisk();
    }
  }, [id, fetchRisk]);

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

  const createRisk = async (input: CreateRiskInput): Promise<Risk | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('006_matriz_riscos')
        .insert({
          eventos_riscos: input.eventos_riscos,
          probabilidade: input.probabilidade,
          impacto: input.impacto,
          classificacao: input.classificacao,
          responsavel_risco: input.responsavel_risco
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar risco');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRisk,
    loading,
    error
  };
}

export function useUpdateRisk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRisk = async (id: string, input: UpdateRiskInput): Promise<Risk | null> => {
    try {
      setLoading(true);
      setError(null);

      const updateData: Partial<Risk> = {
        ...input,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('006_matriz_riscos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar risco');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRisk,
    loading,
    error
  };
}

export function useDeleteRisk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRisk = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Soft delete - atualiza deleted_at em vez de remover
      const { error } = await supabase
        .from('006_matriz_riscos')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir risco');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteRisk,
    loading,
    error
  };
}