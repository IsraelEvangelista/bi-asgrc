import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RiscoPorCategoria {
  nivel_risco: string;
  quantidade: number;
  percentual: number;
}

interface RiscosPorCategoriaData {
  dados: RiscoPorCategoria[];
  total: number;
  loading: boolean;
  error: string | null;
}

export const useRiscosPorCategoria = (): RiscosPorCategoriaData => {
  const [data, setData] = useState<RiscosPorCategoriaData>({
    dados: [],
    total: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Query para buscar dados agrupados por nivel_risco
        const { data: riscosData, error: riscosError } = await supabase
          .from('015_riscos_x_acoes_proc_trab')
          .select('id_risco, nivel_risco')
          .not('nivel_risco', 'is', null)
          .not('id_risco', 'is', null); // Filtra apenas registros com nivel_risco e id_risco não nulos
        
        if (riscosError) {
          throw riscosError;
        }

        // Primeiro, obter apenas os id_risco únicos
        const riscosUnicos = [...new Set(riscosData?.map(item => item.id_risco).filter(Boolean))];
        
        // Depois, para cada risco único, pegar o primeiro registro (evita duplicação)
        const dadosUnicos = riscosUnicos.map(idRisco => {
          return riscosData?.find(item => item.id_risco === idRisco);
        }).filter(Boolean);

        // Agrupar por nivel_risco
        const agrupamento: { [key: string]: number } = {};
        
        dadosUnicos.forEach(item => {
          if (item?.nivel_risco) {
            if (!agrupamento[item.nivel_risco]) {
              agrupamento[item.nivel_risco] = 0;
            }
            agrupamento[item.nivel_risco]++;
          }
        });

        // Converter para array e calcular percentuais
        const dadosProcessados: RiscoPorCategoria[] = [];
        let totalRiscos = 0;

        // Primeiro, calcular o total de riscos distintos
        Object.values(agrupamento).forEach(quantidade => {
          totalRiscos += quantidade;
        });

        // Depois, criar os dados com percentuais
        Object.entries(agrupamento).forEach(([nivel, quantidade]) => {
          const percentual = totalRiscos > 0 ? Math.round((quantidade / totalRiscos) * 100) : 0;
          
          dadosProcessados.push({
            nivel_risco: nivel,
            quantidade,
            percentual
          });
        });

        // Ordenar por quantidade (maior para menor)
        dadosProcessados.sort((a, b) => b.quantidade - a.quantidade);

        setData({
          dados: dadosProcessados,
          total: totalRiscos,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Erro ao buscar dados de riscos por categoria:', error);
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