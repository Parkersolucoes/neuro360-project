
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { SMTPConfigService } from '@/services/smtpConfigService';
import type { SMTPConfig, CreateSMTPConfigData, UpdateSMTPConfigData } from '@/types/smtpConfig';

export function useSMTPConfig(companyId: string) {
  const [config, setConfig] = useState<SMTPConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const smtpConfig = await SMTPConfigService.fetchByCompanyId(companyId);
      setConfig(smtpConfig);
      
      if (smtpConfig) {
        logInfo('Configuração SMTP carregada', 'useSMTPConfig', { companyId, configId: smtpConfig.id });
      }
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      logError(`Erro ao carregar configuração SMTP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useSMTPConfig', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: CreateSMTPConfigData | UpdateSMTPConfigData) => {
    try {
      let savedConfig: SMTPConfig;

      if (config?.id) {
        // Update existing config
        savedConfig = await SMTPConfigService.update(config.id, configData as UpdateSMTPConfigData);
        logInfo('Configuração SMTP atualizada', 'useSMTPConfig', { companyId, configId: savedConfig.id });
      } else {
        // Create new config
        savedConfig = await SMTPConfigService.create(configData as CreateSMTPConfigData);
        logInfo('Configuração SMTP criada', 'useSMTPConfig', { companyId, configId: savedConfig.id });
      }

      setConfig(savedConfig);
      
      toast({
        title: "Sucesso",
        description: config?.id ? "Configuração SMTP atualizada com sucesso!" : "Configuração SMTP criada com sucesso!"
      });

      return savedConfig;
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      logError(`Erro ao salvar configuração SMTP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useSMTPConfig', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configuração SMTP",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const testConnection = async (configData: Partial<CreateSMTPConfigData>) => {
    try {
      setTesting(true);
      
      toast({
        title: "Testando Conexão",
        description: "Verificando configurações SMTP..."
      });

      const result = await SMTPConfigService.testConnection(configData);
      
      if (result.success) {
        toast({
          title: "✅ Teste Bem-sucedido",
          description: result.message
        });

        // Update status to connected if we have a saved config
        if (config?.id) {
          await SMTPConfigService.update(config.id, { status: 'connected' });
          setConfig(prev => prev ? { ...prev, status: 'connected' } : null);
        }
      } else {
        toast({
          title: "❌ Teste Falhou",
          description: result.message,
          variant: "destructive"
        });

        // Update status to disconnected if we have a saved config
        if (config?.id) {
          await SMTPConfigService.update(config.id, { status: 'disconnected' });
          setConfig(prev => prev ? { ...prev, status: 'disconnected' } : null);
        }
      }

      logInfo(`Teste de conexão SMTP: ${result.success ? 'sucesso' : 'falha'}`, 'useSMTPConfig', { 
        companyId, 
        success: result.success,
        message: result.message 
      });

      return result;
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      logError(`Erro ao testar conexão SMTP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useSMTPConfig', error);
      
      toast({
        title: "Erro",
        description: "Erro interno ao testar conexão SMTP",
        variant: "destructive"
      });
      
      return { success: false, message: 'Erro interno' };
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchConfig();
    }
  }, [companyId]);

  return {
    config,
    loading,
    testing,
    saveConfig,
    testConnection,
    refetch: fetchConfig
  };
}
