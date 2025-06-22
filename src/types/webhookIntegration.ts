
export interface WebhookIntegration {
  id: string;
  company_id: string;
  qrcode_webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateWebhookIntegrationData = {
  company_id: string;
  qrcode_webhook_url: string;
  is_active: boolean;
};

export type UpdateWebhookIntegrationData = {
  qrcode_webhook_url?: string;
  is_active?: boolean;
};
