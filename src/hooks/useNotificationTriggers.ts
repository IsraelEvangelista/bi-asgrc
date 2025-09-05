import { useCallback } from 'react';
import { NotificationService } from '../services/notificationService';
import { toast } from 'sonner';

/**
 * Hook para facilitar o uso dos gatilhos de notificação
 * nos componentes da aplicação
 */
export const useNotificationTriggers = () => {
  /**
   * Gatilho para prazo de ação se aproximando
   */
  const triggerActionDeadline = useCallback(async (
    responsavelId: string,
    acaoId: string,
    acaoDescricao: string,
    prazoFinal: Date
  ) => {
    try {
      await NotificationService.notifyActionDeadlineApproaching(
        responsavelId,
        acaoId,
        acaoDescricao,
        prazoFinal
      );
    } catch (error) {
      console.error('Erro ao notificar prazo de ação:', error);
      toast.error('Erro ao enviar notificação de prazo');
    }
  }, []);

  /**
   * Gatilho para risco fora da tolerância
   */
  const triggerRiskOutOfTolerance = useCallback(async (
    gestorRiscoId: string,
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    indicadorValor: number,
    limiteTolerancia: number
  ) => {
    try {
      await NotificationService.notifyRiskOutOfTolerance(
        gestorRiscoId,
        responsavelId,
        riscoId,
        riscoDescricao,
        indicadorValor,
        limiteTolerancia
      );
    } catch (error) {
      console.error('Erro ao notificar risco fora da tolerância:', error);
      toast.error('Erro ao enviar notificação de risco');
    }
  }, []);

  /**
   * Gatilho para novo risco atribuído
   */
  const triggerNewRiskAssigned = useCallback(async (
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    atribuidoPor: string
  ) => {
    try {
      await NotificationService.notifyNewRiskAssigned(
        responsavelId,
        riscoId,
        riscoDescricao,
        atribuidoPor
      );
      toast.success('Notificação de novo risco enviada');
    } catch (error) {
      console.error('Erro ao notificar novo risco:', error);
      toast.error('Erro ao enviar notificação de novo risco');
    }
  }, []);

  /**
   * Gatilho para atualização de status de risco
   */
  const triggerRiskStatusUpdate = useCallback(async (
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    novoStatus: string,
    atualizadoPor: string
  ) => {
    try {
      await NotificationService.notifyRiskStatusUpdate(
        responsavelId,
        riscoId,
        riscoDescricao,
        novoStatus,
        atualizadoPor
      );
    } catch (error) {
      console.error('Erro ao notificar atualização de status:', error);
      toast.error('Erro ao enviar notificação de status');
    }
  }, []);

  /**
   * Gatilho para nova avaliação de risco
   */
  const triggerNewRiskAssessment = useCallback(async (
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    novoNivel: string
  ) => {
    try {
      await NotificationService.notifyNewRiskAssessment(
        responsavelId,
        riscoId,
        riscoDescricao,
        novoNivel
      );
    } catch (error) {
      console.error('Erro ao notificar nova avaliação:', error);
      toast.error('Erro ao enviar notificação de avaliação');
    }
  }, []);

  /**
   * Verifica limites de tolerância para um risco específico
   */
  const checkRiskTolerance = useCallback(async (riscoId: string) => {
    try {
      await NotificationService.checkRiskToleranceLimits(riscoId);
    } catch (error) {
      console.error('Erro ao verificar tolerância do risco:', error);
    }
  }, []);

  /**
   * Executa verificação manual de prazos de ações
   */
  const checkActionDeadlines = useCallback(async () => {
    try {
      await NotificationService.checkUpcomingActionDeadlines();
      toast.success('Verificação de prazos executada');
    } catch (error) {
      console.error('Erro ao verificar prazos:', error);
      toast.error('Erro na verificação de prazos');
    }
  }, []);

  return {
    triggerActionDeadline,
    triggerRiskOutOfTolerance,
    triggerNewRiskAssigned,
    triggerRiskStatusUpdate,
    triggerNewRiskAssessment,
    checkRiskTolerance,
    checkActionDeadlines
  };
};