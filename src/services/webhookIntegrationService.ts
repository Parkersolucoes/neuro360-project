
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
    
    const { data, error } = await supabase
      .from('webhook_integrations')
      .insert({
        ...integrationData,
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
    
    const { data, error } = await supabase
      .from('webhook_integrations')
      .update({
        ...updates,
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
