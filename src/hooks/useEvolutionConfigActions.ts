
import { useToast } from '@/hooks/use-toast';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { EvolutionConfigService } from '@/services/evolutionConfigService';
import { EvolutionApiService } from '@/services/evolutionApiService';
import { useSystemConfigs } from '@/hooks/useSystemConfigs';
import type { EvolutionConfig, CreateEvolutionConfigData, UpdateEvolutionConfigData } from '@/types/evolutionConfig';

export function useEvolutionConfigActions() {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();
  const { getConfigValue } = useSystemConfigs();

  const getGlobalEvolutionConfig = () => {
    // Primeiro tenta buscar da configuração do sistema via hook
    const globalConfig = getConfigValue('evolution_global_config');
    
    if (globalConfig && globalConfig.base_url && globalConfig.global_api_key) {
      return {
        base_url: globalConfig.base_url,
        global_api_key: globalConfig.global_api_key
      };
    }

    // Fallback para localStorage se não encontrou na configuração do sistema
    const savedConfig = localStorage.getItem('evolution_global_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.base_url && config.global_api_key) {
          return {
            base_url: config.base_url,
            global_api_key: config.global_api_key
          };
        }
      } catch (error) {
        console.error('Error parsing localStorage config:', error);
      }
    }

    return null;
  };

  const generateSessionName = (companyName: string): string => {
    // Pegar primeiro nome da empresa
    const firstName = companyName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Adicionar data no formato YYYYMMDD
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    return `${firstName}_${dateStr}`;
  };

  const createInstanceWithValidation = async (config: {
    instance_name: string;
    api_key: string;
  }): Promise<boolean> => {
    try {
      console.log('useEvolutionConfigActions: Creating Evolution instance:', config);
      logInfo('Criando nova instância Evolution API', 'useEvolutionConfigActions', { 
        instance_name: config.instance_name 
      });

      // Buscar configuração global
      const globalConfig = getGlobalEvolutionConfig();
      
      if (!globalConfig) {
        throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
      }

      console.log('useEvolutionConfigActions: Using global config:', { base_url: globalConfig.base_url });

      // Criar uma instância temporária do serviço Evolution com dados combinados
      const tempEvolutionService = new EvolutionApiService({
        id: 'temp',
        company_id: currentCompany?.id || 'temp',
        api_url: globalConfig.base_url,
        api_key: globalConfig.global_api_key, // Usar chave global para operações de instância
        instance_name: config.instance_name,
        webhook_url: null,
        is_active: true,
        status: 'testing' as const
      });

      // Tentar criar a instância para validar a configuração
      const createResponse = await tempEvolutionService.createInstance();
      
      if (createResponse.instance && createResponse.instance.instanceName) {
        console.log('useEvolutionConfigActions: Instance created successfully:', createResponse);
        logInfo('Instância Evolution API criada com sucesso', 'useEvolutionConfigActions', {
          instance_name: config.instance_name,
          response: createResponse
        });
        return true;
      } else {
        console.log('useEvolutionConfigActions: Instance creation failed, invalid response');
        logError('Falha na criação da instância - resposta inválida', 'useEvolutionConfigActions');
        return false;
      }
    } catch (error) {
      console.error('useEvolutionConfigActions: Instance creation failed:', error);
      logError(`Falha na criação da instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
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

      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Buscar configuração global
      const globalConfig = getGlobalEvolutionConfig();
      
      if (!globalConfig) {
        throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
      }

      // Gerar nome da sessão baseado no nome da empresa
      const sessionName = generateSessionName(currentCompany.name);
      
      // Usar o nome da sessão gerado se não foi fornecido um nome de instância
      const instanceName = configData.instance_name || sessionName;

      // Validar configuração criando instância
      toast({
        title: "Criando instância",
        description: "Criando nova instância WhatsApp na Evolution API..."
      });

      const isValid = await createInstanceWithValidation({
        instance_name: instanceName,
        api_key: configData.api_key
      });

      if (!isValid) {
        throw new Error('Configuração inválida: não foi possível criar a instância. Verifique o nome da instância e token.');
      }

      // Se a validação passou, criar a configuração com dados globais + específicos da empresa
      const configToCreate = {
        ...configData,
        instance_name: instanceName,
        api_url: globalConfig.base_url, // Usar URL da configuração global
        company_id: currentCompany.id,
        status: 'connected' as const
      };

      const newConfig = await EvolutionConfigService.create(configToCreate);
      
      console.log('useEvolutionConfigActions: Config created successfully:', newConfig);
      logInfo('Configuração da Evolution API criada e instância validada com sucesso', 'useEvolutionConfigActions', { configId: newConfig.id });
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada e instância criada com sucesso! Agora você pode gerar QR Code."
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
      
      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      // Buscar configuração global
      const globalConfig = getGlobalEvolutionConfig();
      
      if (!globalConfig) {
        throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
      }

      // Se estamos atualizando dados críticos, validar criando nova instância
      if (updates.instance_name || updates.api_key) {
        // Buscar configuração atual para ter dados completos
        const currentConfig = await EvolutionConfigService.fetchByCompanyId(currentCompany.id);
        
        if (!currentConfig) {
          throw new Error('Configuração atual não encontrada');
        }

        let instanceName = updates.instance_name || currentConfig.instance_name;
        
        // Se não há nome de instância definido, gerar um novo
        if (!instanceName) {
          instanceName = generateSessionName(currentCompany.name);
          updates.instance_name = instanceName;
        }

        const configToValidate = {
          instance_name: instanceName,
          api_key: updates.api_key || currentConfig.api_key
        };

        toast({
          title: "Validando alterações",
          description: "Criando nova instância para validar as alterações..."
        });

        const isValid = await createInstanceWithValidation(configToValidate);

        if (!isValid) {
          throw new Error('Alterações inválidas: não foi possível criar instância com as novas configurações. Verifique os dados informados.');
        }

        // Se a validação passou, definir status como 'connected' e atualizar URL da API
        updates.status = 'connected';
        updates.api_url = globalConfig.base_url;
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
    createInstanceWithValidation,
    generateSessionName
  };
}
