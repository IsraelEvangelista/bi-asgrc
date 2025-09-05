import { useEffect, memo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationInitializer from './components/NotificationInitializer';
import RealtimeStatus from './components/RealtimeStatus';
import LoadingSpinner, { FullScreenLoader } from './components/LoadingSpinner';

// Lazy loading para componentes de páginas
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RiskList = lazy(() => import('./pages/RiskList'));
const RiskDetail = lazy(() => import('./pages/RiskDetail'));
const RiskFormPage = lazy(() => import('./pages/RiskFormPage'));
const ProfileManagement = lazy(() => import('./pages/ProfileManagement').then(module => ({ default: module.ProfileManagement })));
const UserManagement = lazy(() => import('./pages/UserManagement').then(module => ({ default: module.UserManagement })));
const Reports = lazy(() => import('./pages/Reports'));
const ProcessHierarchy = lazy(() => import('./pages/ProcessHierarchy'));
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
const Conceitos = lazy(() => import('./pages/Conceitos'));

function App() {
  const authStore = useAuthStore();
  const { initialize } = authStore;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
      }
    };
    
    initializeAuth();
  }, [initialize]);

  return (
    <Router>
      <NotificationInitializer />
      <RealtimeStatus />
      <Suspense fallback={<FullScreenLoader text="Carregando página..." />}>
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        
          {/* Rotas do módulo de riscos */}
          <Route 
            path="/riscos" 
            element={
              <ProtectedRoute>
                <RiskList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/riscos/novo" 
            element={
              <ProtectedRoute>
                <RiskFormPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/riscos/:id" 
            element={
              <ProtectedRoute>
                <RiskDetail />
              </ProtectedRoute>
            } 
          />
          
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
          
          {/* Rota de Relatórios */}
          <Route 
            path="/relatorios" 
            element={
              <ProtectedRoute>
                <Reports />
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
          
          {/* Rotas de Processos */}
          <Route 
            path="/processos" 
            element={
              <ProtectedRoute>
                <ProcessHierarchy />
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
          
          {/* Rota raiz redireciona para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rota catch-all redireciona para dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default memo(App);
