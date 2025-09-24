import { useMemo } from 'react';
import { Action, StatusAcao, SituacaoAcao } from '../types/action';

interface ChartDataHooks {
  statusData: Array<{ name: string; value: number; color: string }>;
  prazoData: Array<{ name: string; value: number; color: string }>;
  statusCardsData: { emImplementacao: number; implementada: number; naoIniciada: number };
}

export const useActionsChartData = (
  filteredActions: Action[],
  riskBarData?: Array<{ riskId: string; statusData: any }>,
  hasFiltersApplied: boolean = false
): ChartDataHooks => {

  const statusData = useMemo(() => {
    // Contar apenas ações com status DEFINIDO nos dados filtrados
    const naoIniciada = filteredActions.filter(a => a.status === StatusAcao.NAO_INICIADA).length;
    const emImplementacao = filteredActions.filter(a => a.status === StatusAcao.EM_IMPLEMENTACAO).length;
    const implementada = filteredActions.filter(a => a.status === StatusAcao.IMPLEMENTADA).length;

    // SEMPRE retornar a estrutura completa dos dados, mesmo com valores zero
    // Isso garante que o gráfico sempre tenha a estrutura correta
    return [
      { name: 'Não Iniciada', value: naoIniciada, color: '#F59E0B' },
      { name: 'Em implementação', value: emImplementacao, color: '#3B82F6' },
      { name: 'Implementada', value: implementada, color: '#10B981' }
    ];
  }, [filteredActions]);

  const prazoData = useMemo(() => {
    // Filtrar EXATAMENTE: apenas 'Não iniciada' e 'Em implementação' com situação definida
    const acoesRelevantes = filteredActions.filter(a => 
      (a.status === StatusAcao.EM_IMPLEMENTACAO || a.status === StatusAcao.NAO_INICIADA) &&
      (a.situacao === SituacaoAcao.NO_PRAZO || a.situacao === SituacaoAcao.ATRASADO)
    );
    
    const noPrazo = acoesRelevantes.filter(a => a.situacao === SituacaoAcao.NO_PRAZO).length;
    const atrasado = acoesRelevantes.filter(a => a.situacao === SituacaoAcao.ATRASADO).length;

    // SEMPRE retornar dados com estrutura completa
    return [
      { name: 'No Prazo', value: noPrazo, color: '#059669' },
      { name: 'Atrasado', value: atrasado, color: '#DC2626' }
    ];
  }, [filteredActions]);


  const statusCardsData = useMemo(() => {
    // Contar apenas ações com status DEFINIDO nos dados filtrados
    const naoIniciada = filteredActions.filter(a => a.status === StatusAcao.NAO_INICIADA).length;
    const emImplementacao = filteredActions.filter(a => a.status === StatusAcao.EM_IMPLEMENTACAO).length;
    const implementada = filteredActions.filter(a => a.status === StatusAcao.IMPLEMENTADA).length;

    return {
      naoIniciada,
      emImplementacao,
      implementada
    };
  }, [filteredActions]);

  return {
    statusData,
    prazoData,
    statusCardsData
  };
};