import React, { useState, useEffect } from 'react';
import { Plus, Edit, Users, AlertCircle, Search, UserX, UserCheck } from 'lucide-react';
import { UserProfile, UserWithProfile, UserFilters, UserFormData } from '../types/user';
import { useUsers } from '../hooks/useUsers';
import { usePermissions } from '../hooks/usePermissions';
import { UserForm } from '../components/UserForm';
import { toast } from 'sonner';
import Layout from '../components/Layout';

export const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    totalUsers,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser
  } = useUsers();

  const {
    canManageUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers
  } = usePermissions();

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | undefined>();
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    perfil_id: '',
    area_gerencia_id: '',
    ativo: 'all'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showActivateConfirm, setShowActivateConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fixed to prevent infinite loops - removed function dependencies
  useEffect(() => {
    if (canManageUsers()) {
      fetchUsers(currentPage, itemsPerPage, filters);
    }
  }, [currentPage, itemsPerPage, filters.search, filters.perfil_id, filters.area_gerencia_id, filters.ativo]); // Only depend on primitive values

  const handleCreateUser = () => {
    if (!canCreateUsers()) {
      toast.error('Você não tem permissão para criar usuários.');
      return;
    }
    setSelectedUser(undefined);
    setShowForm(true);
  };

  const handleEditUser = (user: UserProfile) => {
    if (!canEditUsers()) {
      toast.error('Você não tem permissão para editar usuários.');
      return;
    }
    
    // Convert UserProfile to UserWithProfile if profile exists
    if (user.profile) {
      setSelectedUser(user as UserWithProfile);
    } else {
      toast.error('Usuário sem perfil definido.');
      return;
    }
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!canDeleteUsers()) {
      toast.error('Você não tem permissão para desativar usuários.');
      return;
    }

    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      toast.success('Usuário desativado com sucesso!');
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
    }
  };

  const handleActivateUser = async (userId: string) => {
    if (!canEditUsers()) {
      toast.error('Você não tem permissão para ativar usuários.');
      return;
    }

    try {
      await activateUser(userId);
      setShowActivateConfirm(null);
      toast.success('Usuário ativado com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        await updateUser({ id: selectedUser.id, ...data });
      } else {
        await createUser(data);
      }
      setShowForm(false);
      setSelectedUser(undefined);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(undefined);
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (ativo: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        ativo 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {ativo ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  if (!canManageUsers()) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-7rem)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Acesso Negado</h2>
            <p className="mt-2 text-sm text-gray-600">
              Você não tem permissão para acessar o gerenciamento de usuários.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gerencie os usuários do sistema e seus perfis de acesso.
                </p>
              </div>
              {canCreateUsers() && (
                <button
                  onClick={handleCreateUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Profile Filter */}
              <div>
                <select
                  value={filters.perfil_id}
                  onChange={(e) => handleFilterChange('perfil_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os Perfis</option>
                  {/* TODO: Load profiles dynamically */}
                  <option value="admin">Administrador</option>
                  <option value="user">Usuário</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <select
                  value={filters.ativo?.toString() || 'all'}
                  onChange={(e) => handleFilterChange('ativo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Carregando usuários...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.search || filters.perfil_id || filters.ativo !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando um novo usuário.'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perfil
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Área/Gerência
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criado em
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.nome.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.nome}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.profile?.nome || 'Sem perfil'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.area_gerencia_id || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.ativo)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {canEditUsers() && (
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar usuário"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              {user.ativo ? (
                                canDeleteUsers() && (
                                  <button
                                    onClick={() => setShowDeleteConfirm(user.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Desativar usuário"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </button>
                                )
                              ) : (
                                canEditUsers() && (
                                  <button
                                    onClick={() => setShowActivateConfirm(user.id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Ativar usuário"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {Math.ceil(totalUsers / itemsPerPage) > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === Math.ceil(totalUsers / itemsPerPage)}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próximo
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando{' '}
                          <span className="font-medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                          </span>{' '}
                          até{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalUsers)}
                          </span>{' '}
                          de{' '}
                          <span className="font-medium">{totalUsers}</span>{' '}
                          resultados
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          {Array.from({ length: Math.ceil(totalUsers / itemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              const distance = Math.abs(page - currentPage);
                              return distance <= 2 || page === 1 || page === Math.ceil(totalUsers / itemsPerPage);
                            })
                            .map((page, index, array) => {
                              const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                      ...
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handlePageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      page === currentPage
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === Math.ceil(totalUsers / itemsPerPage)}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Próximo
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={loading}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Confirmar Desativação</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja desativar este usuário? O usuário não poderá mais acessar o sistema.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Desativar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activate Confirmation Modal */}
        {showActivateConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <UserCheck className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Confirmar Ativação</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja ativar este usuário? O usuário poderá acessar o sistema novamente.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowActivateConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleActivateUser(showActivateConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ativar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;