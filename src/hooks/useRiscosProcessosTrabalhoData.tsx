import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RiscoProcessoTrabalhoData {
  id: string;              // id do relacionamento (015)
  id_risco?: string | null;
  processo: string;
  risco: string;
  acao: string;
  responsavel_acao: string;
  nivel_risco: string;
  nivel_risco_tratado: string;
  resposta_risco: string;
  plano_resposta_risco?: string;
  situacao_risco?: string;
  id_processo?: string | null;
  id_subprocesso?: string | null;
  id_macroprocesso?: string | null;
  id_acao_controle?: string | null;
  responsavel_processo_id?: string | null;
  responsavel_risco: string;
}

export const useRiscosProcessosTrabalhoData = () => {
  const [dados, setDados] = useState<RiscoProcessoTrabalhoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeira query: dados base da tabela de relacionamento
      const { data: dadosBase, error: errorBase } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id,
          responsavel_acao,
          responsavel_processo,
          nivel_risco,
          nivel_risco_tratado,
          resposta_risco,
          plano_resposta_risco,
          situacao_risco,
          id_processo,
          id_risco,
          id_acao_controle
        `);

      if (errorBase) {
        setError(errorBase.message);
        return;
      }

      if (!dadosBase || dadosBase.length === 0) {
        setDados([]);
        return;
      }

      // Segunda query: dados dos processos
      const processosIds = [...new Set(dadosBase.map(item => item.id_processo).filter(Boolean))];
      let processosData: any[] | null = [];
      if (processosIds.length > 0) {
        try {
          const resp = await supabase
            .from('005_processos')
            .select('id, processo, id_macroprocesso')
            .in('id', processosIds);
          if (resp.error) {
            processosData = [];
          } else {
            processosData = resp.data || [];
          }
        } catch (err) {
          processosData = [];
        }
      }

      // Query adicional: dados dos subprocessos (013_subprocessos referencia 005_processos)
      let subprocessosData: any[] = [];
      if (processosIds.length > 0) {
        try {
          const resp = await supabase
            .from('013_subprocessos')
            .select('id, subprocesso, id_processo')
            .in('id_processo', processosIds);
          if (resp.error) {
            subprocessosData = [];
          } else {
            subprocessosData = resp.data || [];
          }
        } catch (err) {
          subprocessosData = [];
        }
      }

      // Terceira query: dados das áreas/gerências (para responsável_acao)
      const responsaveisAcaoIds = [...new Set(dadosBase.map(item => item.responsavel_acao).filter(Boolean))];
      let areasData: any[] | null = [];
      if (responsaveisAcaoIds.length > 0) {
        try {
          const respAreas = await supabase
            .from('003_areas_gerencias')
            .select('id, sigla_area, gerencia')
            .in('id', responsaveisAcaoIds);
          if (respAreas.error) {
            areasData = [];
          } else {
            areasData = respAreas.data || [];
          }
        } catch (err) {
          areasData = [];
        }
      }

      // Quarta query: dados dos riscos
      const riscosIds = [...new Set(dadosBase.map(item => item.id_risco).filter(Boolean))];
      let riscosData: any[] | null = [];
      if (riscosIds.length > 0) {
        try {
          const respRiscos = await supabase
            .from('007_riscos_trabalho')
            .select('id, risco')
            .in('id', riscosIds);
          if (respRiscos.error) {
            riscosData = [];
          } else {
            riscosData = respRiscos.data || [];
          }
        } catch (err) {
          riscosData = [];
        }
      }

      // Quinta query: dados das ações de controle
      const acoesIds = [...new Set(dadosBase.map(item => item.id_acao_controle).filter(Boolean))];
      
      let acoesData: any[] = [];
      if (acoesIds.length > 0) {
        // Busca simplificada - todas as ações de uma vez
        const resp = await supabase
          .from('014_acoes_controle_proc_trab')
          .select('id, acao')
          .in('id', acoesIds);
        
        if (resp.error) {
          acoesData = [];
        } else {
          acoesData = resp.data || [];
        }
      }

      // Criar mapas para lookup rápido
      const processosMap = new Map<string, any>();
      processosData?.forEach(processo => {
        const k = String(processo.id);
        processosMap.set(k, processo.processo);
        processosMap.set(`${k}_macro`, processo.id_macroprocesso);
      });

      const subprocessosMap = new Map<string, any>();
      subprocessosData?.forEach(subprocesso => {
        const k = String(subprocesso.id);
        subprocessosMap.set(k, subprocesso.subprocesso);
        subprocessosMap.set(`${k}_processo`, subprocesso.id_processo);
      });

      const areasMap = new Map<string, any>();
      areasData?.forEach(area => {
        areasMap.set(String(area.id), area.sigla_area);
      });

      const riscosMap = new Map<string, any>();
      riscosData?.forEach(risco => {
        riscosMap.set(String(risco.id), risco.risco);
      });

      const acoesMap = new Map<string, string>();
      acoesData?.forEach(acao => {
        const chave = String(acao.id);
        acoesMap.set(chave, acao.acao || '');
      });

      // Fallback: se houver IDs presentes em 015 que não vieram no primeiro fetch, buscar novamente
      const missingAcaoIds = [...new Set(dadosBase
        .map((i: any) => i.id_acao_controle)
        .filter((id: any) => id !== null && id !== undefined)
        .map((id: any) => String(id))
        .filter((id: string) => !acoesMap.has(id))
      )];
      if (missingAcaoIds.length > 0) {
        // Buscar novamente por 'id' em lotes menores
        const chunks2: string[][] = [];
        const size2 = 20;
        for (let i = 0; i < missingAcaoIds.length; i += size2) {
          chunks2.push(missingAcaoIds.slice(i, i + size2).map(String));
        }
        for (const ch of chunks2) {
          const respMissing = await supabase
            .from('014_acoes_controle_proc_trab')
            .select('id, acao')
            .in('id', ch as any);
          if (!respMissing.error) {
            respMissing.data?.forEach(acao => {
              const chave = String(acao.id);
              if (!acoesMap.has(chave)) {
                acoesMap.set(chave, acao.acao || '');
              }
            });
          }
        }

        // Verificar se ainda restam ids sem mapeamento
        const stillMissing = missingAcaoIds.filter(id => !acoesMap.has(id));
        if (stillMissing.length > 0) {
          // Último fallback: buscar todas as ações
          const { data: allAcoes, error: errAll } = await supabase
            .from('014_acoes_controle_proc_trab')
            .select('id, acao');
          if (!errAll) {
            allAcoes?.forEach(acao => {
              const chave = String(acao.id);
              if (!acoesMap.has(chave)) {
                acoesMap.set(chave, acao.acao || '');
              }
            });
          }
        }
      }

      // Transformar os dados para o formato esperado
      const dadosFormatados: RiscoProcessoTrabalhoData[] = dadosBase.map((item: any) => {
        const idAcao = item.id_acao_controle ? String(item.id_acao_controle) : '';
        const acaoTexto = idAcao ? acoesMap.get(idAcao) : '';
        const procKey = item.id_processo ? String(item.id_processo) : '';
        const responsavelAcaoKey = item.responsavel_acao ? String(item.responsavel_acao) : '';
        
        // Buscar subprocesso relacionado ao processo atual
        const subprocessoRelacionado = subprocessosData.find(sub => 
          String(sub.id_processo) === procKey
        );
        const subprocessoId = subprocessoRelacionado ? String(subprocessoRelacionado.id) : null;
        
        return {
          id: String(item.id),
          id_risco: item.id_risco ? String(item.id_risco) : null,
          processo: procKey ? (processosMap.get(procKey) || '') : '',
          risco: item.id_risco ? (riscosMap.get(String(item.id_risco)) || '') : '',
          acao: acaoTexto || '',
          responsavel_acao: item.responsavel_acao || '',
          nivel_risco: item.nivel_risco || '',
          nivel_risco_tratado: item.nivel_risco_tratado || '',
          resposta_risco: item.resposta_risco || '',
          plano_resposta_risco: item.plano_resposta_risco || '',
          situacao_risco: item.situacao_risco || '',
          id_processo: procKey || null,
          id_subprocesso: subprocessoId,
          id_macroprocesso: procKey ? (processosMap.get(`${procKey}_macro`) || null) : null,
          id_acao_controle: idAcao || null,
          responsavel_processo_id: responsavelAcaoKey || null, // CORRIGIDO: usar responsavel_acao
          responsavel_risco: areasMap.get(responsavelAcaoKey) || '' // CORRIGIDO: usar responsavel_acao
        };
      });

      setDados(dadosFormatados);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  return {
    dados,
    loading,
    error,
    refetch: buscarDados
  };
};