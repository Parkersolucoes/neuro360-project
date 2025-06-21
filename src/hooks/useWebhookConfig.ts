
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WebhookConfig {
  id: string;
  user_id: string;
  webhook_url: string;
  webhook_secret: string | null;
  is_active: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
}

export function useWebhookConfig() {
  const [config, setConfig] = useState<WebhookConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      // Since webhook_configs table doesn't exist in current schema, return null
      setConfig(null);
    } catch (error) {
      console.error('Error fetching webhook config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Omit<WebhookConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate saving webhook config since table doesn't exist
      const mockConfig: WebhookConfig = {
        id: `mock-webhook-${Date.now()}`,
        user_id: 'mock-user-id',
        ...configData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConfig(mockConfig);

      toast({
        title: "Informação",
        description: "Funcionalidade Webhook será implementada em uma próxima versão. Configuração simulada salva."
      });
    } catch (error) {
      console.error('Error saving webhook config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração de webhook",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConfig = async () => {
    if (!config) return;

    try {
      setConfig(null);
      toast({
        title: "Sucesso",
        description: "Configuração de webhook removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting webhook config:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover configuração de webhook",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    saveConfig,
    deleteConfig,
    refetch: fetchConfig
  };
}
