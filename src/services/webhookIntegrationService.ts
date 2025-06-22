
import { supabase } from '@/integrations/supabase/client';
import type { WebhookIntegration, CreateWebhookIntegrationData, UpdateWebhookIntegrationData } from '@/types/webhookIntegration';

export class WebhookIntegrationService {
  static async fetchByCompanyId(companyId: string): Promise<WebhookIntegration | null> {
    console.log('Fetching webhook integration for company:', companyId);
    
    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching webhook integration:', error);
      throw error;
    }

    console.log('Webhook integration fetched:', data);
    return data;
  }

  static async create(integrationData: CreateWebhookIntegrationData): Promise<WebhookIntegration> {
    console.log('Creating webhook integration with data:', integrationData);
    
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    console.log('Authenticated user:', user.id);
    
    const { data, error } = await supabase
      .from('webhook_integrations')
      .insert({
        company_id: integrationData.company_id,
        webhook_name: integrationData.webhook_name,
        is_active: integrationData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook integration:', error);
      throw error;
    }

    console.log('Webhook integration created:', data);
    return data;
  }

  static async update(id: string, updates: UpdateWebhookIntegrationData): Promise<WebhookIntegration> {
    console.log('Updating webhook integration:', id, 'with data:', updates);
    
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    console.log('Authenticated user:', user.id);
    
    const { data, error } = await supabase
      .from('webhook_integrations')
      .update({
        webhook_name: updates.webhook_name,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating webhook integration:', error);
      throw error;
    }

    console.log('Webhook integration updated:', data);
    return data;
  }
}
