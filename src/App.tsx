import { useEffect, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RiskList from './pages/RiskList';
import RiskDetail from './pages/RiskDetail';
import RiskFormPage from './pages/RiskFormPage';
import { ProfileManagement } from './pages/ProfileManagement';
import { UserManagement } from './pages/UserManagement';
import Reports from './pages/Reports';
import Indicators from './pages/Indicators';
import IndicatorDetails from './pages/IndicatorDetails';
import CreateIndicator from './pages/CreateIndicator';
import EditIndicator from './pages/EditIndicator';
import Actions from './pages/Actions';
import ActionDetails from './pages/ActionDetails';
import CreateAction from './pages/CreateAction';
import EditAction from './pages/EditAction';

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
  }, []); // Removida dependência 'initialize' para evitar loops infinitos

  return (
    <Router>
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
      </Router>
  );
}

export default memo(App);
