import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, AlertCircle } from 'lucide-react';
import { Profile, CreateProfileData, UpdateProfileData, AVAILABLE_INTERFACES, ADMIN_PROFILE_NAME } from '../types/profile';
import { toast } from 'sonner';

const profileSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().optional(),
  acessos_interfaces: z.array(z.string()).min(1, 'Pelo menos uma interface deve ser selecionada'),
  regras_permissoes: z.object({
    admin: z.boolean().default(false),
    configuracoes: z.object({
      read: z.boolean().default(false),
      create: z.boolean().default(false),
      update: z.boolean().default(false),
      delete: z.boolean().default(false)
    }).optional(),
    riscos: z.object({
      read: z.boolean().default(false),
      create: z.boolean().default(false),
      edit: z.boolean().default(false),
      delete: z.boolean().default(false),
      export: z.boolean().default(false),
      approve: z.boolean().default(false)
    }).optional()
  }),
  ativo: z.boolean().default(true)
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile?: Profile;
  onSubmit: (data: CreateProfileData | UpdateProfileData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isEditing = !!profile;
  const isAdminProfile = profile?.nome === ADMIN_PROFILE_NAME;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: profile?.nome || '',
      descricao: profile?.descricao || '',
      acessos_interfaces: profile?.acessos_interfaces || [],
      regras_permissoes: profile?.regras_permissoes || {
        admin: false,
        configuracoes: {
          read: false,
          create: false,
          update: false,
          delete: false
        },
        riscos: {
          read: false,
          create: false,
          edit: false,
          delete: false,
          export: false,
          approve: false
        }
      },
      ativo: profile?.ativo ?? true
    }
  });

  const watchedPermissions = watch('regras_permissoes');
  const watchedInterfaces = watch('acessos_interfaces');

  // Auto-select all interfaces when admin is checked
  useEffect(() => {
    if (watchedPermissions.admin) {
      setValue('acessos_interfaces', [...AVAILABLE_INTERFACES]);
    }
  }, [watchedPermissions.admin, setValue]);

  const handleFormSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      const profileData: CreateProfileData | UpdateProfileData = isEditing 
        ? { ...data, id: profile!.id }
        : data;
      await onSubmit(profileData);
      toast.success(isEditing ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil. Tente novamente.');
    }
  };

  const handleInterfaceToggle = (interfaceName: string, checked: boolean) => {
    const currentInterfaces = watchedInterfaces;
    if (checked) {
      setValue('acessos_interfaces', [...currentInterfaces, interfaceName]);
    } else {
      setValue('acessos_interfaces', currentInterfaces.filter(i => i !== interfaceName));
    }
  };

  const handleSelectAllInterfaces = () => {
    setValue('acessos_interfaces', [...AVAILABLE_INTERFACES]);
  };

  const handleDeselectAllInterfaces = () => {
    setValue('acessos_interfaces', []);
  };

  if (isAdminProfile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Perfil Administrador</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Perfil Protegido
              </p>
              <p className="text-sm text-amber-700">
                O perfil "Administrador" não pode ser editado ou removido por questões de segurança.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Perfil' : 'Novo Perfil'}
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
          {/* Nome do Perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Perfil *
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
                  placeholder="Digite o nome do perfil"
                />
              )}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva as responsabilidades deste perfil"
                />
              )}
            />
          </div>

          {/* Acessos a Interfaces */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Acessos a Interfaces *
            </label>
            
            <div className="mb-3 flex space-x-2">
              <button
                type="button"
                onClick={handleSelectAllInterfaces}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200"
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={handleDeselectAllInterfaces}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
              >
                Desmarcar Todos
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              {AVAILABLE_INTERFACES.map((interfaceName) => (
                <label key={interfaceName} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedInterfaces.includes(interfaceName)}
                    onChange={(e) => handleInterfaceToggle(interfaceName, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{interfaceName}</span>
                </label>
              ))}
            </div>
            
            {errors.acessos_interfaces && (
              <p className="mt-1 text-sm text-red-600">{errors.acessos_interfaces.message}</p>
            )}
          </div>

          {/* Regras de Permissões */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Regras de Permissões
            </label>
            
            {/* Admin Permission */}
            <div className="mb-4 p-4 border border-amber-200 rounded-lg bg-amber-50">
              <Controller
                name="regras_permissoes.admin"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-amber-800">Administrador Total</span>
                      <p className="text-xs text-amber-700">Concede acesso irrestrito a todas as funcionalidades</p>
                    </div>
                  </label>
                )}
              />
            </div>

            {/* Configurações Permissions */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Configurações</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['read', 'create', 'update', 'delete'] as const).map((action) => (
                  <Controller
                    key={action}
                    name={`regras_permissoes.configuracoes.${action}`}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={field.onChange}
                          disabled={watchedPermissions.admin}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {action === 'read' ? 'Visualizar' : 
                           action === 'create' ? 'Criar' :
                           action === 'update' ? 'Editar' : 'Excluir'}
                        </span>
                      </label>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Riscos Permissions */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Riscos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(['read', 'create', 'edit', 'delete', 'export', 'approve'] as const).map((action) => (
                  <Controller
                    key={action}
                    name={`regras_permissoes.riscos.${action}`}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={field.onChange}
                          disabled={watchedPermissions.admin}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {action === 'read' ? 'Visualizar' : 
                           action === 'create' ? 'Criar' :
                           action === 'edit' ? 'Editar' :
                           action === 'delete' ? 'Excluir' :
                           action === 'export' ? 'Exportar' : 'Aprovar'}
                        </span>
                      </label>
                    )}
                  />
                ))}
              </div>
            </div>
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
                  <span className="text-sm text-gray-700">Perfil ativo</span>
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
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
            >
              {(isSubmitting || isLoading) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditing ? 'Atualizar' : 'Criar'} Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};