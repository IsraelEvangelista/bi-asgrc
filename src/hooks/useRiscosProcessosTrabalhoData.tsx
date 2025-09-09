import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface RiscoProcessoTrabalhoData {
  id: string;
  processo: string;
  risco: string;
  acao: string;
  responsavel_acao: string;
  nivel_risco: string;
  nivel_risco_tratado: string;
  resposta_risco: string;
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

      // Query com JOINs manuais para buscar todos os dados relacionados
      const { data, error } = await supabase
        .from('015_riscos_x_acoes_proc_trab')
        .select(`
          id,
          responsavel_acao,
          responsavel_processo,
          nivel_risco,
          nivel_risco_tratado,
          resposta_risco,
          id_processo,
          id_risco,
          id_acao_controle,
          014_acoes_controle_proc_trab!inner (
            acao
          ),
          007_riscos_trabalho!inner (
            risco
          )
        `);

      if (error) {
        console.error('Erro ao buscar dados:', error);
        setError(error.message);
        return;
      }

      if (!data) {
        setDados([]);
        return;
      }

      // Buscar dados dos processos separadamente
      const processosIds = [...new Set(data.map(item => item.id_processo).filter(Boolean))];
      const { data: processosData } = await supabase
        .from('005_processos')
        .select('id, processo')
        .in('id', processosIds);

      // Buscar dados das áreas/gerências para responsável pelo processo
      const responsaveisProcessoIds = [...new Set(data.map(item => item.responsavel_processo).filter(Boolean))];
      const { data: areasData } = await supabase
        .from('003_areas_gerencias')
        .select('id, sigla_area')
        .in('id', responsaveisProcessoIds);

      // Criar mapa de processos para lookup rápido
      const processosMap = new Map();
      processosData?.forEach(processo => {
        processosMap.set(processo.id, processo.processo);
      });

      // Criar mapa de áreas para lookup rápido
      const areasMap = new Map();
      areasData?.forEach(area => {
        areasMap.set(area.id, area.sigla_area);
      });

      // Transformar os dados para o formato esperado
      const dadosFormatados: RiscoProcessoTrabalhoData[] = data.map((item: any) => ({
        id: item.id,
        processo: processosMap.get(item.id_processo) || '',
        risco: item['007_riscos_trabalho']?.risco || '',
        acao: item['014_acoes_controle_proc_trab']?.acao || '',
        responsavel_acao: item.responsavel_acao || '',
        nivel_risco: item.nivel_risco || '',
        nivel_risco_tratado: item.nivel_risco_tratado || '',
        resposta_risco: item.resposta_risco || '',
        responsavel_risco: areasMap.get(item.responsavel_processo) || ''
      }));

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