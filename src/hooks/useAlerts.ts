import { useMemo } from 'react';
import { Indicator, IndicatorAlert, Tolerancia } from '../types/indicator';
import { Action, ActionAlert, StatusAcao } from '../types/action';

export interface AlertSummary {
  indicatorAlerts: IndicatorAlert[];
  actionAlerts: ActionAlert[];
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
}

export const useAlerts = (indicators: Indicator[], actions: Action[]): AlertSummary => {
  return useMemo(() => {
    // Gerar alertas de indicadores
    const indicatorAlerts: IndicatorAlert[] = indicators
      .filter(indicator => indicator.tolerancia === Tolerancia.FORA_TOLERANCIA)
      .map(indicator => ({
        id: `indicator-${indicator.id}`,
        indicador_id: indicator.id,
        indicador_nome: indicator.indicador_risco,
        tipo_alerta: 'FORA_TOLERANCIA' as const,
        mensagem: `Indicador "${indicator.indicador_risco}" está fora da tolerância`,
        severidade: 'CRITICAL' as const,
        data_criacao: new Date().toISOString(),
        resolvido: false
      }));

    // Gerar alertas de ações
    const now = new Date();
    const actionAlerts: ActionAlert[] = actions
      .filter(action => {
        if (!action.prazo_implementacao || action.status === StatusAcao.ACOES_IMPLEMENTADAS) {
          return false;
        }
        return new Date(action.prazo_implementacao) < now;
      })
      .map(action => ({
        id: `action-${action.id}`,
        action_id: action.id,
        action_name: action.desc_acao,
        alert_type: 'ATRASADA' as const,
        message: `Ação "${action.desc_acao}" está atrasada`,
        severity: 'high' as const,
        created_at: new Date().toISOString(),
        acknowledged: false
      }));

    // Contar alertas por tipo
    const allAlerts = [...indicatorAlerts, ...actionAlerts];
    const criticalAlerts = indicatorAlerts.filter(alert => alert.severidade === 'CRITICAL').length;
    const warningAlerts = actionAlerts.filter(alert => alert.severity === 'high').length;

    return {
      indicatorAlerts,
      actionAlerts,
      totalAlerts: allAlerts.length,
      criticalAlerts,
      warningAlerts
    };
  }, [indicators, actions]);
};

export const useIndicatorAlerts = (indicators: Indicator[]): IndicatorAlert[] => {
  return useMemo(() => {
    return indicators
      .filter(indicator => indicator.tolerancia === Tolerancia.FORA_TOLERANCIA)
      .map(indicator => ({
        id: `indicator-${indicator.id}`,
        indicador_id: indicator.id,
        indicador_nome: indicator.indicador_risco,
        tipo_alerta: 'FORA_TOLERANCIA' as const,
        mensagem: `Indicador "${indicator.indicador_risco}" está fora da tolerância`,
        severidade: 'CRITICAL' as const,
        data_criacao: new Date().toISOString(),
        resolvido: false
      }));
  }, [indicators]);
};

export const useActionAlerts = (actions: Action[]): ActionAlert[] => {
  return useMemo(() => {
    const now = new Date();
    return actions
      .filter(action => {
        if (!action.prazo_implementacao || action.status === StatusAcao.ACOES_IMPLEMENTADAS) {
          return false;
        }
        return new Date(action.prazo_implementacao) < now;
      })
      .map(action => ({
        id: `action-${action.id}`,
        action_id: action.id,
        action_name: action.desc_acao,
        alert_type: 'ATRASADA' as const,
        message: `Ação "${action.desc_acao}" está atrasada`,
        severity: 'high' as const,
        created_at: new Date().toISOString(),
        acknowledged: false
      }));
  }, [actions]);
};

// Hook para alertas específicos de tolerância
export const useToleranceAlerts = (indicators: Indicator[]) => {
  return useMemo(() => {
    const outOfToleranceIndicators = indicators.filter(
      indicator => indicator.tolerancia === Tolerancia.FORA_TOLERANCIA
    );

    return {
      count: outOfToleranceIndicators.length,
      indicators: outOfToleranceIndicators,
      hasAlerts: outOfToleranceIndicators.length > 0
    };
  }, [indicators]);
};

// Hook para alertas específicos de ações atrasadas
export const useOverdueActionAlerts = (actions: Action[]) => {
  return useMemo(() => {
    const now = new Date();
    const overdueActions = actions.filter(action => {
      if (!action.prazo_implementacao || action.status === StatusAcao.ACOES_IMPLEMENTADAS) {
        return false;
      }
      return new Date(action.prazo_implementacao) < now;
    });

    return {
      count: overdueActions.length,
      actions: overdueActions,
      hasAlerts: overdueActions.length > 0
    };
  }, [actions]);
};