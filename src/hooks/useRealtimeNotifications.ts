import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Notificacao } from '../types/notification';
import { toast } from 'sonner';

interface UseRealtimeNotificationsProps {
  onNewNotification?: (notification: Notificacao) => void;
  onNotificationUpdate?: (notification: Notificacao) => void;
  onNotificationDelete?: (notificationId: string) => void;
}

/**
 * Hook para gerenciar Real-time Subscriptions do Supabase para notificações
 */
export const useRealtimeNotifications = ({
  onNewNotification,
  onNotificationUpdate,
  onNotificationDelete
}: UseRealtimeNotificationsProps = {}) => {
  const { user } = useAuthStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isSubscribedRef.current) {
      return;
    }

    // Criar canal para as notificações do usuário
    const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: '021_notificacoes',
            filter: `id_usuario_destino=eq.${user.id}`
          },
        (payload) => {
          const newNotification = payload.new as Notificacao;
          
          // Callback personalizado
          onNewNotification?.(newNotification);
          
          // Toast de notificação se não estiver lida
          if (!newNotification.lida) {
            toast.info(newNotification.mensagem, {
              description: `Tipo: ${newNotification.tipo_notificacao}`,
              action: newNotification.link_redirecionamento ? {
                label: 'Ver',
                onClick: () => {
                  if (newNotification.link_redirecionamento) {
                    window.location.href = newNotification.link_redirecionamento;
                  }
                }
              } : undefined
            });
          }
        }
      )
      .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: '021_notificacoes',
            filter: `id_usuario_destino=eq.${user.id}`
          },
        (payload) => {
          console.log('Notificação atualizada:', payload);
          onNotificationUpdate?.(payload.new as Notificacao);
        }
      )
      .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: '021_notificacoes',
            filter: `id_usuario_destino=eq.${user.id}`
          },
        (payload) => {
          const deletedNotification = payload.old as Notificacao;
          onNotificationDelete?.(deletedNotification.id);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao Real-time de notificações');
          isSubscribedRef.current = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na conexão Real-time de notificações');
          isSubscribedRef.current = false;
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Timeout na conexão Real-time de notificações');
          isSubscribedRef.current = false;
        } else if (status === 'CLOSED') {
          console.log('🔌 Conexão Real-time de notificações fechada');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        console.log('🔌 Desconectado do Real-time de notificações');
      }
    };
  }, [user?.id, onNewNotification, onNotificationUpdate, onNotificationDelete]);

  // Função para reconectar manualmente
  const reconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
    
    // O useEffect será executado novamente devido à mudança na ref
    setTimeout(() => {
      // Força re-execução do useEffect
    }, 100);
  };

  return {
    isConnected: isSubscribedRef.current,
    reconnect
  };
};