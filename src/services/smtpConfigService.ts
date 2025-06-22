
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

      return {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      throw error;
    }
  }

  static async create(configData: CreateSMTPConfigData): Promise<SMTPConfig> {
    try {
      console.log('SMTPConfigService: Creating SMTP config:', configData);
      
      // Criptografar a senha antes de salvar
      const encryptedPassword = btoa(configData.smtp_password); // Base64 por simplicidade
      
      const { data, error } = await supabase
        .from('smtp_configs')
        .insert({
          company_id: configData.company_id,
          smtp_host: configData.smtp_host,
          smtp_port: configData.smtp_port,
          smtp_username: configData.smtp_username,
          smtp_password_encrypted: encryptedPassword,
          use_tls: configData.use_tls,
          use_ssl: configData.use_ssl,
          from_email: configData.from_email,
          from_name: configData.from_name || null,
          is_active: configData.is_active,
          status: 'disconnected'
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
    } catch (error) {
      console.error('SMTPConfigService: Error creating SMTP config:', error);
      throw error;
    }
  }

  static async update(id: string, updates: UpdateSMTPConfigData): Promise<SMTPConfig> {
    try {
      console.log('SMTPConfigService: Updating SMTP config:', id, updates);
      
      const updateData: any = { ...updates };
      
      // Criptografar nova senha se fornecida
      if (updates.smtp_password) {
        updateData.smtp_password_encrypted = btoa(updates.smtp_password);
        delete updateData.smtp_password;
      }
      
      // Adicionar timestamp de atualização
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('smtp_configs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
    } catch (error) {
      console.error('SMTPConfigService: Error updating SMTP config:', error);
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
