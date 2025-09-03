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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: loginError } = await signIn(email, password);
      
      if (loginError) {
        setError(loginError.message || 'Erro ao fazer login');
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<RegisterResponse> => {
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
  };

  const logout = async (): Promise<void> => {
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
  };

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