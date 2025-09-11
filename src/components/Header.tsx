import { memo, useCallback, useState } from 'react';
import { LogOut, User, X, Filter, FilterX } from 'lucide-react';
import { useAuthStore } from "../store/authStore";
import { useFilter } from '../contexts/FilterContext';
import { useConfig } from '../hooks/useConfig';
import MatrizRiscoFilterModal from './MatrizRiscoFilterModal';

const Header: React.FC = () => {
  const { user, userProfile, signOut } = useAuthStore();
  const { filtroSeveridade, filtroQuadrante, filtroNatureza, clearAllFilters } = useFilter();
  const { naturezas } = useConfig();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleClearAllFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  const hasActiveFilters = filtroSeveridade || filtroQuadrante || filtroNatureza;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg">
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
              {/* Tags de Filtro */}
              {(filtroSeveridade || filtroQuadrante || filtroNatureza) && (
                <div className="flex items-center space-x-2">
                  {filtroSeveridade && (
                    <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      <span>Severidade: {filtroSeveridade}</span>
                      <button
                        onClick={() => clearAllFilters()}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filtroNatureza && (
                    <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      <span>Natureza: {naturezas.find(n => n.id === filtroNatureza)?.natureza || 'N/A'}</span>
                      <button
                        onClick={() => clearAllFilters()}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filtroQuadrante && (
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      <span>Quadrante: I{filtroQuadrante.impacto} × P{filtroQuadrante.probabilidade}</span>
                      <button
                        onClick={() => clearAllFilters()}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Seção de botões removida - botão de filtros movido para MatrizRisco.tsx */}

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
      
      {/* Modal de Filtros */}
      <MatrizRiscoFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </header>
  );
};

export default memo(Header);