
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

export function useEvolutionConfig(companyId?: string) {
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      console.log('EvolutionConfig: Table evolution_configs does not exist in current database schema');
      
      // Como a tabela evolution_configs não existe mais, retornar null
      setConfig(null);
    } catch (error) {
      console.error('Error fetching Evolution config:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (configData: Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('EvolutionConfig: Cannot create config - table evolution_configs does not exist');
      
      toast({
        title: "Erro",
        description: "Tabela de configurações da Evolution API não existe no banco de dados atual",
        variant: "destructive"
      });
      
      throw new Error('evolution_configs table does not exist');
    } catch (error) {
      console.error('Error creating Evolution config:', error);
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<EvolutionConfig>) => {
    try {
      console.log('EvolutionConfig: Cannot update config - table evolution_configs does not exist');
      
      toast({
        title: "Erro",
        description: "Tabela de configurações da Evolution API não existe no banco de dados atual",
        variant: "destructive"
      });
      
      throw new Error('evolution_configs table does not exist');
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
