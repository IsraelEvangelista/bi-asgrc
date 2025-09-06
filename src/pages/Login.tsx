import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { RegisterFormData } from '../types/user';
import { Eye, EyeOff, LogIn, UserPlus, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

// Estilos CSS para animação personalizada
const customStyles = `
  @keyframes textSweep {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .animate-text-sweep {
    background: linear-gradient(
      90deg,
      #000 0%,
      #000 30%,
      #3b82f6 50%,
      #000 70%,
      #000 100%
    );
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textSweep 3s ease-in-out infinite;
    animation-delay: 2s;
  }
`

// Esquemas de validação
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  area_gerencia_id: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [cogerhTextWidth, setCogerhTextWidth] = useState('120px');
  
  const { 
    user, 
    signupMessage, 
    verificationMessage, 
    setSignupMessage, 
    clearMessages, 
    handleEmailVerification 
  } = useAuthStore();
  const { login, register, isLoading, error, clearError, needsVerification } = useAuth();

  // Formulários
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
      area_gerencia_id: ''
    }
  });

  // Verificar parâmetros de URL para verificação de email
  useEffect(() => {
    const checkEmailVerification = async () => {
      await handleEmailVerification();
    };
    checkEmailVerification();
  }, [handleEmailVerification]);

  // Calcular largura do texto COGERH
  useEffect(() => {
    const calculateTextWidth = () => {
      const textElement = document.getElementById('cogerh-text');
      if (textElement) {
        setCogerhTextWidth(`${textElement.offsetWidth}px`);
      }
    };
    
    // Calcular após um pequeno delay para garantir que o elemento foi renderizado
    const timer = setTimeout(calculateTextWidth, 100);
    
    // Recalcular quando a janela for redimensionada
    window.addEventListener('resize', calculateTextWidth);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateTextWidth);
    };
  }, []);

  // Limpar erros ao trocar de aba
  useEffect(() => {
    clearError();
    loginForm.clearErrors();
    registerForm.clearErrors();
    setSignupSuccess(false);
    setRedirectCountdown(0);
    clearMessages();
  }, [activeTab, clearError, loginForm, registerForm, clearMessages]);

  // Countdown para redirecionamento após cadastro
  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0 && signupSuccess) {
      setActiveTab('login');
      setSignupSuccess(false);
    }
  }, [redirectCountdown, signupSuccess]);

  // Redirecionamento se usuário já estiver logado
  if (user) {
    return <Navigate to="/indicadores" replace />;
  }

  const handleLogin = async (data: LoginFormData) => {
    const success = await login(data.email, data.password);
    if (!success && error) {
      toast.error(error);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    const response = await register({
      nome: data.nome,
      email: data.email,
      password: data.password,
      area_gerencia_id: data.area_gerencia_id
    });

    if (response.error) {
      toast.error(response.error);
    } else if (response.needsEmailVerification) {
      setSignupMessage(`E-mail de verificação enviado para ${data.email}. Verifique sua caixa de entrada.`);
      setSignupSuccess(true);
      setRedirectCountdown(5);
      registerForm.reset();
      toast.success('Conta criada com sucesso! Verifique seu e-mail para ativar a conta.');
    } else {
      toast.success('Conta criada e ativada com sucesso!');
      setActiveTab('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex relative overflow-hidden">
      <style>{customStyles}</style>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-indigo-400/15 rounded-lg rotate-45 animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-cyan-400/10 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full p-8">
            {Array.from({length: 48}).map((_, i) => (
              <div 
                key={i} 
                className="border border-blue-300/20 rounded animate-pulse" 
                style={{animationDelay: `${i * 0.1}s`, animationDuration: '2s'}}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Floating data visualization elements */}
        <div className="absolute top-1/4 right-1/3 opacity-20">
          <div className="flex space-x-1">
            {Array.from({length: 8}).map((_, i) => (
              <div 
                key={i}
                className="w-2 bg-blue-400 rounded-t animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 20}px`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Risk assessment icons */}
        <div className="absolute bottom-1/3 right-1/4 opacity-15">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({length: 9}).map((_, i) => (
              <div 
                key={i}
                className="w-4 h-4 border border-blue-300 rounded animate-spin"
                style={{animationDuration: `${3 + i * 0.5}s`}}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-800/30 to-transparent"></div>
      </div>
      
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 lg:p-8 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100/50 w-full max-w-md p-6 lg:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 gap-0 space-x-0">
            {/* Logo da gota d'água */}
            <img
              src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756835962585.png"
              alt="Logo COGERH"
              className="h-16 w-auto flex-shrink-0"
            />
            {/* Container com nome COGERH e imagem em coluna */}
            <div className="flex flex-col items-center gap-0 -ml-1">
              {/* Nome COGERH com animação */}
              <div className="relative">
                <h2 className="text-2xl font-bold animate-text-sweep relative overflow-hidden" id="cogerh-text">COGERH</h2>
              </div>
              {/* Nova imagem com largura igual ao nome COGERH */}
               <img
                 src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756850641546.png"
                 alt="Onda COGERH"
                 className="h-10 object-fill -mt-3"
                 style={{
                   width: cogerhTextWidth
                 }}
               />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{
            color: '#1e40af'
          }}>BI ASGRC</h1>
          <p className="text-blue-600 font-medium">
            Sistema de Gestão de Riscos e Compliance
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de verificação de email */}
        {verificationMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700 text-sm font-medium">
                {verificationMessage}
              </p>
            </div>
          </div>
        )}

        {/* Mensagem de sucesso do cadastro */}
        {signupSuccess && signupMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Mail className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-blue-700 text-sm font-medium">
                {signupMessage}
              </p>
            </div>
            {redirectCountdown > 0 && (
              <p className="text-blue-600 text-xs mt-2">
                Redirecionando para login em {redirectCountdown} segundos...
              </p>
            )}
          </div>
        )}

        {/* Mensagem de verificação necessária */}
        {needsVerification && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-yellow-700 text-sm font-medium">
                  Verificação de e-mail necessária
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  Verifique sua caixa de entrada e clique no link de verificação para ativar sua conta.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Abas */}
        <div className="flex mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-1 border border-blue-100">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
            }`}
          >
            <LogIn className="h-4 w-4 inline mr-2" />
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Cadastro
          </button>
        </div>

        {/* Formulário de Login */}
        {activeTab === 'login' && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                {...loginForm.register('email')}
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl shadow-sm placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/30 hover:bg-blue-50/50"
                placeholder="seu@email.com"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  {...loginForm.register('password')}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl shadow-sm placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/30 hover:bg-blue-50/50 pr-12"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-blue-500/25 items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Entrar
                </>
              )}
            </button>
          </form>
        )}

        {/* Formulário de Cadastro */}
        {activeTab === 'register' && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
            <div>
              <label htmlFor="register-nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                id="register-nome"
                type="text"
                {...registerForm.register('nome')}
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl shadow-sm placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/30 hover:bg-blue-50/50"
                placeholder="Seu nome completo"
              />
              {registerForm.formState.errors.nome && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                id="register-email"
                type="email"
                {...registerForm.register('email')}
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl shadow-sm placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/30 hover:bg-blue-50/50"
                placeholder="seu@email.com"
                />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  {...registerForm.register('password')}
                  className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl shadow-sm placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50/30 hover:bg-blue-50/50 pr-12"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerForm.register('confirmPassword')}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || signupSuccess}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-blue-500/25 items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Criando conta...
                </>
              ) : signupSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Conta criada!
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Criar Conta
                </>
              )}
            </button>
          </form>
        )}

        {/* Informações adicionais */}
        {activeTab === 'login' && (
          <div className="mt-6 text-center text-sm text-gray-600">

          </div>
        )}

        {activeTab === 'register' && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Após o cadastro, você receberá um e-mail de verificação.</p>
            <p className="mt-1">Verifique sua caixa de entrada para ativar a conta.</p>
          </div>
        )}
        </div>
      </div>
      
      {/* Right side - Hero Content */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 items-center justify-center p-12 relative z-10">
        <div className="text-center text-white max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500/20 rounded-full mb-6 animate-pulse">
              <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Gestão por Processos com Foco em Riscos</h1>
            <h2 className="text-3xl font-semibold mb-6 text-blue-200">Assessoria de Governança, Riscos e Conformidade - ASGRC</h2>
          </div>
          
          <div className="space-y-6 text-lg text-blue-100">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>Conceitos</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>Processos</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Riscos</span>
              </div>
            </div>
          </div>
          
          {/* Risk metrics visualization */}
          <div className="mt-12 grid grid-cols-3 gap-6">

          </div>
          
          {/* Animated risk assessment chart */}
          <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-blue-300/20">
            <div className="text-sm text-blue-300 mb-4">Níveis de Risco - Tempo Real</div>
            <div className="flex items-end justify-center space-x-2 h-16">
              {Array.from({length: 12}).map((_, i) => (
                <div 
                  key={i}
                  className="bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t animate-pulse"
                  style={{
                    width: '8px',
                    height: `${Math.random() * 50 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;