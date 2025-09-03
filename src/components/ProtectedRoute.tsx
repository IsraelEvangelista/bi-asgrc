import { ReactNode, memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { AlertCircle } from 'lucide-react';

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
  const { user, loading, userProfile } = useAuthStore();
  const location = useLocation();
  const {
    canAccessRoute,
    isUserAdmin,
    hasUserPermission
  } = usePermissions();
  

  
  // Mostra loading enquanto verifica autenticação
  if (loading) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!user) {

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o perfil ainda não foi carregado, mostra loading
  if (!userProfile) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil do usuário...</p>
        </div>
      </div>
    );
  }

  // Verifica se requer acesso de administrador
  if (requireAdmin && !isUserAdmin()) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">
            Esta página requer privilégios de administrador.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verifica acesso à rota específica
  if (requiredRoute && !canAccessRoute(requiredRoute)) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verifica permissão específica
  if (requiredPermission && !hasUserPermission(requiredPermission)) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Permissão Insuficiente</h2>
          <p className="text-gray-600 mb-4">
            Você não possui a permissão necessária para acessar esta funcionalidade.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verifica função customizada de permissão
  if (customCheck && !customCheck()) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não atende aos critérios necessários para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Todas as verificações passaram, renderiza o componente

  return <>{children}</>;
};

export default memo(ProtectedRoute);