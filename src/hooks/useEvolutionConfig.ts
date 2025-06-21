
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface EvolutionConfig {
  id: string;
  api_url: string;
  api_key: string;
  instance_name: string;
  status: 'connected' | 'disconnected' | 'testing';
  created_at?: string;
  updated_at?: string;
}

export function useEvolutionConfig() {
  const [config, setConfig] = useState<EvolutionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      // Since evolution_configs table doesn't exist, return null
      setConfig(null);
    } catch (error) {
      console.error('Error fetching Evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração Evolution",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate saving configuration since table doesn't exist
      toast({
        title: "Informação",
        description: "A funcionalidade Evolution será implementada em uma próxima versão."
      });
      
      return null;
    } catch (error) {
      console.error('Error saving Evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração Evolution",
        variant: "destructive"
      });
      throw error;
    }
  };

  const testConnection = async () => {
    try {
      toast({
        title: "Informação",
        description: "A funcionalidade de teste de conexão Evolution será implementada em uma próxima versão."
      });
    } catch (error) {
      console.error('Error testing Evolution connection:', error);
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
