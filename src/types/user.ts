// Tipos para sistema de usuários

import { Profile } from './profile';

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil_id?: string;
  area_gerencia_id?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  profile?: Profile;
  area_gerencia?: {
    id: string;
    nome: string;
    descricao?: string;
  };
}

export interface UserWithProfile extends User {
  profile: Profile;
}

// Tipos para criação e edição de usuários
export interface CreateUserData {
  nome: string;
  email: string;
  perfil_id?: string;
  area_gerencia_id?: string;
  ativo?: boolean;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

// Tipo para o contexto de autenticação
export interface AuthUser {
  id: string;
  email: string;
  nome?: string;
  profile?: Profile;
  permissions?: {
    canAccess: (resource: string) => boolean;
    canPerform: (action: string, resource?: string) => boolean;
    isAdmin: () => boolean;
    hasPermission: (permission: string) => boolean;
  };
}

// Tipos para formulários
export interface UserFormData {
  nome: string;
  email: string;
  perfil_id: string;
  area_gerencia_id?: string;
  senha?: string;
  ativo?: boolean;
}

// Tipos para formulário de registro/cadastro
export interface RegisterFormData {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  area_gerencia_id?: string;
}

// Tipos para dados de registro (sem confirmação de senha)
export interface RegisterData {
  nome: string;
  email: string;
  password: string;
  area_gerencia_id?: string;
}

// Tipo para resposta de registro
export interface RegisterResponse {
  user?: User;
  error?: string;
  needsEmailVerification?: boolean;
}

// Tipos para filtros e busca
export interface UserFilters {
  search?: string;
  nome?: string;
  email?: string;
  perfil_id?: string;
  area_gerencia_id?: string;
  ativo?: boolean | string;
}

export interface UserSearchParams {
  search?: string;
  filters?: UserFilters;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Tipos para resposta da API
export interface UsersResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}