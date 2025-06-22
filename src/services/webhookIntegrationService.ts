
import { supabase } from '@/integrations/supabase/client';
import type { WebhookIntegration, CreateWebhookIntegrationData, UpdateWebhookIntegrationData } from '@/types/webhookIntegration';

export class WebhookIntegrationService {
  static async fetchByCompanyId(companyId: string): Promise<WebhookIntegration | null> {
    console.log('🔍 WebhookIntegrationService: Fetching webhook integration for company:', companyId);
    
    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      console.error('❌ WebhookIntegrationService: Error fetching webhook integration:', error);
      throw error;
    }

    console.log('✅ WebhookIntegrationService: Webhook integration fetched:', data);
    return data;
  }

  static async create(integrationData: CreateWebhookIntegrationData): Promise<WebhookIntegration> {
    console.log('📝 WebhookIntegrationService: Creating webhook integration with data:', integrationData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const insertData = {
      company_id: integrationData.company_id,
      qrcode_webhook_url: integrationData.qrcode_webhook_url,
      is_active: integrationData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📤 WebhookIntegrationService: Insert data:', insertData);

    const { data, error } = await supabase
      .from('webhook_integrations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ WebhookIntegrationService: Error creating webhook integration:', error);
      throw error;
    }

    console.log('✅ WebhookIntegrationService: Webhook integration created successfully:', data);
    return data;
  }

  static async update(id: string, updates: UpdateWebhookIntegrationData): Promise<WebhookIntegration> {
    console.log('🔄 WebhookIntegrationService: Updating webhook integration:', id, 'with data:', updates);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const updateData = {
      qrcode_webhook_url: updates.qrcode_webhook_url,
      is_active: updates.is_active,
      updated_at: new Date().toISOString()
    };

    console.log('📤 WebhookIntegrationService: Update data:', updateData);

    const { data, error } = await supabase
      .from('webhook_integrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ WebhookIntegrationService: Error updating webhook integration:', error);
      throw error;
    }

    console.log('✅ WebhookIntegrationService: Webhook integration updated successfully:', data);
    return data;
  }
}
