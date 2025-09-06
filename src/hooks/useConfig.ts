import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  AreaGerencia,
  Natureza,
  Categoria,
  Subcategoria,
  Conceito,
  AreaGerenciaFormData,
  NaturezaFormData,
  CategoriaFormData,
  SubcategoriaFormData,
  ConceitoFormData
} from '../types/config';

// Hook simplificado para a Fase 1 - Fundação
export const useConfig = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para áreas
  const [areas, setAreas] = useState<AreaGerencia[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);

  // Estados para naturezas
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const [naturezasLoading, setNaturezasLoading] = useState(false);

  // Estados para categorias
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);

  // Estados para subcategorias
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [subcategoriasLoading, setSubcategoriasLoading] = useState(false);

  // Estados para conceitos
  const [conceitos, setConceitos] = useState<Conceito[]>([]);
  const [conceitosLoading, setConceitosLoading] = useState(false);

  // Função para limpar erros
  const clearError = () => setError(null);

  // ===== OPERAÇÕES DE ÁREAS =====
  
  const fetchAreas = useCallback(async (filters?: {
    search?: string;
    ativo?: boolean;
  }) => {
    try {
      setAreasLoading(true);
      clearError();

      let query = supabase
        .from('003_areas_gerencias')
        .select('*')
        .order('gerencia', { ascending: true });

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(`gerencia.ilike.%${filters.search}%,sigla_area.ilike.%${filters.search}%`);
      }
      
      if (filters?.ativo !== undefined) {
        query = query.eq('ativa', filters.ativo);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setAreas(data || []);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar áreas';
      setError(errorMessage);
      console.error('Erro ao buscar áreas:', err);
      return [];
    } finally {
      setAreasLoading(false);
    }
  }, []);

  const createArea = async (input: AreaGerenciaFormData): Promise<AreaGerencia> => {
    try {
      setLoading(true);
      clearError();

      const { data, error } = await supabase
        .from('003_areas_gerencias')
        .insert({
          gerencia: input.gerencia,
          sigla_area: input.sigla_area || input.gerencia.substring(0, 3).toUpperCase(),
          responsavel_area: input.responsavel_area,
          descricao: input.descricao,
          ativa: input.ativa ?? true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista local
      await fetchAreas();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar área';
      setError(errorMessage);
      console.error('Erro ao criar área:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateArea = async (id: string, input: AreaGerenciaFormData): Promise<AreaGerencia> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('003_areas_gerencias')
        .update({
          gerencia: input.gerencia,
          responsavel_area: input.responsavel_area,
          descricao: input.descricao,
          ativa: input.ativa
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista local
      await fetchAreas();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar área';
      setError(errorMessage);
      console.error('Erro ao atualizar área:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteArea = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      const { error } = await supabase
        .from('003_areas_gerencias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar lista local
      await fetchAreas();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir área';
      setError(errorMessage);
      console.error('Erro ao excluir área:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===== OPERAÇÕES DE NATUREZAS =====
  
  const fetchNaturezas = useCallback(async (filters?: {
    search?: string;
    ativo?: boolean;
  }) => {
    try {
      setNaturezasLoading(true);
      clearError();

      let query = supabase
        .from('010_natureza')
        .select('*')
        .order('desc_natureza', { ascending: true });

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(`desc_natureza.ilike.%${filters.search}%,sigla_natureza.ilike.%${filters.search}%`);
      }
      
      if (filters?.ativo !== undefined) {
        query = query.eq('ativa', filters.ativo);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setNaturezas(data || []);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar naturezas';
      setError(errorMessage);
      console.error('Erro ao buscar naturezas:', err);
      return [];
    } finally {
      setNaturezasLoading(false);
    }
  }, []);

  const createNatureza = async (input: NaturezaFormData): Promise<Natureza> => {
    try {
      setLoading(true);
      clearError();

      const { data, error } = await supabase
        .from('010_natureza')
        .insert({
          natureza: input.natureza,
          descricao: input.descricao,
          ativa: input.ativa ?? true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista local
      await fetchNaturezas();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar natureza';
      setError(errorMessage);
      console.error('Erro ao criar natureza:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNatureza = async (id: string, input: NaturezaFormData): Promise<Natureza> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('010_natureza')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar lista local
      await fetchNaturezas();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar natureza';
      setError(errorMessage);
      console.error('Erro ao atualizar natureza:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteNatureza = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      // Verificar se existem categorias vinculadas
      const { data: categorias, error: checkError } = await supabase
        .from('011_categoria')
        .select('id')
        .eq('id_natureza', id)
        .limit(1);

      if (checkError) throw checkError;

      if (categorias && categorias.length > 0) {
        throw new Error('Não é possível excluir esta natureza pois existem categorias vinculadas a ela.');
      }

      const { error } = await supabase
        .from('010_natureza')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar lista local
      await fetchNaturezas();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir natureza';
      setError(errorMessage);
      console.error('Erro ao excluir natureza:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNÇÕES DE ESTATÍSTICAS BÁSICAS =====
  
  const getBasicStats = async () => {
    try {
      setLoading(true);
      clearError();

      const [areasResult, naturezasResult, categoriasResult, subcategoriasResult, conceitosResult] = await Promise.all([
        supabase.from('003_areas_gerencias').select('id, ativa'),
        supabase.from('010_natureza').select('id, ativa'),
        supabase.from('011_categoria').select('id, ativa'),
        supabase.from('012_subcategoria').select('id, ativa'),
        supabase.from('013_conceito').select('id, ativo')
      ]);

      if (areasResult.error) throw areasResult.error;
      if (naturezasResult.error) throw naturezasResult.error;
      if (categoriasResult.error) throw categoriasResult.error;
      if (subcategoriasResult.error) throw subcategoriasResult.error;
      if (conceitosResult.error) throw conceitosResult.error;

      const areas = areasResult.data || [];
      const naturezas = naturezasResult.data || [];
      const categorias = categoriasResult.data || [];
      const subcategorias = subcategoriasResult.data || [];
      const conceitos = conceitosResult.data || [];

      return {
        total_areas: areas.length,
        areas_ativas: areas.filter(a => a.ativa).length,
        total_naturezas: naturezas.length,
        naturezas_ativas: naturezas.filter(n => n.ativa).length,
        total_categorias: categorias.length,
        categorias_ativas: categorias.filter(c => c.ativa).length,
        total_subcategorias: subcategorias.length,
        subcategorias_ativas: subcategorias.filter(s => s.ativa).length,
        total_conceitos: conceitos.length,
        conceitos_ativos: conceitos.filter(c => c.ativo).length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas';
      setError(errorMessage);
      console.error('Erro ao buscar estatísticas:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  // ===== OPERAÇÕES DE CATEGORIAS =====
  
  const fetchCategorias = useCallback(async (filters?: {
    search?: string;
    ativo?: boolean;
    natureza_id?: string;
  }) => {
    try {
      setCategoriasLoading(true);
      clearError();
      
      let query = supabase
        .from('011_categoria')
        .select(`
          *,
          natureza:010_natureza(id, natureza, ativa)
        `);
      
      if (filters?.search) {
        query = query.ilike('categoria', `%${filters.search}%`);
      }
      
      if (filters?.ativo !== undefined) {
        query = query.eq('ativa', filters.ativo);
      }
      
      if (filters?.natureza_id) {
        query = query.eq('id_natureza', filters.natureza_id);
      }
      
      query = query.order('categoria');
      
      const { data, error } = await query;
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias';
      setError(errorMessage);
    } finally {
      setCategoriasLoading(false);
    }
  }, []);

  const createCategoria = async (input: CategoriaFormData): Promise<Categoria> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('011_categoria')
        .insert(input)
        .select(`
          *,
          natureza:010_natureza(id, natureza, ativa)
        `)
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setCategorias(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoria = async (id: string, input: CategoriaFormData): Promise<Categoria> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('011_categoria')
        .update(input)
        .eq('id', id)
        .select(`
          *,
          natureza:010_natureza(id, natureza, ativa)
        `)
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setCategorias(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoria = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      
      // Verificar se há subcategorias vinculadas
      const { data: subcategorias, error: checkError } = await supabase
        .from('012_subcategoria')
        .select('id')
        .eq('id_categoria', id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (subcategorias && subcategorias.length > 0) {
        throw new Error('Não é possível excluir categoria com subcategorias vinculadas');
      }
      
      const { error } = await supabase
        .from('011_categoria')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar lista local
      setCategorias(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir categoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== OPERAÇÕES DE SUBCATEGORIAS =====
  
  const fetchSubcategorias = useCallback(async (filters?: {
    search?: string;
    ativo?: boolean;
    categoria_id?: string;
    natureza_id?: string;
  }) => {
    try {
      setSubcategoriasLoading(true);
      clearError();
      
      let query = supabase
        .from('012_subcategoria')
        .select(`
          *,
          categoria:011_categoria(
            id, categoria, ativa,
            natureza:010_natureza(id, natureza, ativa)
          )
        `);
      
      if (filters?.search) {
        query = query.ilike('subcategoria', `%${filters.search}%`);
      }
      
      if (filters?.ativo !== undefined) {
        query = query.eq('ativa', filters.ativo);
      }
      
      if (filters?.categoria_id) {
        query = query.eq('id_categoria', filters.categoria_id);
      }
      
      query = query.order('subcategoria');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filtrar por natureza se especificado
      let filteredData = data || [];
      if (filters?.natureza_id) {
        filteredData = filteredData.filter(sub => 
          sub.categoria?.natureza?.id === filters.natureza_id
        );
      }
      
      setSubcategorias(filteredData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar subcategorias';
      setError(errorMessage);
    } finally {
      setSubcategoriasLoading(false);
    }
  }, []);

  const createSubcategoria = async (input: SubcategoriaFormData): Promise<Subcategoria> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('012_subcategoria')
        .insert(input)
        .select(`
          *,
          categoria:011_categoria(
            id, categoria, ativa,
            natureza:010_natureza(id, natureza, ativa)
          )
        `)
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setSubcategorias(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar subcategoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSubcategoria = async (id: string, input: SubcategoriaFormData): Promise<Subcategoria> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('012_subcategoria')
        .update(input)
        .eq('id', id)
        .select(`
          *,
          categoria:011_categoria(
            id, categoria, ativa,
            natureza:010_natureza(id, natureza, ativa)
          )
        `)
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setSubcategorias(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar subcategoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategoria = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      
      const { error } = await supabase
        .from('012_subcategoria')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar lista local
      setSubcategorias(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir subcategoria';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== OPERAÇÕES DE CONCEITOS =====
  
  const fetchConceitos = useCallback(async (filters?: {
    search?: string;
    ativo?: boolean;
    categoria_conceito?: string;
  }) => {
    try {
      setConceitosLoading(true);
      clearError();
      
      let query = supabase
        .from('013_conceito')
        .select('*');
      
      if (filters?.search) {
        query = query.or(`termo.ilike.%${filters.search}%,definicao.ilike.%${filters.search}%`);
      }
      
      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }
      
      if (filters?.categoria_conceito) {
        query = query.eq('categoria_conceito', filters.categoria_conceito);
      }
      
      query = query.order('termo');
      
      const { data, error } = await query;
      
      if (error) throw error;
      setConceitos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar conceitos';
      setError(errorMessage);
    } finally {
      setConceitosLoading(false);
    }
  }, []);

  const createConceito = async (input: ConceitoFormData): Promise<Conceito> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('013_conceito')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setConceitos(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conceito';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateConceito = async (id: string, input: ConceitoFormData): Promise<Conceito> => {
    try {
      setLoading(true);
      clearError();
      
      const { data, error } = await supabase
        .from('013_conceito')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setConceitos(prev => 
        prev.map(item => item.id === id ? data : item)
      );
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conceito';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteConceito = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      
      const { error } = await supabase
        .from('013_conceito')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar lista local
      setConceitos(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir conceito';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Remove fetch function dependencies to prevent infinite loops
  // The fetch functions are stable due to useCallback, but including them as dependencies
  // can still cause unnecessary re-renders. Empty dependency array ensures this runs only once.
  useEffect(() => {
    fetchAreas();
    fetchNaturezas();
    fetchCategorias();
    fetchSubcategorias();
    fetchConceitos();
  }, []); // Fixed: empty dependency array to prevent infinite loops

  return {
    // Estados gerais
    loading,
    error,
    clearError,
    
    // Áreas
    areas,
    areasLoading,
    fetchAreas,
    createArea,
    updateArea,
    deleteArea,
    
    // Naturezas
    naturezas,
    naturezasLoading,
    fetchNaturezas,
    createNatureza,
    updateNatureza,
    deleteNatureza,
    
    // Categorias
    categorias,
    categoriasLoading,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    
    // Subcategorias
    subcategorias,
    subcategoriasLoading,
    fetchSubcategorias,
    createSubcategoria,
    updateSubcategoria,
    deleteSubcategoria,
    
    // Conceitos
    conceitos,
    conceitosLoading,
    fetchConceitos,
    createConceito,
    updateConceito,
    deleteConceito,
    
    // Estatísticas
    getBasicStats
  };
};

export default useConfig;