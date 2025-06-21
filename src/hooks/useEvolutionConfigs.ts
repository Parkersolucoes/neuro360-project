
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';

export interface EvolutionConfig {
  id: string;
  company_id: string;
  api_url: string;
  api_key: string;
  webhook_url: string | null;
  instance_name: string;
  status: 'connected' | 'disconnected' | 'testing';
  created_at: string;
  updated_at: string;
}

export function useEvolutionConfigs() {
  const [configs, setConfigs] = useState<EvolutionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany) {
        setConfigs([]);
        return;
      }

      const { data, error } = await supabase
        .from('evolution_configs')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching evolution configs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações da Evolution API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConfig = async (configData: Omit<EvolutionConfig, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    try {
      if (!currentCompany) throw new Error('Nenhuma empresa selecionada');

      const { data, error } = await supabase
        .from('evolution_configs')
        .insert({
          ...configData,
          company_id: currentCompany.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada com sucesso"
      });

      await fetchConfigs();
      return data;
    } catch (error) {
      console.error('Error creating evolution config:', error);
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
      const { data, error } = await supabase
        .from('evolution_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API atualizada com sucesso"
      });

      await fetchConfigs();
      return data;
    } catch (error) {
      console.error('Error updating evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração da Evolution API",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('evolution_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API removida com sucesso"
      });

      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting evolution config:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover configuração da Evolution API",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [currentCompany]);

  return {
    configs,
    loading,
    createConfig,
    updateConfig,
    deleteConfig,
    refetch: fetchConfigs
  };
}
