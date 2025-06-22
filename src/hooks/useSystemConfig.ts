
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

interface SystemConfigValue {
  system_name?: string;
  system_description?: string;
  primary_color?: string;
  login_background_image?: string;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      console.log('Fetching system config from database...');
      
      // Buscar configuração do sistema na tabela system_configs
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('config_key', 'system_appearance')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching system config:', error);
        throw error;
      }

      if (data) {
        // Converter os dados do banco para o formato esperado
        const configValue = data.config_value as SystemConfigValue;
        const systemConfig: SystemConfig = {
          id: data.id,
          system_name: configValue.system_name || 'Visão 360 - Soluções em Dados',
          system_description: configValue.system_description || 'Plataforma completa para análise e gestão de dados empresariais',
          primary_color: configValue.primary_color || '#1e293b',
          login_background_image: configValue.login_background_image || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setConfig(systemConfig);
        console.log('System config loaded:', systemConfig);
      } else {
        // Se não existe configuração, criar uma padrão
        console.log('No system config found, creating default...');
        await createDefaultConfig();
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
      
      // Fallback para configuração padrão em caso de erro
      const defaultConfig: SystemConfig = {
        id: 'default',
        system_name: 'Visão 360 - Soluções em Dados',
        system_description: 'Plataforma completa para análise e gestão de dados empresariais',
        primary_color: '#1e293b',
        login_background_image: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async () => {
    try {
      const configData = {
        config_key: 'system_appearance',
        config_value: {
          system_name: 'Visão 360 - Soluções em Dados',
          system_description: 'Plataforma completa para análise e gestão de dados empresariais',
          primary_color: '#1e293b',
          login_background_image: ''
        },
        description: 'Configurações de aparência do sistema',
        is_public: true
      };

      const { data, error } = await supabase
        .from('system_configs')
        .insert([configData])
        .select()
        .single();

      if (error) throw error;

      const configValue = data.config_value as SystemConfigValue;
      const systemConfig: SystemConfig = {
        id: data.id,
        system_name: configValue.system_name || 'Visão 360 - Soluções em Dados',
        system_description: configValue.system_description || 'Plataforma completa para análise e gestão de dados empresariais',
        primary_color: configValue.primary_color || '#1e293b',
        login_background_image: configValue.login_background_image || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setConfig(systemConfig);
      console.log('Default system config created:', systemConfig);
    } catch (error) {
      console.error('Error creating default config:', error);
    }
  };

  // Função saveConfig que atualiza as configurações
  const saveConfig = async (formData: any) => {
    try {
      console.log('Saving system config:', formData);
      
      const configData = {
        config_key: 'system_appearance',
        config_value: {
          system_name: formData.system_name || config?.system_name,
          system_description: formData.system_description || config?.system_description,
          primary_color: formData.primary_color || config?.primary_color,
          login_background_image: formData.login_background_image || config?.login_background_image
        },
        description: 'Configurações de aparência do sistema',
        is_public: true
      };

      // Verificar se já existe uma configuração
      const { data: existingConfig } = await supabase
        .from('system_configs')
        .select('id')
        .eq('config_key', 'system_appearance')
        .maybeSingle();

      let result;
      if (existingConfig) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('system_configs')
          .update(configData)
          .eq('id', existingConfig.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('system_configs')
          .insert([configData])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      // Atualizar o estado local
      const configValue = result.config_value as SystemConfigValue;
      const updatedConfig: SystemConfig = {
        id: result.id,
        system_name: configValue.system_name || 'Visão 360 - Soluções em Dados',
        system_description: configValue.system_description || 'Plataforma completa para análise e gestão de dados empresariais',
        primary_color: configValue.primary_color || '#1e293b',
        login_background_image: configValue.login_background_image || '',
        created_at: result.created_at,
        updated_at: result.updated_at
      };

      setConfig(updatedConfig);
      console.log('System config saved successfully:', result);

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
        variant: "default"
      });

      return updatedConfig;
    } catch (error) {
      console.error('Error saving system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do sistema",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Alias for compatibility with existing code
  const updateConfig = saveConfig;

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Uploading image to images360 storage...');
      
      // Primeiro, deletar imagem anterior se existir
      if (config?.login_background_image) {
        try {
          // Extrair o caminho do arquivo da URL
          const url = new URL(config.login_background_image);
          const pathSegments = url.pathname.split('/');
          const fileName = pathSegments[pathSegments.length - 1];
          
          if (fileName && fileName !== '') {
            console.log('Deleting old image:', fileName);
            await supabase.storage
              .from('images360')
              .remove([fileName]);
          }
        } catch (deleteError) {
          console.warn('Could not delete old image:', deleteError);
        }
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `login-background-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from('images360')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('images360')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem",
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
    updateConfig,
    saveConfig,
    uploadImage,
    refetch: fetchConfig
  };
}
