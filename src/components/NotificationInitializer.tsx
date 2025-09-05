import { useEffect } from 'react';
import { scheduleNotificationChecks } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

/**
 * Componente para inicializar o sistema de notificações
 * Deve ser montado uma vez na aplicação (no App.tsx)
 */
const NotificationInitializer = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    // Só inicia as verificações se o usuário estiver logado
    if (user) {
      // Agenda as verificações automáticas
      scheduleNotificationChecks();

      console.log('Sistema de notificações inicializado');
    }

    // Cleanup não é necessário pois os intervalos são globais
    // e devem continuar rodando durante toda a sessão
  }, [user]);

  // Este componente não renderiza nada
  return null;
};

export default NotificationInitializer;