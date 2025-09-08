import { memo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';

interface FixedLayoutProps {
  children: React.ReactNode;
}

const FixedLayout = ({ children }: FixedLayoutProps) => {
  const location = useLocation();
  
  // Não mostrar header e navbar na página de login
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Header fixo */}
      <div className="fixed-header-container">
        <Header />
      </div>
      
      {/* Navbar fixo */}
      <div className="fixed-navbar-container">
        <Navbar />
      </div>
      
      {/* Conteúdo principal com espaçamento adequado */}
      <div className="main-content-wrapper">
        {children}
      </div>
    </>
  );
};

export default memo(FixedLayout);