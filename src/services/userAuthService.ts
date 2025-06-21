
import { supabase } from '@/integrations/supabase/client';

export interface UserLoginData {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin: boolean;
  is_master: boolean;
  status: string;
}

export class UserAuthService {
  static async validateUserCredentials(email: string, password: string): Promise<UserLoginData | null> {
    try {
      console.log('Validating user credentials for email:', email);
      
      // Chama a função SQL que valida a senha criptografada
      const { data, error } = await supabase.rpc('validate_user_password', {
        user_email: email,
        user_password: password
      });

      if (error) {
        console.error('Error validating user credentials:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No user found with provided credentials');
        return null;
      }

      const user = data[0];
      console.log('User found:', user);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        is_master: user.is_master,
        status: user.status
      };
    } catch (error) {
      console.error('Unexpected error in validateUserCredentials:', error);
      return null;
    }
  }
}
