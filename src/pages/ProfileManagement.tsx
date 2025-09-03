import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, AlertCircle, Search } from 'lucide-react';
import { Profile, ADMIN_PROFILE_NAME } from '../types/profile';
import { useProfiles } from '../hooks/useProfiles';
import { usePermissions } from '../hooks/usePermissions';
import { ProfileForm } from '../components/ProfileForm';
import { toast } from 'sonner';

export const ProfileManagement: React.FC = () => {
  const {
    profiles,
    loading,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile
  } = useProfiles();

  const {
    canManageProfiles,
    canCreateProfiles,
    canEditProfiles,
    canDeleteProfiles
  } = usePermissions();

  const [showForm, setShowForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (canManageProfiles()) {
      fetchProfiles();
    }
  }, [fetchProfiles, canManageProfiles]);

  // Filter profiles based on search and status
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (profile.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && profile.ativo) ||
                         (statusFilter === 'inactive' && !profile.ativo);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateProfile = () => {
    if (!canCreateProfiles()) {
      toast.error('Você não tem permissão para criar perfis.');
      return;
    }
    setSelectedProfile(undefined);
    setShowForm(true);
  };

  const handleEditProfile = (profile: Profile) => {
    if (profile.nome === ADMIN_PROFILE_NAME) {
      setSelectedProfile(profile);
      setShowForm(true);
      return;
    }
    
    if (!canEditProfiles()) {
      toast.error('Você não tem permissão para editar perfis.');
      return;
    }
    
    setSelectedProfile(profile);
    setShowForm(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!canDeleteProfiles()) {
      toast.error('Você não tem permissão para excluir perfis.');
      return;
    }

    const profile = profiles.find(p => p.id === profileId);
    if (profile?.nome === ADMIN_PROFILE_NAME) {
      toast.error('O perfil Administrador não pode ser excluído.');
      return;
    }

    try {
      await deleteProfile(profileId);
      setShowDeleteConfirm(null);
      toast.success('Perfil excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
    }
  };

  const handleFormSubmit = async (data: Profile) => {
    try {
      if (selectedProfile) {
        await updateProfile({ id: selectedProfile.id, ...data });
      } else {
        await createProfile(data);
      }
      setShowForm(false);
      setSelectedProfile(undefined);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedProfile(undefined);
  };

  const getPermissionsSummary = (profile: Profile) => {
    const permissions = profile.regras_permissoes;
    const summary = [];
    
    if (permissions.admin) {
      return ['Administrador Total'];
    }
    
    if (permissions.configuracoes) {
      const configPerms = [];
      if (permissions.configuracoes.view) configPerms.push('Visualizar');
      if (permissions.configuracoes.create) configPerms.push('Criar');
      if (permissions.configuracoes.edit) configPerms.push('Editar');
      if (permissions.configuracoes.delete) configPerms.push('Excluir');
      if (configPerms.length > 0) {
        summary.push(`Config: ${configPerms.join(', ')}`);
      }
    }
    
    if (permissions.riscos) {
      const riskPerms = [];
      if (permissions.riscos.view) riskPerms.push('Visualizar');
      if (permissions.riscos.create) riskPerms.push('Criar');
      if (permissions.riscos.edit) riskPerms.push('Editar');
      if (permissions.riscos.delete) riskPerms.push('Excluir');
      if (permissions.riscos.export) riskPerms.push('Exportar');
      if (permissions.riscos.approve) riskPerms.push('Aprovar');
      if (riskPerms.length > 0) {
        summary.push(`Riscos: ${riskPerms.join(', ')}`);
      }
    }
    
    return summary.length > 0 ? summary : ['Sem permissões específicas'];
  };

  if (!canManageProfiles()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Acesso Negado</h2>
          <p className="mt-2 text-sm text-gray-600">
            Você não tem permissão para acessar o gerenciamento de perfis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Perfis</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie os perfis de acesso e suas permissões no sistema.
              </p>
            </div>
            {canCreateProfiles() && (
              <button
                onClick={handleCreateProfile}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Perfil
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar perfis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profiles List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Carregando perfis...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum perfil encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando um novo perfil de acesso.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interfaces
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => {
                    const isAdmin = profile.nome === ADMIN_PROFILE_NAME;
                    const permissionsSummary = getPermissionsSummary(profile);
                    
                    return (
                      <tr key={profile.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isAdmin && (
                              <Shield className="h-4 w-4 text-amber-500 mr-2" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {profile.nome}
                                {isAdmin && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Protegido
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {profile.descricao || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {permissionsSummary.slice(0, 2).map((perm, index) => (
                              <div key={index} className="truncate max-w-xs">
                                {perm}
                              </div>
                            ))}
                            {permissionsSummary.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{permissionsSummary.length - 2} mais
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {profile.acessos_interfaces.includes('*') ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Todas
                              </span>
                            ) : (
                              <span className="text-sm text-gray-600">
                                {profile.acessos_interfaces.length} interface(s)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            profile.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {profile.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditProfile(profile)}
                              className="text-blue-600 hover:text-blue-900"
                              title={isAdmin ? 'Visualizar perfil' : 'Editar perfil'}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {!isAdmin && canDeleteProfiles() && (
                              <button
                                onClick={() => setShowDeleteConfirm(profile.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir perfil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form Modal */}
      {showForm && (
        <ProfileForm
          profile={selectedProfile}
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
              <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProfile(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};