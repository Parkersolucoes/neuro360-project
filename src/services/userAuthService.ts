
import { supabase } from '@/integrations/supabase/client';

export interface UserLoginData {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin: string; // Agora é string: '0' = master, '1' = usuário comum
  is_master: boolean; // Calculado pela função SQL
  status: string;
}

export class UserAuthService {
  static async validateUserCredentials(email: string, password: string): Promise<UserLoginData | null> {
    try {
      console.log('UserAuthService: Validating user credentials for email:', email);
      
      // Chama a função SQL que valida a senha criptografada
      const { data, error } = await supabase.rpc('validate_user_password', {
        user_email: email,
        user_password: password
      });

      if (error) {
        console.error('UserAuthService: Error validating user credentials:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('UserAuthService: No user found with provided credentials');
        return null;
      }

      const user = data[0];
      console.log('UserAuthService: User found and validated:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        is_master: user.is_master,
        status: user.status
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin, // String do banco
        is_master: user.is_master, // Boolean calculado pela função SQL
        status: user.status
      };
    } catch (error) {
      console.error('UserAuthService: Unexpected error in validateUserCredentials:', error);
      return null;
    }
  }

  static async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log('UserAuthService: Testing database connection...');
      
      // Testa uma consulta simples para verificar se o banco está acessível
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        console.error('UserAuthService: Database connection test failed:', error);
        return false;
      }

      console.log('UserAuthService: Database connection test successful');
      return true;
    } catch (error) {
      console.error('UserAuthService: Database connection test error:', error);
      return false;
    }
  }
}
