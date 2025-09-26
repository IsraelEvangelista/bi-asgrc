import { create } from 'zustand';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, PermissionRules, ADMIN_PROFILE_NAME } from '../types/profile';
import { User, UserProfile, RegisterData, RegisterResponse } from '../types/user';

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  userProfile: UserProfile | null;
  profile: Profile | null;
  permissions: PermissionRules | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  infoMessage: string | null;
  needsVerification: boolean;
  signupMessage: string | null;
  verificationMessage: string | null;
  // Internal state flags
  isInitializing: boolean;
  isLoadingProfile: boolean;
  // Enhanced loading states
  isFullyInitialized: boolean;
  authCheckCompleted: boolean;
  
  // Flags para controle do listener de autenticação
  authListenerSetup: boolean;
  authListenerActive: boolean;
  
  // Guards para prevenir execuções múltiplas
  initializationPromise: Promise<void> | null;
  sessionCheckInProgress: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (userData: RegisterData) => Promise<RegisterResponse>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  loadUserProfile: (retryCount?: number) => Promise<void>;
  activateUser: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Message management functions
  setSignupMessage: (message: string | null) => void;
  setVerificationMessage: (message: string | null) => void;
  clearMessages: () => void;
  handleEmailVerification: () => void;
  // Permission checking functions
  canAccess: (resource: string) => boolean;
  canPerform: (action: string, resource?: string) => boolean;
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

