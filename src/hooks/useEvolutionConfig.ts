import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useAuth } from '@/hooks/useAuth';

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
  const { logError, logInfo } = useSystemLogs();
  const { userLogin } = useAuth();

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
      
      const { data, error } = await supabase
        .from('evolution_configs')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('useEvolutionConfig: Error fetching config:', error);
        logError(`Erro ao buscar configuração Evolution: ${error.message}`, 'useEvolutionConfig', error);
        throw error;
      }

      console.log('useEvolutionConfig: Fetched config:', data);
      if (data) {
        const configData = {
          ...data,
          status: data.status as 'connected' | 'disconnected' | 'testing'
        };
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

  const createConfig = async (configData: Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('useEvolutionConfig: Creating config:', configData);
      logInfo('Criando nova configuração Evolution API', 'useEvolutionConfig', { companyId: configData.company_id });
      
      // Garantir que temos um usuário autenticado
      if (!userLogin?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Inserção direta com timestamps explícitos
      const { data, error } = await supabase
        .from('evolution_configs')
        .insert({
          ...configData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('useEvolutionConfig: Error creating config:', error);
        logError(`Erro ao criar configuração Evolution: ${error.message}`, 'useEvolutionConfig', error);
        throw error;
      }

      console.log('useEvolutionConfig: Config created successfully:', data);
      const newConfig = {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
      setConfig(newConfig);
      
      logInfo('Configuração da Evolution API criada com sucesso', 'useEvolutionConfig', { configId: data.id });
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('useEvolutionConfig: Error creating Evolution config:', error);
      logError(`Erro ao criar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfig', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar configuração da Evolution API",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: Partial<EvolutionConfig>) => {
    try {
      console.log('useEvolutionConfig: Updating config:', id, updates);
      logInfo('Atualizando configuração Evolution API', 'useEvolutionConfig', { configId: id });
      
      const { data, error } = await supabase
        .from('evolution_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useEvolutionConfig: Error updating config:', error);
        logError(`Erro ao atualizar configuração Evolution: ${error.message}`, 'useEvolutionConfig', error);
        throw error;
      }

      console.log('useEvolutionConfig: Config updated successfully:', data);
      const updatedConfig = {
        ...data,
        status: data.status as 'connected' | 'disconnected' | 'testing'
      };
      setConfig(updatedConfig);
      
      logInfo('Configuração da Evolution API atualizada com sucesso', 'useEvolutionConfig', { configId: id });
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API atualizada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('useEvolutionConfig: Error updating Evolution config:', error);
      logError(`Erro ao atualizar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfig', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração da Evolution API",
        variant: "destructive"
      });
      throw error;
    }
  };

  const saveConfig = async (configData: Partial<EvolutionConfig> & { company_id: string }) => {
    try {
      console.log('useEvolutionConfig: Saving config - existing config:', config);
      console.log('useEvolutionConfig: Saving config - new data:', configData);
      
      if (config && config.id) {
        console.log('useEvolutionConfig: Updating existing config');
        return await updateConfig(config.id, configData);
      } else {
        console.log('useEvolutionConfig: Creating new config');
        return await createConfig(configData as Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at'>);
      }
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
    createConfig,
    updateConfig,
    saveConfig,
    refetch: fetchConfig
  };
}
