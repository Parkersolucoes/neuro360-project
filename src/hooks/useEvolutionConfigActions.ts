import { useToast } from '@/hooks/use-toast';
import { useSystemLogsDB } from '@/hooks/useSystemLogsDB';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { EvolutionConfigService } from '@/services/evolutionConfigService';
import { EvolutionApiService } from '@/services/evolutionApiService';
import { useSystemConfigs } from '@/hooks/useSystemConfigs';
import { supabase } from '@/integrations/supabase/client';
import type { EvolutionConfig, CreateEvolutionConfigData, UpdateEvolutionConfigData } from '@/types/evolutionConfig';

export function useEvolutionConfigActions() {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogsDB();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();
  const { getConfigValue } = useSystemConfigs();

  const getGlobalEvolutionConfig = () => {
    const globalConfig = getConfigValue('evolution_global_config');
    
    if (globalConfig && globalConfig.base_url && globalConfig.global_api_key) {
      return {
        base_url: globalConfig.base_url,
        global_api_key: globalConfig.global_api_key
      };
    }

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
    const firstName = companyName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    return `${firstName}_${dateStr}`;
  };

  const createInstanceWithQRCode = async (config: {
    instance_name: string;
    company_phone: string;
  }): Promise<{ success: boolean; qrCodeData?: string; evolutionService?: EvolutionApiService }> => {
    try {
      console.log('useEvolutionConfigActions: Creating Evolution instance with QR Code:', config);
      
      // Passo 1: Validar configurações globais
      toast({
        title: "Passo 1/6 - Validando Configurações",
        description: "🔍 Verificando configurações globais da Evolution API..."
      });

      const globalConfig = getGlobalEvolutionConfig();
      
      if (!globalConfig) {
        const errorMsg = 'Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.';
        await logError(errorMsg, 'useEvolutionConfigActions');
        throw new Error(errorMsg);
      }

      // Passo 2: Mostrar configurações globais
      toast({
        title: "✓ Configurações Globais Encontradas",
        description: `📋 URL Base: ${globalConfig.base_url}\n🔑 API Key: ${globalConfig.global_api_key.substring(0, 8)}...`
      });

      console.log('useEvolutionConfigActions: Using global config:', { base_url: globalConfig.base_url });

      // Passo 3: Preparar número sem formatação
      toast({
        title: "Passo 2/6 - Preparando Número",
        description: `📱 Número da empresa: ${config.company_phone}\n📋 Será enviado SEM formatação conforme especificado`
      });

      const phoneNumber = config.company_phone; // Sem formatação, como cadastrado
      
      console.log('useEvolutionConfigActions: Phone number without formatting:', phoneNumber);

      // Passo 4: Mostrar parâmetros completos que serão enviados
      toast({
        title: "Passo 3/6 - Parâmetros da Requisição",
        description: `🌐 server-url: ${globalConfig.base_url}\n🔑 apikey: ${globalConfig.global_api_key.substring(0, 12)}...\n📱 instanceName: ${config.instance_name}\n🎯 token: (em branco)\n📱 qrcode: true\n📞 number: ${phoneNumber}\n🔧 integration: Baileys`
      });

      const tempEvolutionService = new EvolutionApiService({
        id: 'temp',
        company_id: currentCompany?.id || 'temp',
        api_url: globalConfig.base_url,
        api_key: globalConfig.global_api_key,
        instance_name: config.instance_name,
        webhook_url: null,
        number: phoneNumber, // Número sem formatação
        is_active: true,
        status: 'testing' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Passo 5: Enviar requisição
      toast({
        title: "Passo 4/6 - Enviando Requisição",
        description: "🚀 Enviando POST para Evolution API com parâmetros especificados..."
      });

      const createResponse = await tempEvolutionService.createInstanceWithQRCode();
      
      if (createResponse.instance && createResponse.instance.instanceName) {
        console.log('useEvolutionConfigActions: Instance created successfully with QR Code:', createResponse);
        
        // Passo 6: Sucesso e QR Code
        toast({
          title: "Passo 5/6 - Instância Criada com Sucesso",
          description: `🎉 Nome: ${createResponse.instance.instanceName}\n📊 Status: ${createResponse.instance.status}\n${createResponse.qrCodeData ? '📱 QR Code gerado automaticamente' : '⚠️ QR Code não disponível'}`
        });
        
        // Passo 7: Salvar QR Code
        toast({
          title: "Passo 6/6 - Finalizando",
          description: "💾 Salvando QR Code e preparando para exibição..."
        });
        
        // Salvar QR Code na sessão se disponível
        if (createResponse.qrCodeData && currentCompany) {
          await saveQRCodeToSession(config.instance_name, createResponse.qrCodeData, currentCompany.id);
          
          toast({
            title: "✅ Processo Concluído com Sucesso!",
            description: `🎯 Instância ${config.instance_name} criada\n📱 QR Code gerado e salvo\n👆 Escaneie o código para conectar`
          });
        }
        
        await logInfo('Instância Evolution API criada com sucesso e QR Code salvo', 'useEvolutionConfigActions', {
          instance_name: config.instance_name,
          phone_number: phoneNumber,
          has_qr_code: !!createResponse.qrCodeData,
          api_url: globalConfig.base_url
        });
        
        return { 
          success: true, 
          qrCodeData: createResponse.qrCodeData,
          evolutionService: tempEvolutionService
        };
      } else {
        console.log('useEvolutionConfigActions: Instance creation failed, invalid response');
        await logError('Falha na criação da instância - resposta inválida', 'useEvolutionConfigActions');
        
        toast({
          title: "❌ Falha na Criação",
          description: "Resposta inválida da Evolution API. Verifique as configurações.",
          variant: "destructive"
        });
        
        return { success: false };
      }
    } catch (error) {
      console.error('useEvolutionConfigActions: Instance creation failed:', error);
      await logError(`Falha na criação da instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      
      toast({
        title: "❌ Erro na Criação",
        description: error instanceof Error ? error.message : 'Erro desconhecido na criação da instância',
        variant: "destructive"
      });
      
      return { success: false };
    }
  };

  const saveQRCodeToSession = async (instanceName: string, qrCodeData: string, companyId: string) => {
    try {
      // Verificar se já existe uma sessão para esta instância
      const { data: existingSession } = await supabase
        .from('qr_sessions')
        .select('*')
        .eq('instance_name', instanceName)
        .eq('company_id', companyId)
        .single();

      if (existingSession) {
        // Atualizar sessão existente
        await supabase
          .from('qr_sessions')
          .update({
            qr_code_data: qrCodeData,
            session_status: 'waiting',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        // Criar nova sessão
        await supabase
          .from('qr_sessions')
          .insert({
            session_name: instanceName,
            instance_name: instanceName,
            company_id: companyId,
            qr_code_data: qrCodeData,
            session_status: 'waiting'
          });
      }

      console.log('QR Code saved to session successfully');
    } catch (error) {
      console.error('Error saving QR Code to session:', error);
    }
  };

  const createConfig = async (configData: CreateEvolutionConfigData): Promise<EvolutionConfig> => {
    try {
      console.log('useEvolutionConfigActions: Creating config:', configData);
      await logInfo('Iniciando criação de configuração Evolution API', 'useEvolutionConfigActions', { companyId: configData.company_id });
      
      if (!userLogin?.id) {
        throw new Error('Usuário não autenticado');
      }

      if (!currentCompany?.id) {
        throw new Error('Nenhuma empresa selecionada');
      }

      if (!currentCompany?.phone) {
        throw new Error('Número de telefone da empresa é obrigatório para criar a instância');
      }

      const globalConfig = getGlobalEvolutionConfig();
      
      if (!globalConfig) {
        throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
      }

      const sessionName = generateSessionName(currentCompany.name);
      const instanceName = configData.instance_name || sessionName;
      const phoneNumber = currentCompany.phone; // Sem formatação

      // Criar instância com QR Code e feedback passo a passo
      const createResult = await createInstanceWithQRCode({
        instance_name: instanceName,
        company_phone: currentCompany.phone
      });

      if (!createResult.success) {
        throw new Error('Configuração inválida: não foi possível criar a instância. Verifique o nome da instância e o número de telefone da empresa.');
      }

      const configToCreate = {
        ...configData,
        instance_name: instanceName,
        api_url: globalConfig.base_url,
        api_key: globalConfig.global_api_key,
        number: phoneNumber, // Sem formatação
        company_id: currentCompany.id,
        status: 'connected' as const
      };

      const newConfig = await EvolutionConfigService.create(configToCreate);
      
      console.log('useEvolutionConfigActions: Config created successfully:', newConfig);
      await logInfo('Configuração da Evolution API criada e instância validada com sucesso', 'useEvolutionConfigActions', { configId: newConfig.id });
      
      return newConfig;
    } catch (error) {
      console.error('useEvolutionConfigActions: Error creating Evolution config:', error);
      await logError(`Erro ao criar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      
      throw error;
    }
  };

  return {
    createConfig,
    updateConfig: async (id: string, updates: UpdateEvolutionConfigData): Promise<EvolutionConfig> => {
      try {
        console.log('useEvolutionConfigActions: Updating config:', id, updates);
        logInfo('Atualizando configuração Evolution API', 'useEvolutionConfigActions', { configId: id });
        
        if (!currentCompany?.id) {
          throw new Error('Nenhuma empresa selecionada');
        }

        if (!currentCompany?.phone) {
          throw new Error('Número de telefone da empresa é obrigatório para atualizar a instância');
        }

        const globalConfig = getGlobalEvolutionConfig();
        
        if (!globalConfig) {
          throw new Error('Configuração global da Evolution API não encontrada. Configure primeiro nas Configurações do Sistema.');
        }

        if (updates.instance_name) {
          const currentConfig = await EvolutionConfigService.fetchByCompanyId(currentCompany.id);
          
          if (!currentConfig) {
            throw new Error('Configuração atual não encontrada');
          }

          let instanceName = updates.instance_name;
          
          if (!instanceName) {
            instanceName = generateSessionName(currentCompany.name);
            updates.instance_name = instanceName;
          }

          const phoneNumber = currentCompany.phone; // Sem formatação

          toast({
            title: "Validando alterações",
            description: "Criando nova instância para validar as alterações..."
          });

          const createResult = await createInstanceWithQRCode({
            instance_name: instanceName,
            company_phone: currentCompany.phone
          });

          if (!createResult.success) {
            throw new Error('Alterações inválidas: não foi possível criar instância com as novas configurações. Verifique os dados informados.');
          }

          updates.status = 'connected';
          updates.api_url = globalConfig.base_url;
          updates.api_key = globalConfig.global_api_key;
          updates.number = phoneNumber; // Sem formatação
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
    },
    createInstanceWithQRCode,
    generateSessionName,
    getGlobalEvolutionConfig,
    formatPhoneNumber: (phone: string) => phone // Agora retorna sem formatação
  };
}
