
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EvolutionConfig {
  id: string;
  company_id: string | null;
  api_url: string;
  api_key: string;
  instance_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEvolutionConfig() {
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async (companyId?: string) => {
    try {
      let query = supabase
        .from('evolution_configs')
        .select('*')
        .eq('is_active', true);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

      if (error) {
        console.error('Error fetching Evolution config:', error);
        return;
      }

      if (data && data.length > 0) {
        setConfig(data[0]);
      }
    } catch (error) {
      console.error('Error fetching Evolution config:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (configData: Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('evolution_configs')
        .insert([configData])
        .select()
        .single();

      if (error) {
        console.error('Error creating Evolution config:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar configuração da Evolution API",
          variant: "destructive"
        });
        throw error;
      }

      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error creating Evolution config:', error);
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<EvolutionConfig>) => {
    try {
      const { data, error } = await supabase
        .from('evolution_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating Evolution config:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar configuração da Evolution API",
          variant: "destructive"
        });
        throw error;
      }

      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API atualizada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error updating Evolution config:', error);
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
  }, []);

  return {
    config,
    loading,
    createConfig,
    updateConfig,
    saveConfig,
    refetch: fetchConfig
  };
}
