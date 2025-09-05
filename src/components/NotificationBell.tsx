import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Notificacao, TipoNotificacao } from '../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  className?: string;
}

const getTipoIcon = (tipo: TipoNotificacao) => {
  switch (tipo) {
    case TipoNotificacao.ALERTA:
      return '🚨';
    case TipoNotificacao.URGENTE:
      return '⚠️';
    case TipoNotificacao.SUCESSO:
      return '✅';
    case TipoNotificacao.INFORMATIVO:
    default:
      return 'ℹ️';
  }
};

const getTipoColor = (tipo: TipoNotificacao) => {
  switch (tipo) {
    case TipoNotificacao.ALERTA:
      return 'text-red-600 bg-red-50';
    case TipoNotificacao.URGENTE:
      return 'text-yellow-600 bg-yellow-50';
    case TipoNotificacao.SUCESSO:
      return 'text-green-600 bg-green-50';
    case TipoNotificacao.INFORMATIVO:
    default:
      return 'text-blue-600 bg-blue-50';
  }
};

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const {
    notificacoes,
    countNaoLidas,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotificacao
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notificacao: Notificacao) => {
    // Marcar como lida
    if (!notificacao.lida) {
      await markAsRead(notificacao.id);
    }

    // Redirecionar se houver link
    if (notificacao.link_redirecionamento) {
      setIsOpen(false);
      navigate(notificacao.link_redirecionamento);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotificacao(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-blue-100 hover:bg-blue-700 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6" />
        {countNaoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {countNaoLidas > 99 ? '99+' : countNaoLidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
            <div className="flex items-center gap-2">
              {countNaoLidas > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificacoes.slice(0, 20).map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notificacao.lida ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notificacao)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone do tipo */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        getTipoColor(notificacao.tipo_notificacao)
                      }`}>
                        {getTipoIcon(notificacao.tipo_notificacao)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          !notificacao.lida ? 'font-medium text-gray-900' : 'text-gray-700'
                        }`}>
                          {notificacao.mensagem}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notificacao.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1">
                        {!notificacao.lida && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notificacao.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Marcar como lida"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notificacao.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Remover notificação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Indicador de não lida */}
                    {!notificacao.lida && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notificacoes');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}