
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  id: string;
  login_background_image?: string;
  system_name: string;
  system_description?: string;
  primary_color?: string;
  created_at: string;
  updated_at: string;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Ensure we only set config if data exists and is properly typed
      if (data) {
        setConfig(data as SystemConfig);
      } else {
        // Se não houver configuração, criar uma padrão
        const defaultConfig = {
          system_name: "Visão 360 - Soluções em Dados",
          system_description: "Soluções de Análise dados para seu negócio",
          primary_color: "#1e293b"
        };
        await saveConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Omit<SystemConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (config) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('system_configs')
          .update(configData)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setConfig(data as SystemConfig);
        }
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('system_configs')
          .insert([configData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setConfig(data as SystemConfig);
        }
      }

      toast({
        title: "Sucesso",
        description: "Configuração do sistema salva com sucesso!"
      });
    } catch (error) {
      console.error('Error saving system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração do sistema",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `login-bg-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('system-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('system-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    saveConfig,
    uploadImage,
    refetch: fetchConfig
  };
}