// Flag to track if auth listener is already set up
let authListenerSetup = false;
let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  userProfile: null,
  profile: null,
  permissions: null,
  loading: false,
  error: null,
  successMessage: null,
  infoMessage: null,
  needsVerification: false,
  signupMessage: null,
  verificationMessage: null,
  // Internal state flags
  isInitializing: false,
  isLoadingProfile: false,
  // Enhanced loading states
  isFullyInitialized: false,
  authCheckCompleted: false,
  
  // Flags para controle do listener de autenticação
  authListenerSetup: false,
  authListenerActive: false,
  
  // Guards para prevenir execuções múltiplas
  initializationPromise: null as Promise<void> | null,
  sessionCheckInProgress: false,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user && data.session) {
        set({ user: data.user, session: data.session });
        await get().loadUserProfile();
      }

      return { error };
    } catch (err) {
      return { error: new Error('Erro interno durante o login') };
    }
  },

  signUp: async (userData: RegisterData): Promise<RegisterResponse> => {
    try {
      // 1. Verificar se o email já existe na tabela de usuários
      const { data: existingUser } = await supabase
        .from('002_usuarios')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return {
          error: 'Este e-mail já está cadastrado no sistema.'
        };
      }

      // 2. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      if (authError) {
        return {
          error: authError.message || 'Erro ao criar conta de usuário.'
        };
      }

      // 3. Se o usuário foi criado com sucesso, inserir na tabela 002_usuarios
      if (authData.user) {
        // Buscar perfil padrão (assumindo que existe um perfil "Usuário" ou similar)
        const { data: defaultProfile } = await supabase
          .from('001_perfis')
          .select('id')
          .eq('nome', 'Usuário')
          .single();

        const { error: insertError } = await supabase
          .from('002_usuarios')
          .insert({
            nome: userData.nome,
            email: userData.email,
            perfil_id: defaultProfile?.id || null,
            area_gerencia_id: userData.area_gerencia_id || null,
            ativo: false // Usuário inativo até verificar email
          });

        if (insertError) {
          // Se falhar ao inserir na tabela, tentar remover o usuário do Auth
          await supabase.auth.admin.deleteUser(authData.user.id);
          return {
            error: 'Erro ao salvar dados do usuário. Tente novamente.'
          };
        }

        // Convert Supabase User to our User type
        const customUser: User = {
          id: authData.user.id,
          nome: authData.user.user_metadata?.nome || '',
          email: authData.user.email || '',
          ativo: true
        };

        return {
          user: customUser,
          needsEmailVerification: !authData.session // Se não há sessão, precisa verificar email
        };
      }

      return {
        error: 'Erro inesperado ao criar usuário.'
      };
    } catch (error) {
      return {
        error: 'Erro interno do sistema. Tente novamente mais tarde.'
      };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ 
      user: null, 
      session: null, 
      userProfile: null, 
      profile: null, 
      permissions: null,
      needsVerification: false,
      loading: false
    });
  },

  initialize: async () => {
    const state = get();
    
    // Debug logs removed for production
    
    // Prevent concurrent initializations with better guard
    if (state.isInitializing || state.isFullyInitialized) {
      console.log('🔄 AuthStore: Inicialização já em andamento ou concluída, ignorando...');
      return;
    }
    
    set({ isInitializing: true, loading: true, error: null });
    console.log('🔄 AuthStore: Iniciando inicialização...');
    
    try {
      // Get current session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 10000)
      );
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as { data: { session: import('@supabase/supabase-js').Session | null }, error: import('@supabase/supabase-js').AuthError | null };
      
      if (sessionError) {
        console.error('❌ AuthStore: Erro ao obter sessão:', sessionError);
        throw sessionError;
      }
      
      console.log('🔍 AuthStore: Sessão obtida:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      });
      
      if (session?.user) {
        // Set user first
        set({ user: session.user });
        
        // Load user profile with error handling
        try {
          await get().loadUserProfile();
        } catch (profileError) {
          console.error('❌ AuthStore: Erro ao carregar perfil, continuando com perfil básico:', profileError);
          // Continue with basic profile instead of failing completely
        }
      } else {
        // No session, clear everything
        set({
          user: null,
          userProfile: null,
          profile: null,
          permissions: null,
          authCheckCompleted: true,
          isFullyInitialized: true,
          loading: false,
          isLoadingProfile: false
        });
      }
      
      // Setup auth state change listener only once with better guard
      if (!authListenerSetup && !authSubscription) {
        console.log('🔄 AuthStore: Configurando listener de mudanças de auth...');
        
        authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 AuthStore: Auth state change:', event, {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id ? '[MASKED]' : null
          });
          
          // Prevent processing during initialization
          const currentState = get();
          if (currentState.isInitializing) {
            console.log('🔄 AuthStore: Ignorando mudança de auth durante inicialização');
            return;
          }
          
          // Handle different auth events
          if (event === 'INITIAL_SESSION') {
            // Initial session - don't process as it's already handled in initialize()
            console.log('🔄 AuthStore: INITIAL_SESSION detectado, ignorando processamento');
            return;
          } else if (event === 'SIGNED_IN' && session?.user) {
            console.log('🔄 AuthStore: SIGNED_IN detectado, carregando perfil');
            set({ user: session.user, loading: true });
            try {
              await get().loadUserProfile();
              
              // Login detectado - deixar o roteamento natural do React Router lidar com o redirecionamento
              console.log('✅ AuthStore: Login detectado, estado atualizado');
            } catch (error) {
              console.error('❌ AuthStore: Erro ao carregar perfil após login:', error);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🔄 AuthStore: SIGNED_OUT detectado, limpando estado');
            set({
              user: null,
              userProfile: null,
              profile: null,
              permissions: null,
              authCheckCompleted: true,
              isFullyInitialized: true,
              loading: false,
              isLoadingProfile: false,
              error: null
            });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 AuthStore: TOKEN_REFRESHED detectado, mantendo estado atual');
            // Token refreshed - no action needed, just log
          }
        });
        
        authListenerSetup = true;
      }
      
      console.log('✅ AuthStore: Inicialização concluída com sucesso');
    } catch (error) {
      console.error('❌ AuthStore: Erro na inicialização:', error);
      set({
        error: error instanceof Error ? error.message : 'Erro na inicialização',
        authCheckCompleted: true,
        isFullyInitialized: false,
        loading: false,
        isLoadingProfile: false
      });
    } finally {
      set({ isInitializing: false });
    }
  },

  loadUserProfile: async (retryCount = 0) => {
    const state = get();
    const maxRetries = 3;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 loadUserProfile: Iniciando carregamento', {
        hasUser: !!state.user,
        userId: state.user?.id ? '[MASKED]' : null,
        isLoadingProfile: state.isLoadingProfile,
        retryCount
      });
    }
    
    if (!state.user) {
      console.log('🚫 loadUserProfile: Nenhum usuário logado, abortando');
      set({ 
        loading: false, 
        authCheckCompleted: true, 
        isFullyInitialized: true,
        isInitializing: false,
        isLoadingProfile: false
      });
      return;
    }
    
    // Prevent concurrent loading with better guard
    if (state.isLoadingProfile && retryCount === 0) {
      console.log('⏳ loadUserProfile: Carregamento já em progresso, ignorando...');
      return;
    }
    
    // Se já está totalmente inicializado, não recarregar
    if (state.isFullyInitialized && retryCount === 0) {
      console.log('✅ loadUserProfile: Perfil já carregado, ignorando...');
      return;
    }

    console.log('🔍 loadUserProfile: Iniciando carregamento do perfil para usuário:', state.user.id);
    set({ 
      isLoadingProfile: true,
      loading: true, 
      error: null 
    });

    try {
      console.log('🔍 loadUserProfile: Buscando usuário por email: [MASKED]');
      console.log('🔍 loadUserProfile: ID do usuário logado: [MASKED]');
      
      // Buscar perfil do usuário sem joins para evitar recursão RLS
      const { data, error } = await supabase
        .from('002_usuarios')
        .select('*')
        .eq('email', state.user.email)
        .single();

      if (error) {
        console.error('❌ loadUserProfile: Erro ao buscar perfil:', error);
        
        // Se o erro for PGRST116 (0 rows), significa que o usuário não existe na tabela
        if (error.code === 'PGRST116') {
          console.log('⚠️ loadUserProfile: Usuário não encontrado na tabela 002_usuarios, criando perfil básico');
          
          // Criar um perfil básico temporário para evitar tela branca
          const basicProfile = {
            id: state.user.id,
            nome: state.user.user_metadata?.nome || state.user.email?.split('@')[0] || 'Usuário',
            email: state.user.email || '',
            ativo: true,
            perfil_id: null,
            area_gerencia_id: null,
            perfil: null,
            area_gerencia: null
          };
          
          set({ 
            userProfile: basicProfile,
            profile: null,
            permissions: { admin: false, all: false },
            loading: false,
            isLoadingProfile: false,
            authCheckCompleted: true,
            isFullyInitialized: true,
            isInitializing: false,
            error: null
          });
          
          console.log('✅ loadUserProfile: Perfil básico criado temporariamente');
          
          // Perfil básico criado - deixar o roteamento natural lidar com a navegação
          console.log('✅ AuthStore: Perfil básico criado');
          
          return;
        }
        
        throw error;
      }

      if (!data) {
        console.log('⚠️ loadUserProfile: Nenhum perfil encontrado para o usuário');
        
        // Criar perfil básico como fallback
        const basicProfile = {
          id: state.user.id,
          nome: state.user.user_metadata?.nome || state.user.email?.split('@')[0] || 'Usuário',
          email: state.user.email || '',
          ativo: true,
          perfil_id: null,
          area_gerencia_id: null,
          perfil: null,
          area_gerencia: null
        };
        
        set({ 
          userProfile: basicProfile,
          profile: null,
          permissions: { admin: false, all: false },
          loading: false,
          isLoadingProfile: false,
          authCheckCompleted: true,
          isFullyInitialized: true,
          isInitializing: false,
          error: null
        });
        return;
      }

      // Como não temos mais joins, vamos buscar o perfil separadamente se necessário
        // Por enquanto, criar permissões básicas baseadas nos dados do usuário
        const permissions = {
          admin: false, // Será definido posteriormente quando buscarmos o perfil
          all: false
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ loadUserProfile: Perfil carregado com sucesso:', {
            profileId: data?.id,
            permissionsCount: permissions ? Object.keys(permissions).length : 0
          });
        }

      // Final check to prevent race conditions
      const currentState = get();
      if (!currentState.isLoadingProfile) {
        console.log('⚠️ loadUserProfile: Estado mudou durante carregamento, ignorando resultado');
        return;
      }

      set({ 
        userProfile: data,
        profile: null, // Será carregado separadamente se necessário
        permissions: permissions,
        loading: false,
        isLoadingProfile: false,
        authCheckCompleted: true,
        isFullyInitialized: true,
        isInitializing: false,
        error: null
      });
      
      console.log('🎉 loadUserProfile: Inicialização completa!');
    } catch (error: unknown) {
      console.error('❌ loadUserProfile: Erro ao carregar perfil:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        userId: state.user?.id,
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      // Tentar novamente se ainda há tentativas disponíveis
      if (retryCount < maxRetries) {
        console.log(`🔄 loadUserProfile: Tentativa ${retryCount + 1}/${maxRetries + 1} em 2 segundos...`);
        
        setTimeout(() => {
          const currentState = get();
          if (currentState.isLoadingProfile) {
            get().loadUserProfile(retryCount + 1);
          }
        }, 2000);
        return;
      }
      
      // Todas as tentativas falharam, criar perfil básico como fallback
      console.log('❌ loadUserProfile: Todas as tentativas falharam, criando perfil básico');
      
      // Only update state if we're still in loading state
      const currentState = get();
      if (currentState.isLoadingProfile) {
        // Criar perfil básico como fallback para evitar tela branca
        const basicProfile = {
          id: state.user?.id || '',
          nome: state.user?.user_metadata?.nome || state.user?.email?.split('@')[0] || 'Usuário',
          email: state.user?.email || '',
          ativo: true,
          perfil_id: null,
          area_gerencia_id: null,
          perfil: null,
          area_gerencia: null
        };
        
        set({ 
          userProfile: basicProfile,
          profile: null,
          permissions: { admin: false, all: false },
          loading: false,
          isLoadingProfile: false,
          authCheckCompleted: true,
          isFullyInitialized: true,
          isInitializing: false,
          error: null // Não definir erro para evitar tela branca
        });
        
        console.log('⚠️ loadUserProfile: Perfil básico criado como fallback após todas as tentativas falharem');
      }
    }
  },

  activateUser: async (userEmail?: string) => {
    const { user } = get();
    const email = userEmail || user?.email;
    
    if (!email) {
      return { success: false, error: 'No email provided' };
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('002_usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { success: false, error: checkError.message };
      }

      if (existingUser) {
        // User exists, just activate them
        const { error: updateError } = await supabase
          .from('002_usuarios')
          .update({ ativo: true })
          .eq('email', email);

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        // Don't reload user profile to avoid infinite loop
        // The profile will be loaded on next auth state change
        return { success: true };
      } else {
        // User doesn't exist, create them
        const { error: insertError } = await supabase
          .from('002_usuarios')
          .insert({
            email: email,
            nome: user?.user_metadata?.full_name || email.split('@')[0],
            ativo: true,
            perfil_id: null // No default profile - will be assigned by admin
          });

        if (insertError) {
          return { success: false, error: insertError.message };
        }

        // Don't reload user profile to avoid infinite loop
        // The profile will be loaded on next auth state change
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Message management functions
  setSignupMessage: (message: string | null) => {
    set({ signupMessage: message });
  },

  setVerificationMessage: (message: string | null) => {
    set({ verificationMessage: message });
  },

  clearMessages: () => {
    set({ signupMessage: null, verificationMessage: null });
  },

  handleEmailVerification: async () => {
    // Check URL parameters for email verification
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const error = urlParams.get('error');
    
    if (verified === 'true') {
      const { user, activateUser } = get();
      
      // If user is logged in, activate their account
      if (user?.email) {
        const result = await activateUser(user.email);
        if (result.success) {
          set({ verificationMessage: 'E-mail verificado com sucesso! Sua conta foi ativada.' });
          // Force a page reload to refresh the authentication state
          window.location.reload();
        } else {
          set({ verificationMessage: 'E-mail verificado, mas houve um erro ao ativar a conta. Tente fazer login novamente.' });
        }
      } else {
        set({ verificationMessage: 'E-mail verificado com sucesso! Você já pode fazer login.' });
      }
      
      // Clean URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      set({ verificationMessage: 'Erro na verificação do e-mail. Tente novamente.' });
      // Clean URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  },

  // Permission checking functions
  canAccess: (resource: string) => {
    const { profile, permissions } = get();
    if (!profile || !permissions) return false;
    
    // Admin has access to everything
    if (permissions.admin || permissions.all) return true;
    
    // Check if resource is in allowed interfaces
    if (profile.acessos_interfaces.includes('*') || 
        profile.acessos_interfaces.includes(resource)) {
      return true;
    }
    
    return false;
  },

  canPerform: (action: string, resource?: string) => {
    const { permissions } = get();
    if (!permissions) return false;
    
    // Admin can perform any action
    if (permissions.admin || permissions.all) return true;
    
    // Check general permissions
    if (permissions[action as keyof PermissionRules]) return true;
    
    // Check resource-specific permissions
    if (resource && permissions[resource as keyof PermissionRules]) {
      const resourcePerms = permissions[resource as keyof PermissionRules] as Record<string, boolean>;
      if (resourcePerms && typeof resourcePerms === 'object') {
        return resourcePerms[action] === true;
      }
    }
    
    return false;
  },

  isAdmin: () => {
    const { profile, permissions } = get();
    return profile?.nome === ADMIN_PROFILE_NAME || 
           permissions?.admin === true || 
           permissions?.all === true;
  },

  hasPermission: (permission: string) => {
    const { permissions } = get();
    if (!permissions) return false;
    
    // Admin has all permissions
    if (permissions.admin || permissions.all) return true;
    
    // Check specific permission
    return permissions[permission as keyof PermissionRules] === true;
  },

  // Função para cleanup das subscrições
  cleanup: () => {
    if (authSubscription) {
      authSubscription.data.subscription.unsubscribe();
      authSubscription = null;
      authListenerSetup = false;
    }
  }
}));