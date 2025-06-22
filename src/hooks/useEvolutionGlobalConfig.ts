
import { useState, useEffect } from 'react';
import { useSystemConfigs } from '@/hooks/useSystemConfigs';
import { useToast } from '@/hooks/use-toast';

export interface EvolutionGlobalConfig {
  base_url: string;
  global_api_key: string;
}

export function useEvolutionGlobalConfig() {
  const [globalConfig, setGlobalConfig] = useState<EvolutionGlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getConfigValue, updateConfig, createConfig, configs } = useSystemConfigs();

  const fetchGlobalConfig = () => {
    try {
      setLoading(true);
      
      // Buscar da configuração do sistema
      const systemConfig = getConfigValue('evolution_global_config');
      
      if (systemConfig && systemConfig.base_url && systemConfig.global_api_key) {
        setGlobalConfig({
          base_url: systemConfig.base_url,
          global_api_key: systemConfig.global_api_key
        });
        return;
      }

      // Fallback para localStorage
      const savedConfig = localStorage.getItem('evolution_global_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (config.base_url && config.global_api_key) {
            setGlobalConfig({
              base_url: config.base_url,
              global_api_key: config.global_api_key
            });
            return;
          }
        } catch (error) {
          console.error('Error parsing localStorage config:', error);
        }
      }

      setGlobalConfig(null);
    } catch (error) {
      console.error('Error fetching global Evolution config:', error);
      setGlobalConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalConfig = async (configData: EvolutionGlobalConfig) => {
    try {
      // Salvar no localStorage (mantém compatibilidade)
      localStorage.setItem('evolution_global_config', JSON.stringify(configData));

      // Tentar salvar na configuração do sistema também
      const existingConfig = configs.find(c => c.config_key === 'evolution_global_config');
      
      if (existingConfig) {
        await updateConfig(existingConfig.id, {
          config_value: configData
        });
      } else {
        await createConfig({
          config_key: 'evolution_global_config',
          config_value: configData,
          description: 'Configuração global da Evolution API',
          is_public: false
        });
      }

      setGlobalConfig(configData);
      
      toast({
        title: "Sucesso",
        description: "Configuração global da Evolution API salva com sucesso!"
      });

    } catch (error) {
      console.error('Error saving global Evolution config:', error);
      
      // Se falhar ao salvar no sistema, pelo menos salva no localStorage
      localStorage.setItem('evolution_global_config', JSON.stringify(configData));
      setGlobalConfig(configData);
      
      toast({
        title: "Aviso",
        description: "Configuração salva localmente. Algumas funcionalidades podem ser limitadas.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchGlobalConfig();
  }, [configs]);

  return {
    globalConfig,
    loading,
    saveGlobalConfig,
    refetch: fetchGlobalConfig
  };
}
