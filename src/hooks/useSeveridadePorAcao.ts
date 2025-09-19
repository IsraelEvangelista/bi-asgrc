import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePortfolioAcoesFilter } from '../contexts/PortfolioAcoesFilterContext';

interface SeveridadeAcao {
  id_acao: string;
  sigla_acao: string;
  desc_acao: string;
  media_severidade: number;
  qtd_riscos: number;
}

interface SeveridadePorAcaoStats {
  severidadeAcoes: SeveridadeAcao[];
  loading: boolean;
  error: string | null;
}

export const useSeveridadePorAcao = (): SeveridadePorAcaoStats => {
  const [severidadeAcoes, setSeveridadeAcoes] = useState<SeveridadeAcao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    filtroSeveridade,
    filtroAcao,
    filtroNatureza,
    filtroCategoria,
    filtroSubcategoria
  } = usePortfolioAcoesFilter();
  
  // Função para classificar severidade
  const getSeverityLabel = (severidade: number): string => {
    if (severidade >= 20) return 'Muito Alto';
    if (severidade >= 10 && severidade < 20) return 'Alto';
    if (severidade >= 5 && severidade < 10) return 'Moderado';
    return 'Baixo';
  };

  const fetchSeveridadePorAcao = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todas as ações
      const { data: acoesData, error: acoesError } = await supabase
        .from('009_acoes')
        .select('id, sigla_acao, desc_acao');
        
      if (acoesError) throw new Error(`Erro ao buscar ações: ${acoesError.message}`);

      // Query com joins para relacionar ações, riscos e metadados
      const { data: relacoes, error: fetchError } = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_acao,
          id_risco,
          006_matriz_riscos!inner(
            id,
            severidade
          )
        `)
        .not('006_matriz_riscos.severidade', 'is', null)
        .is('006_matriz_riscos.deleted_at', null);
        
      // Buscar relações risco-natureza-categoria-subcategoria
      const { data: riscoRelacoes, error: riscoRelError } = await supabase
        .from('018_rel_risco')
        .select(`
          id_risco,
          id_natureza,
          id_categoria,
          id_subcategoria,
          010_natureza!inner(id, desc_natureza),
          011_categoria!inner(id, desc_categoria),
          012_subcategoria!left(id, desc_subcategoria)
        `);

      if (fetchError) throw new Error(`Erro ao buscar dados de severidade por ação: ${fetchError.message}`);
      if (riscoRelError) throw new Error(`Erro ao buscar relações de risco: ${riscoRelError.message}`);

      // Combinar dados das queries
      const relacoesCombinadas = (relacoes || []).map(rel => {
        const riscoRel = (riscoRelacoes || []).find(rr => String(rr.id_risco) === String(rel.id_risco));
        return { ...rel, riscoRelacao: riscoRel || null };
      });

      // Aplicar filtros
      const relacoesFiltradas = relacoesCombinadas.filter(relacao => {
        const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
        const riscoRelacao = relacao.riscoRelacao;
        
        if (!riscoData?.severidade && riscoData?.severidade !== 0) return false;
        
        // Filtro por severidade
        if (filtroSeveridade) {
          const severidadeLabel = getSeverityLabel(riscoData.severidade);
          if (severidadeLabel !== filtroSeveridade) return false;
        }
        
        // Filtro por ação
        if (filtroAcao && String(relacao.id_acao) !== filtroAcao) return false;
        
        // Filtro por natureza
        if (filtroNatureza && riscoRelacao) {
          const naturezaData = Array.isArray(riscoRelacao['010_natureza']) ? riscoRelacao['010_natureza'][0] : riscoRelacao['010_natureza'];
          if (!naturezaData || String(naturezaData.id) !== filtroNatureza) return false;
        }
        
        // Filtro por categoria
        if (filtroCategoria && riscoRelacao) {
          const categoriaData = Array.isArray(riscoRelacao['011_categoria']) ? riscoRelacao['011_categoria'][0] : riscoRelacao['011_categoria'];
          if (!categoriaData || String(categoriaData.id) !== filtroCategoria) return false;
        }
        
        // Filtro por subcategoria
        if (filtroSubcategoria && riscoRelacao) {
          const subcategoriaData = Array.isArray(riscoRelacao['012_subcategoria']) ? riscoRelacao['012_subcategoria'][0] : riscoRelacao['012_subcategoria'];
          if (!subcategoriaData || String(subcategoriaData.id) !== filtroSubcategoria) return false;
        }
        
        return true;
      });

      // Agregar por ação
      const acoesAgg = new Map<string, { severidades: number[]; riscoIds: Set<string> }>();
      
      relacoesFiltradas.forEach(relacao => {
        const idAcao = String(relacao.id_acao);
        const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
        const severidade = riscoData?.severidade;
        const riscoId = relacao.id_risco?.toString?.() ?? String(relacao.id_risco);

        if (severidade !== null && severidade !== undefined) {
          if (!acoesAgg.has(idAcao)) acoesAgg.set(idAcao, { severidades: [], riscoIds: new Set<string>() });
          const agg = acoesAgg.get(idAcao)!;
          agg.severidades.push(Number(severidade));
          if (riscoId) agg.riscoIds.add(riscoId);
        }
      });

      // Construir lista completa de ações
      const severidadeAcoesCalculada: SeveridadeAcao[] = (acoesData || []).map(acao => {
        const agg = acoesAgg.get(String(acao.id));
        const media = agg && agg.severidades.length > 0
          ? Number((agg.severidades.reduce((acc, v) => acc + v, 0) / agg.severidades.length).toFixed(2))
          : 0;

        return {
          id_acao: String(acao.id),
          sigla_acao: acao.sigla_acao,
          desc_acao: acao.desc_acao,
          media_severidade: media,
          qtd_riscos: agg ? agg.riscoIds.size : 0
        };
      }).sort((a, b) => b.media_severidade - a.media_severidade);

      setSeveridadeAcoes(severidadeAcoesCalculada);
    } catch (err) {
      console.error('Erro no useSeveridadePorAcao:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeveridadePorAcao();
  }, [filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  return {
    severidadeAcoes,
    loading,
    error
  };
};
