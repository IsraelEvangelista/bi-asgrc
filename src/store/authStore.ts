import { create } from 'zustand';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && data.session) {
      set({ user: data.user, session: data.session });
      // Load user profile after successful login
      await get().loadUserProfile();
    }

    return { error };
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
    const { loading, isInitializing } = get();
    
    // Prevent multiple simultaneous initializations
    if (loading || isInitializing) {

      return;
    }

    set({ isInitializing: true, loading: true, error: null });
    
    try {
  
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        set({ error: sessionError.message, loading: false, isInitializing: false });
        return;
      }

      if (session?.user) {
  
        set({ 
          user: session.user, 
          session,
          loading: true // Keep loading while we fetch profile
        });
        
        // Load user profile
        await get().loadUserProfile();
      } else {
  
        set({ 
          user: null, 
          session: null, 
          userProfile: null,
          profile: null,
          permissions: null,
          loading: false 
        });
      }

      // Set up auth state change listener (only once)
      if (!authListenerSetup) {
    
        supabase.auth.onAuthStateChange(async (event, session) => {
    
          
          if (event === 'SIGNED_IN' && session?.user) {
            set({ 
              user: session.user, 
              session,
              loading: true
            });
            await get().loadUserProfile();
          } else if (event === 'SIGNED_OUT') {
            set({ 
              user: null, 
              session: null, 
              userProfile: null,
              profile: null,
              permissions: null,
              loading: false,
              error: null
            });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            // Only update if it's a different user
            const currentUser = get().user;
            if (!currentUser || currentUser.id !== session.user.id) {
              set({ 
                user: session.user, 
                session,
                loading: true
              });
              await get().loadUserProfile();
            } else {
              // Just update the session
              set({ session });
            }
          }
        });
        authListenerSetup = true;
      }

  
    } catch (error) {
      console.error('Erro durante initialize():', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false 
      });
    } finally {
      set({ isInitializing: false });
    }
  },

  loadUserProfile: async () => {
    const { user, isLoadingProfile } = get();
    

    
    if (!user?.email) {

      set({ loading: false });
      return;
    }

    // Prevent multiple simultaneous profile loads
    if (isLoadingProfile) {

      return;
    }
    
    set({ isLoadingProfile: true });


    try {
  
      // Query user from database
      const { data: userData, error: userError } = await supabase
        .from('002_usuarios')
        .select(`
          *,
          perfil:001_perfis(*)
        `)
        .eq('email', user.email)
        .eq('ativo', true)
        .single();

      if (userError) {
        // If user not found, set loading to false and don't call activateUser to avoid infinite loop
        if (userError.code === 'PGRST116') {
  
          set({ 
            userProfile: null,
            profile: null,
            permissions: null,
            loading: false,
            error: 'Usuário não encontrado ou inativo',
            isLoadingProfile: false
          });
          return;
        }
        
        console.error('Erro ao carregar perfil:', userError);
        throw userError;
      }

      if (!userData) {
  
        set({ 
          userProfile: null,
          profile: null,
          permissions: null,
          loading: false,
          error: 'Usuário não encontrado',
          isLoadingProfile: false
        });
        return;
      }



      // Extract permissions from profile
      const permissions = userData.perfil?.regras_permissoes || {};
      

      
      set({
        userProfile: userData,
        profile: userData.perfil,
        permissions,
        loading: false,
        error: null,
        isLoadingProfile: false
      });
      
  
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user profile',
        isLoadingProfile: false
      });
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
            perfil_id: '00000000-0000-0000-0000-000000000001' // Default profile UUID
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
}));