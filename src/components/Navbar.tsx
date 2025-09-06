import { useState, memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Settings, Workflow, Target, BookOpen } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { ProtectedComponent } from './ProtectedComponent';

interface NavItem {
  label: string;
  path?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Conceitos',
    path: '/conceitos',
  },
  {
    label: 'Processos',
    children: [
      { label: 'Cadeia de Valor', path: '/processos/cadeia-valor' },
      { label: 'Arquitetura de Processos', path: '/processos/arquitetura' },
      { label: 'Riscos de Processos de Trabalho', path: '/processos/riscos-trabalho' },
    ],
  },
  {
    label: 'Riscos Estratégicos',
    children: [
      {
        label: 'Portfólio de Riscos',
        children: [
          { label: 'Matriz de Risco', path: '/riscos/matriz' },
          { label: 'Portfólio de Ações', path: '/riscos/portfolio-acoes' },
        ],
      },
      {
        label: 'Monitoramento',
        children: [
          { label: 'Plano de Ações', path: '/riscos/plano-acoes' },
          { label: 'Indicadores', path: '/riscos/indicadores' },
        ],
      },
    ],
  },
];



const Navbar = () => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const { canManageProfiles, canManageUsers } = usePermissions();

  const getIconForNavItem = (label: string) => {
    switch (label) {
      case 'Conceitos':
        return <BookOpen className="h-4 w-4" />;
      case 'Processos':
        return <Workflow className="h-4 w-4" />;
      case 'Riscos Estratégicos':
        return <Target className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdowns([]);
  }, []);

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isDropdownActive = (item: NavItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => {
        if (child.path && isActive(child.path)) return true;
        if (child.children) {
          return child.children.some(grandchild => 
            grandchild.path && isActive(grandchild.path)
          );
        }
        return false;
      });
    }
    return false;
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openDropdowns.includes(item.label);
    const active = hasChildren ? isDropdownActive(item) : isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.label} className="relative group">
          <button
            onClick={() => toggleDropdown(item.label)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 transform ${
              active
                ? 'bg-gradient-to-b from-blue-200 to-blue-300 text-blue-800 shadow-inner border border-blue-400'
                : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 shadow-md border border-gray-300 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 hover:shadow-lg hover:scale-105 active:shadow-inner active:scale-95'
            }`}
          >
            {getIconForNavItem(item.label)}
            <span>{item.label}</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {isOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg border-2 border-blue-400 z-50" style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'}}>
              <div className="py-1">
                {item.children?.map(child => (
                  <div key={child.label}>
                    {child.children ? (
                      <div>
                        <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                          child.label === 'Portfólio de Riscos' || child.label === 'Monitoramento'
                            ? 'bg-blue-900 text-white'
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          {child.label}
                        </div>
                        {child.children.map(grandchild => (
                          <Link
                            key={grandchild.label}
                            to={grandchild.path!}
                            onClick={closeAllDropdowns}
                            className={`block px-6 py-2 text-sm transition-colors duration-200 ${
                              isActive(grandchild.path)
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            {grandchild.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={child.path!}
                        onClick={closeAllDropdowns}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          isActive(child.path)
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {child.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path!}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 transform ${
          active
            ? 'bg-gradient-to-b from-blue-200 to-blue-300 text-blue-800 shadow-inner border border-blue-400'
            : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 shadow-md border border-gray-300 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 hover:shadow-lg hover:scale-105 active:shadow-inner active:scale-95'
        }`}
      >
        {getIconForNavItem(item.label)}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-evenly h-12 w-full">

          
          {/* Itens de Navegação */}
          {navigationItems.map(item => renderNavItem(item))}
          
          {/* Seção de Configurações */}
          <ProtectedComponent
            customCheck={() => canManageProfiles() || canManageUsers()}
          >
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('Configurações')}
                className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 transform ${
                  location.pathname.startsWith('/configuracoes')
                    ? 'bg-gradient-to-b from-blue-200 to-blue-300 text-blue-800 shadow-inner border border-blue-400'
                    : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 shadow-md border border-gray-300 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 hover:shadow-lg hover:scale-105 active:shadow-inner active:scale-95'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdowns.includes('Configurações') ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {openDropdowns.includes('Configurações') && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border-2 border-blue-400 z-50" style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'}}>
                  <div className="py-1">
                    <ProtectedComponent customCheck={canManageProfiles}>
                      <Link
                        to="/configuracoes/perfis"
                        onClick={closeAllDropdowns}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          location.pathname === '/configuracoes/perfis'
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        Perfis de Acesso
                      </Link>
                    </ProtectedComponent>
                    
                    <ProtectedComponent customCheck={canManageUsers}>
                      <Link
                        to="/configuracoes/usuarios"
                        onClick={closeAllDropdowns}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          location.pathname === '/configuracoes/usuarios'
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        Usuários
                      </Link>
                    </ProtectedComponent>
                  </div>
                </div>
              )}
            </div>
          </ProtectedComponent>
        </div>
      </div>
      
      {/* Overlay para fechar dropdowns */}
      {openDropdowns.length > 0 && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeAllDropdowns}
        />
      )}
    </nav>
  );
};

export default memo(Navbar);