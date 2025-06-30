
import { supabase } from '@/integrations/supabase/client';

export class PasswordService {
  static async generateUserPassword(userId: string): Promise<string | null> {
    try {
      console.log('Generating password for user:', userId);
      
      const { data, error } = await supabase.rpc('generate_user_password', {
        user_id: userId
      });

      if (error) {
        console.error('Error generating password:', error);
        throw new Error(`Erro ao gerar senha: ${error.message}`);
      }

      console.log('Password generated successfully');
      return data;
    } catch (error) {
      console.error('Error in generateUserPassword:', error);
      throw error;
    }
  }

  static async setUserPassword(userId: string, password: string): Promise<boolean> {
    try {
      console.log('Setting password for user:', userId);
      
      const { data, error } = await supabase.rpc('set_user_password', {
        user_id: userId,
        new_password: password
      });

      if (error) {
        console.error('Error setting password:', error);
        throw new Error(`Erro ao definir senha: ${error.message}`);
      }

      console.log('Password set successfully');
      return data;
    } catch (error) {
      console.error('Error in setUserPassword:', error);
      throw error;
    }
  }
}
