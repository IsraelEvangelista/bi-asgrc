import { memo, useCallback } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Header = () => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <img
              src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756835962585.png"
              alt="Logo COGERH"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-semibold">
                Sistema de Gestão de Riscos
              </h1>
              <p className="text-blue-100 text-sm">
                Assessoria de Risco e Compliance - COGERH
              </p>
            </div>
          </div>

          {/* Informações do Usuário */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-blue-700 hover:bg-blue-600 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default memo(Header);