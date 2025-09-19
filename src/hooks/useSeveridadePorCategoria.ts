import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePortfolioAcoesFilter } from '../contexts/PortfolioAcoesFilterContext';

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

interface SeveridadePorCategoriaStats {
  severidadeCategorias: SeveridadeCategoria[];
  loading: boolean;
  error: string | null;
}

export const useSeveridadePorCategoria = (): SeveridadePorCategoriaStats => {
  const [severidadeCategorias, setSeveridadeCategorias] = useState<SeveridadeCategoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    filtroSeveridade,
    filtroAcao,
    filtroNatureza,
    filtroCategoria,
    filtroSubcategoria
  } = usePortfolioAcoesFilter();

  const fetchSeveridadePorCategoria = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query complexa com joins para relacionar riscos, categorias e subcategorias
      const { data: relacoes, error: fetchError } = await supabase
        .from('018_rel_risco')
        .select(`
          id_risco,
          id_categoria,
          id_subcategoria,
          006_matriz_riscos!inner(
            id,
            severidade
          ),
          011_categoria!inner(
            id,
            desc_categoria
          ),
          012_subcategoria!left(
            id,
            desc_subcategoria
          )
        `)
        .not('006_matriz_riscos.severidade', 'is', null)
        .is('006_matriz_riscos.deleted_at', null);

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de severidade por categoria: ${fetchError.message}`);
      }

      if (!relacoes || relacoes.length === 0) {
        setSeveridadeCategorias([]);
        return;
      }

      // Agrupar por categoria e subcategoria
      const categoriasMap = new Map<string, {
        desc_categoria: string;
        severidades: number[];
        riscoIds: Set<string>;
      }>();

      const subcategoriasMap = new Map<string, {
        desc_subcategoria: string;
        id_categoria: string;
        severidades: number[];
        riscoIds: Set<string>;
      }>();

      relacoes.forEach(relacao => {
        const idCategoria = relacao.id_categoria;
        const idSubcategoria = relacao.id_subcategoria;
        const categoriaData = Array.isArray(relacao['011_categoria']) ? relacao['011_categoria'][0] : relacao['011_categoria'];
        const subcategoriaData = Array.isArray(relacao['012_subcategoria']) ? relacao['012_subcategoria'][0] : relacao['012_subcategoria'];
        const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
        const descCategoria = categoriaData?.desc_categoria || '';
        const descSubcategoria = subcategoriaData?.desc_subcategoria || '';
        const severidade = riscoData?.severidade;
        const riscoId = relacao.id_risco?.toString?.() ?? String(relacao.id_risco);

        if (severidade !== null && severidade !== undefined) {
          // Processar categoria
          if (!categoriasMap.has(idCategoria)) {
            categoriasMap.set(idCategoria, {
              desc_categoria: descCategoria,
              severidades: [],
              riscoIds: new Set<string>()
            });
          }

          const categoriaEntry = categoriasMap.get(idCategoria)!;
          categoriaEntry.severidades.push(severidade);
          if (relacao.id_risco !== null && relacao.id_risco !== undefined) {
            categoriaEntry.riscoIds.add(riscoId);
          }

          // Processar subcategoria se existir
          if (idSubcategoria) {
            if (!subcategoriasMap.has(idSubcategoria)) {
              subcategoriasMap.set(idSubcategoria, {
                desc_subcategoria: descSubcategoria,
                id_categoria: idCategoria,
                severidades: [],
                riscoIds: new Set<string>()
              });
            }

            const subcategoriaEntry = subcategoriasMap.get(idSubcategoria)!;
            subcategoriaEntry.severidades.push(severidade);
            if (relacao.id_risco !== null && relacao.id_risco !== undefined) {
              subcategoriaEntry.riscoIds.add(riscoId);
            }
          }
        }
      });

      // Calcular médias de severidade para categorias
      const severidadeCategoriasCalculada: SeveridadeCategoria[] = Array.from(categoriasMap.entries())
        .map(([idCategoria, dados]) => {
          const somaSeveridade = dados.severidades.reduce((acc, sev) => acc + sev, 0);
          const mediaSeveridade = somaSeveridade / dados.severidades.length;

          return {
            id: `cat-${idCategoria}`,
            nome: dados.desc_categoria,
            tipo: 'categoria' as const,
            media_severidade: Number(mediaSeveridade.toFixed(2)),
            qtd_riscos: dados.riscoIds.size,
            id_categoria: idCategoria,
            parentId: undefined
          };
        })
        // Ordenar da maior média para a menor
        .sort((a, b) => b.media_severidade - a.media_severidade);

      // Calcular médias de severidade para subcategorias
      const severidadeSubcategoriasCalculada: SeveridadeCategoria[] = Array.from(subcategoriasMap.entries())
        .map(([idSubcategoria, dados]) => {
          const somaSeveridade = dados.severidades.reduce((acc, sev) => acc + sev, 0);
          const mediaSeveridade = somaSeveridade / dados.severidades.length;

          return {
            id: `sub-${idSubcategoria}`,
            nome: dados.desc_subcategoria,
            tipo: 'subcategoria' as const,
            media_severidade: Number(mediaSeveridade.toFixed(2)),
            qtd_riscos: dados.riscoIds.size,
            id_subcategoria: idSubcategoria,
            parentId: `cat-${dados.id_categoria}`
          };
        })
        // Ordenar da maior média para a menor
        .sort((a, b) => b.media_severidade - a.media_severidade);

      // Combinar categorias e subcategorias
      const todasCategorias = [...severidadeCategoriasCalculada, ...severidadeSubcategoriasCalculada];
      setSeveridadeCategorias(todasCategorias);
    } catch (err) {
      console.error('Erro no useSeveridadePorCategoria:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeveridadePorCategoria();
  }, [filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  return {
    severidadeCategorias,
    loading,
    error
  };
};