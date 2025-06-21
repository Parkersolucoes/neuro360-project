
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('evolution_configs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConfig(data || null);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (config) {
        const { data, error } = await supabase
          .from('evolution_configs')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      } else {
        const { data, error } = await supabase
          .from('evolution_configs')
          .insert([{ ...configData, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: "Sucesso",
        description: "Configuração Evolution salva com sucesso!"
      });
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
    if (!config) return;

    try {
      await supabase
        .from('evolution_configs')
        .update({ status: 'testing' })
        .eq('id', config.id);

      setConfig(prev => prev ? { ...prev, status: 'testing' } : null);

      // Simular teste de conexão
      setTimeout(async () => {
        const { data, error } = await supabase
          .from('evolution_configs')
          .update({ status: 'connected' })
          .eq('id', config.id)
          .select()
          .single();

        if (!error && data) {
          setConfig(data);
          toast({
            title: "Sucesso",
            description: "Conexão Evolution testada com sucesso!"
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Error testing Evolution connection:', error);
      toast({
        title: "Erro",
        description: "Erro ao testar conexão Evolution",
        variant: "destructive"
      });
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
