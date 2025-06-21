
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EvolutionConfig {
  id: string;
  company_id: string;
  api_url: string;
  api_key: string;
  instance_name: string;
  webhook_url: string | null;
  is_active: boolean;
  status: 'connected' | 'disconnected' | 'testing';
  created_at: string;
  updated_at: string;
}

export function useEvolutionConfig(companyId?: string) {
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    if (!companyId) {
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('EvolutionConfig: Fetching config for company:', companyId);
      
      const { data, error } = await supabase
        .from('evolution_configs')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('EvolutionConfig: Error fetching config:', error);
        throw error;
      }

      console.log('EvolutionConfig: Fetched config:', data);
      setConfig(data as EvolutionConfig);
    } catch (error) {
      console.error('Error fetching Evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração da Evolution API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (configData: Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('EvolutionConfig: Creating config:', configData);
      
      const { data, error } = await supabase
        .from('evolution_configs')
        .insert(configData)
        .select()
        .single();

      if (error) throw error;

      console.log('EvolutionConfig: Config created successfully:', data);
      setConfig(data as EvolutionConfig);
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating Evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar configuração da Evolution API",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<EvolutionConfig>) => {
    try {
      console.log('EvolutionConfig: Updating config:', id, updates);
      
      const { data, error } = await supabase
        .from('evolution_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('EvolutionConfig: Config updated successfully:', data);
      setConfig(data as EvolutionConfig);
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating Evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração da Evolution API",
        variant: "destructive"
      });
      throw error;
    }
  };

  const saveConfig = async (configData: Partial<EvolutionConfig>) => {
    try {
      if (config && config.id) {
        return await updateConfig(config.id, configData);
      } else {
        return await createConfig(configData as Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>);
      }
    } catch (error) {
      console.error('Error saving Evolution config:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [companyId]);

  return {
    config,
    loading,
    createConfig,
    updateConfig,
    saveConfig,
    refetch: fetchConfig
  };
}
