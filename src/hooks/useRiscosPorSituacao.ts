import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscoPorSituacao {
  situacao_risco: string;
  quantidade: number;
  percentual: number;
}

interface RiscosPorSituacaoData {
  dados: RiscoPorSituacao[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const useRiscosPorSituacao = (): RiscosPorSituacaoData => {
  const [data, setData] = useState<RiscosPorSituacaoData>({
    dados: [],
    total: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Query para buscar dados agrupados por situacao_risco
        const { data: riscosData, error: riscosError } = await supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_risco, situacao_risco')
          .not('situacao_risco', 'is', null);

        console.log('Dados brutos da situação dos riscos:', riscosData);

        if (riscosError) {
          console.error('Erro ao buscar dados de situação dos riscos:', riscosError);
          throw riscosError;
        }

        if (!riscosData || riscosData.length === 0) {
          console.log('Nenhum dado encontrado');
          setData({
            dados: [],
            total: 0,
            loading: false,
            error: null
          });
          return;
        }

        // Agrupar por situacao_risco e contar IDs únicos
        const agrupamento: Record<string, Set<string>> = {};
        
        riscosData.forEach(item => {
          const situacao = item.situacao_risco || 'Não informado';
          
          if (!agrupamento[situacao]) {
            agrupamento[situacao] = new Set();
          }
          
          agrupamento[situacao].add(item.id_risco);
        });

        // Converter Sets em contagens
        const agrupamentoContagem: Record<string, number> = {};
        Object.entries(agrupamento).forEach(([situacao, idsSet]) => {
          agrupamentoContagem[situacao] = idsSet.size;
        });

        const dadosProcessados: RiscoPorSituacao[] = [];
        let totalRiscos = 0;

        // Primeiro, calcular o total de riscos distintos
        Object.values(agrupamentoContagem).forEach(quantidade => {
          totalRiscos += quantidade;
        });

        // Depois, criar os dados com percentuais
        Object.entries(agrupamentoContagem).forEach(([situacao, quantidade]) => {
          const percentual = totalRiscos > 0 ? Math.round((quantidade / totalRiscos) * 100) : 0;
          
          dadosProcessados.push({
            situacao_risco: situacao,
            quantidade,
            percentual
          });
        });

        // Ordenar por quantidade (decrescente)
        dadosProcessados.sort((a, b) => b.quantidade - a.quantidade);

        setData({
          dados: dadosProcessados,
          total: totalRiscos,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro ao buscar dados de situação dos riscos:', error);
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