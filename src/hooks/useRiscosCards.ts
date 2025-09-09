import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscosCardsData {
  quantidadeProcessos: number;
  quantidadeRiscos: number;
  quantidadeAcoes: number;
  loading: boolean;
  error: string | null;
}

export const useRiscosCards = (): RiscosCardsData => {
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

        // Query para contar riscos distintos da tabela 015_riscos_x_acoes_proc_trab (campo 'id_risco')
        const { data: riscosData, error: riscosError } = await supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_risco'); // Seleciona apenas o campo id_risco
        
        if (riscosError) {
          throw riscosError;
        }

        // Contar IDs de risco distintos
        const riscosDistintos = new Set(riscosData?.map(item => item.id_risco) || []);
        const riscosCount = riscosDistintos.size;

        // Query para contar ações distintas da tabela 015_riscos_x_acoes_proc_trab (campo 'id_acao_controle')
        const { data: acoesData, error: acoesError } = await supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_acao_controle'); // Seleciona apenas o campo id_acao_controle
        
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
  }, []);

  return data;
};