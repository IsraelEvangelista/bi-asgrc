import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, CreateProfileData, UpdateProfileData, ADMIN_PROFILE_NAME } from '../types/profile';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canPerform } = useAuthStore();

  // Fetch all profiles
  const fetchProfiles = useCallback(async () => {
    if (!canPerform('read', 'configuracoes')) {
      setError('Sem permissão para visualizar perfis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('001_perfis')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (fetchError) {
        throw fetchError;
      }

      setProfiles(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfis';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [canPerform]);

  // Get profile by ID
  const getProfile = async (id: string): Promise<Profile | null> => {
    if (!canPerform('read', 'configuracoes')) {
      toast.error('Sem permissão para visualizar perfil');
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('001_perfis')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil';
      toast.error(errorMessage);
      return null;
    }
  };

  // Create new profile
  const createProfile = async (profileData: CreateProfileData): Promise<Profile | null> => {
    if (!canPerform('create', 'configuracoes')) {
      toast.error('Sem permissão para criar perfis');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('001_perfis')
        .insert({
          ...profileData,
          ativo: profileData.ativo ?? true
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      toast.success('Perfil criado com sucesso!');
      await fetchProfiles(); // Refresh the list
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData: UpdateProfileData): Promise<Profile | null> => {
    if (!canPerform('update', 'configuracoes')) {
      toast.error('Sem permissão para editar perfis');
      return null;
    }

    // Check if trying to update admin profile
    const currentProfile = profiles.find(p => p.id === profileData.id);
    if (currentProfile?.nome === ADMIN_PROFILE_NAME) {
      toast.error('O perfil Administrador não pode ser modificado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = profileData;
      
      const { data, error: updateError } = await supabase
        .from('001_perfis')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Perfil atualizado com sucesso!');
      await fetchProfiles(); // Refresh the list
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Soft delete profile (deactivate)
  const deleteProfile = async (id: string): Promise<boolean> => {
    if (!canPerform('delete', 'configuracoes')) {
      toast.error('Sem permissão para excluir perfis');
      return false;
    }

    // Check if trying to delete admin profile
    const profileToDelete = profiles.find(p => p.id === id);
    if (profileToDelete?.nome === ADMIN_PROFILE_NAME) {
      toast.error('O perfil Administrador não pode ser removido');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if profile is being used by any users
      const { data: usersWithProfile, error: checkError } = await supabase
        .from('002_usuarios')
        .select('id')
        .eq('perfil_id', id)
        .eq('ativo', true);

      if (checkError) {
        throw checkError;
      }

      if (usersWithProfile && usersWithProfile.length > 0) {
        toast.error('Não é possível excluir um perfil que está sendo usado por usuários ativos');
        return false;
      }

      const { error: deleteError } = await supabase
        .from('001_perfis')
        .update({ ativo: false })
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Perfil removido com sucesso!');
      await fetchProfiles(); // Refresh the list
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is admin (read-only)
  const isAdminProfile = (profile: Profile): boolean => {
    return profile.nome === ADMIN_PROFILE_NAME;
  };

  // Check if current user can modify profiles
  const canModifyProfiles = (): boolean => {
    return canPerform('update', 'configuracoes') || canPerform('create', 'configuracoes');
  };

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    isAdminProfile,
    canModifyProfiles
  };
};