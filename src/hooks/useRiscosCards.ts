import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscosCardsData {
  quantidadeProcessos: number;
  quantidadeRiscos: number;
  quantidadeAcoes: number;
  loading: boolean;
  error: string | null;
}

interface FiltrosGerais {
  macroprocessoId: string;
  processoId: string;
  subprocessoId: string;
  responsavelId: string;
  acaoId: string;
  situacaoRisco: string;
}

export const useRiscosCards = (filtrosGerais?: FiltrosGerais): RiscosCardsData => {
  const [data, setData] = useState<RiscosCardsData>({
    quantidadeProcessos: 0,
    quantidadeRiscos: 0,
    quantidadeAcoes: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Query para contar processos estruturados com data_ultima_atualizacao não nula
        const { data: processosData, error: processosError } = await supabase
          .from('005_processos')
          .select('id')
          .not('data_ultima_atualizacao', 'is', null); // Seleciona apenas o campo id
        
        if (processosError) {
          throw processosError;
        }

        // Query para contar riscos distintos com filtros aplicados
        let riscosQuery = supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_risco, id_processo, id_acao_controle, responsavel_processo, situacao_risco');
        
        // Aplicar filtros se fornecidos
        if (filtrosGerais) {
          if (filtrosGerais.processoId) {
            riscosQuery = riscosQuery.eq('id_processo', filtrosGerais.processoId);
          }
          if (filtrosGerais.acaoId) {
            riscosQuery = riscosQuery.eq('id_acao_controle', filtrosGerais.acaoId);
          }
          if (filtrosGerais.responsavelId) {
            riscosQuery = riscosQuery.eq('responsavel_processo', filtrosGerais.responsavelId);
          }
          if (filtrosGerais.situacaoRisco) {
            riscosQuery = riscosQuery.ilike('situacao_risco', `%${filtrosGerais.situacaoRisco}%`);
          }
        }
        
        const { data: riscosData, error: riscosError } = await riscosQuery;
        
        if (riscosError) {
          throw riscosError;
        }

        // Contar IDs de risco distintos
        const riscosDistintos = new Set(riscosData?.map(item => item.id_risco) || []);
        const riscosCount = riscosDistintos.size;

        // Query para contar ações distintas com filtros aplicados
        let acoesQuery = supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_acao_controle, id_processo, responsavel_processo, situacao_risco');
        
        // Aplicar os mesmos filtros
        if (filtrosGerais) {
          if (filtrosGerais.processoId) {
            acoesQuery = acoesQuery.eq('id_processo', filtrosGerais.processoId);
          }
          if (filtrosGerais.responsavelId) {
            acoesQuery = acoesQuery.eq('responsavel_processo', filtrosGerais.responsavelId);
          }
          if (filtrosGerais.situacaoRisco) {
            acoesQuery = acoesQuery.ilike('situacao_risco', `%${filtrosGerais.situacaoRisco}%`);
          }
        }
        
        const { data: acoesData, error: acoesError } = await acoesQuery;
        
        if (acoesError) {
          throw acoesError;
        }

        // Contar IDs únicos de ações
        const acoesUnicas = new Set(acoesData?.map(item => item.id_acao_controle) || []);
        const acoesCount = acoesUnicas.size;

        setData({
          quantidadeProcessos: processosData?.length || 0,
          quantidadeRiscos: riscosCount,
          quantidadeAcoes: acoesCount,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro geral ao buscar dados:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    fetchData();
  }, [filtrosGerais]);

  return data;
};