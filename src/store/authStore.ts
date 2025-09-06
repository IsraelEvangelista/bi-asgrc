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
  loadUserProfile: () => Promise<void>;
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
      console.log('🔐 signIn: Iniciando processo de login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 signIn: Resposta do Supabase:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        error: error?.message
      });

      if (error) {
        console.error('❌ signIn: Erro de autenticação:', error);
        return { error };
      }

      if (data.user && data.session) {
        console.log('✅ signIn: Login bem-sucedido, atualizando estado...');
        set({ user: data.user, session: data.session });
        
        console.log('👤 signIn: Carregando perfil do usuário...');
        // Load user profile after successful login
        await get().loadUserProfile();
        console.log('✅ signIn: Processo de login concluído com sucesso');
      } else {
        console.warn('⚠️ signIn: Login sem dados de usuário ou sessão');
      }

      return { error };
    } catch (err) {
      console.error('💥 signIn: Erro inesperado durante o login:', err);
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
      console.error('Erro no signUp:', error);
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
    
    // Prevent multiple concurrent initializations
    if (state.initializationPromise) {
      console.log('⏳ initialize: Aguardando inicialização em progresso...');
      return state.initializationPromise;
    }
    
    if (state.isInitializing) {
      console.log('⏳ initialize: Inicialização já em progresso, abortando...');
      return;
    }
    
    console.log('🚀 initialize: Iniciando processo de inicialização...');
    
    const initPromise = (async () => {
      try {
        set({ isInitializing: true, loading: true, error: null, authCheckCompleted: false });
        
        console.log('🔍 initialize: Obtendo sessão atual...');
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ initialize: Erro ao obter sessão:', sessionError);
          set({ 
            error: sessionError.message, 
            loading: false, 
            isInitializing: false,
            authCheckCompleted: true,
            isFullyInitialized: true
          });
          return;
        }

        console.log('🔍 initialize: Estado da sessão:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        });

        if (session?.user) {
          console.log('👤 initialize: Usuário encontrado, carregando perfil...');
          set({ 
            user: session.user, 
            session,
            loading: true // Keep loading while we fetch profile
          });
          
          // Load user profile and wait for completion
          await get().loadUserProfile();
        } else {
          console.log('🚫 initialize: Nenhum usuário encontrado, finalizando inicialização...');
          set({ 
            user: null, 
            session: null, 
            userProfile: null,
            profile: null,
            permissions: null,
            loading: false,
            authCheckCompleted: true,
            isFullyInitialized: true,
            isInitializing: false
          });
        }

        // Set up auth state change listener (only once)
        if (!authListenerSetup) {
          // Cleanup any existing subscription first
          if (authSubscription) {
            authSubscription.data.subscription.unsubscribe();
          }
          
          authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentState = get();
            
            // Evita processamento durante inicialização para prevenir loops
            if (currentState.isInitializing) {
              return;
            }
            
            if (event === 'SIGNED_IN' && session?.user) {
              // Prevent concurrent profile loading
              if (!currentState.isLoadingProfile) {
                set({ 
                  user: session.user, 
                  session,
                  loading: true,
                  isFullyInitialized: false
                });
                await get().loadUserProfile();
              }
            } else if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                session: null, 
                userProfile: null,
                profile: null,
                permissions: null,
                loading: false,
                error: null,
                authCheckCompleted: true,
                isFullyInitialized: true
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              // Only reload profile if it's a different user or we're not fully initialized
              const currentUser = get().user;
              const { isFullyInitialized: currentlyInitialized } = currentState;
              
              if (!currentUser || currentUser.id !== session.user.id) {
                // Different user - need to reload profile
                if (!currentState.isLoadingProfile) {
                  set({ 
                    user: session.user, 
                    session,
                    loading: true,
                    isFullyInitialized: false
                  });
                  await get().loadUserProfile();
                }
              } else if (!currentlyInitialized) {
                // Same user but not yet initialized - complete initialization
                if (!currentState.isLoadingProfile) {
                  set({ 
                    user: session.user, 
                    session,
                    loading: true
                  });
                  await get().loadUserProfile();
                }
              } else {
                // Same user and already initialized - just update the session without resetting state
                console.log('🔄 Token refreshed for same user - updating session only');
                set({ session });
              }
            }
          });
          authListenerSetup = true;
        }
      } catch (error) {
        console.error('❌ initialize: Erro durante inicialização:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          isInitializing: false,
          loading: false,
          authCheckCompleted: true,
          isFullyInitialized: true
        });
      } finally {
        console.log('🏁 initialize: Limpando promise e finalizando...');
        set({ 
          initializationPromise: null,
          isInitializing: false 
        });
        console.log('🎯 initialize: Processo completo!');
      }
    })();
    
    set({ initializationPromise: initPromise });
    return initPromise;
  },

  loadUserProfile: async () => {
    const state = get();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 loadUserProfile: Iniciando carregamento', {
        hasUser: !!state.user,
        userId: state.user?.id,
        isLoadingProfile: state.isLoadingProfile
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
    
    // Prevent concurrent loading
    if (state.isLoadingProfile) {
      console.log('⏳ loadUserProfile: Carregamento já em progresso, abortando');
      return;
    }

    console.log('🔍 loadUserProfile: Iniciando carregamento do perfil para usuário:', state.user.id);
    set({ 
      isLoadingProfile: true,
      loading: true, 
      error: null 
    });

    try {
      console.log('🔍 loadUserProfile: Buscando usuário por email:', state.user.email);
      console.log('🔍 loadUserProfile: ID do usuário logado:', state.user.id);
      
      const { data, error } = await supabase
        .from('002_usuarios')
        .select(`
          *,
          perfil:001_perfis(*),
          area_gerencia:003_areas_gerencias(*)
        `)
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

      // Extract profile and permissions from the loaded data
        const profile = data.perfil;
        const permissions = profile ? {
          admin: profile.nome === 'Administrador',
          all: profile.acessos_interfaces?.includes('*') || false,
          // Add other permission mappings as needed
        } : { admin: false, all: false };

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ loadUserProfile: Perfil carregado com sucesso:', {
            profileId: data?.id,
            permissionsCount: permissions ? Object.keys(permissions).length : 0
          });
        }

      set({ 
        userProfile: data,
        profile: profile,
        permissions: permissions,
        loading: false,
        isLoadingProfile: false,
        authCheckCompleted: true,
        isFullyInitialized: true,
        isInitializing: false,
        error: null
      });
      
      console.log('🎉 loadUserProfile: Inicialização completa!');
    } catch (error: any) {
      console.error('❌ loadUserProfile: Erro ao carregar perfil:', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        userId: state.user?.id,
        timestamp: new Date().toISOString()
      });
      
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
      
      console.log('⚠️ loadUserProfile: Perfil básico criado como fallback após erro');
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