import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  Notificacao,
  CreateNotificacaoInput,
  NotificacaoStats,
  TipoNotificacao
} from '../types/notification';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { toast } from 'sonner';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificacaoStats | null>(null);


  // Buscar notificações do usuário logado
  const fetchNotificacoes = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('021_notificacoes')
        .select('*')
        .eq('id_usuario_destino', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Buscar estatísticas das notificações
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('021_notificacoes')
        .select('id, lida, tipo_notificacao')
        .eq('id_usuario_destino', user.id);

      if (error) throw error;

      const total_notificacoes = data?.length || 0;
      const nao_lidas = data?.filter(n => !n.lida).length || 0;
      
      const por_tipo: Record<TipoNotificacao, number> = {
        [TipoNotificacao.ALERTA]: 0,
        [TipoNotificacao.INFORMATIVO]: 0,
        [TipoNotificacao.SUCESSO]: 0,
        [TipoNotificacao.URGENTE]: 0
      };

      data?.forEach(notif => {
        por_tipo[notif.tipo_notificacao as TipoNotificacao]++;
      });

      setStats({
        total_notificacoes,
        nao_lidas,
        por_tipo
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, [user?.id]);

  // Criar nova notificação (para administradores)
  const createNotificacao = useCallback(async (input: CreateNotificacaoInput) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('020_notificacoes')
        .insert({
          ...input,
          lida: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Notificação criada com sucesso!');
      await fetchNotificacoes();
      await fetchStats();
      return data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast.error('Erro ao criar notificação');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchNotificacoes, fetchStats]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('021_notificacoes')
        .update({ lida: true })
        .eq('id', id)
        .eq('id_usuario_destino', user?.id);

      if (error) throw error;

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, lida: true } : notif
        )
      );
      
      await fetchStats();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  }, [user?.id, fetchStats]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('021_notificacoes')
        .update({ lida: true })
        .eq('id_usuario_destino', user.id)
        .eq('lida', false);

      if (error) throw error;

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      );
      
      await fetchStats();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  }, [user?.id, fetchStats]);

  // Deletar notificação
  const deleteNotificacao = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('021_notificacoes')
        .delete()
        .eq('id', id)
        .eq('id_usuario_destino', user?.id);

      if (error) throw error;

      setNotificacoes(prev => prev.filter(notif => notif.id !== id));
      await fetchStats();
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Erro ao remover notificação');
    }
  }, [user?.id, fetchStats]);



  // Real-time Subscriptions
  const { isConnected } = useRealtimeNotifications({
    onNewNotification: (notification) => {
      // Adicionar nova notificação ao estado
      setNotificacoes(prev => [notification, ...prev]);
      
      // Atualizar estatísticas
      setStats(prev => prev ? {
        ...prev,
        total_notificacoes: prev.total_notificacoes + 1,
        nao_lidas: prev.nao_lidas + (notification.lida ? 0 : 1)
      } : null);
    },
    onNotificationUpdate: (notification) => {
      // Atualizar notificação no estado
      setNotificacoes(prev => 
        prev.map(n => n.id === notification.id ? notification : n)
      );
      
      // Recarregar estatísticas para garantir consistência
      fetchStats();
    },
    onNotificationDelete: (notificationId) => {
      // Remover notificação do estado
      setNotificacoes(prev => prev.filter(n => n.id !== notificationId));
      
      // Recarregar estatísticas
      fetchStats();
    }
  });

  // Efeitos
  useEffect(() => {
    if (user?.id) {
      fetchNotificacoes();
      fetchStats();
    } else {
      setNotificacoes([]);
      setStats(null);
    }
  }, [user?.id, fetchNotificacoes, fetchStats]);

  // Computed values
  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);
  const countNaoLidas = notificacoesNaoLidas.length;

  return {
    // Estado
    notificacoes,
    notificacoesNaoLidas,
    countNaoLidas,
    loading,
    stats,
    
    // Ações
    fetchNotificacoes,
    fetchStats,
    createNotificacao,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
    
    // Real-time
    isConnected
  };
}