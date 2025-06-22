
import { supabase } from '@/integrations/supabase/client';
import type { WebhookIntegration, CreateWebhookIntegrationData, UpdateWebhookIntegrationData } from '@/types/webhookIntegration';

export class WebhookIntegrationService {
  static async fetchByCompanyId(companyId: string): Promise<WebhookIntegration | null> {
    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  static async create(integrationData: CreateWebhookIntegrationData): Promise<WebhookIntegration> {
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
      throw error;
    }

    return data;
  }

  static async update(id: string, updates: UpdateWebhookIntegrationData): Promise<WebhookIntegration> {
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
      throw error;
    }

    return data;
  }
}
