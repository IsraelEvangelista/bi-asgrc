import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import {
  Notificacao,
  CreateNotificacaoInput,
  NotificacaoStats,
  TipoNotificacao
} from '../types/notification';
import { toast } from 'sonner';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificacaoStats | null>(null);


  // Memoizar user ID para estabilizar dependências
  const userId = useMemo(() => user?.id, [user?.id]);

  // Buscar notificações do usuário logado - memoizado com userId estável
  const fetchNotificacoes = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('021_notificacoes')
        .select('*')
        .eq('id_usuario_destino', userId)
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
  }, [userId]);

  // Buscar estatísticas das notificações - memoizado com userId estável
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('021_notificacoes')
        .select('id, lida, tipo_notificacao')
        .eq('id_usuario_destino', userId);

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
  }, [userId]);

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
  }, []);

  // Marcar notificação como lida - memoizado com userId estável
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('021_notificacoes')
        .update({ lida: true })
        .eq('id', id)
        .eq('id_usuario_destino', userId);

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
  }, [userId]);

  // Marcar todas como lidas - memoizado com userId estável
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('021_notificacoes')
        .update({ lida: true })
        .eq('id_usuario_destino', userId)
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
  }, [userId]);

  // Deletar notificação - memoizado com userId estável
  const deleteNotificacao = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('021_notificacoes')
        .delete()
        .eq('id', id)
        .eq('id_usuario_destino', userId);

      if (error) throw error;

      setNotificacoes(prev => prev.filter(notif => notif.id !== id));
      await fetchStats();
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      toast.error('Erro ao remover notificação');
    }
  }, [userId]);






  


  // Efeitos - usando userId memoizado
  useEffect(() => {
    if (userId) {
      fetchNotificacoes();
      fetchStats();
    } else {
      setNotificacoes([]);
      setStats(null);
    }
  }, [userId]); // Removido fetchNotificacoes e fetchStats para evitar loop infinito

  // Computed values - memoizados para evitar re-cálculos desnecessários
  const notificacoesNaoLidas = useMemo(() => notificacoes.filter(n => !n.lida), [notificacoes]);
  const countNaoLidas = useMemo(() => notificacoesNaoLidas.length, [notificacoesNaoLidas]);

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
    deleteNotificacao
  };
}