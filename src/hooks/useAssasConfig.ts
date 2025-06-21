
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AssasConfig {
  id: string;
  user_id: string;
  api_url: string;
  api_key: string;
  wallet_id?: string;
  webhook_url?: string;
  is_sandbox: boolean;
  status: 'connected' | 'disconnected' | 'testing';
  created_at?: string;
  updated_at?: string;
}

export function useAssasConfig() {
  const [config, setConfig] = useState<AssasConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('assas_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setConfig(data ? {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      } : null);
    } catch (error) {
      console.error('Error fetching ASSAS config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Omit<AssasConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const configPayload = {
        ...configData,
        user_id: user.id,
        status: configData.status as 'connected' | 'disconnected' | 'testing'
      };

      const { data, error } = config
        ? await supabase
            .from('assas_configs')
            .update(configPayload)
            .eq('id', config.id)
            .select()
            .single()
        : await supabase
            .from('assas_configs')
            .insert([configPayload])
            .select()
            .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
      
      setConfig(typedData);
      
      toast({
        title: "Sucesso",
        description: "Configuração ASSAS salva com sucesso!"
      });
      
      return typedData;
    } catch (error) {
      console.error('Error saving ASSAS config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração ASSAS",
        variant: "destructive"
      });
      throw error;
    }
  };

  const testConnection = async () => {
    if (!config) return;
    
    try {
      await supabase
        .from('assas_configs')
        .update({ status: 'testing' })
        .eq('id', config.id);
      
      setConfig(prev => prev ? { ...prev, status: 'testing' } : null);
      
      // Simular teste de conexão
      setTimeout(async () => {
        const { data, error } = await supabase
          .from('assas_configs')
          .update({ status: 'connected' })
          .eq('id', config.id)
          .select()
          .single();
          
        if (!error) {
          setConfig(prev => prev ? { ...prev, status: 'connected' } : null);
          toast({
            title: "Sucesso",
            description: "Conexão com ASSAS estabelecida!"
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Error testing ASSAS connection:', error);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    saveConfig,
    testConnection,
    refetch: fetchConfig
  };
}
