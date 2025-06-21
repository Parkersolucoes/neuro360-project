
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      console.log('Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createMasterUser = async () => {
    try {
      console.log('Creating master user...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'contato@parkersolucoes.com.br',
        password: 'Parker@2024',
        options: {
          data: {
            name: 'Master User - Parker Soluções'
          }
        }
      });

      if (authError && !authError.message.includes('already registered')) {
        console.error('Error creating auth user:', authError);
        return;
      }

      // If user creation was successful or user already exists
      if (authData?.user?.id) {
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
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('Master user profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error creating master user:', error);
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
    console.log('Attempting login for:', email);
    
    if (email === 'contato@parkersolucoes.com.br') {
      await createMasterUser();
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
    } else {
      console.error('Login error:', error);
    }

    return { error };
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
