import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useFilter } from '../contexts/FilterContext';

interface RiscoCoordinates {
  probabilidade: number;
  impacto: number;
  count: number;
}

interface SeveridadeData {
  name: string;
  value: number;
  color: string;
}

interface RiscoCompleto {
  id: string;
  eventos_riscos: string;
  probabilidade: number;
  impacto: number;
  severidade: number;
  responsavel_risco: string | null;
  sigla: string | null;
  demais_responsaveis: string | null;
  created_at: string;
  updated_at: string;
}

interface MatrizRiscosStats {
  totalRiscos: number;
  mediaSeveridade: number;
  coordenadas: RiscoCoordinates[];
  severidadeData: SeveridadeData[];
  riscosCompletos: RiscoCompleto[];
  loading: boolean;
  error: string | null;
}

export const useMatrizRiscos = (): MatrizRiscosStats => {
  const [totalRiscos, setTotalRiscos] = useState<number>(0);
  const [mediaSeveridade, setMediaSeveridade] = useState<number>(0);
  const [coordenadas, setCoordenadas] = useState<RiscoCoordinates[]>([]);
  const [severidadeData, setSeveridadeData] = useState<SeveridadeData[]>([]);
  const [riscosCompletos, setRiscosCompletos] = useState<RiscoCompleto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // CORREÇÃO: Usar FilterContext global em vez de estado local
  const { filtroSeveridade, filtroQuadrante, filtroNatureza, filtroEventoRisco, filtroResponsavelRisco } = useFilter();
  
  console.log('🔍 useMatrizRiscos - Filtros do contexto:', { filtroSeveridade, filtroQuadrante, filtroNatureza, filtroEventoRisco, filtroResponsavelRisco });

  const fetchMatrizRiscosStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os riscos primeiro para calcular dados de severidade
      const { data: todosRiscos, error: fetchAllError } = await supabase
        .from('006_matriz_riscos')
        .select('id, eventos_riscos, probabilidade, impacto, severidade, responsavel_risco, sigla, demais_responsaveis, created_at, updated_at')
        .is('deleted_at', null);

      if (fetchAllError) {
        throw new Error(`Erro ao buscar todos os dados: ${fetchAllError.message}`);
      }

      // Calcular dados de severidade baseados em todos os riscos
      const calcularSeveridadePorValor = (severidade: number): string => {
        if (severidade >= 20) return 'Muito Alto';
        if (severidade >= 10 && severidade < 20) return 'Alto';
        if (severidade >= 5 && severidade < 10) return 'Moderado';
        return 'Baixo';
      };

      const contadores = { 'Baixo': 0, 'Moderado': 0, 'Alto': 0, 'Muito Alto': 0 };
      
      if (todosRiscos) {
        todosRiscos.forEach(risco => {
          if (risco.severidade !== null) {
            const severidade = calcularSeveridadePorValor(risco.severidade);
            contadores[severidade as keyof typeof contadores]++;
          }
        });
      }

      const severidadeDataCalculada: SeveridadeData[] = [
        { name: 'Muito Alto', value: contadores['Muito Alto'], color: '#ef4444' },
        { name: 'Alto', value: contadores['Alto'], color: '#f97316' },
        { name: 'Moderado', value: contadores['Moderado'], color: '#eab308' },
        { name: 'Baixo', value: contadores['Baixo'], color: '#22c55e' }
      ];

      setSeveridadeData(severidadeDataCalculada);

      // CORREÇÃO: Buscar dados com joins para aplicar filtros de natureza
      let query = supabase
        .from('006_matriz_riscos')
        .select(`
          id, eventos_riscos, probabilidade, impacto, severidade, responsavel_risco, sigla, demais_responsaveis, created_at, updated_at,
          018_rel_risco!inner(
            id_natureza,
            010_natureza!inner(
              desc_natureza
            )
          )
        `)
        .is('deleted_at', null);

      // Aplicar filtro de severidade se existir
      if (filtroSeveridade) {
        console.log('🔍 Aplicando filtro de severidade:', filtroSeveridade);
        // Mapear filtros para faixas de severidade baseadas nos novos critérios
        let severidadeRange: { min: number; max?: number } | null = null;
        
        switch (filtroSeveridade) {
          case 'Baixo':
            severidadeRange = { min: 0, max: 4 };
            break;
          case 'Moderado':
            severidadeRange = { min: 5, max: 9 };
            break;
          case 'Alto':
            severidadeRange = { min: 10, max: 19 };
            break;
          case 'Muito Alto':
            severidadeRange = { min: 20 };
            break;
        }
        
        if (severidadeRange) {
          if (severidadeRange.max !== undefined) {
            query = query.gte('severidade', severidadeRange.min).lte('severidade', severidadeRange.max);
          } else {
            query = query.gte('severidade', severidadeRange.min);
          }
        }
      }
      
      // CORREÇÃO: Aplicar filtro de natureza se existir
      if (filtroNatureza) {
        console.log('🔍 Aplicando filtro de natureza:', filtroNatureza);
        query = query.eq('018_rel_risco.id_natureza', filtroNatureza);
      }
      
      // Aplicar filtro de evento de risco se existir
      if (filtroEventoRisco) {
        console.log('🔍 Aplicando filtro de evento de risco:', filtroEventoRisco);
        query = query.ilike('eventos_riscos', `%${filtroEventoRisco}%`);
      }
      
      // Aplicar filtro de responsável pelo risco se existir
      if (filtroResponsavelRisco) {
        console.log('🔍 Aplicando filtro de responsável pelo risco:', filtroResponsavelRisco);
        query = query.or(`responsavel_risco.ilike.%${filtroResponsavelRisco}%,demais_responsaveis.ilike.%${filtroResponsavelRisco}%`);
      }
      
      // Aplicar filtro de quadrante se existir
      if (filtroQuadrante) {
        console.log('🔍 Aplicando filtro de quadrante:', filtroQuadrante);
        query = query.eq('probabilidade', filtroQuadrante.probabilidade).eq('impacto', filtroQuadrante.impacto);
      }

      const { data: riscos, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Erro ao buscar dados: ${fetchError.message}`);
      }

      if (!riscos) {
        setTotalRiscos(0);
        setMediaSeveridade(0);
        setCoordenadas([]);
        setRiscosCompletos([]);
        return;
      }

      // Definir riscos completos filtrados
      setRiscosCompletos(riscos);

      // Calcular total de riscos
      const total = riscos.length;
      setTotalRiscos(total);

      // Calcular média de severidade
      const riscosComSeveridade = riscos.filter(risco => risco.severidade !== null);
      let media = 0;
      
      if (riscosComSeveridade.length > 0) {
        const somaSeveridade = riscosComSeveridade.reduce((acc, risco) => acc + risco.severidade, 0);
        media = somaSeveridade / riscosComSeveridade.length;
        setMediaSeveridade(Number(media.toFixed(2)));
      } else {
        setMediaSeveridade(0);
      }

      // Agrupar por coordenadas (probabilidade x impacto)
      const coordenadasMap = new Map<string, number>();
      
      riscos.forEach(risco => {
        if (risco.probabilidade !== null && risco.impacto !== null) {
          const key = `${risco.probabilidade}-${risco.impacto}`;
          coordenadasMap.set(key, (coordenadasMap.get(key) || 0) + 1);
        }
      });

      const coordenadasArray: RiscoCoordinates[] = [];
      coordenadasMap.forEach((count, key) => {
        const [probabilidade, impacto] = key.split('-').map(Number);
        coordenadasArray.push({ probabilidade, impacto, count });
      });

      setCoordenadas(coordenadasArray);

    } catch (err) {
      console.error('Erro ao buscar estatísticas da matriz de riscos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setTotalRiscos(0);
      setMediaSeveridade(0);
      setCoordenadas([]);
      setSeveridadeData([]);
      setRiscosCompletos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useMatrizRiscos - Recarregando dados devido a mudança nos filtros');
    fetchMatrizRiscosStats();
  }, [filtroSeveridade, filtroQuadrante, filtroNatureza, filtroEventoRisco, filtroResponsavelRisco]);

  return {
    totalRiscos,
    mediaSeveridade,
    coordenadas,
    severidadeData,
    riscosCompletos,
    loading,
    error
  };
};