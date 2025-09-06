import React, { useEffect, Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner, { FullScreenLoader } from './components/LoadingSpinner';

// Lazy loading para componentes de páginas
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
const CadeiaValor = lazy(() => import('./pages/CadeiaValor'));
const ProcessDetail = lazy(() => import('./pages/ProcessDetail'));
const ArquiteturaProcessos = lazy(() => import('./pages/ArquiteturaProcessos'));
const RiscosProcessosTrabalho = lazy(() => import('./pages/RiscosProcessosTrabalho'));

function App() {
  const { 
    user, 
    userProfile, 
    loading, 
    error, 
    authCheckCompleted, 
    isFullyInitialized,
    initialize 
  } = useAuthStore();

  console.log('🔄 App: Renderizando com estado:', {
    loading,
    authCheckCompleted,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    isFullyInitialized,
    error
  });

  useEffect(() => {
    let initTimer: NodeJS.Timeout;
    let visibilityTimer: NodeJS.Timeout;
    let isInitializing = false;

    const initializeAuth = async () => {
      try {
        // Only initialize if not already initialized or in progress
        if (!isFullyInitialized && !isInitializing) {
          isInitializing = true;
          await initialize();
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
      } finally {
        isInitializing = false;
      }
    };
    
    // Small delay to ensure DOM is ready
    initTimer = setTimeout(initializeAuth, 100);

    // Listener para mudanças de visibilidade da página com debouncing
     const handleVisibilityChange = () => {
       // Quando a página fica visível novamente, verifica se precisa revalidar a sessão
       // IMPORTANTE: Só executa se estiver totalmente inicializado E não há usuário
       if (!document.hidden && authCheckCompleted && !isInitializing) {
         // Limpar timer anterior se existir
         if (visibilityTimer) {
           clearTimeout(visibilityTimer);
         }
         
         // Debounce de 1000ms para evitar múltiplas execuções
         visibilityTimer = setTimeout(async () => {
           try {
             const { data: { session } } = await supabase.auth.getSession();
             // Só reinicializa se há sessão válida MAS não há usuário carregado
             // E se não estamos em processo de carregamento
             if (session && !user && !isInitializing) {
               console.log('🔄 Visibilidade: Sessão válida detectada, reinicializando...');
               isInitializing = true;
               await initialize();
             }
           } catch (error) {
             console.error('Erro ao verificar sessão após mudança de visibilidade:', error);
           } finally {
             isInitializing = false;
           }
         }, 1000); // Aumentado para 1 segundo
       }
     };
 
     document.addEventListener('visibilitychange', handleVisibilityChange);
 
     return () => {
       if (initTimer) clearTimeout(initTimer);
       if (visibilityTimer) clearTimeout(visibilityTimer);
       document.removeEventListener('visibilitychange', handleVisibilityChange);
     };
   }, []); // Executar apenas uma vez na montagem do componente

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
            element={<Navigate to="/login" replace />}
          />
          
          {/* Catch-all route */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
          </Routes>
        </Suspense>
        
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
