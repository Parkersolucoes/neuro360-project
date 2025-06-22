
export interface WebhookIntegration {
  id: string;
  company_id: string;
  webhook_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateWebhookIntegrationData = Omit<WebhookIntegration, 'id' | 'created_at' | 'updated_at'>;

export type UpdateWebhookIntegrationData = Partial<WebhookIntegration>;
