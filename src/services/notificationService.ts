import { supabase } from '../lib/supabase';
import { CreateNotificacaoInput, TipoNotificacao } from '../types/notification';

/**
 * Serviço para geração automática de notificações
 * Implementa os gatilhos definidos no EPIC 9
 */
export class NotificationService {
  /**
   * Cria uma nova notificação no banco de dados
   */
  static async createNotification(input: CreateNotificacaoInput): Promise<void> {
    try {
      const { error } = await supabase
            .from('021_notificacoes')
        .insert({
          id_usuario_destino: input.id_usuario_destino,
          mensagem: input.mensagem,
          tipo_notificacao: input.tipo_notificacao,
          link_redirecionamento: input.link_redirecionamento
        });

      if (error) {
        console.error('Erro ao criar notificação:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço de notificação:', error);
      throw error;
    }
  }

  /**
   * Gatilho 1: Notifica quando prazo de ação se aproxima (3 dias)
   * Para o Responsável pela Ação
   */
  static async notifyActionDeadlineApproaching(
    responsavelId: string,
    acaoId: string,
    acaoDescricao: string,
    prazoFinal: Date
  ): Promise<void> {
    const diasRestantes = Math.ceil(
      (prazoFinal.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    await this.createNotification({
      id_usuario_destino: responsavelId,
      mensagem: `Ação "${acaoDescricao}" vence em ${diasRestantes} dias. Prazo final: ${prazoFinal.toLocaleDateString('pt-BR')}.`,
      tipo_notificacao: TipoNotificacao.ALERTA,
      link_redirecionamento: `/acoes/${acaoId}`
    });
  }

  /**
   * Gatilho 2: Notifica quando indicador fica "Fora da Tolerância"
   * Para o Gestor de Risco e Responsável
   */
  static async notifyRiskOutOfTolerance(
    gestorRiscoId: string,
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    indicadorValor: number,
    limiteTolerancia: number
  ): Promise<void> {
    const mensagem = `Risco "${riscoDescricao}" está fora da tolerância. Valor atual: ${indicadorValor}, Limite: ${limiteTolerancia}.`;
    
    // Notifica o Gestor de Risco
    await this.createNotification({
      id_usuario_destino: gestorRiscoId,
      mensagem,
      tipo_notificacao: TipoNotificacao.ALERTA,
      link_redirecionamento: `/indicadores`
    });

    // Notifica o Responsável (se diferente do gestor)
    if (responsavelId !== gestorRiscoId) {
      await this.createNotification({
        id_usuario_destino: responsavelId,
        mensagem,
        tipo_notificacao: TipoNotificacao.ALERTA,
        link_redirecionamento: `/indicadores`
      });
    }
  }

  /**
   * Gatilho 3: Notifica quando novo risco é atribuído
   * Para o Responsável pelo Risco
   */
  static async notifyNewRiskAssigned(
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    atribuidoPor: string
  ): Promise<void> {
    await this.createNotification({
      id_usuario_destino: responsavelId,
      mensagem: `Novo risco "${riscoDescricao}" foi atribuído a você por ${atribuidoPor}.`,
      tipo_notificacao: TipoNotificacao.INFORMATIVO,
      link_redirecionamento: `/indicadores`
    });
  }

  /**
   * Verifica ações com prazo próximo (executar diariamente)
   * Busca ações que vencem em 3 dias e ainda não foram notificadas
   */
  static async checkUpcomingActionDeadlines(): Promise<void> {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);

      // Busca ações que vencem em 3 dias
      const { data: acoes, error } = await supabase
        .from('acoes_mitigacao')
        .select(`
          id,
          descricao,
          prazo_final,
          id_responsavel,
          usuarios!id_responsavel(nome)
        `)
        .lte('prazo_final', threeDaysFromNow.toISOString())
        .gte('prazo_final', new Date().toISOString())
        .eq('status', 'em_andamento');

      if (error) {
        console.error('Erro ao buscar ações com prazo próximo:', error);
        return;
      }

      // Verifica se já existe notificação para cada ação
      for (const acao of acoes || []) {
        const { data: existingNotification } = await supabase
          .from('021_notificacoes')
          .select('id')
          .eq('id_usuario_destino', acao.id_responsavel)
          .eq('link_redirecionamento', `/acoes/${acao.id}`)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
          .single();

        // Se não existe notificação recente, cria uma nova
        if (!existingNotification) {
          await this.notifyActionDeadlineApproaching(
            acao.id_responsavel,
            acao.id,
            acao.descricao,
            new Date(acao.prazo_final)
          );
        }
      }
    } catch (error) {
      console.error('Erro ao verificar prazos de ações:', error);
    }
  }

  /**
   * Verifica indicadores fora da tolerância
   * Executar quando indicadores são atualizados
   */
  static async checkRiskToleranceLimits(riscoId: string): Promise<void> {
    try {
      // Busca o risco com seus indicadores e limites
      const { data: risco, error } = await supabase
        .from('riscos')
        .select(`
          id,
          descricao,
          id_gestor_risco,
          id_responsavel,
          indicadores_risco(
            id,
            valor_atual,
            limite_tolerancia,
            tipo_limite
          )
        `)
        .eq('id', riscoId)
        .single();

      if (error || !risco) {
        console.error('Erro ao buscar risco:', error);
        return;
      }

      // Verifica cada indicador
      for (const indicador of risco.indicadores_risco || []) {
        const isOutOfTolerance = 
          indicador.tipo_limite === 'maximo' 
            ? indicador.valor_atual > indicador.limite_tolerancia
            : indicador.valor_atual < indicador.limite_tolerancia;

        if (isOutOfTolerance) {
          // Verifica se já existe notificação recente
          const { data: existingNotification } = await supabase
            .from('021_notificacoes')
            .select('id')
            .eq('link_redirecionamento', `/riscos/${riscoId}`)
            .eq('tipo_notificacao', TipoNotificacao.ALERTA)
            .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
            .single();

          if (!existingNotification) {
            await this.notifyRiskOutOfTolerance(
              risco.id_gestor_risco,
              risco.id_responsavel,
              risco.id,
              risco.descricao,
              indicador.valor_atual,
              indicador.limite_tolerancia
            );
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar limites de tolerância:', error);
    }
  }

  /**
   * Notifica sobre atualização de status de risco
   */
  static async notifyRiskStatusUpdate(
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    novoStatus: string,
    atualizadoPor: string
  ): Promise<void> {
    await this.createNotification({
      id_usuario_destino: responsavelId,
      mensagem: `Status do risco "${riscoDescricao}" foi alterado para "${novoStatus}" por ${atualizadoPor}.`,
      tipo_notificacao: TipoNotificacao.INFORMATIVO,
      link_redirecionamento: `/riscos/${riscoId}`
    });
  }

  /**
   * Notifica sobre nova avaliação de risco
   */
  static async notifyNewRiskAssessment(
    responsavelId: string,
    riscoId: string,
    riscoDescricao: string,
    novoNivel: string
  ): Promise<void> {
    await this.createNotification({
      id_usuario_destino: responsavelId,
      mensagem: `Nova avaliação do risco "${riscoDescricao}". Nível atual: ${novoNivel}.`,
      tipo_notificacao: TipoNotificacao.INFORMATIVO,
      link_redirecionamento: `/riscos/${riscoId}`
    });
  }
}

// Função utilitária para agendar verificações periódicas
export const scheduleNotificationChecks = () => {
  // Verifica prazos de ações a cada 6 horas
  setInterval(() => {
    NotificationService.checkUpcomingActionDeadlines();
  }, 6 * 60 * 60 * 1000);

  console.log('Verificações automáticas de notificação agendadas');
};