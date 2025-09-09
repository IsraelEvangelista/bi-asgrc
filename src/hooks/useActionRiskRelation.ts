import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ActionRiskRelation, CreateActionRiskRelation, UpdateActionRiskRelation } from '../types/actionRiskRelation';
import { toast } from 'sonner';

export const useActionRiskRelation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as relações ação-risco
  const fetchActionRiskRelations = useCallback(async (): Promise<ActionRiskRelation[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('016_rel_acoes_riscos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relações ação-risco';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relações por ID da ação
  const fetchRelationsByAction = useCallback(async (actionId: string): Promise<ActionRiskRelation[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('016_rel_acoes_riscos')
        .select('*')
        .eq('id_acao', actionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relações da ação';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relações por ID do risco
  const fetchRelationsByRisk = useCallback(async (riskId: string): Promise<ActionRiskRelation[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('016_rel_acoes_riscos')
        .select('*')
        .eq('id_risco', riskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar relações do risco';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova relação ação-risco
  const createActionRiskRelation = useCallback(async (data: CreateActionRiskRelation): Promise<ActionRiskRelation | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: newRelation, error } = await supabase
        .from('016_rel_acoes_riscos')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Relação ação-risco criada com sucesso!');
      return newRelation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar relação ação-risco';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar relação ação-risco
  const updateActionRiskRelation = useCallback(async (id: string, data: UpdateActionRiskRelation): Promise<ActionRiskRelation | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: updatedRelation, error } = await supabase
        .from('016_rel_acoes_riscos')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Relação ação-risco atualizada com sucesso!');
      return updatedRelation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar relação ação-risco';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar relação ação-risco
  const deleteActionRiskRelation = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('016_rel_acoes_riscos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Relação ação-risco removida com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover relação ação-risco';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar relação com detalhes expandidos (incluindo dados da ação e risco)
  const fetchRelationWithDetails = useCallback(async (id: string): Promise<ActionRiskRelation | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          *,
          acao:009_acoes(id, desc_acao, status, prazo_implementacao),
          risco:006_matriz_riscos(id, evento_risco, classificacao, responsavel_risco)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar detalhes da relação';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchActionRiskRelations,
    fetchRelationsByAction,
    fetchRelationsByRisk,
    createActionRiskRelation,
    updateActionRiskRelation,
    deleteActionRiskRelation,
    fetchRelationWithDetails
  };
};

// Hook específico para criar relações
export const useCreateActionRiskRelation = () => {
  const { createActionRiskRelation, loading, error } = useActionRiskRelation();
  return { createActionRiskRelation, loading, error };
};

// Hook específico para atualizar relações
export const useUpdateActionRiskRelation = () => {
  const { updateActionRiskRelation, loading, error } = useActionRiskRelation();
  return { updateActionRiskRelation, loading, error };
};

// Hook específico para deletar relações
export const useDeleteActionRiskRelation = () => {
  const { deleteActionRiskRelation, loading, error } = useActionRiskRelation();
  return { deleteActionRiskRelation, loading, error };
};