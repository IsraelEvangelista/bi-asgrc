import { ReactNode, memo } from 'react';
import Header from './Header';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <Navbar />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default memo(Layout);