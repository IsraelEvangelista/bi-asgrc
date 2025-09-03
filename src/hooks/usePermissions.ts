import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { PermissionRules, AVAILABLE_INTERFACES, AvailableInterface } from '../types/profile';

export const usePermissions = () => {
  const { 
    profile, 
    permissions, 
    canAccess, 
    canPerform, 
    isAdmin, 
    hasPermission 
  } = useAuthStore();

  // Check if user can access a specific route/interface
  const canAccessRoute = useCallback((route: string): boolean => {
    return canAccess(route);
  }, [canAccess]);

  // Check if user can perform a specific action
  const canPerformAction = useCallback((action: string, resource?: string): boolean => {
    return canPerform(action, resource);
  }, [canPerform]);

  // Check if user is admin
  const isUserAdmin = useCallback((): boolean => {
    return isAdmin();
  }, [isAdmin]);

  // Check if user has a specific permission
  const hasUserPermission = useCallback((permission: string): boolean => {
    return hasPermission(permission);
  }, [hasPermission]);

  // Check if user can access configuration pages
  const canAccessConfigurations = useCallback((): boolean => {
    return canAccess('/configuracoes');
  }, [canAccess]);

  // Check if user can manage profiles
  const canManageProfiles = useCallback((): boolean => {
    return canAccess('/configuracoes/perfis') && canPerform('read', 'configuracoes');
  }, [canAccess, canPerform]);

  // Check if user can manage users
  const canManageUsers = useCallback((): boolean => {
    return canAccess('/configuracoes/usuarios') && canPerform('read', 'configuracoes');
  }, [canAccess, canPerform]);

  // Check if user can create profiles
  const canCreateProfiles = useCallback((): boolean => {
    return canManageProfiles() && canPerform('create', 'configuracoes');
  }, [canManageProfiles, canPerform]);

  // Check if user can edit profiles
  const canEditProfiles = useCallback((): boolean => {
    return canManageProfiles() && canPerform('update', 'configuracoes');
  }, [canManageProfiles, canPerform]);

  // Check if user can delete profiles
  const canDeleteProfiles = useCallback((): boolean => {
    return canManageProfiles() && canPerform('delete', 'configuracoes');
  }, [canManageProfiles, canPerform]);

  // Check if user can create users
  const canCreateUsers = useCallback((): boolean => {
    return canManageUsers() && canPerform('create', 'configuracoes');
  }, [canManageUsers, canPerform]);

  // Check if user can edit users
  const canEditUsers = useCallback((): boolean => {
    return canManageUsers() && canPerform('update', 'configuracoes');
  }, [canManageUsers, canPerform]);

  // Check if user can delete users
  const canDeleteUsers = useCallback((): boolean => {
    return canManageUsers() && canPerform('delete', 'configuracoes');
  }, [canManageUsers, canPerform]);

  // Check if user can access risks module
  const canAccessRisks = useCallback((): boolean => {
    return canAccess('/riscos');
  }, [canAccess]);

  // Check if user can manage risks
  const canManageRisks = useCallback((): boolean => {
    return canAccessRisks() && (canPerform('read', 'riscos') || hasPermission('riscos'));
  }, [canAccessRisks, canPerform, hasPermission]);

  // Check if user can create risks
  const canCreateRisks = useCallback((): boolean => {
    return canManageRisks() && (canPerform('create', 'riscos') || permissions?.riscos?.create === true);
  }, [canManageRisks, canPerform, permissions]);

  // Check if user can edit risks
  const canEditRisks = useCallback((): boolean => {
    return canManageRisks() && (canPerform('update', 'riscos') || permissions?.riscos?.edit === true);
  }, [canManageRisks, canPerform, permissions]);

  // Check if user can delete risks
  const canDeleteRisks = useCallback((): boolean => {
    return canManageRisks() && (canPerform('delete', 'riscos') || permissions?.riscos?.delete === true);
  }, [canManageRisks, canPerform, permissions]);

  // Check if user can export data
  const canExportData = useCallback((module?: string): boolean => {
    if (isAdmin()) return true;
    
    if (module && permissions) {
      const modulePerms = permissions[module as keyof PermissionRules];
      if (modulePerms && typeof modulePerms === 'object' && 'export' in modulePerms) {
        return (modulePerms as { export?: boolean }).export === true;
      }
    }
    
    return canPerform('export') || hasPermission('export');
  }, [isAdmin, permissions, canPerform, hasPermission]);

  // Check if user can approve items
  const canApprove = useCallback((module?: string): boolean => {
    if (isAdmin()) return true;
    
    if (module && permissions) {
      const modulePerms = permissions[module as keyof PermissionRules];
      if (modulePerms && typeof modulePerms === 'object' && 'approve' in modulePerms) {
        return (modulePerms as { approve?: boolean }).approve === true;
      }
    }
    
    return canPerform('approve') || hasPermission('approve');
  }, [isAdmin, permissions, canPerform, hasPermission]);

  // Get all accessible routes for the user
  const getAccessibleRoutes = useCallback((): string[] => {
    if (!profile) return [];
    
    if (isAdmin() || profile.acessos_interfaces.includes('*')) {
      return [...AVAILABLE_INTERFACES];
    }
    
    return profile.acessos_interfaces.filter(route => 
      AVAILABLE_INTERFACES.includes(route as AvailableInterface)
    );
  }, [profile, isAdmin]);

  // Get user's permission summary
  const getPermissionSummary = useCallback(() => {
    return {
      isAdmin: isUserAdmin(),
      profile: profile?.nome || 'Sem perfil',
      accessibleRoutes: getAccessibleRoutes(),
      permissions: permissions || {},
      canAccessConfigurations: canAccessConfigurations(),
      canManageProfiles: canManageProfiles(),
      canManageUsers: canManageUsers(),
      canManageRisks: canManageRisks()
    };
  }, [isUserAdmin, profile, getAccessibleRoutes, permissions, canAccessConfigurations, canManageProfiles, canManageUsers, canManageRisks]);

  // Check if user has any administrative permissions
  const hasAdminPermissions = (): boolean => {
    return isAdmin() || 
           canManageProfiles() || 
           canManageUsers() || 
           canAccessConfigurations();
  };

  return {
    // Basic permission checks
    canAccessRoute,
    canPerformAction,
    isUserAdmin,
    hasUserPermission,
    
    // Configuration permissions
    canAccessConfigurations,
    canManageProfiles,
    canManageUsers,
    canCreateProfiles,
    canEditProfiles,
    canDeleteProfiles,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    
    // Risk management permissions
    canAccessRisks,
    canManageRisks,
    canCreateRisks,
    canEditRisks,
    canDeleteRisks,
    
    // General permissions
    canExportData,
    canApprove,
    
    // Utility functions
    getAccessibleRoutes,
    getPermissionSummary,
    hasAdminPermissions,
    
    // Raw data
    profile,
    permissions
  };
};