import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, CreateUserData, UpdateUserData, UserFilters, UsersResponse } from '../types/user';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const { canPerform } = useAuthStore();

  // Fetch users with pagination and filters
  const fetchUsers = useCallback(async (
    page: number = 1,
    limit: number = 10,
    filters?: UserFilters
  ): Promise<UsersResponse | null> => {
    if (!canPerform('read', 'configuracoes')) {
      setError('Sem permissão para visualizar usuários');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('002_usuarios')
        .select(`
          *,
          profile:001_perfis(*),
          area_gerencia:003_areas_gerencias(*)
        `, { count: 'exact' })
        .eq('ativo', true);

      // Apply filters
      if (filters) {
        if (filters.nome) {
          query = query.ilike('nome', `%${filters.nome}%`);
        }
        if (filters.email) {
          query = query.ilike('email', `%${filters.email}%`);
        }
        if (filters.perfil_id) {
          query = query.eq('perfil_id', filters.perfil_id);
        }
        if (filters.area_gerencia_id) {
          query = query.eq('area_gerencia_id', filters.area_gerencia_id);
        }
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by name
      query = query.order('nome');

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const usersData = data || [];
      setUsers(usersData);
      setTotalUsers(count || 0);

      return {
        users: usersData,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [canPerform]);

  // Get user by ID
  const getUser = async (id: string): Promise<UserProfile | null> => {
    if (!canPerform('read', 'configuracoes')) {
      toast.error('Sem permissão para visualizar usuário');
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('002_usuarios')
        .select(`
          *,
          profile:001_perfis(*),
          area_gerencia:003_areas_gerencias(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuário';
      toast.error(errorMessage);
      return null;
    }
  };

  // Get user by email
  const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('002_usuarios')
        .select(`
          *,
          profile:001_perfis(*),
          area_gerencia:003_areas_gerencias(*)
        `)
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch {
      return null;
    }
  };

  // Create new user
  const createUser = async (userData: CreateUserData): Promise<UserProfile | null> => {
    if (!canPerform('create', 'configuracoes')) {
      toast.error('Sem permissão para criar usuários');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('002_usuarios')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        toast.error('Já existe um usuário com este email');
        return null;
      }

      const { data, error: createError } = await supabase
        .from('002_usuarios')
        .insert({
          ...userData,
          ativo: userData.ativo ?? true
        })
        .select(`
          *,
          profile:001_perfis(*),
          area_gerencia:003_areas_gerencias(*)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      toast.success('Usuário criado com sucesso!');
      await fetchUsers(); // Refresh the list
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (userData: UpdateUserData): Promise<UserProfile | null> => {
    if (!canPerform('update', 'configuracoes')) {
      toast.error('Sem permissão para editar usuários');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = userData;

      // Check if email already exists (excluding current user)
      if (updateData.email) {
        const { data: existingUser } = await supabase
          .from('002_usuarios')
          .select('id')
          .eq('email', updateData.email)
          .neq('id', id)
          .single();

        if (existingUser) {
          toast.error('Já existe um usuário com este email');
          return null;
        }
      }
      
      const { data, error: updateError } = await supabase
        .from('002_usuarios')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          profile:001_perfis(*),
          area_gerencia:003_areas_gerencias(*)
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Usuário atualizado com sucesso!');
      await fetchUsers(); // Refresh the list
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Soft delete user (deactivate)
  const deleteUser = async (id: string): Promise<boolean> => {
    if (!canPerform('delete', 'configuracoes')) {
      toast.error('Sem permissão para excluir usuários');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('002_usuarios')
        .update({ ativo: false })
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('Usuário removido com sucesso!');
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Activate user
  const activateUser = async (id: string): Promise<boolean> => {
    if (!canPerform('update', 'configuracoes')) {
      toast.error('Sem permissão para ativar usuários');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: activateError } = await supabase
        .from('002_usuarios')
        .update({ ativo: true })
        .eq('id', id);

      if (activateError) {
        throw activateError;
      }

      toast.success('Usuário ativado com sucesso!');
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao ativar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if current user can modify users
  const canModifyUsers = (): boolean => {
    return canPerform('update', 'configuracoes') || canPerform('create', 'configuracoes');
  };

  // Fixed: Remove fetch function dependency to prevent infinite loops
  useEffect(() => {
    fetchUsers();
  }, []); // Fixed: empty dependency array to prevent infinite loops

  return {
    users,
    loading,
    error,
    totalUsers,
    fetchUsers,
    getUser,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    canModifyUsers
  };
};