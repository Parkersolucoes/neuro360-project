
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching system config:', error);
        return;
      }

      if (data && data.length > 0) {
        setConfig(data[0]);
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<SystemConfig>) => {
    try {
      let configToUpdate = config;
      
      if (!configToUpdate) {
        // Create default config if none exists
        const { data, error } = await supabase
          .from('system_configs')
          .insert([{
            system_name: 'Visão 360 - Soluções em Dados',
            system_description: 'Soluções de Análise dados para seu negócio',
            primary_color: '#1e293b'
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating system config:', error);
          throw error;
        }
        
        configToUpdate = data;
        setConfig(data);
      }

      const { data, error } = await supabase
        .from('system_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', configToUpdate.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating system config:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar configuração do sistema",
          variant: "destructive"
        });
        throw error;
      }

      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configuração do sistema atualizada com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error updating system config:', error);
      throw error;
    }
  };

  // Alias for compatibility with existing code
  const saveConfig = updateConfig;

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `system-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('system-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
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
