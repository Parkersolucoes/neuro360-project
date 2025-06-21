
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  is_admin: boolean;
  is_master_user: boolean;
  is_test_user: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (action: 'create' | 'edit' | 'delete') => boolean;
  isMasterUser: () => boolean;
  createMasterUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        console.log('Profile fetched:', data);
        setProfile(data);
      } else {
        console.log('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createMasterUser = async () => {
    try {
      console.log('Creating master user...');
      
      // Primeiro, verifica se o usuário já existe no auth
      console.log('Checking if master user exists in auth...');
      
      // Tenta fazer login primeiro para ver se o usuário existe
      const { data: loginAttempt, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'contato@parkersolucoes.com.br',
        password: 'Parker@2024'
      });

      console.log('Login attempt result:', { loginAttempt, loginError });

      if (loginAttempt?.user && !loginError) {
        console.log('Master user already exists and can login, checking profile...');
        
        // Verifica se tem perfil
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', loginAttempt.user.id)
          .maybeSingle();

        console.log('Profile check result:', { existingProfile, profileError });

        if (!existingProfile && !profileError) {
          console.log('User exists but no profile, creating profile...');
          
          const { error: createProfileError } = await supabase
            .from('profiles')
            .upsert({
              id: loginAttempt.user.id,
              name: 'Master User - Parker Soluções',
              email: 'contato@parkersolucoes.com.br',
              role: 'admin',
              is_admin: true,
              is_master_user: true,
              is_test_user: false
            }, {
              onConflict: 'id'
            });

          if (createProfileError) {
            console.error('Error creating profile for existing user:', createProfileError);
          } else {
            console.log('Profile created for existing user');
          }
        }
        
        // Faz logout após verificação
        await supabase.auth.signOut();
        return;
      }

      // Se chegou aqui, o usuário não existe, então cria
      console.log('Master user does not exist, creating...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'contato@parkersolucoes.com.br',
        password: 'Parker@2024',
        options: {
          data: {
            name: 'Master User - Parker Soluções'
          }
        }
      });

      console.log('SignUp result:', { authData, authError });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('User already registered, this is expected');
        } else {
          console.error('Error creating auth user:', authError);
          return;
        }
      }

      // Garante que o perfil existe
      if (authData?.user?.id) {
        console.log('Creating profile for new user:', authData.user.id);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: 'Master User - Parker Soluções',
            email: 'contato@parkersolucoes.com.br',
            role: 'admin',
            is_admin: true,
            is_master_user: true,
            is_test_user: false
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error creating profile for new user:', profileError);
        } else {
          console.log('Profile created for new user');
        }
      }

    } catch (error) {
      console.error('Unexpected error in createMasterUser:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    if (!error) {
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso! Você pode fazer login agora."
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== INÍCIO DO PROCESSO DE LOGIN ===');
    console.log('Email:', email);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Limpar qualquer sessão anterior
      console.log('Limpando sessão anterior...');
      await supabase.auth.signOut();
      
      // Se for o email master, garante que o usuário master existe
      if (email === 'contato@parkersolucoes.com.br') {
        console.log('Email master detectado, garantindo que usuário existe...');
        await createMasterUser();
      }

      console.log('Tentando login com Supabase...');
      const startTime = Date.now();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      const endTime = Date.now();
      console.log(`Login completado em ${endTime - startTime}ms`);
      console.log('Resposta completa do Supabase:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error('=== ERRO NO LOGIN ===');
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
        console.error('Status do erro:', error.status);
        console.error('Nome do erro:', error.name);
        
        // Mensagens de erro mais específicas
        let errorMessage = "Erro ao fazer login";
        
        switch (error.code) {
          case 'invalid_credentials':
            errorMessage = "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
            break;
          case 'email_not_confirmed':
            errorMessage = "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.";
            break;
          case 'too_many_requests':
            errorMessage = "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.";
            break;
          case 'signup_disabled':
            errorMessage = "Cadastro desabilitado. Entre em contato com o administrador.";
            break;
          default:
            errorMessage = `Erro: ${error.message} (${error.code})`;
        }
        
        console.error('Mensagem de erro para o usuário:', errorMessage);
        return { error: { ...error, userMessage: errorMessage } };
      }

      if (data?.user && data?.session) {
        console.log('=== LOGIN BEM-SUCEDIDO ===');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Session válida:', !!data.session.access_token);
        
        return { error: null };
      } else {
        console.error('=== DADOS INCOMPLETOS ===');
        console.error('User:', !!data?.user);
        console.error('Session:', !!data?.session);
        
        return { 
          error: { 
            message: 'Dados de login incompletos retornados pelo servidor',
            code: 'incomplete_data'
          } 
        };
      }
    } catch (error: any) {
      console.error('=== ERRO INESPERADO ===');
      console.error('Tipo do erro:', typeof error);
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      
      return { 
        error: { 
          message: `Erro inesperado: ${error.message || 'Erro desconhecido'}`,
          code: 'unexpected_error'
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    toast({
      title: "Sucesso",
      description: "Logout realizado com sucesso!"
    });
  };

  const isMasterUser = () => {
    return profile?.is_master_user || false;
  };

  const hasPermission = (action: 'create' | 'edit' | 'delete') => {
    if (!profile) return false;
    
    if (profile.is_master_user) return true;
    if (profile.is_admin) return true;
    
    if (action === 'delete') return false;
    
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      hasPermission,
      isMasterUser,
      createMasterUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
