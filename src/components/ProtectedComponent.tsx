import React, { memo } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../store/authStore';

interface ProtectedComponentProps {
  children: React.ReactNode;
  /** Required permission to view the component */
  permission?: string;
  /** Required route access to view the component */
  route?: string;
  /** Require admin access */
  requireAdmin?: boolean;
  /** Require specific profile permissions */
  profilePermissions?: {
    /** Module name (configuracoes, riscos) */
    module?: string;
    /** Required actions (read, create, update, delete, export, approve) */
    actions?: string[];
  };
  /** Custom permission check function */
  customCheck?: () => boolean;
  /** Component to render when access is denied */
  fallback?: React.ReactNode;
  /** Show nothing when access is denied (default: true) */
  hideWhenDenied?: boolean;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = memo(({
  children,
  permission,
  route,
  requireAdmin = false,
  profilePermissions,
  customCheck,
  fallback = null,
  hideWhenDenied = true
}) => {
  const { user } = useAuthStore();
  const {
    canAccessRoute,
    canPerformAction,
    isUserAdmin,
    hasUserPermission
  } = usePermissions();

  // If user is not authenticated, deny access
  if (!user) {
    return hideWhenDenied ? null : fallback;
  }

  // Check admin requirement
  if (requireAdmin && !isUserAdmin()) {
    return hideWhenDenied ? null : fallback;
  }

  // Check route access
  if (route && !canAccessRoute(route)) {
    return hideWhenDenied ? null : fallback;
  }

  // Check specific permission
  if (permission && !hasUserPermission(permission)) {
    return hideWhenDenied ? null : fallback;
  }

  // Check profile permissions
  if (profilePermissions) {
    const { module, actions = [] } = profilePermissions;
    
    if (module && actions.length > 0) {
      const hasAllActions = actions.every(action => 
        canPerformAction(action, module)
      );
      
      if (!hasAllActions) {
        return hideWhenDenied ? null : fallback;
      }
    }
  }

  // Check custom permission function
  if (customCheck && !customCheck()) {
    return hideWhenDenied ? null : fallback;
  }

  // All checks passed, render children
  return <>{children}</>;
});

// Convenience components for common use cases
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = memo(({ children, fallback }) => (
  <ProtectedComponent requireAdmin fallback={fallback}>
    {children}
  </ProtectedComponent>
));

export const RouteProtected: React.FC<{
  children: React.ReactNode;
  route: string;
  fallback?: React.ReactNode;
}> = memo(({ children, route, fallback }) => (
  <ProtectedComponent route={route} fallback={fallback}>
    {children}
  </ProtectedComponent>
));

export const PermissionProtected: React.FC<{
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}> = memo(({ children, permission, fallback }) => (
  <ProtectedComponent permission={permission} fallback={fallback}>
    {children}
  </ProtectedComponent>
));

export const ModuleProtected: React.FC<{
  children: React.ReactNode;
  module: string;
  actions: string[];
  fallback?: React.ReactNode;
}> = memo(({ children, module, actions, fallback }) => (
  <ProtectedComponent 
    profilePermissions={{ module, actions }} 
    fallback={fallback}
  >
    {children}
  </ProtectedComponent>
));

// Specific module protection components
export const ConfigProtected: React.FC<{
  children: React.ReactNode;
  actions: string[];
  fallback?: React.ReactNode;
}> = memo(({ children, actions, fallback }) => (
  <ModuleProtected module="configuracoes" actions={actions} fallback={fallback}>
    {children}
  </ModuleProtected>
));

export const RiskProtected: React.FC<{
  children: React.ReactNode;
  actions: string[];
  fallback?: React.ReactNode;
}> = memo(({ children, actions, fallback }) => (
  <ModuleProtected module="riscos" actions={actions} fallback={fallback}>
    {children}
  </ModuleProtected>
));