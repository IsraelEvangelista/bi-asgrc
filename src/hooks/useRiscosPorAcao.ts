import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface RiscoPorAcao {
  id: string;
  eventos_riscos: string;
  severidade: number;
  sigla?: string;
}

interface UseRiscosPorAcaoResult {
  riscos: RiscoPorAcao[];
  loading: boolean;
  error: string | null;
  fetchRiscosPorAcao: (idAcao: string) => Promise<void>;
  getCachedRiscos: (idAcao: string) => RiscoPorAcao[] | null;
}

export const useRiscosPorAcao = (): UseRiscosPorAcaoResult => {
  const [riscos, setRiscos] = useState<RiscoPorAcao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cache para armazenar respostas anteriores
  const cacheRef = useRef<Map<string, RiscoPorAcao[]>>(new Map());

  const fetchRiscosPorAcao = async (idAcao: string) => {
    if (!idAcao) {
      setRiscos([]);
      return;
    }

    // Verificar cache primeiro
    if (cacheRef.current.has(idAcao)) {
      const cachedData = cacheRef.current.get(idAcao);
      if (cachedData) {
        setRiscos(cachedData);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Consulta otimizada com joins para buscar riscos de uma ação específica
      const { data: relacoes, error: fetchError } = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_risco,
          006_matriz_riscos!inner(
            id,
            eventos_riscos,
            severidade,
            sigla
          )
        `)
        .eq('id_acao', idAcao)
        .not('006_matriz_riscos.severidade', 'is', null)
        .is('006_matriz_riscos.deleted_at', null);

      if (fetchError) {
        throw new Error(`Erro ao buscar riscos da ação: ${fetchError.message}`);
      }

      if (!relacoes || relacoes.length === 0) {
        const emptyData: RiscoPorAcao[] = [];
        setRiscos(emptyData);
        cacheRef.current.set(idAcao, emptyData);
        return;
      }

      // Filtro adicional para garantir dados válidos (backup para filtros aninhados)
      const relacoesFiltradas = relacoes.filter(relacao => {
        const riscoData = Array.isArray(relacao['006_matriz_riscos'])
          ? relacao['006_matriz_riscos'][0]
          : relacao['006_matriz_riscos'];

        return riscoData &&
               riscoData.severidade !== null &&
               riscoData.severidade !== undefined &&
               riscoData.id !== null;
      });

      // Processar os dados retornados
      const riscosProcessados: RiscoPorAcao[] = relacoesFiltradas
        .map(relacao => {
          const riscoData = Array.isArray(relacao['006_matriz_riscos'])
            ? relacao['006_matriz_riscos'][0]
            : relacao['006_matriz_riscos'];

          if (!riscoData) return null;

          return {
            id: riscoData.id?.toString() || relacao.id_risco?.toString() || '',
            eventos_riscos: riscoData.eventos_riscos || 'Risco sem descrição',
            severidade: riscoData.severidade || 0,
            sigla: riscoData.sigla || undefined
          };
        })
        .filter((risco): risco is NonNullable<typeof risco> => risco !== null)
        // Ordenar por severidade (maior para menor)
        .sort((a, b) => b.severidade - a.severidade);

      // Armazenar no cache
      cacheRef.current.set(idAcao, riscosProcessados);
      setRiscos(riscosProcessados);
    } catch (err) {
      console.error('Erro no useRiscosPorAcao:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setRiscos([]);
    } finally {
      setLoading(false);
    }
  };

  // Limpar dados quando o componente for desmontado
  useEffect(() => {
    return () => {
      setRiscos([]);
      setError(null);
    };
  }, []);

  // Getter síncrono para acessar dados em cache
  const getCachedRiscos = (idAcao: string): RiscoPorAcao[] | null => {
    return cacheRef.current.get(idAcao) || null;
  };

  return {
    riscos,
    loading,
    error,
    fetchRiscosPorAcao,
    getCachedRiscos
  };
};