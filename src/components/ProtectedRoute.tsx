import { ReactNode, memo, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { AlertCircle } from 'lucide-react';
import { FullScreenLoader } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required route access */
  requiredRoute?: string;
  /** Require admin access */
  requireAdmin?: boolean;
  /** Required permission */
  requiredPermission?: string;
  /** Custom permission check function */
  customCheck?: () => boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiredRoute,
  requireAdmin = false,
  requiredPermission,
  customCheck
}: ProtectedRouteProps) => {
  const { user, loading, userProfile, isFullyInitialized, authCheckCompleted } = useAuthStore();
  const location = useLocation();
  const {
    canAccessRoute,
    isUserAdmin,
    hasUserPermission
  } = usePermissions();
  
  // Memoiza as verificações de permissão para evitar re-renderizações desnecessárias
  const permissionChecks = useMemo(() => {
    if (!user || !userProfile) return null;
    
    return {
      hasAdminAccess: requireAdmin ? isUserAdmin() : true,
      hasRouteAccess: requiredRoute ? canAccessRoute(requiredRoute) : true,
      hasPermission: requiredPermission ? hasUserPermission(requiredPermission) : true,
      hasCustomAccess: customCheck ? customCheck() : true
    };
  }, [user, userProfile, requireAdmin, requiredRoute, requiredPermission, customCheck, isUserAdmin, canAccessRoute, hasUserPermission]);
  
  // Show loading only if we're truly checking auth for the first time
  // Don't show loading if user exists but profile is loading (navigation case)
  if ((loading || !authCheckCompleted) && !user) {
    return <FullScreenLoader text="Verificando autenticação..." />;
  }

  // Only redirect to login if we've completed the auth check and there's no user
  if (!user && authCheckCompleted) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user exists but profile is still loading, show loading
  if (user && !userProfile && !isFullyInitialized) {
    return <FullScreenLoader text="Carregando perfil do usuário..." />;
  }

  // If we have a user but no profile after initialization is complete, there's an error
  if (user && !userProfile && isFullyInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center transition-all duration-300">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600 mb-4">Seu perfil de usuário não pôde ser carregado. Entre em contato com o administrador.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Fazer login novamente
          </button>
        </div>
      </div>
    );
  }

  // Usa as verificações memoizadas para evitar re-renderizações
  if (!permissionChecks) {
    return <FullScreenLoader text="Verificando permissões..." />;
  }

  // Componente de erro reutilizável
  const AccessDeniedScreen = ({ title, message }: { title: string; message: string }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center transition-all duration-300">
      <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Voltar
        </button>
      </div>
    </div>
  );

  // Verifica se requer acesso de administrador
  if (!permissionChecks.hasAdminAccess) {
    return (
      <AccessDeniedScreen 
        title="Acesso Restrito" 
        message="Esta página requer privilégios de administrador." 
      />
    );
  }

  // Verifica acesso à rota específica
  if (!permissionChecks.hasRouteAccess) {
    return (
      <AccessDeniedScreen 
        title="Acesso Negado" 
        message="Você não tem permissão para acessar esta página." 
      />
    );
  }

  // Verifica permissão específica
  if (!permissionChecks.hasPermission) {
    return (
      <AccessDeniedScreen 
        title="Permissão Insuficiente" 
        message="Você não possui a permissão necessária para acessar esta funcionalidade." 
      />
    );
  }

  // Verifica função customizada de permissão
  if (!permissionChecks.hasCustomAccess) {
    return (
      <AccessDeniedScreen 
        title="Acesso Negado" 
        message="Você não atende aos critérios necessários para acessar esta página." 
      />
    );
  }

  // Todas as verificações passaram, renderiza o componente com transição suave
  return (
    <div className="route-transition-enter-active">
      {children}
    </div>
  );
};

export default memo(ProtectedRoute);