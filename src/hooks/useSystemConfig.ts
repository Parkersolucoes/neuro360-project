
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';

interface SystemConfig {
  system_name: string;
  system_description: string;
  login_background_image: string;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();

  const fetchConfig = async () => {
    if (!currentCompany?.id) {
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_configs')
        .select('config_value')
        .eq('company_id', currentCompany.id)
        .eq('config_key', 'system_appearance')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.config_value) {
        // Validar se o config_value tem a estrutura esperada
        const configValue = data.config_value as any;
        if (configValue && typeof configValue === 'object') {
          setConfig({
            system_name: configValue.system_name || "Visão 360 - Soluções em Dados",
            system_description: configValue.system_description || "Plataforma completa para análise e gestão de dados empresariais", 
            login_background_image: configValue.login_background_image || ""
          });
        } else {
          // Usar valores padrão se a estrutura não estiver correta
          setConfig({
            system_name: "Visão 360 - Soluções em Dados",
            system_description: "Plataforma completa para análise e gestão de dados empresariais",
            login_background_image: ""
          });
        }
      } else {
        // Se não há configuração, usar valores padrão
        setConfig({
          system_name: "Visão 360 - Soluções em Dados",
          system_description: "Plataforma completa para análise e gestão de dados empresariais",
          login_background_image: ""
        });
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: SystemConfig) => {
    if (!currentCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive"
      });
      return;
    }

    try {
      // Converter SystemConfig para um objeto JSON compatível
      const jsonConfigValue = {
        system_name: configData.system_name,
        system_description: configData.system_description,
        login_background_image: configData.login_background_image
      };

      // Verificar se já existe uma configuração
      const { data: existingConfig } = await supabase
        .from('system_configs')
        .select('id')
        .eq('company_id', currentCompany.id)
        .eq('config_key', 'system_appearance')
        .single();

      if (existingConfig) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('system_configs')
          .update({
            config_value: jsonConfigValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('system_configs')
          .insert({
            company_id: currentCompany.id,
            config_key: 'system_appearance',
            config_value: jsonConfigValue,
            description: 'Configurações de aparência do sistema',
            is_public: true
          });

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });

      await fetchConfig();
    } catch (error) {
      console.error('Error saving system config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!currentCompany?.id) {
      throw new Error('Nenhuma empresa selecionada');
    }

    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentCompany.id}-login-bg-${Date.now()}.${fileExt}`;
      
      // Upload para o storage do Supabase (se configurado)
      // Por enquanto, retornar URL temporária para demonstração
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [currentCompany?.id]);

  return {
    config,
    loading,
    saveConfig,
    uploadImage,
    refetch: fetchConfig
  };
}
