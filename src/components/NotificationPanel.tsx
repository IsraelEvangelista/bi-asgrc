import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Search, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Notificacao, TipoNotificacao } from '../types/notification';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

type FiltroStatus = 'todas' | 'nao_lidas' | 'lidas';
type FiltroTipo = 'todos' | TipoNotificacao;

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
      return 'text-red-600 bg-red-50 border-red-200';
    case TipoNotificacao.URGENTE:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case TipoNotificacao.SUCESSO:
      return 'text-green-600 bg-green-50 border-green-200';
    case TipoNotificacao.INFORMATIVO:
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

const getTipoLabel = (tipo: TipoNotificacao) => {
  switch (tipo) {
    case TipoNotificacao.ALERTA:
      return 'Alerta';
    case TipoNotificacao.URGENTE:
      return 'Urgente';
    case TipoNotificacao.SUCESSO:
      return 'Sucesso';
    case TipoNotificacao.INFORMATIVO:
    default:
      return 'Informativo';
  }
};

export function NotificationPanel() {
  const {
    notificacoes,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
    fetchNotificacoes
  } = useNotifications();
  
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  // Recarregar notificações ao montar o componente
  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  // Filtrar notificações
  const notificacoesFiltradas = notificacoes.filter((notificacao) => {
    // Filtro por status
    if (filtroStatus === 'nao_lidas' && notificacao.lida) return false;
    if (filtroStatus === 'lidas' && !notificacao.lida) return false;

    // Filtro por tipo
    if (filtroTipo !== 'todos' && notificacao.tipo_notificacao !== filtroTipo) return false;

    // Filtro por termo de busca
    if (termoBusca && !notificacao.mensagem.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleNotificationClick = async (notificacao: Notificacao) => {
    // Marcar como lida
    if (!notificacao.lida) {
      await markAsRead(notificacao.id);
    }

    // Redirecionar se houver link
    if (notificacao.link_redirecionamento) {
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
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notificacoesFiltradas.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedIds) {
      await markAsRead(id);
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteNotificacao(id);
    }
    setSelectedIds([]);
  };

  const limparFiltros = () => {
    setFiltroStatus('todas');
    setFiltroTipo('todos');
    setTermoBusca('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notificações</h1>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_notificacoes || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Não Lidas</p>
                <p className="text-2xl font-bold text-red-600">{stats?.nao_lidas || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Lidas</p>
                <p className="text-2xl font-bold text-green-600">{stats ? (stats.total_notificacoes - stats.nao_lidas) : 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">📅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Hoje</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.nao_lidas || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">Todas</option>
            <option value="nao_lidas">Não Lidas</option>
            <option value="lidas">Lidas</option>
          </select>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="informativo">Informativo</option>
            <option value="aviso">Aviso</option>
            <option value="alerta">Alerta</option>
            <option value="sucesso">Sucesso</option>
          </select>

          {/* Limpar Filtros */}
          <button
            onClick={limparFiltros}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ações em Massa */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedIds.length} notificação(ões) selecionada(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Marcar como Lidas
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Notificações */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header da Lista */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === notificacoesFiltradas.length && notificacoesFiltradas.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {notificacoesFiltradas.length} notificação(ões)
            </span>
          </div>
          
          {stats?.nao_lidas && stats.nao_lidas > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando notificações...
          </div>
        ) : notificacoesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma notificação encontrada</p>
            {(filtroStatus !== 'todas' || filtroTipo !== 'todos' || termoBusca) && (
              <button
                onClick={limparFiltros}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificacoesFiltradas.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notificacao.lida ? 'bg-blue-50' : ''
                } ${selectedIds.includes(notificacao.id) ? 'bg-blue-100' : ''}`}
                onClick={() => handleNotificationClick(notificacao)}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notificacao.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectNotification(notificacao.id, e.target.checked);
                    }}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Ícone do tipo */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border ${
                    getTipoColor(notificacao.tipo_notificacao)
                  }`}>
                    {getTipoIcon(notificacao.tipo_notificacao)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        getTipoColor(notificacao.tipo_notificacao)
                      }`}>
                        {getTipoLabel(notificacao.tipo_notificacao)}
                      </span>
                      {!notificacao.lida && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      !notificacao.lida ? 'font-medium text-gray-900' : 'text-gray-700'
                    }`}>
                      {notificacao.mensagem}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {format(new Date(notificacao.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR
                        })}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(notificacao.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    {!notificacao.lida && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notificacao.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notificacao.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Remover notificação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}