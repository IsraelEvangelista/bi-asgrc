import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  Macroprocesso,
  Processo,
  Subprocesso,
  ProcessoWithMacro,
  SubprocessoWithProcesso,
  MacroprocessoWithProcessos,
  CreateMacroprocessoInput,
  UpdateMacroprocessoInput,
  CreateProcessoInput,
  UpdateProcessoInput,
  CreateSubprocessoInput,
  UpdateSubprocessoInput,
  ProcessFilters,
  ProcessStatistics,
  HierarchyNode,
  ProcessTreeData
} from '../types/process';

export const useProcesses = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Macroprocessos
  const [macroprocessos, setMacroprocessos] = useState<MacroprocessoWithProcessos[]>([]);
  const [processos, setProcessos] = useState<ProcessoWithMacro[]>([]);
  const [subprocessos, setSubprocessos] = useState<SubprocessoWithProcesso[]>([]);
  const [hierarchyData, setHierarchyData] = useState<ProcessTreeData | null>(null);
  const [statistics, setStatistics] = useState<ProcessStatistics | null>(null);

  // MACROPROCESSOS CRUD
  const fetchMacroprocessos = useCallback(async (filters?: ProcessFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('004_macroprocessos')
        .select(`
          *,
          processos:005_processos(
            id,
            processo,
            responsavel_processo,
            situacao,
            subprocessos:013_subprocessos(id, subprocesso, situacao)
          )
        `);

      if (filters?.search) {
        query = query.or(`macroprocesso.ilike.%${filters.search}%,tipo_macroprocesso.ilike.%${filters.search}%`);
      }

      if (filters?.situacao && filters.situacao !== 'Todos') {
        query = query.eq('situacao', filters.situacao);
      }

      if (filters?.tipo_macroprocesso) {
        query = query.eq('tipo_macroprocesso', filters.tipo_macroprocesso);
      }

      query = query.order('macroprocesso', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Enriquecer dados com estatísticas
      const enrichedData = (data || []).map(macro => ({
        ...macro,
        total_processos: macro.processos?.length || 0,
        total_subprocessos: macro.processos?.reduce((acc, proc) => acc + (proc.subprocessos?.length || 0), 0) || 0,
        total_riscos: 0 // TODO: Implementar contagem de riscos
      }));

      setMacroprocessos(enrichedData);
      return enrichedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar macroprocessos';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMacroprocesso = useCallback(async (data: CreateMacroprocessoInput): Promise<Macroprocesso | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: newMacroprocesso, error: createError } = await supabase
        .from('004_macroprocessos')
        .insert([{
          ...data,
          situacao: data.situacao || 'Ativo'
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lista local
      await fetchMacroprocessos();
      return newMacroprocesso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar macroprocesso';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMacroprocessos]);

  const updateMacroprocesso = useCallback(async (data: UpdateMacroprocessoInput): Promise<Macroprocesso | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = data;
      const { data: updatedMacroprocesso, error: updateError } = await supabase
        .from('004_macroprocessos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      await fetchMacroprocessos();
      return updatedMacroprocesso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar macroprocesso';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMacroprocessos]);

  const deleteMacroprocesso = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se há processos vinculados
      const { data: linkedProcessos, error: checkError } = await supabase
        .from('005_processos')
        .select('id')
        .eq('id_macroprocesso', id)
        .limit(1);

      if (checkError) throw checkError;

      if (linkedProcessos && linkedProcessos.length > 0) {
        throw new Error('Não é possível excluir macroprocesso com processos vinculados');
      }

      const { error: deleteError } = await supabase
        .from('004_macroprocessos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      await fetchMacroprocessos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir macroprocesso';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMacroprocessos]);

  // PROCESSOS CRUD
  const fetchProcessos = useCallback(async (filters?: ProcessFilters) => {
    console.log('🔍 fetchProcessos iniciado com filtros:', filters);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Construindo query para 005_processos...');
      let query = supabase
        .from('005_processos')
        .select(`
          *,
          macroprocesso:004_macroprocessos(
            id,
            macroprocesso,
            tipo_macroprocesso,
            situacao
          ),
          responsavel_area:003_areas_gerencias(
            id,
            sigla_area,
            gerencia
          )
        `);

      if (filters?.search) {
        console.log('🔎 Aplicando filtro de busca:', filters.search);
        query = query.ilike('processo', `%${filters.search}%`);
      }

      if (filters?.macroprocesso_id) {
        console.log('🎯 Aplicando filtro de macroprocesso_id:', filters.macroprocesso_id);
        // Corrigindo o nome da coluna de id_macro para id_macroprocesso
        query = query.eq('id_macroprocesso', filters.macroprocesso_id);
      }

      if (filters?.situacao && filters.situacao !== 'Todos') {
        console.log('📋 Aplicando filtro de situação:', filters.situacao);
        query = query.eq('situacao', filters.situacao);
      }

      query = query.order('processo', { ascending: true });

      console.log('🚀 Executando query no Supabase...');
      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Erro na query do Supabase:', fetchError);
        throw fetchError;
      }

      console.log('✅ Dados recebidos do Supabase:', data?.length || 0, 'processos');
      setProcessos(data || []);
      return data || [];
    } catch (err) {
      console.error('💥 Erro em fetchProcessos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar processos';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchProcessos finalizado');
    }
  }, []);

  const createProcesso = useCallback(async (data: CreateProcessoInput): Promise<Processo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: newProcesso, error: createError } = await supabase
        .from('005_processos')
        .insert([{
          ...data,
          situacao: data.situacao || 'Ativo'
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lista local
      await fetchProcessos();
      return newProcesso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar processo';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProcessos]);

  const updateProcesso = useCallback(async (data: UpdateProcessoInput): Promise<Processo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = data;
      const { data: updatedProcesso, error: updateError } = await supabase
        .from('005_processos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      await fetchProcessos();
      return updatedProcesso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar processo';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProcessos]);

  const deleteProcesso = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se há subprocessos vinculados
      const { data: linkedSubprocessos, error: checkError } = await supabase
        .from('013_subprocessos')
        .select('id')
        .eq('id_processo', id)
        .limit(1);

      if (checkError) throw checkError;

      if (linkedSubprocessos && linkedSubprocessos.length > 0) {
        throw new Error('Não é possível excluir processo com subprocessos vinculados');
      }

      const { error: deleteError } = await supabase
        .from('005_processos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      await fetchProcessos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir processo';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProcessos]);

  // SUBPROCESSOS CRUD
  const fetchSubprocessos = useCallback(async (filters?: ProcessFilters) => {
    console.log('🔍 fetchSubprocessos iniciado com filtros:', filters);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Construindo query para 013_subprocessos...');
      let query = supabase
        .from('013_subprocessos')
        .select(`
          *,
          processo:005_processos(
            id,
            processo,
            responsavel_processo,
            situacao,
            macroprocesso:004_macroprocessos(
              id,
              macroprocesso,
              tipo_macroprocesso
            ),
            responsavel_area:003_areas_gerencias(
              id,
              sigla_area,
              gerencia
            )
          )
        `);

      if (filters?.search) {
        console.log('🔎 Aplicando filtro de busca:', filters.search);
        query = query.ilike('subprocesso', `%${filters.search}%`);
      }

      if (filters?.processo_id) {
        console.log('🎯 Aplicando filtro de processo_id:', filters.processo_id);
        query = query.eq('id_processo', filters.processo_id);
      }

      if (filters?.situacao && filters.situacao !== 'Todos') {
        console.log('📋 Aplicando filtro de situação:', filters.situacao);
        query = query.eq('situacao', filters.situacao);
      }

      query = query.order('subprocesso', { ascending: true });

      console.log('🚀 Executando query no Supabase...');
      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Erro na query do Supabase:', fetchError);
        throw fetchError;
      }

      console.log('✅ Dados recebidos do Supabase:', data?.length || 0, 'subprocessos');
      console.log('📋 Subprocessos encontrados:', data);
      setSubprocessos(data || []);
      return data || [];
    } catch (err) {
      console.error('💥 Erro em fetchSubprocessos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar subprocessos';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchSubprocessos finalizado');
    }
  }, []);

  const createSubprocesso = useCallback(async (data: CreateSubprocessoInput): Promise<Subprocesso | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: newSubprocesso, error: createError } = await supabase
        .from('013_subprocessos')
        .insert([{
          ...data,
          situacao: data.situacao || 'Ativo'
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lista local
      await fetchSubprocessos();
      return newSubprocesso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar subprocesso';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubprocessos]);

  const updateSubprocesso = useCallback(async (data: UpdateSubprocessoInput): Promise<Subprocesso | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = data;
      const { data: updatedSubprocesso, error: updateError } = await supabase
        .from('013_subprocessos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      await fetchSubprocessos();
      return updatedSubprocesso;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar subprocesso';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubprocessos]);

  const deleteSubprocesso = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('013_subprocessos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      await fetchSubprocessos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir subprocesso';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSubprocessos]);

  // HIERARQUIA E ESTATÍSTICAS
  const fetchHierarchy = useCallback(async (): Promise<ProcessTreeData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('004_macroprocessos')
        .select(`
          *,
          processos:005_processos(
            *,
            subprocessos:013_subprocessos(*)
          )
        `)
        .eq('situacao', 'Ativo')
        .order('macroprocesso');

      if (fetchError) throw fetchError;

      // Construir árvore hierárquica
      const nodes: HierarchyNode[] = [];
      let totalNodes = 0;

      (data || []).forEach(macro => {
        const macroNode: HierarchyNode = {
          id: macro.id,
          name: macro.macroprocesso,
          type: 'macroprocesso',
          level: 0,
          situacao: macro.situacao,
          children: [],
          riscos_count: 0
        };

        totalNodes++;

        (macro.processos || []).forEach(processo => {
          const processoNode: HierarchyNode = {
            id: processo.id,
            name: processo.processo,
            type: 'processo',
            level: 1,
            parent_id: macro.id,
            situacao: processo.situacao,
            children: [],
            riscos_count: 0
          };

          totalNodes++;

          (processo.subprocessos || []).forEach(subprocesso => {
            const subprocessoNode: HierarchyNode = {
              id: subprocesso.id,
              name: subprocesso.subprocesso,
              type: 'subprocesso',
              level: 2,
              parent_id: processo.id,
              situacao: subprocesso.situacao,
              riscos_count: 0
            };

            totalNodes++;
            processoNode.children!.push(subprocessoNode);
          });

          macroNode.children!.push(processoNode);
        });

        nodes.push(macroNode);
      });

      const hierarchyData: ProcessTreeData = {
        nodes,
        total_nodes: totalNodes,
        max_depth: 3
      };

      setHierarchyData(hierarchyData);
      return hierarchyData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar hierarquia';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async (): Promise<ProcessStatistics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const [macroStats, processStats, subprocessStats] = await Promise.all([
        supabase.from('004_macroprocessos').select('situacao, tipo_macroprocesso'),
        supabase.from('005_processos').select('situacao'),
        supabase.from('013_subprocessos').select('situacao')
      ]);

      if (macroStats.error) throw macroStats.error;
      if (processStats.error) throw processStats.error;
      if (subprocessStats.error) throw subprocessStats.error;

      const macroData = macroStats.data || [];
      const processData = processStats.data || [];
      const subprocessData = subprocessStats.data || [];

      const statistics: ProcessStatistics = {
        total_macroprocessos: macroData.length,
        total_processos: processData.length,
        total_subprocessos: subprocessData.length,
        macroprocessos_ativos: macroData.filter(m => m.situacao === 'Ativo').length,
        processos_ativos: processData.filter(p => p.situacao === 'Ativo').length,
        subprocessos_ativos: subprocessData.filter(s => s.situacao === 'Ativo').length,
        processos_com_riscos: 0, // TODO: Implementar contagem de riscos
        processos_sem_riscos: processData.length,
        distribuicao_por_tipo: macroData.reduce((acc, macro) => {
          const existing = acc.find(item => item.tipo === macro.tipo_macroprocesso);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ tipo: macro.tipo_macroprocesso, count: 1 });
          }
          return acc;
        }, [] as { tipo: string; count: number }[])
      };

      setStatistics(statistics);
      return statistics;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    macroprocessos,
    processos,
    subprocessos,
    hierarchyData,
    statistics,

    // Macroprocessos
    fetchMacroprocessos,
    createMacroprocesso,
    updateMacroprocesso,
    deleteMacroprocesso,

    // Processos
    fetchProcessos,
    createProcesso,
    updateProcesso,
    deleteProcesso,

    // Subprocessos
    fetchSubprocessos,
    createSubprocesso,
    updateSubprocesso,
    deleteSubprocesso,

    // Hierarquia e estatísticas
    fetchHierarchy,
    fetchStatistics,

    // Utilitários
    clearError
  };
};