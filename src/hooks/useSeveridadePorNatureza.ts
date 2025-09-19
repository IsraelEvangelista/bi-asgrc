import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePortfolioAcoesFilter } from '../contexts/PortfolioAcoesFilterContext';

interface SeveridadeNatureza {
  id_natureza: string;
  desc_natureza: string;
  media_severidade: number;
  qtd_riscos: number;
}

interface SeveridadePorNaturezaStats {
  severidadeNatureza: SeveridadeNatureza[];
  loading: boolean;
  error: string | null;
}

export const useSeveridadePorNatureza = (): SeveridadePorNaturezaStats => {
  const [severidadeNatureza, setSeveridadeNatureza] = useState<SeveridadeNatureza[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    filtroSeveridade,
    filtroAcao,
    filtroNatureza,
    filtroCategoria,
    filtroSubcategoria
  } = usePortfolioAcoesFilter();
  
  const getSeverityLabel = (severidade: number): string => {
    if (severidade >= 20) return 'Muito Alto';
    if (severidade >= 10 && severidade < 20) return 'Alto';
    if (severidade >= 5 && severidade < 10) return 'Moderado';
    return 'Baixo';
  };

  const fetchSeveridadePorNatureza = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query complexa com joins para relacionar riscos e naturezas
      const { data: relacoes, error: fetchError } = await supabase
        .from('018_rel_risco')
        .select(`
          id_risco,
          id_natureza,
          006_matriz_riscos!inner(
            id,
            severidade
          ),
          010_natureza!inner(
            id,
            desc_natureza
          )
        `)
        .not('006_matriz_riscos.severidade', 'is', null)
        .is('006_matriz_riscos.deleted_at', null);

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de severidade por natureza: ${fetchError.message}`);
      }

      if (!relacoes || relacoes.length === 0) {
        setSeveridadeNatureza([]);
        return;
      }

      // Agrupar por natureza e calcular média de severidade
      const naturezasMap = new Map<string, {
        desc_natureza: string;
        severidades: number[];
        riscoIds: Set<string>;
      }>();

      relacoes.forEach(relacao => {
        const idNatureza = relacao.id_natureza;
        const naturezaData = Array.isArray(relacao['010_natureza']) ? relacao['010_natureza'][0] : relacao['010_natureza'];
        const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
        const descNatureza = naturezaData?.desc_natureza || '';
        const severidade = riscoData?.severidade;
        const riscoId = relacao.id_risco?.toString?.() ?? String(relacao.id_risco);

        if (severidade !== null && severidade !== undefined) {
          if (!naturezasMap.has(idNatureza)) {
            naturezasMap.set(idNatureza, {
              desc_natureza: descNatureza,
              severidades: [],
              riscoIds: new Set<string>()
            });
          }

          const entry = naturezasMap.get(idNatureza)!;
          entry.severidades.push(severidade);
          if (relacao.id_risco !== null && relacao.id_risco !== undefined) {
            entry.riscoIds.add(riscoId);
          }
        }
      });

      // Calcular média de severidade para cada natureza
      const severidadeNaturezaCalculada: SeveridadeNatureza[] = Array.from(naturezasMap.entries())
        .map(([idNatureza, dados]) => {
          const somaSeveridade = dados.severidades.reduce((acc, sev) => acc + sev, 0);
          const mediaSeveridade = somaSeveridade / dados.severidades.length;

          return {
            id_natureza: idNatureza,
            desc_natureza: dados.desc_natureza,
            media_severidade: Number(mediaSeveridade.toFixed(2)),
            qtd_riscos: dados.riscoIds.size
          };
        })
        // Ordenar da maior média para a menor (esquerda para direita)
        .sort((a, b) => b.media_severidade - a.media_severidade);

      setSeveridadeNatureza(severidadeNaturezaCalculada);
    } catch (err) {
      console.error('Erro no useSeveridadePorNatureza:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeveridadePorNatureza();
  }, [filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  return {
    severidadeNatureza,
    loading,
    error
  };
};