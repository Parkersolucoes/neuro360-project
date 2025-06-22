
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WebhookIntegrationService } from '@/services/webhookIntegrationService';
import type { WebhookIntegration, UpdateWebhookIntegrationData } from '@/types/webhookIntegration';

export function useWebhookIntegration(companyId?: string) {
  const [integration, setIntegration] = useState<WebhookIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegration = async () => {
    if (!companyId) {
      setIntegration(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const integrationData = await WebhookIntegrationService.fetchByCompanyId(companyId);
      setIntegration(integrationData);
    } catch (error) {
      console.error('Error fetching webhook integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar integração webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (integrationData: UpdateWebhookIntegrationData & { company_id: string }) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      console.log('Saving webhook integration with companyId:', companyId);
      console.log('Integration data:', integrationData);

      let savedIntegration: WebhookIntegration;
      
      if (integration && integration.id) {
        console.log('Updating existing integration:', integration.id);
        savedIntegration = await WebhookIntegrationService.update(integration.id, {
          webhook_name: integrationData.webhook_name,
          is_active: integrationData.is_active !== undefined ? integrationData.is_active : true
        });
      } else {
        console.log('Creating new integration for company:', companyId);
        savedIntegration = await WebhookIntegrationService.create({
          company_id: companyId,
          webhook_name: integrationData.webhook_name || 'Webhook Integração QrCode',
          is_active: integrationData.is_active !== undefined ? integrationData.is_active : true
        });
      }
      
      setIntegration(savedIntegration);
      
      toast({
        title: "Sucesso",
        description: "Integração webhook salva com sucesso!"
      });
      
      return savedIntegration;
    } catch (error) {
      console.error('Error saving webhook integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar integração webhook",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchIntegration();
  }, [companyId]);

  return {
    integration,
    loading,
    saveIntegration,
    refetch: fetchIntegration
  };
}
