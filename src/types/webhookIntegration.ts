
export interface WebhookIntegration {
  id: string;
  company_id: string;
  webhook_name: string | null;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateWebhookIntegrationData = {
  company_id: string;
  webhook_name?: string | null;
  webhook_url: string;
  is_active: boolean;
};

export type UpdateWebhookIntegrationData = {
  webhook_name?: string | null;
  webhook_url?: string;
  is_active?: boolean;
};
