/**
 * Tipos de notificação disponíveis
 */
export enum TipoNotificacao {
  INFORMATIVO = 'INFORMATIVO',
  ALERTA = 'ALERTA',
  URGENTE = 'URGENTE',
  SUCESSO = 'SUCESSO'
}

export interface Notificacao {
  id: string;
  id_usuario_destino: string;
  mensagem: string;
  tipo_notificacao: TipoNotificacao;
  lida: boolean;
  link_redirecionamento?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificacaoFormData {
  id_usuario_destino: string;
  mensagem: string;
  tipo_notificacao: TipoNotificacao;
  link_redirecionamento?: string;
}

export interface CreateNotificacaoInput {
  id_usuario_destino: string;
  mensagem: string;
  tipo_notificacao: TipoNotificacao;
  link_redirecionamento?: string;
}

export interface UpdateNotificacaoInput {
  lida?: boolean;
  mensagem?: string;
  tipo_notificacao?: TipoNotificacao;
  link_redirecionamento?: string;
}

export interface NotificacaoStats {
  total_notificacoes: number;
  nao_lidas: number;
  por_tipo: Record<TipoNotificacao, number>;
}

// Tipos para eventos que geram notificações
export interface EventoNotificacao {
  tipo: 'prazo_acao' | 'risco_fora_tolerancia' | 'novo_risco_atribuido';
  dados: Record<string, unknown>;
  usuarios_destino: string[];
}

// Configurações de notificação
export interface ConfigNotificacao {
  dias_antecedencia_prazo: number;
  tipos_habilitados: TipoNotificacao[];
  realtime_enabled: boolean;
}