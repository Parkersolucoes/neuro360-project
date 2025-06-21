
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching webhook config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Omit<WebhookConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (config) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('webhook_configs')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('webhook_configs')
          .insert([{
            ...configData,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: "Sucesso",
        description: "Configuração de webhook salva com sucesso!"
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
      const { error } = await supabase
        .from('webhook_configs')
        .delete()
        .eq('id', config.id);

      if (error) throw error;
      
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
