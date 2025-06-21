
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SystemConfig {
  id: string;
  system_name: string;
  system_description?: string;
  primary_color?: string;
  login_background_image?: string;
  created_at: string;
  updated_at: string;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      console.log('SystemConfig: Table system_configs does not exist in current database schema');
      
      // Como a tabela system_configs não existe mais, retornar configuração padrão
      const defaultConfig: SystemConfig = {
        id: 'default',
        system_name: 'Visão 360 - Soluções em Dados',
        system_description: 'Soluções de Análise dados para seu negócio',
        primary_color: '#1e293b',
        login_background_image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Error fetching system config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<SystemConfig>) => {
    try {
      console.log('SystemConfig: Cannot update config - table system_configs does not exist');
      
      // Simular atualização local
      if (config) {
        const updatedConfig = { ...config, ...updates, updated_at: new Date().toISOString() };
        setConfig(updatedConfig);
      }

      toast({
        title: "Aviso",
        description: "Configurações salvas localmente. Funcionalidade completa está temporariamente indisponível",
        variant: "default"
      });

      return config;
    } catch (error) {
      console.error('Error updating system config:', error);
      toast({
        title: "Erro",
        description: "Funcionalidade de configuração do sistema está temporariamente indisponível",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Alias for compatibility with existing code
  const saveConfig = updateConfig;

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('SystemConfig: Image upload temporarily unavailable');
      
      toast({
        title: "Aviso",
        description: "Upload de imagem está temporariamente indisponível",
        variant: "default"
      });

      // Retornar URL placeholder
      return '';
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    updateConfig,
    saveConfig,
    uploadImage,
    refetch: fetchConfig
  };
}
