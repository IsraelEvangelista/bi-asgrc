import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { usePortfolioAcoesFilter } from '../contexts/PortfolioAcoesFilterContext';

interface SeveridadeAcao {
  id_acao: string;
  sigla_acao: string;
  desc_acao: string;
  media_severidade: number;
  qtd_riscos: number;
}

interface SeveridadeNatureza {
  id_natureza: string;
  desc_natureza: string;
  media_severidade: number;
  qtd_riscos: number;
}

interface SeveridadeCategoria {
  id: string;
  nome: string;
  tipo: 'categoria' | 'subcategoria';
  media_severidade: number;
  qtd_riscos: number;
  id_categoria?: string;
  id_subcategoria?: string;
  parentId?: string;
}

interface PortfolioAcoesData {
  severidadeAcoes: SeveridadeAcao[];
  severidadeNatureza: SeveridadeNatureza[];
  severidadeCategorias: SeveridadeCategoria[];
  loading: boolean;
  error: string | null;
}

interface Acao {
  id: string;
  sigla_acao: string;
  desc_acao: string;
}

export const usePortfolioAcoesData = (): PortfolioAcoesData => {
  const [rawRelacoes, setRawRelacoes] = useState<any[]>([]);
  const [acoes, setAcoes] = useState<Acao[]>([]);
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

  // Buscar dados brutos: lista completa de ações + relações (para calcular severidade)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar TODAS as ações (sem limite) — fonte de verdade para contagem total
        const { data: acoesData, error: acoesError } = await supabase
          .from('009_acoes')
          .select('id, sigla_acao, desc_acao');

        if (acoesError) throw new Error(`Erro ao buscar ações: ${acoesError.message}`);

        // Buscar relações completas: ação-risco-natureza-categoria-subcategoria
        const { data: relacoes, error: relError } = await supabase
          .from('016_rel_acoes_riscos')
          .select(`
            id_acao,
            id_risco,
            006_matriz_riscos!inner(
              id,
              severidade,
              deleted_at
            )
          `)
          .is('006_matriz_riscos.deleted_at', null);

        // Buscar relações risco-natureza-categoria-subcategoria
        const { data: riscoRelacoes, error: riscoRelError } = await supabase
          .from('018_rel_risco')
          .select(`
            id_risco,
            id_natureza,
            id_categoria,
            id_subcategoria,
            010_natureza!inner(
              id,
              desc_natureza
            ),
            011_categoria!inner(
              id,
              desc_categoria
            ),
            012_subcategoria!left(
              id,
              desc_subcategoria
            )
          `);

        if (relError) throw new Error(`Erro ao buscar relações: ${relError.message}`);
        if (riscoRelError) throw new Error(`Erro ao buscar relações de risco: ${riscoRelError.message}`);

        // Combinar dados das duas queries
        const relacoesCombinadas = (relacoes || []).map(rel => {
          const riscoRel = (riscoRelacoes || []).find(rr => String(rr.id_risco) === String(rel.id_risco));
          return {
            ...rel,
            riscoRelacao: riscoRel || null
          };
        });

        setAcoes((acoesData || []).map(a => ({ id: String(a.id), sigla_acao: a.sigla_acao, desc_acao: a.desc_acao })));
        setRawRelacoes(relacoesCombinadas);
      } catch (err) {
        console.error('Erro no usePortfolioAcoesData:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros e processar dados
  const processedData = useMemo(() => {
    if (!acoes.length) {
      return { severidadeAcoes: [], severidadeNatureza: [], severidadeCategorias: [] };
    }

    // 1) Filtrar relações baseado em todos os filtros ativos
    const relacoesFiltradas = rawRelacoes.filter(relacao => {
      const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
      const riscoRelacao = relacao.riscoRelacao;
      
      // Verificar se tem severidade válida
      if (!riscoData?.severidade && riscoData?.severidade !== 0) return false;
      
      // Filtro por severidade
      if (filtroSeveridade) {
        const severidadeLabel = getSeverityLabel(riscoData.severidade);
        if (severidadeLabel !== filtroSeveridade) return false;
      }
      
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

    // 2) Agregar severidade por ação a partir das relações filtradas
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

    // 3) Construir a lista completa de ações garantindo presença de TODAS as 204
    let severidadeAcoes: SeveridadeAcao[] = acoes.map(acao => {
      const agg = acoesAgg.get(acao.id);
      const media = agg && agg.severidades.length > 0
        ? Number((agg.severidades.reduce((acc, v) => acc + v, 0) / agg.severidades.length).toFixed(2))
        : 0;

      return {
        id_acao: acao.id,
        sigla_acao: acao.sigla_acao,
        desc_acao: acao.desc_acao,
        media_severidade: media,
        qtd_riscos: agg ? agg.riscoIds.size : 0,
      };
    });

    // 4) Aplicar filtro por ação específica (outros filtros já aplicados na etapa 1)
    if (filtroAcao) {
      severidadeAcoes = severidadeAcoes.filter(a => a.id_acao === filtroAcao);
    }

    // Ordenar por severidade (desc)
    severidadeAcoes.sort((a, b) => b.media_severidade - a.media_severidade);

    // 5) Processar severidade por natureza a partir das relações filtradas
    const naturezaAgg = new Map<string, { desc_natureza: string; severidades: number[]; riscoIds: Set<string> }>();
    
    relacoesFiltradas.forEach(relacao => {
      const riscoRelacao = relacao.riscoRelacao;
      if (riscoRelacao) {
        const naturezaData = Array.isArray(riscoRelacao['010_natureza']) ? riscoRelacao['010_natureza'][0] : riscoRelacao['010_natureza'];
        if (naturezaData) {
          const idNatureza = String(naturezaData.id);
          const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
          const severidade = riscoData?.severidade;
          const riscoId = relacao.id_risco?.toString?.() ?? String(relacao.id_risco);
          
          if (severidade !== null && severidade !== undefined) {
            if (!naturezaAgg.has(idNatureza)) {
              naturezaAgg.set(idNatureza, {
                desc_natureza: naturezaData.desc_natureza,
                severidades: [],
                riscoIds: new Set<string>()
              });
            }
            const agg = naturezaAgg.get(idNatureza)!;
            agg.severidades.push(Number(severidade));
            if (riscoId) agg.riscoIds.add(riscoId);
          }
        }
      }
    });
    
    const severidadeNatureza: SeveridadeNatureza[] = Array.from(naturezaAgg.entries())
      .map(([idNatureza, dados]) => ({
        id_natureza: idNatureza,
        desc_natureza: dados.desc_natureza,
        media_severidade: dados.severidades.length > 0
          ? Number((dados.severidades.reduce((acc, v) => acc + v, 0) / dados.severidades.length).toFixed(2))
          : 0,
        qtd_riscos: dados.riscoIds.size
      }))
      .sort((a, b) => b.media_severidade - a.media_severidade);
    
    // 6) Processar severidade por categoria/subcategoria a partir das relações filtradas
    const categoriaAgg = new Map<string, { desc_categoria: string; severidades: number[]; riscoIds: Set<string> }>();
    const subcategoriaAgg = new Map<string, { desc_subcategoria: string; id_categoria: string; severidades: number[]; riscoIds: Set<string> }>();
    
    relacoesFiltradas.forEach(relacao => {
      const riscoRelacao = relacao.riscoRelacao;
      if (riscoRelacao) {
        const categoriaData = Array.isArray(riscoRelacao['011_categoria']) ? riscoRelacao['011_categoria'][0] : riscoRelacao['011_categoria'];
        const subcategoriaData = Array.isArray(riscoRelacao['012_subcategoria']) ? riscoRelacao['012_subcategoria'][0] : riscoRelacao['012_subcategoria'];
        const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
        const severidade = riscoData?.severidade;
        const riscoId = relacao.id_risco?.toString?.() ?? String(relacao.id_risco);
        
        if (severidade !== null && severidade !== undefined) {
          // Processar categoria
          if (categoriaData) {
            const idCategoria = String(categoriaData.id);
            if (!categoriaAgg.has(idCategoria)) {
              categoriaAgg.set(idCategoria, {
                desc_categoria: categoriaData.desc_categoria,
                severidades: [],
                riscoIds: new Set<string>()
              });
            }
            const catAgg = categoriaAgg.get(idCategoria)!;
            catAgg.severidades.push(Number(severidade));
            if (riscoId) catAgg.riscoIds.add(riscoId);
          }
          
          // Processar subcategoria
          if (subcategoriaData && categoriaData) {
            const idSubcategoria = String(subcategoriaData.id);
            const idCategoria = String(categoriaData.id);
            if (!subcategoriaAgg.has(idSubcategoria)) {
              subcategoriaAgg.set(idSubcategoria, {
                desc_subcategoria: subcategoriaData.desc_subcategoria,
                id_categoria: idCategoria,
                severidades: [],
                riscoIds: new Set<string>()
              });
            }
            const subAgg = subcategoriaAgg.get(idSubcategoria)!;
            subAgg.severidades.push(Number(severidade));
            if (riscoId) subAgg.riscoIds.add(riscoId);
          }
        }
      }
    });
    
    const severidadeCategorias: SeveridadeCategoria[] = [
      // Categorias
      ...Array.from(categoriaAgg.entries()).map(([idCategoria, dados]) => ({
        id: `cat-${idCategoria}`,
        nome: dados.desc_categoria,
        tipo: 'categoria' as const,
        media_severidade: dados.severidades.length > 0
          ? Number((dados.severidades.reduce((acc, v) => acc + v, 0) / dados.severidades.length).toFixed(2))
          : 0,
        qtd_riscos: dados.riscoIds.size,
        id_categoria: idCategoria
      })),
      // Subcategorias
      ...Array.from(subcategoriaAgg.entries()).map(([idSubcategoria, dados]) => ({
        id: `sub-${idSubcategoria}`,
        nome: dados.desc_subcategoria,
        tipo: 'subcategoria' as const,
        media_severidade: dados.severidades.length > 0
          ? Number((dados.severidades.reduce((acc, v) => acc + v, 0) / dados.severidades.length).toFixed(2))
          : 0,
        qtd_riscos: dados.riscoIds.size,
        id_subcategoria: idSubcategoria,
        parentId: `cat-${dados.id_categoria}`
      }))
    ].sort((a, b) => b.media_severidade - a.media_severidade);

    return { severidadeAcoes, severidadeNatureza, severidadeCategorias };
  }, [acoes, rawRelacoes, filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  return {
    ...processedData,
    loading,
    error
  };
};