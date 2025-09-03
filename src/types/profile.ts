// Tipos para sistema de perfis e permissões

export interface Profile {
  id: string;
  nome: string;
  descricao?: string;
  area_id?: string;
  acessos_interfaces: string[];
  regras_permissoes: PermissionRules;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionRules {
  admin?: boolean;
  all?: boolean;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  // Permissões específicas por módulo
  riscos?: ModulePermissions;
  processos?: ModulePermissions;
  indicadores?: ModulePermissions;
  acoes?: ModulePermissions;
  configuracoes?: ModulePermissions;
  relatorios?: ModulePermissions;
}

export interface ModulePermissions {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean;
  approve?: boolean;
}

export interface AccessRule {
  resource: string;
  action: string;
  allowed: boolean;
  conditions?: Record<string, unknown>;
}

// Tipos para criação e edição de perfis
export interface CreateProfileData {
  nome: string;
  descricao?: string;
  area_id?: string;
  acessos_interfaces: string[];
  regras_permissoes: PermissionRules;
  ativo?: boolean;
}

export interface UpdateProfileData extends Partial<CreateProfileData> {
  id: string;
}

// Constantes para interfaces disponíveis
export const AVAILABLE_INTERFACES = [
  '/dashboard',
  '/riscos',
  '/processos',
  '/indicadores',
  '/acoes',
  '/configuracoes',
  '/configuracoes/perfis',
  '/configuracoes/usuarios',
  '/relatorios'
] as const;

export type AvailableInterface = typeof AVAILABLE_INTERFACES[number];

// Perfil padrão do administrador (somente leitura)
export const ADMIN_PROFILE_NAME = 'Administrador';

export const DEFAULT_ADMIN_PERMISSIONS: PermissionRules = {
  admin: true,
  all: true,
  create: true,
  read: true,
  update: true,
  delete: true,
  riscos: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    approve: true
  },
  processos: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    approve: true
  },
  indicadores: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    approve: true
  },
  acoes: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    approve: true
  },
  configuracoes: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    approve: true
  },
  relatorios: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    approve: true
  }
};