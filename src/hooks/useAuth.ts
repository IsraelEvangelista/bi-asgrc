import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { RegisterData, RegisterResponse } from '../types/user';

interface UseAuthReturn {
  // Estados
  isLoading: boolean;
  error: string | null;
  needsVerification: boolean;
  
  // Funções de autenticação
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  activateUser: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // Utilitários
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, signOut, activateUser, needsVerification } = useAuthStore();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    console.log('🎯 useAuth.login: Iniciando processo de login para:', email);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎯 useAuth.login: Chamando signIn do authStore...');
      const { error: loginError } = await signIn(email, password);
      
      console.log('🎯 useAuth.login: Resposta do signIn:', {
        hasError: !!loginError,
        errorMessage: loginError?.message
      });
      
      if (loginError) {
        const errorMessage = loginError.message || 'Erro ao fazer login';
        console.error('❌ useAuth.login: Erro de login:', errorMessage);
        setError(errorMessage);
        return false;
      }
      
      console.log('✅ useAuth.login: Login realizado com sucesso');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      console.error('💥 useAuth.login: Erro inesperado:', error);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
      console.log('🎯 useAuth.login: Processo finalizado');
    }
  }, [signIn]);

  const register = useCallback(async (userData: RegisterData): Promise<RegisterResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await signUp(userData);
      
      if (response.error) {
        setError(response.error);
      }
      
      return response;
    } catch {
      const errorMessage = 'Erro interno do sistema';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [signUp]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer logout';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [signOut]);

  return {
    isLoading,
    error,
    needsVerification,
    login,
    register,
    logout,
    activateUser,
    clearError
  };
};