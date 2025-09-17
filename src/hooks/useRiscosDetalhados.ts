import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RiscoDetalhado {
  id: string;
  desc_risco: string;
  severidade: number;
  conformidade: number;
  id_natureza?: string;
  id_categoria?: string;
  id_subcategoria?: string;
  desc_natureza?: string;
  desc_categoria?: string;
  desc_subcategoria?: string;
}

interface RiscosPorAcao {
  [acaoId: string]: RiscoDetalhado[];
}

interface UseRiscosDetalhadosResult {
  riscosPorAcao: RiscosPorAcao;
  loading: boolean;
  error: string | null;
}

export const useRiscosDetalhados = (): UseRiscosDetalhadosResult => {
  const [riscosPorAcao, setRiscosPorAcao] = useState<RiscosPorAcao>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiscosDetalhados = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar todos os riscos com suas relações - abordagem simplificada
        const { data: relacoesAcoesRiscos, error: fetchError1 } = await supabase
          .from('016_rel_acoes_riscos')
          .select('*')
          .not('id_risco', 'is', null);

        if (fetchError1) {
          throw new Error(`Erro ao buscar relações ações-riscos: ${fetchError1.message}`);
        }

        // Buscar detalhes dos riscos
        const riscoIds = relacoesAcoesRiscos?.map(r => r.id_risco).filter(Boolean) || [];
        let riscoDetails: any[] = [];

        if (riscoIds.length > 0) {
          const { data: riscosData, error: fetchError2 } = await supabase
            .from('006_matriz_riscos')
            .select('id, eventos_riscos, severidade, sigla')
            .in('id', riscoIds)
            .not('severidade', 'is', null)
            .is('deleted_at', null);

          if (fetchError2) {
            throw new Error(`Erro ao buscar detalhes dos riscos: ${fetchError2.message}`);
          }
          riscoDetails = riscosData || [];
        }

        // Buscar detalhes das ações
        const acaoIds = relacoesAcoesRiscos?.map(r => r.id_acao).filter(Boolean) || [];
        let acaoDetails: any[] = [];

        if (acaoIds.length > 0) {
          const { data: acoesData, error: fetchError3 } = await supabase
            .from('009_acoes')
            .select('id, sigla_acao, desc_acao')
            .in('id', acaoIds);

          if (fetchError3) {
            throw new Error(`Erro ao buscar detalhes das ações: ${fetchError3.message}`);
          }
          acaoDetails = acoesData || [];
        }

        // Buscar relacionamentos de categorias
        const { data: relacoesCategorias, error: fetchError4 } = await supabase
          .from('018_rel_risco')
          .select('*')
          .in('id_risco', riscoIds);

        if (fetchError4) {
          throw new Error(`Erro ao buscar relações de categorias: ${fetchError4.message}`);
        }

        // Combinar todos os dados
        const relacoes = relacoesAcoesRiscos?.map(relacao => {
          const risco = riscoDetails.find(r => r.id === relacao.id_risco);
          const acao = acaoDetails.find(a => a.id === relacao.id_acao);
          const relCategoria = relacoesCategorias?.find(rc => rc.id_risco === relacao.id_risco);

          return {
            id_risco: relacao.id_risco,
            id_acao: relacao.id_acao,
            id_natureza: relCategoria?.id_natureza,
            id_categoria: relCategoria?.id_categoria,
            id_subcategoria: relCategoria?.id_subcategoria,
            '006_matriz_riscos': risco,
            '009_acoes': acao,
            '010_natureza': null, // Será preenchido depois se necessário
            '011_categoria': null,
            '012_subcategoria': null
          };
        }) || [];

  
        if (!relacoes || relacoes.length === 0) {
          setRiscosPorAcao({});
          return;
        }

        // Agrupar riscos por ação
        const riscosAgrupados: RiscosPorAcao = {};

        relacoes.forEach(relacao => {
          const acaoData = Array.isArray(relacao['009_acoes']) ? relacao['009_acoes'][0] : relacao['009_acoes'];
          const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
          const naturezaData = Array.isArray(relacao['010_natureza']) ? relacao['010_natureza'][0] : relacao['010_natureza'];
          const categoriaData = Array.isArray(relacao['011_categoria']) ? relacao['011_categoria'][0] : relacao['011_categoria'];
          const subcategoriaData = Array.isArray(relacao['012_subcategoria']) ? relacao['012_subcategoria'][0] : relacao['012_subcategoria'];

          const acaoId = acaoData?.id || relacao.id_acao;

          if (!riscosAgrupados[acaoId]) {
            riscosAgrupados[acaoId] = [];
          }

          // Converte severidade (1..25) para percentual de conformidade (0..100)
          const severidade = riscoData?.severidade || 0;
          const conformidade = ((Math.max(1, Math.min(25, severidade)) - 1) / 24) * 100;

          const riscoDetalhado: RiscoDetalhado = {
            id: relacao.id_risco?.toString() || `${acaoId}-${riscosAgrupados[acaoId].length}`,
            desc_risco: riscoData?.eventos_riscos || riscoData?.sigla || 'Risco sem descrição',
            severidade: severidade,
            conformidade: Number(conformidade.toFixed(1)),
            id_natureza: relacao.id_natureza,
            id_categoria: relacao.id_categoria,
            id_subcategoria: relacao.id_subcategoria,
            desc_natureza: naturezaData?.desc_natureza,
            desc_categoria: categoriaData?.desc_categoria,
            desc_subcategoria: subcategoriaData?.desc_subcategoria
          };

          riscosAgrupados[acaoId].push(riscoDetalhado);
        });

        setRiscosPorAcao(riscosAgrupados);
      } catch (err) {
        console.error('Erro no useRiscosDetalhados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchRiscosDetalhados();
  }, []);

  return {
    riscosPorAcao,
    loading,
    error
  };
};