import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { User, CreateUserData, UpdateUserData, UserFormData } from '../types/user';

import { useProfiles } from '../hooks/useProfiles';
import { toast } from 'sonner';

const userSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  perfil_id: z.string().min(1, 'Perfil é obrigatório'),
  area_gerencia_id: z.string().optional(),
  senha: z.string().optional(),
  ativo: z.boolean().default(true)
}).refine((data) => {
  // Password is required for new users
  if (!data.senha) {
    return false;
  }
  return data.senha.length >= 6;
}, {
  message: 'Senha deve ter pelo menos 6 caracteres',
  path: ['senha']
});

const userUpdateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  perfil_id: z.string().min(1, 'Perfil é obrigatório'),
  area_gerencia_id: z.string().optional(),
  senha: z.string().optional(),
  ativo: z.boolean().default(true)
}).refine((data) => {
  // Password is optional for updates, but if provided, must be at least 6 characters
  if (data.senha && data.senha.length > 0) {
    return data.senha.length >= 6;
  }
  return true;
}, {
  message: 'Senha deve ter pelo menos 6 caracteres',
  path: ['senha']
});

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false);
  const { profiles, fetchProfiles, loading: profilesLoading } = useProfiles();

  const schema = isEditing ? userUpdateSchema : userSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      perfil_id: user?.perfil_id || '',
      area_gerencia_id: user?.area_gerencia_id || '',
      senha: '',
      ativo: user?.ativo ?? true
    }
  });

  // Load profiles on component mount
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      // Remove empty password for updates
      if (isEditing && !data.senha) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { senha, ...updateData } = data;
        await onSubmit(updateData);
      } else {
        await onSubmit(data);
      }
      toast.success(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário. Tente novamente.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Mock areas/gerências - In a real app, this would come from an API
  const areas = [
    { id: '1', nome: 'Diretoria' },
    { id: '2', nome: 'Assessoria de Risco e Compliance' },
    { id: '3', nome: 'Gerência de Recursos Hídricos' },
    { id: '4', nome: 'Gerência de Infraestrutura' },
    { id: '5', nome: 'Gerência Administrativa' },
    { id: '6', nome: 'Gerência Financeira' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting || isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nome ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite o nome completo do usuário"
                />
              )}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite o email do usuário"
                />
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {isEditing ? '(deixe em branco para manter a atual)' : '*'}
            </label>
            <div className="relative">
              <Controller
                name="senha"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.senha ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={isEditing ? 'Nova senha (opcional)' : 'Digite a senha'}
                  />
                )}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          {/* Perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil de Acesso *
            </label>
            <Controller
              name="perfil_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.perfil_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={profilesLoading}
                >
                  <option value="">Selecione um perfil</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.nome}
                      {!profile.ativo && ' (Inativo)'}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.perfil_id && (
              <p className="mt-1 text-sm text-red-600">{errors.perfil_id.message}</p>
            )}
            {profilesLoading && (
              <p className="mt-1 text-sm text-gray-500">Carregando perfis...</p>
            )}
          </div>

          {/* Área/Gerência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área/Gerência
            </label>
            <Controller
              name="area_gerencia_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma área (opcional)</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nome}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Status */}
          <div>
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Usuário ativo</span>
                </label>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || profilesLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {(isSubmitting || isLoading) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditing ? 'Atualizar' : 'Criar'} Usuário</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};