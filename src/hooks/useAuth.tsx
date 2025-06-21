
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserLogin {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin: string;
  is_master: boolean;
  status: string;
}

interface AuthContextType {
  userLogin: UserLogin | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userLogin, setUserLogin] = useState<UserLogin | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.rpc('validate_user_password', {
        user_email: email,
        user_password: password
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Erro de autenticação' };
      }

      if (!data || data.length === 0) {
        console.log('No user found or invalid credentials');
        return { success: false, error: 'Email ou senha incorretos' };
      }

      const user = data[0];
      console.log('Login successful for user:', user);
      
      setUserLogin(user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.name}!`
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const logout = async () => {
    setUserLogin(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
  };

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('userLogin');
    if (savedUser) {
      try {
        setUserLogin(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('userLogin');
      }
    }
    setLoading(false);
  }, []);

  // Salvar usuário no localStorage quando mudar
  useEffect(() => {
    if (userLogin) {
      localStorage.setItem('userLogin', JSON.stringify(userLogin));
    } else {
      localStorage.removeItem('userLogin');
    }
  }, [userLogin]);

  return (
    <AuthContext.Provider value={{
      userLogin,
      login,
      logout,
      loading
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
