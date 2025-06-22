
import { useToast } from '@/hooks/use-toast';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useAuth } from '@/hooks/useAuth';
import { EvolutionConfigService } from '@/services/evolutionConfigService';
import { EvolutionApiService } from '@/services/evolutionApiService';
import type { EvolutionConfig, CreateEvolutionConfigData, UpdateEvolutionConfigData } from '@/types/evolutionConfig';

export function useEvolutionConfigActions() {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { userLogin } = useAuth();

  const validateConfigWithQRGeneration = async (config: {
    api_url: string;
    api_key: string;
    instance_name: string;
  }): Promise<boolean> => {
    try {
      console.log('useEvolutionConfigActions: Validating config with QR generation:', config);
      logInfo('Validando configuração Evolution API com geração de QR Code', 'useEvolutionConfigActions', { 
        instance_name: config.instance_name 
      });

      // Criar uma instância temporária do serviço Evolution
      const tempEvolutionService = new EvolutionApiService({
        id: 'temp',
        company_id: 'temp',
        api_url: config.api_url,
        api_key: config.api_key,
        instance_name: config.instance_name,
        webhook_url: null,
        is_active: true,
        status: 'testing' as const
      });

      // Tentar gerar QR Code para validar a configuração
      const qrResponse = await tempEvolutionService.generateQRCode();
      
      if (qrResponse.qrCode) {
        console.log('useEvolutionConfigActions: QR Code generated successfully, config is valid');
        logInfo('QR Code gerado com sucesso - configuração validada', 'useEvolutionConfigActions', {
          instance_name: config.instance_name
        });
        return true;
      } else {
        console.log('useEvolutionConfigActions: No QR Code returned, config may be invalid');
        logError('QR Code não foi retornado - configuração pode estar inválida', 'useEvolutionConfigActions');
        return false;
      }
    } catch (error) {
      console.error('useEvolutionConfigActions: QR Code validation failed:', error);
      logError(`Falha na validação com QR Code: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      return false;
    }
  };

  const createConfig = async (configData: CreateEvolutionConfigData): Promise<EvolutionConfig> => {
    try {
      console.log('useEvolutionConfigActions: Creating config:', configData);
      logInfo('Criando nova configuração Evolution API', 'useEvolutionConfigActions', { companyId: configData.company_id });
      
      if (!userLogin?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Validar configuração gerando QR Code
      toast({
        title: "Validando configuração",
        description: "Testando conexão e gerando QR Code para validar a configuração..."
      });

      const isValid = await validateConfigWithQRGeneration({
        api_url: configData.api_url,
        api_key: configData.api_key,
        instance_name: configData.instance_name
      });

      if (!isValid) {
        throw new Error('Configuração inválida: não foi possível gerar QR Code. Verifique a URL da API, chave de acesso e nome da instância.');
      }

      // Se a validação passou, criar a configuração com status 'connected'
      const configToCreate = {
        ...configData,
        status: 'connected' as const
      };

      const newConfig = await EvolutionConfigService.create(configToCreate);
      
      console.log('useEvolutionConfigActions: Config created successfully:', newConfig);
      logInfo('Configuração da Evolution API criada e validada com sucesso', 'useEvolutionConfigActions', { configId: newConfig.id });
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada e validada com sucesso! QR Code pode ser gerado."
      });
      
      return newConfig;
    } catch (error) {
      console.error('useEvolutionConfigActions: Error creating Evolution config:', error);
      logError(`Erro ao criar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar configuração da Evolution API",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: UpdateEvolutionConfigData): Promise<EvolutionConfig> => {
    try {
      console.log('useEvolutionConfigActions: Updating config:', id, updates);
      logInfo('Atualizando configuração Evolution API', 'useEvolutionConfigActions', { configId: id });
      
      // Se estamos atualizando dados críticos, validar com QR Code
      if (updates.api_url || updates.api_key || updates.instance_name) {
        // Buscar configuração atual para ter dados completos
        const currentConfig = await EvolutionConfigService.fetchByCompanyId(updates.company_id || '');
        
        if (!currentConfig) {
          throw new Error('Configuração atual não encontrada');
        }

        const configToValidate = {
          api_url: updates.api_url || currentConfig.api_url,
          api_key: updates.api_key || currentConfig.api_key,
          instance_name: updates.instance_name || currentConfig.instance_name
        };

        toast({
          title: "Validando alterações",
          description: "Testando conexão e gerando QR Code para validar as alterações..."
        });

        const isValid = await validateConfigWithQRGeneration(configToValidate);

        if (!isValid) {
          throw new Error('Alterações inválidas: não foi possível gerar QR Code com as novas configurações. Verifique os dados informados.');
        }

        // Se a validação passou, definir status como 'connected'
        updates.status = 'connected';
      }

      const updatedConfig = await EvolutionConfigService.update(id, updates);
      
      console.log('useEvolutionConfigActions: Config updated successfully:', updatedConfig);
      logInfo('Configuração da Evolution API atualizada e validada com sucesso', 'useEvolutionConfigActions', { configId: id });
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API atualizada e validada com sucesso!"
      });
      
      return updatedConfig;
    } catch (error) {
      console.error('useEvolutionConfigActions: Error updating Evolution config:', error);
      logError(`Erro ao atualizar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar configuração da Evolution API",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return {
    createConfig,
    updateConfig,
    validateConfigWithQRGeneration
  };
}
