import { useState, memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';
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
    label: 'Gestão de Riscos',
    path: '/riscos',
  },
  {
    label: 'Processos',
    children: [
      { label: 'Cadeia de Valor', path: '/processos/cadeia-valor' },
      { label: 'Arquitetura de Processos', path: '/processos/arquitetura' },
      { label: 'Riscos de Processos de Trabalho', path: '/processos/riscos' },
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
  {
    label: 'Formulários',
    path: '/formularios',
  },
  {
    label: 'Cadastro',
    path: '/cadastro',
  },
];



const Navbar = () => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const { canManageProfiles, canManageUsers } = usePermissions();

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

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openDropdowns.includes(item.label);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div key={item.label} className="relative group">
          <button
            onClick={() => toggleDropdown(item.label)}
            className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              active
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>{item.label}</span>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {isOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {item.children?.map(child => (
                  <div key={child.label}>
                    {child.children ? (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
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
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          active
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 h-12">
          {/* Link para Dashboard */}
          <Link
            to="/dashboard"
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              location.pathname === '/dashboard'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>
          
          {/* Itens de Navegação */}
          {navigationItems.map(item => renderNavItem(item))}
          
          {/* Seção de Configurações */}
          <ProtectedComponent
            customCheck={() => canManageProfiles() || canManageUsers()}
          >
            <div className="relative group">
              <button
                onClick={() => toggleDropdown('Configurações')}
                className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  location.pathname.startsWith('/configuracoes')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <ProtectedComponent customCheck={canManageProfiles}>
                      <Link
                        to="/configuracoes/perfis"
                        onClick={closeAllDropdowns}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          location.pathname === '/configuracoes/perfis'
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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