import React, { useEffect, Suspense, lazy, memo, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner, { FullScreenLoader } from './components/LoadingSpinner';
import FixedLayout from './components/FixedLayout';

// Preload dos componentes mais críticos para evitar tela branca
import CadeiaValor from './pages/CadeiaValor';
import ProcessDetail from './pages/ProcessDetail';
import Dashboard from './pages/Dashboard';

// Lazy loading apenas para componentes menos utilizados
const Login = lazy(() => import('./pages/Login'));
const ProfileManagement = lazy(() => import('./pages/ProfileManagement').then(module => ({ default: module.ProfileManagement })));
const UserManagement = lazy(() => import('./pages/UserManagement').then(module => ({ default: module.UserManagement })));
const Conceitos = lazy(() => import('./pages/Conceitos'));
const MacroprocessManagement = lazy(() => import('./pages/MacroprocessManagement'));
const ProcessManagement = lazy(() => import('./pages/ProcessManagement'));
const SubprocessManagement = lazy(() => import('./pages/SubprocessManagement'));
const Indicators = lazy(() => import('./pages/Indicators'));
const IndicatorDetails = lazy(() => import('./pages/IndicatorDetails'));
const CreateIndicator = lazy(() => import('./pages/CreateIndicator'));
const EditIndicator = lazy(() => import('./pages/EditIndicator'));
const Actions = lazy(() => import('./pages/Actions'));
const ActionDetails = lazy(() => import('./pages/ActionDetails'));
const CreateAction = lazy(() => import('./pages/CreateAction'));
const EditAction = lazy(() => import('./pages/EditAction'));
const ConfigDashboard = lazy(() => import('./pages/ConfigDashboard'));
const AreasManagement = lazy(() => import('./pages/AreasManagement'));
const NaturezaManagement = lazy(() => import('./pages/NaturezaManagement'));
const CategoriaManagement = lazy(() => import('./pages/CategoriaManagement'));
const SubcategoriaManagement = lazy(() => import('./pages/SubcategoriaManagement'));
const ArquiteturaProcessos = lazy(() => import('./pages/ArquiteturaProcessos'));
const RiscosProcessosTrabalho = lazy(() => import('./pages/RiscosProcessosTrabalho'));
const MatrizRisco = lazy(() => import('./pages/MatrizRisco'));
const PortfolioAcoes = lazy(() => import('./pages/PortfolioAcoes'));
const MonitoramentoRiscos = lazy(() => import('./pages/MonitoramentoRiscos'));


function App() {
  const { 
    user, 
    userProfile, 
    loading, 
    error, 
    authCheckCompleted, 
    isFullyInitialized,
    isInitializing,
    initialize 
  } = useAuthStore();

  const initializeRef = useRef(false);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout>();
  const lastVisibilityChangeRef = useRef<number>(0);

  console.log('🔄 App: Renderizando com estado:', {
    loading,
    authCheckCompleted,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    isFullyInitialized,
    error
  });

  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid visibility changes (debounce)
    if (now - lastVisibilityChangeRef.current < 1000) {
      return;
    }
    
    lastVisibilityChangeRef.current = now;
    
    if (document.visibilityState === 'visible') {
      // Clear any existing timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
      
      // Only reinitialize if not already initialized and not currently initializing
      if (!isFullyInitialized && !isInitializing) {
        console.log('🔄 App: Página visível, verificando necessidade de reinicialização...');
        
        visibilityTimeoutRef.current = setTimeout(() => {
          const currentState = useAuthStore.getState();
          if (!currentState.isFullyInitialized && !currentState.isInitializing) {
            console.log('🔄 App: Reinicializando auth após mudança de visibilidade...');
            initialize();
          }
        }, 500);
      }
    }
  }, [isFullyInitialized, isInitializing, initialize]);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializeRef.current) {
      return;
    }
    
    // Only initialize once on mount
    if (!isFullyInitialized && !isInitializing) {
      console.log('🚀 App: Inicializando aplicação...');
      initializeRef.current = true;
      initialize();
    }
  }, []); // Empty dependency array - only run on mount

  useEffect(() => {
    // Setup visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [handleVisibilityChange]);

  // Show loading only during initial app load
  if (loading && !authCheckCompleted) {
    return <FullScreenLoader text="Inicializando aplicação..." />;
  }
  
  // If there's a user but profile is still loading
  if (user && loading && !userProfile) {
    return <FullScreenLoader text="Carregando perfil do usuário..." />;
  }
  
  console.log('🔍 App render state:', {
    loading,
    authCheckCompleted,
    user: !!user,
    userProfile: !!userProfile,
    isFullyInitialized
  });

  return (
    <Router>
      <FixedLayout>
        <Suspense fallback={<FullScreenLoader text="Carregando página..." />}>
          <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />
        
          {/* Rotas do módulo de indicadores */}
          <Route 
            path="/indicadores" 
            element={
              <ProtectedRoute>
                <Indicators />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/indicadores/novo" 
            element={
              <ProtectedRoute>
                <CreateIndicator />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/indicadores/:id" 
            element={
              <ProtectedRoute>
                <IndicatorDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/indicadores/:id/editar" 
            element={
              <ProtectedRoute>
                <EditIndicator />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas do módulo de ações */}
          <Route 
            path="/acoes" 
            element={
              <ProtectedRoute>
                <Actions />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/acoes/nova" 
            element={
              <ProtectedRoute>
                <CreateAction />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/acoes/:id" 
            element={
              <ProtectedRoute>
                <ActionDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/acoes/:id/editar" 
            element={
              <ProtectedRoute>
                <EditAction />
              </ProtectedRoute>
            } 
          />
          

          
          {/* Rota de Conceitos */}
          <Route 
            path="/conceitos" 
            element={
              <ProtectedRoute>
                <Conceitos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/processos/cadeia-valor" 
            element={
              <ProtectedRoute>
                <CadeiaValor />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/processo/:macroprocessoId" 
            element={
              <ProtectedRoute>
                <ProcessDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/processos/arquitetura" 
            element={
              <ProtectedRoute>
                <ArquiteturaProcessos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/processos/riscos-trabalho" 
            element={
              <ProtectedRoute>
                <RiscosProcessosTrabalho />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/riscos-estrategicos/matriz-risco" 
            element={
              <ProtectedRoute>
                <MatrizRisco />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/riscos-estrategicos/portfolio-acoes" 
            element={
              <ProtectedRoute>
                <PortfolioAcoes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/riscos-estrategicos/monitoramento" 
            element={
              <ProtectedRoute>
                <MonitoramentoRiscos />
              </ProtectedRoute>
            } 
          />
          

          
          {/* Rota principal de Configurações */}
          <Route 
            path="/configuracoes" 
            element={
              <ProtectedRoute>
                <ConfigDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/configuracoes/areas" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/areas">
                <AreasManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/configuracoes/natureza" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/natureza">
                <NaturezaManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/configuracoes/categoria" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/categoria">
                <CategoriaManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/configuracoes/subcategoria" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/subcategoria">
                <SubcategoriaManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas de Gerenciamento de Processos */}
          <Route 
            path="/configuracoes/macroprocessos" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/macroprocessos">
                <MacroprocessManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracoes/processos" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/processos">
                <ProcessManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracoes/subprocessos" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/subprocessos">
                <SubprocessManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas de Configurações - Protegidas por permissão */}
          <Route 
            path="/configuracoes/perfis" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/perfis">
                <ProfileManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/configuracoes/usuarios" 
            element={
              <ProtectedRoute requiredRoute="/configuracoes/usuarios">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota raiz */}
          <Route
            path="/"
            element={
              user && userProfile ? (
                <Navigate to="/conceitos" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Catch-all route */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
          </Routes>
        </Suspense>
      </FixedLayout>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          duration={4000}
        />
    </Router>
  );
}

export default memo(App);
