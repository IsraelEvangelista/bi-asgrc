import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  const fetchSeveridadePorAcao = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query complexa com joins para relacionar ações, riscos e calcular média de severidade
      const { data: relacoes, error: fetchError } = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_acao,
          id_risco,
          009_acoes!inner(
            id,
            sigla_acao,
            desc_acao
          ),
          006_matriz_riscos!inner(
            id,
            severidade
          )
        `)
        .not('006_matriz_riscos.severidade', 'is', null)
        .is('006_matriz_riscos.deleted_at', null);

      if (fetchError) {
        throw new Error(`Erro ao buscar dados de severidade por ação: ${fetchError.message}`);
      }

      if (!relacoes || relacoes.length === 0) {
        setSeveridadeAcoes([]);
        return;
      }

      // Agrupar por ação e calcular média de severidade
      const acoesMap = new Map<string, {
        sigla_acao: string;
        desc_acao: string;
        severidades: number[];
        riscoIds: Set<string>;
      }>();

      relacoes.forEach(relacao => {
        const idAcao = relacao.id_acao;
        const acaoData = Array.isArray(relacao['009_acoes']) ? relacao['009_acoes'][0] : relacao['009_acoes'];
        const riscoData = Array.isArray(relacao['006_matriz_riscos']) ? relacao['006_matriz_riscos'][0] : relacao['006_matriz_riscos'];
        const siglaAcao = acaoData?.sigla_acao || '';
        const descAcao = acaoData?.desc_acao || '';
        const severidade = riscoData?.severidade;
        const riscoId = relacao.id_risco?.toString?.() ?? String(relacao.id_risco);

        if (severidade !== null && severidade !== undefined) {
          if (!acoesMap.has(idAcao)) {
            acoesMap.set(idAcao, {
              sigla_acao: siglaAcao,
              desc_acao: descAcao,
              severidades: [],
              riscoIds: new Set<string>()
            });
          }
          
          const entry = acoesMap.get(idAcao)!;
          entry.severidades.push(severidade);
          if (relacao.id_risco !== null && relacao.id_risco !== undefined) {
            entry.riscoIds.add(riscoId);
          }
        }
      });


      
      // Calcular média de severidade para cada ação
      const severidadeAcoesCalculada: SeveridadeAcao[] = Array.from(acoesMap.entries())
        .map(([idAcao, dados]) => {
          const somaSeveridade = dados.severidades.reduce((acc, sev) => acc + sev, 0);
          const mediaSeveridade = somaSeveridade / dados.severidades.length;
          
          return {
            id_acao: idAcao,
            sigla_acao: dados.sigla_acao,
            desc_acao: dados.desc_acao,
            media_severidade: Number(mediaSeveridade.toFixed(2)),
            qtd_riscos: dados.riscoIds.size
          };
        })
        // Ordenar da maior média para a menor (esquerda para direita)
        .sort((a, b) => b.media_severidade - a.media_severidade);


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
  }, []);

  return {
    severidadeAcoes,
    loading,
    error
  };
};
