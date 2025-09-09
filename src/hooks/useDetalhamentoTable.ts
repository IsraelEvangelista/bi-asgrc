import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DetalhamentoTableRow {
  id: string;
  macroprocesso: string;
  processo: string;
  subprocesso: string;
  responsavel_processo: string;
  link_manual: string;
  updated_at: string;
}

export interface DetalhamentoTableFilters {
  search?: string;
  macroprocesso?: string;
  processo?: string;
  subprocesso?: string;
  responsavel?: string;
  publicado?: boolean;
}

export type SortField = 'macroprocesso' | 'processo' | 'subprocesso' | 'responsavel_processo';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const useDetalhamentoTable = () => {
  const [data, setData] = useState<DetalhamentoTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'macroprocesso', direction: 'asc' });

  const fetchDetalhamentoData = useCallback(async (filters?: DetalhamentoTableFilters) => {
    console.log('🔍 fetchDetalhamentoData iniciado com filtros:', filters);
    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Construindo query para dados de detalhamento...');
      
      // Query principal com joins
      let query = supabase
        .from('013_subprocessos')
        .select(`
          id,
          subprocesso,
          link_manual,
          updated_at,
          005_processos!inner(
            processo,
            responsavel_processo,
            004_macroprocessos!inner(
              macroprocesso
            ),
            003_areas_gerencias!inner(
              sigla_area
            )
          )
        `);

      // Aplicar filtros
      if (filters?.search) {
        console.log('🔎 Aplicando filtro de busca:', filters.search);
        query = query.or(`subprocesso.ilike.%${filters.search}%,005_processos.processo.ilike.%${filters.search}%,005_processos.004_macroprocessos.macroprocesso.ilike.%${filters.search}%`);
      }

      if (filters?.macroprocesso) {
        console.log('🎯 Aplicando filtro de macroprocesso:', filters.macroprocesso);
        query = query.eq('005_processos.004_macroprocessos.macroprocesso', filters.macroprocesso);
      }

      if (filters?.processo) {
        console.log('📋 Aplicando filtro de processo:', filters.processo);
        query = query.eq('005_processos.processo', filters.processo);
      }

      if (filters?.subprocesso) {
        console.log('📝 Aplicando filtro de subprocesso:', filters.subprocesso);
        query = query.eq('subprocesso', filters.subprocesso);
      }

      if (filters?.responsavel) {
        console.log('👤 Aplicando filtro de responsável:', filters.responsavel);
        query = query.eq('005_processos.003_areas_gerencias.sigla_area', filters.responsavel);
      }

      if (filters?.publicado !== undefined) {
        console.log('📢 Aplicando filtro de publicado:', filters.publicado);
        // Assumindo que publicado significa ter link_manual preenchido
        if (filters.publicado) {
          query = query.not('link_manual', 'is', null).neq('link_manual', '');
        } else {
          query = query.or('link_manual.is.null,link_manual.eq.');
        }
      }

      // Aplicar ordenação
      const { field, direction } = sortConfig;
      console.log('📋 Aplicando ordenação:', field, direction);
      
      switch (field) {
        case 'macroprocesso':
          query = query.order('macroprocesso', { ascending: direction === 'asc', foreignTable: '005_processos.004_macroprocessos' });
          break;
        case 'processo':
          query = query.order('processo', { ascending: direction === 'asc', foreignTable: '005_processos' });
          break;
        case 'subprocesso':
          query = query.order('subprocesso', { ascending: direction === 'asc' });
          break;
        case 'responsavel_processo':
          query = query.order('responsavel_processo', { ascending: direction === 'asc', foreignTable: '005_processos' });
          break;
        default:
          query = query.order('subprocesso', { ascending: true });
      }

      console.log('🚀 Executando query no Supabase...');
      const { data: rawData, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Erro na query do Supabase:', fetchError);
        throw fetchError;
      }

      console.log('✅ Dados recebidos do Supabase:', rawData?.length || 0, 'registros');
      
      // Transformar dados para o formato da tabela
      const transformedData: DetalhamentoTableRow[] = (rawData || []).map((item: Record<string, any>) => ({
        id: String(item.id || ''),
        macroprocesso: item['005_processos']?.['004_macroprocessos']?.macroprocesso || '',
        processo: item['005_processos']?.processo || '',
        subprocesso: String(item.subprocesso || ''),
        responsavel_processo: item['005_processos']?.['003_areas_gerencias']?.sigla_area || '',
        link_manual: String(item.link_manual || ''),
        updated_at: String(item.updated_at || '')
      }));

      console.log('🔄 Dados transformados:', transformedData.length, 'registros');
      setData(transformedData);
      return transformedData;
    } catch (err) {
      console.error('💥 Erro em fetchDetalhamentoData:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados de detalhamento';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchDetalhamentoData finalizado');
    }
  }, [sortConfig]);

  const updateSort = useCallback((field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    sortConfig,
    fetchDetalhamentoData,
    updateSort,
    clearError
  };
};