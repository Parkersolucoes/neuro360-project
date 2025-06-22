
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';

interface SystemConfig {
  system_name: string;
  system_description: string;
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
        const configValue = data.config_value as any;
        if (configValue && typeof configValue === 'object') {
          setConfig({
            system_name: configValue.system_name || "Visão 360 - Soluções em Dados",
            system_description: configValue.system_description || "Plataforma completa para análise e gestão de dados empresariais"
          });
        } else {
          setConfig({
            system_name: "Visão 360 - Soluções em Dados",
            system_description: "Plataforma completa para análise e gestão de dados empresariais"
          });
        }
      } else {
        setConfig({
          system_name: "Visão 360 - Soluções em Dados",
          system_description: "Plataforma completa para análise e gestão de dados empresariais"
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
      const jsonConfigValue = {
        system_name: configData.system_name,
        system_description: configData.system_description
      };

      const { data: existingConfig } = await supabase
        .from('system_configs')
        .select('id')
        .eq('company_id', currentCompany.id)
        .eq('config_key', 'system_appearance')
        .single();

      if (existingConfig) {
        const { error } = await supabase
          .from('system_configs')
          .update({
            config_value: jsonConfigValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);

        if (error) throw error;
      } else {
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

  useEffect(() => {
    fetchConfig();
  }, [currentCompany?.id]);

  return {
    config,
    loading,
    saveConfig,
    refetch: fetchConfig
  };
}
