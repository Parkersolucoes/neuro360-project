
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';

export interface SystemConfig {
  id: string;
  company_id: string;
  config_key: string;
  config_value: any;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function useSystemConfigs() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();
  const { currentCompany } = useCompanies();

  const fetchConfigs = async () => {
    if (!currentCompany?.id) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('config_key', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching system configs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfig = (key: string) => {
    return configs.find(config => config.config_key === key);
  };

  const getConfigValue = (key: string, defaultValue: any = null) => {
    const config = getConfig(key);
    return config ? config.config_value : defaultValue;
  };

  const createConfig = async (configData: Omit<SystemConfig, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    try {
      if (!isAdmin || !currentCompany?.id) throw new Error('Acesso negado');

      const { data, error } = await supabase
        .from('system_configs')
        .insert({
          ...configData,
          company_id: currentCompany.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração criada com sucesso"
      });

      await fetchConfigs();
      return data;
    } catch (error) {
      console.error('Error creating system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar configuração",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<SystemConfig>) => {
    try {
      if (!isAdmin || !currentCompany?.id) throw new Error('Acesso negado');

      const { data, error } = await supabase
        .from('system_configs')
        .update(updates)
        .eq('id', id)
        .eq('company_id', currentCompany.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso"
      });

      await fetchConfigs();
      return data;
    } catch (error) {
      console.error('Error updating system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      if (!isAdmin || !currentCompany?.id) throw new Error('Acesso negado');

      const { error } = await supabase
        .from('system_configs')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração removida com sucesso"
      });

      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover configuração",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [currentCompany?.id]);

  return {
    configs,
    loading,
    isAdmin,
    getConfig,
    getConfigValue,
    createConfig,
    updateConfig,
    deleteConfig,
    refetch: fetchConfigs
  };
}
