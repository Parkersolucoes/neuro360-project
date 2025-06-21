
import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UserAuthService, UserLoginData } from '@/services/userAuthService';

interface AuthContextType {
  userLogin: UserLoginData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (action: 'create' | 'edit' | 'delete') => boolean;
  isMasterUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userLogin, setUserLogin] = useState<UserLoginData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há uma sessão salva no localStorage
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserLogin(userData);
      } catch (error) {
        console.error('Erro ao recuperar sessão salva:', error);
        localStorage.removeItem('userSession');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('=== INÍCIO DO PROCESSO DE LOGIN ===');
    console.log('Email:', email);
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Validar as credenciais na tabela users
      console.log('Validando credenciais na tabela users...');
      const userData = await UserAuthService.validateUserCredentials(email, password);
      
      if (userData) {
        console.log('Credenciais válidas na tabela users:', userData);
        setUserLogin(userData);
        
        // Salvar sessão no localStorage
        localStorage.setItem('userSession', JSON.stringify(userData));
        
        console.log('Login realizado com sucesso usando tabela users!');
        return { error: null };
      }
      
      // Se não encontrou credenciais válidas
      console.log('Credenciais inválidas');
      return { 
        error: { 
          message: 'Email ou senha incorretos',
          code: 'invalid_credentials',
          userMessage: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.'
        } 
      };
      
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
    setUserLogin(null);
    localStorage.removeItem('userSession');
    toast({
      title: "Sucesso",
      description: "Logout realizado com sucesso!"
    });
  };

  const isMasterUser = () => {
    return userLogin?.is_master || false;
  };

  const hasPermission = (action: 'create' | 'edit' | 'delete') => {
    if (!userLogin) return false;
    
    const isAdmin = userLogin?.is_admin || false;
    const isMaster = userLogin?.is_master || false;
    
    if (isMaster) return true;
    if (isAdmin) return true;
    
    if (action === 'delete') return false;
    
    return true;
  };

  return (
    <AuthContext.Provider value={{
      userLogin,
      loading,
      signIn,
      signOut,
      hasPermission,
      isMasterUser
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
