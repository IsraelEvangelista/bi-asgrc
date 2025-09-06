import { memo, useCallback } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';


const Header = () => {
  const { user, userProfile, signOut } = useAuthStore();

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Título */}
          <div className="flex items-center">
            {/* Logo COGERH */}
            <img
            src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757120273655.png"
            alt="COGERH Logo"
            className="h-12 object-contain"
          />
            
            {/* Linha separadora vertical */}
            <div className="h-12 w-px bg-white/50 mx-6"></div>
            
            {/* Título do sistema */}
            <h1 className="text-xl font-bold">ASGRC - Sistema de Gestão de Riscos</h1>
          </div>

          {/* Informações do Usuário */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {userProfile?.nome || user.email}
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