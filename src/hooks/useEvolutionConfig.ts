
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { EvolutionConfigService } from '@/services/evolutionConfigService';
import { useEvolutionConfigActions } from '@/hooks/useEvolutionConfigActions';
import type { EvolutionConfig, UpdateEvolutionConfigData } from '@/types/evolutionConfig';

export function useEvolutionConfig(companyId?: string) {
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { createConfig, updateConfig } = useEvolutionConfigActions();

  const fetchConfig = async () => {
    if (!companyId) {
      console.log('useEvolutionConfig: No company ID provided');
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('useEvolutionConfig: Fetching config for company:', companyId);
      
      const configData = await EvolutionConfigService.fetchByCompanyId(companyId);
      
      console.log('useEvolutionConfig: Fetched config:', configData);
      if (configData) {
        setConfig(configData);
        logInfo('Configuração Evolution carregada com sucesso', 'useEvolutionConfig', { companyId });
      } else {
        console.log('useEvolutionConfig: No config found for company:', companyId);
        setConfig(null);
      }
    } catch (error) {
      console.error('useEvolutionConfig: Error fetching Evolution config:', error);
      logError(`Erro ao carregar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfig', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração da Evolution API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: UpdateEvolutionConfigData & { company_id: string }) => {
    try {
      console.log('useEvolutionConfig: Saving config - existing config:', config);
      console.log('useEvolutionConfig: Saving config - new data:', configData);
      
      let savedConfig: EvolutionConfig;
      
      if (config && config.id) {
        console.log('useEvolutionConfig: Updating existing config');
        savedConfig = await updateConfig(config.id, configData);
      } else {
        console.log('useEvolutionConfig: Creating new config');
        savedConfig = await createConfig(configData as any);
      }
      
      setConfig(savedConfig);
      return savedConfig;
    } catch (error) {
      console.error('useEvolutionConfig: Error saving Evolution config:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [companyId]);

  return {
    config,
    loading,
    createConfig: async (configData: any) => {
      const newConfig = await createConfig(configData);
      setConfig(newConfig);
      return newConfig;
    },
    updateConfig: async (id: string, updates: UpdateEvolutionConfigData) => {
      const updatedConfig = await updateConfig(id, updates);
      setConfig(updatedConfig);
      return updatedConfig;
    },
    saveConfig,
    refetch: fetchConfig
  };
}
