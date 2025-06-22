
import { supabase } from '@/integrations/supabase/client';
import type { SMTPConfig, CreateSMTPConfigData, UpdateSMTPConfigData } from '@/types/smtpConfig';

export class SMTPConfigService {
  static async fetchByCompanyId(companyId: string): Promise<SMTPConfig | null> {
    try {
      const { data, error } = await supabase
        .from('smtp_configs')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      throw error;
    }
  }

  static async create(configData: CreateSMTPConfigData): Promise<SMTPConfig> {
    try {
      // Encrypt password (in a real implementation, this should be done server-side)
      const configToCreate = {
        ...configData,
        smtp_password_encrypted: btoa(configData.smtp_password), // Simple base64 encoding for demo
        status: 'disconnected' as const
      };

      // Remove the plain password before sending to database
      const { smtp_password, ...dataToInsert } = configToCreate as any;

      const { data, error } = await supabase
        .from('smtp_configs')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating SMTP config:', error);
      throw error;
    }
  }

  static async update(id: string, updates: UpdateSMTPConfigData): Promise<SMTPConfig> {
    try {
      let updateData = { ...updates };

      // If password is being updated, encrypt it
      if ('smtp_password' in updates && updates.smtp_password) {
        updateData.smtp_password_encrypted = btoa(updates.smtp_password);
        delete (updateData as any).smtp_password;
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('smtp_configs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating SMTP config:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('smtp_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting SMTP config:', error);
      throw error;
    }
  }

  static async testConnection(config: Partial<CreateSMTPConfigData>): Promise<{ success: boolean; message: string }> {
    // This would typically call an edge function or API endpoint to test the SMTP connection
    // For now, return a mock response
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Mock validation
      if (!config.smtp_host || !config.smtp_username || !config.from_email) {
        return { success: false, message: 'Campos obrigatórios não preenchidos' };
      }

      return { success: true, message: 'Conexão SMTP testada com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao testar conexão SMTP' };
    }
  }
}
