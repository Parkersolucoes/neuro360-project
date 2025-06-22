
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
      console.log('🚫 useWebhookIntegration: No company ID provided');
      setIntegration(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 useWebhookIntegration: Fetching integration for company:', companyId);
      
      const integrationData = await WebhookIntegrationService.fetchByCompanyId(companyId);
      setIntegration(integrationData);
      
      console.log('✅ useWebhookIntegration: Integration loaded:', integrationData);
    } catch (error) {
      console.error('❌ useWebhookIntegration: Error fetching webhook integration:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (integrationData: UpdateWebhookIntegrationData & { company_id: string; qrcode_webhook_url: string }) => {
    if (!companyId) {
      console.error('❌ useWebhookIntegration: Company ID is required');
      throw new Error('Company ID is required');
    }

    try {
      console.log('💾 useWebhookIntegration: Saving webhook integration with companyId:', companyId);
      console.log('💾 useWebhookIntegration: Integration data:', integrationData);

      let savedIntegration: WebhookIntegration;
      
      if (integration && integration.id) {
        console.log('🔄 useWebhookIntegration: Updating existing integration:', integration.id);
        savedIntegration = await WebhookIntegrationService.update(integration.id, {
          qrcode_webhook_url: integrationData.qrcode_webhook_url,
          is_active: integrationData.is_active !== undefined ? integrationData.is_active : true
        });
      } else {
        console.log('📝 useWebhookIntegration: Creating new integration for company:', companyId);
        savedIntegration = await WebhookIntegrationService.create({
          company_id: companyId,
          qrcode_webhook_url: integrationData.qrcode_webhook_url,
          is_active: integrationData.is_active !== undefined ? integrationData.is_active : true
        });
      }
      
      setIntegration(savedIntegration);
      
      console.log('✅ useWebhookIntegration: Integration saved successfully:', savedIntegration);
      
      toast({
        title: "Sucesso",
        description: "Configuração webhook salva com sucesso!"
      });
      
      return savedIntegration;
    } catch (error) {
      console.error('❌ useWebhookIntegration: Error saving webhook integration:', error);
      
      let errorMessage = "Erro ao salvar configuração webhook";
      
      if (error instanceof Error) {
        if (error.message.includes('violates row-level security')) {
          errorMessage = "Erro de permissão: Verifique se você tem acesso à empresa selecionada";
        } else if (error.message.includes('not authenticated')) {
          errorMessage = "Erro de autenticação: Faça login novamente";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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
